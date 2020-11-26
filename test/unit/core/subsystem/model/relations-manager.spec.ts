import {sameset} from 'tsfun';
import {FieldDocument, toResourceId} from 'idai-components-2';
import {createApp, setupSyncTestDb} from '../subsystem-helper';
import {doc} from '../../../test-helpers';
import {RelationsManager} from '../../../../../src/app/core/model/relations-manager';
import {SettingsProvider} from '../../../../../src/app/core/settings/settings-provider';
import {DocumentDatastore} from '../../../../../src/app/core/datastore/document-datastore';

/**
 * @author Daniel de Oliveira
 */
describe('subsystem/relations-manager',() => {

    let documentDatastore: DocumentDatastore;
    let relationsManager: RelationsManager;
    let settingsProvider: SettingsProvider;


    beforeEach(async done => {

        await setupSyncTestDb();

        const {
            documentDatastore: d,
            relationsManager: r,
            settingsProvider: s
        } = await createApp();

        documentDatastore = d;
        relationsManager = r;
        settingsProvider = s;

        spyOn(console, 'error');
        // spyOn(console, 'warn');

        done();
    });


    async function createTestResourcesForRemoveTests() {

        const username = settingsProvider.getSettings().username;

        const d1 = doc('id1', 'Trench') as FieldDocument;
        const d2 = doc('id2', 'Feature') as FieldDocument;
        d2.resource.relations['isRecordedIn'] = ['id1'];
        const d3 = doc('id3', 'Find') as FieldDocument;
        d3.resource.relations['isRecordedIn'] = ['id1'];
        d3.resource.relations['liesWithin'] = ['id2'];
        const d4 = doc('id4', 'Find') as FieldDocument;
        d4.resource.relations['isRecordedIn'] = ['id1'];
        d4.resource.relations['liesWithin'] = ['id3'];
        d4.resource.relations['isDepictedIn'] = ['id5', 'id6'];

        const d5 = doc('id5', 'Image');
        d5.resource.relations['depicts'] = ['id4'];
        const d6 = doc('id6', 'Image');
        d6.resource.relations['depicts'] = ['id4', 'id7'];

        const d7 = doc('id7', 'Find');
        d7.resource.relations['isDepictedIn'] = ['d6'];

        await documentDatastore.create(d1, username);
        await documentDatastore.create(d2, username);
        await documentDatastore.create(d3, username);
        await documentDatastore.create(d4, username);
        await documentDatastore.create(d5, username);
        await documentDatastore.create(d6, username);
        await documentDatastore.create(d7, username);

        return [d1, d2, d3, d4, d5];
    }


    it('remove, beginning with Feature', async done => {

        const [_, d2] = await createTestResourcesForRemoveTests();

        expect((await documentDatastore.find({})).totalCount).toBe(7);
        await relationsManager.remove(d2);
        const result = (await documentDatastore.find({})).documents.map(toResourceId);
        expect(sameset(result, ['id1', 'id5', 'id6', 'id7'])).toBeTruthy();
        done();
    });


    it('remove, beginning with Trench', async done => {

        const [d1, _] = await createTestResourcesForRemoveTests();

        expect((await documentDatastore.find({})).totalCount).toBe(7);
        await relationsManager.remove(d1);
        const result = (await documentDatastore.find({})).documents.map(toResourceId);
        expect(sameset(result, ['id5', 'id6', 'id7'])).toBeTruthy();
        done();
    });
});
