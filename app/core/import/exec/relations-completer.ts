import {Document, Relations} from 'idai-components-2';
import {ImportErrors as E} from './import-errors';
import {compose, filter, flatten, flow, forEach, intersect, isDefined, isEmpty, isNot, isnt, isUndefinedOrEmpty, lookup,
    map, nth, remove, subtract, to, undefinedOrEmpty, on} from 'tsfun';
import {gt, len, makeLookup} from '../util';
import {HIERARCHICAL_RELATIONS, POSITION_RELATIONS, TIME_RELATIONS} from '../../model/relation-constants';
import {setInverseRelationsForDbResources} from './set-inverse-relations-for-db-resources';
import {assertInSameOperationWith} from './utils';
import IS_BELOW = POSITION_RELATIONS.IS_BELOW;
import IS_ABOVE = POSITION_RELATIONS.IS_ABOVE;
import IS_CONTEMPORARY_WITH = TIME_RELATIONS.IS_CONTEMPORARY_WITH;
import LIES_WITHIN = HIERARCHICAL_RELATIONS.LIES_WITHIN;
import RECORDED_IN = HIERARCHICAL_RELATIONS.RECORDED_IN;
import {keys, keysAndValues} from 'tsfun/src/objectmap';


/**
 * @author Thomas Kleinke
 * @author Daniel de Oliveira
 */
export module RelationsCompleter {

    type LookupDocument = (_: string) => Document|undefined;

    /**
     * Iterates over all relations (including obsolete relations) of the given resources.
     * Between import resources, it validates the relations.
     * Between import resources and db resources, it adds the inverses.
     *
     * @param get
     * @param getInverseRelation
     */
    export function completeInverseRelations(get: (_: string) => Promise<Document>,
                                             getInverseRelation: (_: string) => string|undefined,
                                             assertIsAllowedRelationDomainType: Function = () => true) { // TODO improve

        /**
         * @param importDocuments If one of these references another from the import file, the validity of the relations gets checked
         *   for contradictory relations and missing inverses are added.
         *
         * @param mergeMode
         *
         * @SIDE_EFFECTS: if an inverse of one of importDocuments is not set, it gets completed automatically.
         *   The document from importDocuments then gets modified in place.
         *
         * @returns the target importDocuments which should be updated. Only those fetched from the db are included. If a target document comes from
         *   the import file itself, <code>importDocuments</code> gets modified in place accordingly.
         *
         * @throws ImportErrors.*
         *
         * @throws [EXEC_MISSING_RELATION_TARGET, targetId]
         *
         * @throws [EMPTY_RELATION, resourceId]
         *   If relations empty for some relation is empty.
         *   For example relations: {isAbove: []}
         *
         * @throws [BAD_INTERRELATION, sourceId]
         *   - If opposing relations are pointing to the same resource.
         *     For example IS_BEFORE and IS_AFTER pointing both from document '1' to '2'.
         *   - If mutually exluding relations are pointing to the same resource.
         *     For example IS_CONTEMPORARY_WITH and IS_AFTER both from document '1' to '2'.
         */
        return async (importDocuments: Array<Document>, mergeMode: boolean = false): Promise<Array<Document>> => {

            const lookupDocument = lookup(makeDocumentsLookup(importDocuments));

            async function getTargetIds(document: Document) {

                let targetIds = targetIdsReferingToDbResources(document, lookupDocument);
                if (mergeMode) {
                    let oldVersion; try { oldVersion = await get(document.resource.id);
                    } catch { throw "FATAL existing version of document not found" }
                    return [targetIds, subtract(targetIds)(targetIdsReferingToDbResources(oldVersion as any, lookupDocument))]
                }
                return [targetIds, []];
            }

            for (let importDocument of importDocuments) {

                setInverseRelationsForImportResource(
                    importDocument,
                    lookupDocument,
                    addInverse(getInverseRelation),
                    relationNamesExceptRecordedIn(importDocument));
            }

            return await setInverseRelationsForDbResources(
                importDocuments,
                getTargetIds,
                get,
                getInverseRelation,
                assertIsAllowedRelationDomainType);
        }
    }


    function relationNamesExceptRecordedIn(document: Document) {

        return flow(
            document.resource.relations,
            Object.keys,
            filter(isnt(LIES_WITHIN)),
            filter(isnt(RECORDED_IN))) as string[];
    }


    function targetIdsReferingToDbResources(document: Document,
                                            lookupDocument: LookupDocument) {

        return flow(
            document.resource.relations,
            keysAndValues,
            filter(on('[0]', isnt(RECORDED_IN))),
            map(to('[1]')),
            flatten,
            remove(compose(lookupDocument, isDefined)));
    }


    function setInverseRelationsForImportResource(importDocument: Document,
                                                  lookupDocument: LookupDocument,
                                                  addInverse: (_: Document) => (_: string) => [string, string],
                                                  relations: string[]): void {

        const addInverse_ = addInverse(importDocument);
        const inverseIsDefined = compose(nth(1), isDefined);
        const assertNotBadyInterrelated_ = assertNotBadlyInterrelated(importDocument);
        const setInverses_ = setInverses(importDocument, lookupDocument);

        flow(relations,
            map(addInverse_),
            filter(inverseIsDefined),
            forEach(assertNotBadyInterrelated_),
            forEach(setInverses_));
    }


    function setInverses(importDocument: Document, lookupDocument: LookupDocument) {

        return ([relationName, inverseRelationName]: [string, string]) => {

            flow(
                importDocument.resource.relations[relationName],
                map(lookupDocument),
                filter(isDefined),
                forEach(assertInSameOperationWith(importDocument)),
                map(to('resource.relations')),
                forEach(setInverse(importDocument.resource.id, inverseRelationName)));
        }
    }


    function addInverse(getInverseRelation: (_: string) => string|undefined) {

        return (document: Document) =>  (relationName: string) => {

            if (isEmpty(document.resource.relations[relationName])) throw [E.EMPTY_RELATION, document.resource.identifier];

            const inverseRelationName = getInverseRelation(relationName);
            return [relationName, inverseRelationName] as [string, string];
        }
    }



    function assertNotBadlyInterrelated(document: Document) {

        return ([relationName, inverseRelationName]: [string, string]) => {

            const forbiddenRelations = [];
            if (relationName !== inverseRelationName)        forbiddenRelations.push(inverseRelationName);
            if ([IS_ABOVE, IS_BELOW].includes(relationName)) forbiddenRelations.push(IS_CONTEMPORARY_WITH); // TODO review spatial relations
            else if (IS_CONTEMPORARY_WITH === relationName)  forbiddenRelations.push(IS_ABOVE, IS_BELOW);

            assertNoForbiddenRelations(forbiddenRelations, document.resource.relations[relationName], document);
        }
    }


    function assertNoForbiddenRelations(forbiddenRelations: string[], relationTargets: string[], document: Document) {

        forbiddenRelations
            .map(lookup(document.resource.relations))
            .filter(isNot(undefinedOrEmpty))
            .map(intersect(relationTargets))
            .map(len)
            .filter(gt(0))
            .forEach(_ => { throw [E.BAD_INTERRELATION, document.resource.identifier] });
    }


    function setInverse(resourceId: string, inverseRelationName: string) { return (targetDocumentRelations: Relations) => {

        if (isUndefinedOrEmpty(targetDocumentRelations[inverseRelationName])) {
            targetDocumentRelations[inverseRelationName] = [];
        }
        if (!targetDocumentRelations[inverseRelationName].includes(resourceId)) {
            targetDocumentRelations[inverseRelationName].push(resourceId);
        }
    }}


    const makeDocumentsLookup = makeLookup('resource.id');
}
