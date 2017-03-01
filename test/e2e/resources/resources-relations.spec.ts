import {NavbarPage} from '../navbar.page';

let resourcesPage = require('./resources.page');
let documentViewPage = require('../widgets/document-view.page');

describe('relations', function() {

    beforeEach(function() {
        resourcesPage.get();
    });

    it ('should create links for relations', function() {
        resourcesPage.performCreateLink();
        resourcesPage.clickSelectResource('1');
        expect(documentViewPage.getRelationValue(0)).toEqual('2');
        resourcesPage.clickRelationInDocumentView(0);
        expect(documentViewPage.getRelationValue(0)).toEqual('1');
    });

    it('should create a new relation and the corresponding inverse relation', function() {
        resourcesPage.performCreateLink();
        expect(resourcesPage.getRelationButtonText(0, 0, 0)).toEqual('1');
        resourcesPage.clickSelectResource('1');
        resourcesPage.clickEditDocument();
        expect(resourcesPage.getRelationButtonText(1, 0, 0)).toEqual('2');
    });

    it('should edit a resource that contains a relation', function() {
        resourcesPage.performCreateLink();
        expect(NavbarPage.getMessageText()).toContain('erfolgreich');
        resourcesPage.clickFieldsTab();
        resourcesPage.typeInIdentifier('123');
        resourcesPage.clickSaveDocument();
        expect(NavbarPage.getMessageText()).toContain('erfolgreich');
    });

    it('should delete a relation and the corresponding inverse relation', function() {
        resourcesPage.performCreateLink();
        resourcesPage.clickSelectResource('2');
        documentViewPage.getRelations().then(function(relations) {
            expect(relations.length).toBe(1);
        });
        resourcesPage.clickSelectResource('2');
        documentViewPage.getRelations().then(function(relations) {
            expect(relations.length).toBe(1);
        });
        resourcesPage.clickEditDocument();
        resourcesPage.clickRelationsTab();
        resourcesPage.clickRelationDeleteButtonByIndices(0, 0, 0);

        resourcesPage.clickSaveDocument();
        resourcesPage.clickBackToDocumentView();
        documentViewPage.getRelations().then(function(relations) {
            expect(relations.length).toBe(0);
        });
        resourcesPage.clickSelectResource('1');
        documentViewPage.getRelations().then(function(relations) {
            expect(relations.length).toBe(0);
        });
    });

    it('should delete inverse relations when deleting a resource', function() {
        resourcesPage.performCreateLink();
        resourcesPage.clickDeleteDocument();
        resourcesPage.clickDeleteInModal();
        resourcesPage.clickSelectResource('1');
        documentViewPage.getRelations().then(function(relations) {
            expect(relations.length).toBe(0);
        });
    });

});
