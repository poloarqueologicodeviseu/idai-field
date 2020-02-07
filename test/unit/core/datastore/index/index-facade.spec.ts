import {Query, FieldDocument} from 'idai-components-2';
import {IndexFacade} from '../../../../../app/core/datastore/index/index-facade';
import {Static} from '../../../static';
import {IndexerConfiguration} from '../../../../../app/indexer-configuration';
import {FieldTypeConverter} from '../../../../../app/core/datastore/field/field-type-converter';
import {TypeUtility} from '../../../../../app/core/model/type-utility';
import {DocumentCache} from '../../../../../app/core/datastore/core/document-cache';
import {PouchdbManager} from '../../../../../app/core/datastore/core/pouchdb-manager';
import {PouchdbDatastore} from '../../../../../app/core/datastore/core/pouchdb-datastore';
import {to} from 'tsfun';
import {ProjectConfiguration} from '../../../../../app/core/configuration/project-configuration';


class IdGenerator {
    public generateId() {
        return Math.floor(Math.random() * 10000000).toString();
    }
}

/**
 * @author Daniel de Oliveira
 * @author Sebastian Cuy
 * @author Thomas Kleinke
 */
describe('IndexFacade', () => {

    async function createPouchdbDatastore(dbname, projectConfiguration) {

        const {createdIndexFacade} =
            IndexerConfiguration.configureIndexers(projectConfiguration);

        const documentCache = new DocumentCache<FieldDocument>();
        const pouchdbManager = new PouchdbManager();

        const datastore = new PouchdbDatastore(
            pouchdbManager.getDbProxy(),
            new IdGenerator(),
            false);
        await pouchdbManager.loadProjectDb(dbname, undefined);

        return { datastore, documentCache, createdIndexFacade };
    }

    async function init(projectConfiguration: ProjectConfiguration) {

        const { datastore, documentCache, createdIndexFacade: indexFacade } =
            await createPouchdbDatastore('testdb', projectConfiguration);

        return { datastore, documentCache, indexFacade };
    }

    let indexFacade: IndexFacade;


    beforeEach(async done => {

        await init(createMockProjectConfiguration());
        const {createdIndexFacade} =
            IndexerConfiguration.configureIndexers(createMockProjectConfiguration());
        indexFacade = createdIndexFacade;
        done();
    });


    function createMockProjectConfiguration(): any {

        const projectConfiguration = jasmine.createSpyObj('projectConfiguration',
            ['getTypesMap']);

        const defaultFieldConfiguration =  {
            fields: {
                identifier: {},
                shortDescription: {},
            }
        };

        projectConfiguration.getTypesMap.and.returnValue({
            type1: defaultFieldConfiguration,
            type2: defaultFieldConfiguration,
            type3: defaultFieldConfiguration,
            Find: defaultFieldConfiguration,
            Type: defaultFieldConfiguration
        });

        return projectConfiguration;
    }


    it('should put a type and then a find', () => {

        const typeDoc = Static.doc('sd1', 'identifier1', 'Type', 'id1');
        const findDoc = Static.doc('sd2', 'identifier2', 'Find', 'id2');
        findDoc.resource.relations = { isInstanceOf: ['id1'] };

        indexFacade.put(typeDoc);
        indexFacade.put(findDoc);

        const result = indexFacade.perform({ q: 'identifier' }).map(to('id'));
        // TODO write expectation
    });


    it('should find with filterSet undefined', () => {

        const doc1 = Static.doc('sd1', 'identifier1', 'Find', 'id1');
        indexFacade.put(doc1);

        const result = indexFacade.perform({ q: 'identifier' }).map(to('id'));
        expect(result[0]).toBe('id1');
    });


    it('should find with prefix query undefined', () => {

        const doc1 = Static.doc('sd1', 'identifier1', 'Find', 'id1');
        indexFacade.put(doc1);

        const result = indexFacade.perform({ q: undefined }).map(to('id'));
        expect(result[0]).toBe('id1');
    });


    it('should find with omitted q', () => {

        const doc1 = Static.doc('sd1', 'identifier1', 'Find', 'id1');
        indexFacade.put(doc1);

        const result = indexFacade.perform({}).map(to('id'));
        expect(result[0]).toBe('id1');
    });


    it('should find with omitted q and ommitted prefix', () => {

        const doc1 = Static.doc('sd1', 'identifier1', 'Find', 'id1');
        indexFacade.put(doc1);

        const result = indexFacade.perform({}).map(to('id'));
        expect(result[0]).toBe('id1');
    });


    it('should match all fields', () => {

        const doc1 = Static.doc('bla', 'identifier1', 'Find', 'id1');
        const doc2 = Static.doc('sd2', 'bla', 'Find', 'id2');
        indexFacade.put(doc1);
        indexFacade.put(doc2);

        const result = indexFacade.perform({ q: 'bla' }).map(to('id'));
        expect(result.length).toBe(2);
    });


    it('should filter by one type in find', () => {

        const doc1 = Static.doc('bla1', 'blub', 'type1', 'id1');
        const doc2 = Static.doc('bla2', 'blub', 'type2', 'id2');
        const doc3 = Static.doc('bla3', 'blub', 'type3', 'id3');
        indexFacade.put(doc1);
        indexFacade.put(doc2);
        indexFacade.put(doc3);

        const result = indexFacade.perform({ q: 'blub', types: ['type3'] }).map(to('id'));
        expect(result.length).toBe(1);
        expect(result[0]).toBe('id3');
    });


    it('should find by prefix query and filter', () => {

        const doc1 = Static.doc('bla1', 'blub1', 'type1', 'id1');
        const doc2 = Static.doc('bla2', 'blub2', 'type2', 'id2');
        const doc3 = Static.doc('bla3', 'blub3', 'type2', 'id3');
        indexFacade.put(doc1);
        indexFacade.put(doc2);
        indexFacade.put(doc3);

        const result = indexFacade.perform({
            q: 'blub',
            types: ['type2']
        }).map(to('id'));

        expect(result.length).toBe(2);
        expect(result[0]).not.toBe('id1');
        expect(result[1]).not.toBe('id1');
    });


    it('should filter with constraint', () => {

        const doc1 = Static.doc('bla1', 'blub1', 'type1','id1');
        const doc2 = Static.doc('bla2', 'blub2', 'type2','id2');
        const doc3 = Static.doc('bla3', 'blub3', 'type2','id3');
        const doc4 = Static.doc('bla4', 'blub4', 'type2','id4');
        doc2.resource.relations['isRecordedIn'] = ['id1'];
        doc3.resource.relations['isRecordedIn'] = ['id1'];
        doc4.resource.relations['isRecordedIn'] = ['id2'];

        const q: Query = {
            q: 'blub',
            constraints: {
                'isRecordedIn:contain' : 'id1'
            }
        };

        indexFacade.put(doc1);
        indexFacade.put(doc2);
        indexFacade.put(doc3);
        indexFacade.put(doc4);


        const result = indexFacade.perform(q).map(to('id'));
        expect(result).toContain('id2');
        expect(result).toContain('id3');
        expect(result.length).toBe(2);
    });


    it('should filter with multiple constraints', () => {

        const doc1 = Static.doc('bla1', 'blub1', 'type1','id1');
        const doc2 = Static.doc('bla2', 'blub2', 'type2','id2');
        doc2.resource.relations['isRecordedIn'] = ['id1'];
        const doc3 = Static.doc('bla3', 'blub3', 'type2','id3');
        doc3.resource.relations['isRecordedIn'] = ['id1'];
        doc3.resource.relations['liesWithin'] = ['id2'];

        const q: Query = {
            q: 'blub',
            constraints: {
                'isRecordedIn:contain' : 'id1',
                'liesWithin:contain' : 'id2'
            }
        };

        indexFacade.put(doc1);
        indexFacade.put(doc2);
        indexFacade.put(doc3);


        const result = indexFacade.perform(q).map(to('id'));
        expect(result[0]).toBe('id3');
        expect(result.length).toBe(1);
    });


    it('should filter with a subtract constraint', () => {

        const doc1 = Static.doc('Document 1', 'doc1', 'type1','id1');
        const doc2 = Static.doc('Document 2', 'doc2', 'type1','id2');
        const doc3 = Static.doc('Document 3', 'doc3', 'type2','id3');
        doc3.resource.relations['isRecordedIn'] = ['id1'];
        const doc4 = Static.doc('Document 4', 'doc4', 'type2','id4');
        doc4.resource.relations['isRecordedIn'] = ['id2'];

        const q: Query = {
            q: 'doc',
            constraints: {
                'isRecordedIn:contain': { value: 'id2', type: 'subtract' }
            }
        };

        indexFacade.put(doc1);
        indexFacade.put(doc2);
        indexFacade.put(doc3);
        indexFacade.put(doc4);

        const result = indexFacade.perform(q).map(to('id'));
        expect(result.length).toBe(3);
        expect(result).toEqual(['id1', 'id2', 'id3']);
    });


    it('should sort by last modified descending', async done => {

        const doc1 = Static.doc('bla1', 'blub1', 'type1','id1');
        const doc3 = Static.doc('bla3', 'blub3', 'type3','id3');
        doc3.resource.relations['isRecordedIn'] = ['id1'];

        setTimeout(() => {

            const doc2 = Static.doc('bla2', 'blub2', 'type2','id2');
            doc2.resource.relations['isRecordedIn'] = ['id1'];

            const q: Query = {
                q: 'blub',
                constraints: {
                    'isRecordedIn:contain': 'id1'
                }
            };

            indexFacade.put(doc1);
            indexFacade.put(doc2);
            indexFacade.put(doc3);

            const result = indexFacade.perform(q).map(to('id'));
            expect(result.length).toBe(2);
            expect(result[0]).toBe('id2');
            expect(result[1]).toBe('id3');
            done();
        },100)
    });
});