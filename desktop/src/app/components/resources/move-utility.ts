import {flatten, intersection, set} from 'tsfun';
import {Document, ProjectConfiguration, RelationsManager,
    FieldDocument, IndexFacade, Constraint, CategoryForm } from 'idai-field-core';


/**
 * @author Thomas Kleinke
 */
export module MoveUtility {

    export async function moveDocument(document: FieldDocument, newParent: FieldDocument,
                                       relationsManager: RelationsManager,
                                       isRecordedInTargetCategories: Array<CategoryForm>) {

        const oldVersion = Document.clone(document);
        updateRelations(document, newParent, isRecordedInTargetCategories);
        await relationsManager.update(document, oldVersion);
    }


    export async function createConstraints(documents: Array<FieldDocument>, indexFacade: IndexFacade)
            : Promise<{ [name: string]: Constraint }> {

        return {
            'id:match': {
                value: set(flatten(documents.map(document => getResourceIdsToSubtract(document, indexFacade)))),
                subtract: true
            }
        };
    }


    export function getAllowedTargetCategories(documents: Array<FieldDocument>,
                                               projectConfiguration: ProjectConfiguration,
                                               isInOverview: boolean): Array<CategoryForm> {

        const result = set(getIsRecordedInTargetCategories(documents, projectConfiguration)
            .concat(getLiesWithinTargetCategories(documents, projectConfiguration)));

        return (isProjectOptionAllowed(documents, isInOverview))
            ? [projectConfiguration.getCategory('Project')]
                .concat(result)
            : result;
    }



    export function isProjectOptionAllowed(documents: Array<FieldDocument>, isInOverview: boolean): boolean {

        return isInOverview && Document.hasRelations(documents[0],'liesWithin');
    }


    export function getIsRecordedInTargetCategories(documents: Array<FieldDocument>,
                                                    projectConfiguration: ProjectConfiguration): Array<CategoryForm> {

        return intersection(
            documents.map(document => projectConfiguration.getAllowedRelationRangeCategories(
                'isRecordedIn', document.resource.category
            ))
        );
    }


    function updateRelations(document: FieldDocument, newParent: FieldDocument,
                             isRecordedInTargetCategories: Array<CategoryForm>) {

        if (newParent.resource.category === 'Project') {
            document.resource.relations['isRecordedIn'] = [];
            document.resource.relations['liesWithin'] = [];
        } else if (isRecordedInTargetCategories.map(category => category.name)
            .includes(newParent.resource.category)) {
            document.resource.relations['isRecordedIn'] = [newParent.resource.id];
            document.resource.relations['liesWithin'] = [];
        } else {
            document.resource.relations['liesWithin'] = [newParent.resource.id];
            document.resource.relations['isRecordedIn'] = newParent.resource.relations['isRecordedIn'];
        }
    }


    function getResourceIdsToSubtract(document: FieldDocument, indexFacade: IndexFacade): string[] {

        const ids = [document.resource.id];

        const parentId: string|undefined = getParentId(document);
        if (parentId) ids.push(parentId);

        return ids.concat(indexFacade.getDescendantIds(
            'isChildOf:contain', document.resource.id
        ));
    }


    function getParentId(document: FieldDocument): string|undefined {

        return Document.hasRelations(document, 'liesWithin')
            ? document.resource.relations['liesWithin'][0]
            : Document.hasRelations(document, 'isRecordedIn')
                ? document.resource.relations.isRecordedIn[0]
                : undefined;
    }


    function getLiesWithinTargetCategories(documents: Array<FieldDocument>,
                                           projectConfiguration: ProjectConfiguration): Array<CategoryForm> {

        return intersection(
            documents.map(document => projectConfiguration.getAllowedRelationRangeCategories(
                'liesWithin', document.resource.category
            ))
        );
    }
}
