import {Injectable} from '@angular/core';
import {Observable, Observer} from 'rxjs';
import {asyncMap} from 'tsfun-extra';
import {Action, Document, DatastoreErrors} from 'idai-components-2';
import {PouchdbDatastore} from './pouchdb-datastore';
import {DocumentCache} from './document-cache';
import {TypeConverter} from './type-converter';
import {IndexFacade} from '../index/index-facade';
import {ObserverUtil} from '../../util/observer-util';
import {UsernameProvider} from '../../settings/username-provider';
import {DatastoreUtil} from './datastore-util';
import isConflicted = DatastoreUtil.isConflicted;
import isProjectDocument = DatastoreUtil.isProjectDocument;
import {CAMPAIGNS, solveProjectDocumentConflict, STAFF} from './solve-project-document-conflicts';
import getConflicts = DatastoreUtil.getConflicts;
import {ResourceId, RevisionId} from '../../../c';


@Injectable()
/**
 * @author Daniel de Oliveira
 * @author Thomas Kleinke
 */
export class ChangesStream {

    private observers: Array<Observer<Document>> = [];

    /**
     * For each incoming document, we wait a short and random amount of time
     * until we touch it. This is to minimize the chance that multiple clients
     * auto-resolve a conflict at the same time.
     */
    private documentsScheduledToWelcome: { [resourceId: string]: any } = {};


    constructor(
        private datastore: PouchdbDatastore,
        private indexFacade: IndexFacade,
        private documentCache: DocumentCache<Document>,
        private typeConverter: TypeConverter<Document>,
        private usernameProvider: UsernameProvider
    ) {


        datastore.deletedNotifications().subscribe(document => {

            this.documentCache.remove(document.resource.id);
            this.indexFacade.remove(document);
        });


        datastore.changesNotifications().subscribe(async document => {

            if (await ChangesStream.isRemoteChange(
                    document,
                    this.usernameProvider.getUsername())
                || isConflicted(document)) {

                if (this.documentsScheduledToWelcome[document.resource.id]) {
                    clearTimeout(this.documentsScheduledToWelcome[document.resource.id]);
                    delete this.documentsScheduledToWelcome[document.resource.id];
                }

                if (isProjectDocument(document) && isConflicted(document)) {
                    this.documentsScheduledToWelcome[document.resource.id] = setTimeout(
                        () => this.onTimeout(document), Math.random() * 10000);
                } else {
                    await this.welcomeDocument(document);
                }
            }
        });
    }

    public notifications = (): Observable<Document> => ObserverUtil.register(this.observers);


    private async onTimeout(document: Document) {

        delete this.documentsScheduledToWelcome[document.resource.id];
        let solvedDocument: Document|undefined = undefined;
        try {
            solvedDocument = await this.resolveConflict(document)
        } catch (err) {
            console.error("will not put document to index due to " +
                "error in ChangesStream.resolveConflict", err);
            return;
        }
        await this.welcomeDocument(solvedDocument);
    }


    /**
     * Fetches the latestRevision of the document and tries to solve detected conflicts.
     * If at least one conflict has been solved, updates the document in the database.
     *
     * @param document
     *   - latestRevision if no conflicts found or none solved
     *   - the updated version of the document if at least one conflict has been solved
     */
    private async resolveConflict(document: Document): Promise<Document> {

        const latestRevisionDocument = await this.datastore.fetch(document.resource.id);
        if (!latestRevisionDocument.resource[STAFF]) latestRevisionDocument.resource[STAFF] = [];
        if (!latestRevisionDocument.resource[CAMPAIGNS]) latestRevisionDocument.resource[CAMPAIGNS] = [];

        const conflicts = getConflicts(latestRevisionDocument); // fetch again, to make sure it is up to date after the timeout
        if (!conflicts) return latestRevisionDocument;          // again, to make sure other client did not solve it in that exact instant

        const conflictedDocuments = await this.getConflictedDocuments(conflicts, document.resource.id);

        const solution = solveProjectDocumentConflict(latestRevisionDocument, conflictedDocuments);
        return ChangesStream.shouldUpdate(solution, latestRevisionDocument)
            ? this.updateResolvedDocument(solution)
            : latestRevisionDocument;
    }


    private async getConflictedDocuments(conflicts: Array<RevisionId>, resourceId: ResourceId) {

        return await asyncMap((revisionId: string) => {
                return this.datastore.fetchRevision(resourceId, revisionId);
            })(conflicts);
    }


    private welcomeDocument(document: Document) {

        const convertedDocument = this.typeConverter.convert(document);
        this.indexFacade.put(convertedDocument);

        // explicitly assign by value in order for changes to be detected by angular
        if (this.documentCache.get(convertedDocument.resource.id)) {
            this.documentCache.reassign(convertedDocument);
        }

        ObserverUtil.notify(this.observers, convertedDocument);
    }


    private async updateResolvedDocument([document, conflicts]: [Document, Array<string>]): Promise<Document> {

        console.log("update", document);

        try {

            return await this.datastore.update(
                document,
                this.usernameProvider.getUsername(),
                conflicts);

        } catch (errWithParams) {
            // If tho clients have auto-resolved the conflict are exactly the same time,
            // the document is already updated and its revisions already removed. Since
            // the revisions get updated before the document gets updated, REMOVE_REVISIONS
            // error tells us exactly that, which is why we can safely swallow it here.
            if (errWithParams[0] !== DatastoreErrors.REMOVE_REVISIONS_ERROR) throw errWithParams;
            return await this.datastore.fetch(document.resource.id);
        }
    }


    private static async isRemoteChange(document: Document, username: string): Promise<boolean> {

        const latestAction: Action = Document.getLastModified(document);
        return latestAction && latestAction.user !== username;
    }


    private static shouldUpdate([documentAfterConflictResolution, squashRevisionIds]: [Document, Array<RevisionId>], latestRevisionDocument: Document) {

        return squashRevisionIds.length > 0
            // compare for length instead of equality, because we want to avoid loops where one machine reduces a length and then updates while another does the opposite
            || documentAfterConflictResolution.resource[STAFF].length > latestRevisionDocument.resource[STAFF].length
            || documentAfterConflictResolution.resource[CAMPAIGNS].length > latestRevisionDocument.resource[CAMPAIGNS].length;
    }
}