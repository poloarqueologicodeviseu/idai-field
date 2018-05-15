import {Document, NewDocument, ProjectConfiguration} from 'idai-components-2/core';
import {ImportStrategy} from './import-strategy';
import {DocumentDatastore} from "../datastore/document-datastore";
import {Validator} from '../model/validator';

/**
 * @author Daniel de Oliveira
 */
export class MeninxFindImportStrategy implements ImportStrategy {


    constructor(private validator: Validator,
                private datastore: DocumentDatastore,
                private projectConfiguration: ProjectConfiguration,
                private username: string) { }


    /**
     * @throws errorWithParams
     */
    public async importDoc(
        importDoc: NewDocument // TODO use IdaiFieldDocument and make sure it is properly converted
    ): Promise<Document> {

        console.log("import with meninx find import strategy");
        // await this.validator.validate(document as Document); // will throw identifier conflict if document exists

        // find the id of the stratigraphical unit (lies Within)


        // TODO find the id of the operation type resource

        try {
            const trenchIdentifier = '' + importDoc.resource.identifier[0] + '000';
            const existing = await this.datastore.find({q: trenchIdentifier, types: ['Trench']});
            importDoc.resource.relations['isRecordedIn'] = [existing.documents[0].resource.id];
        } catch (err) {
            console.log("isRecordedIn err", err);
            // TODO throw
        }

        try {
            const liesWithinIdentifier = importDoc.resource.relations['liesWithin'][0];
            const existing = await this.datastore.find({q: liesWithinIdentifier, types: [
                    "Feature",
                    "DrillCoreLayer",
                    "Floor",
                    "Grave",
                    "Layer",
                    "Other",
                    "Architecture",
                    "SurveyUnit",
                    "Planum",
                    "Room",
                    "Burial"
                ]});

            importDoc.resource.relations['liesWithin'] = [existing.documents[0].resource.id];
        } catch (err) {
            console.log("liesWithin err", err);
            // TODO throw
        }

        let updateDoc: NewDocument|Document = importDoc;

        let exists = false;
        try {
            const existing = await this.datastore.find({q: importDoc.resource.identifier});

            if (existing.documents.length > 0) {

                exists = true;
                updateDoc = existing.documents[0];

                // merge fields of document into doc
                if (importDoc.resource.shortDescription) updateDoc.resource.shortDescription = importDoc.resource.shortDescription;
                if (importDoc.resource.type) updateDoc.resource.type = importDoc.resource.type;
                updateDoc.resource.relations['liesWithin'] = importDoc.resource.relations['liesWithin'];
                updateDoc.resource.relations['isRecordedIn'] = importDoc.resource.relations['isRecordedIn']
            }
        } catch (err) {}

        console.log("will " + exists ? ' update' : 'create',updateDoc);

        return exists
            ? await this.datastore.update(updateDoc as Document, this.username)
            : await this.datastore.create(updateDoc, this.username);
    }
}