import {sameset} from 'tsfun';
import {Document} from 'idai-components-2';
import {solveProjectDocumentConflict} from '../../../../../app/core/datastore/core/solve-project-document-conflicts';


describe('solveProjectDocumentConflict', () => {

    it('2 identical resources', () => {

        const current: Document = {
            _id: '1',
            created: { user: '', date: new Date() },
            modified: [],
            resource: {
                id: '1',
                type: 'Object',
                aField: 'aValue',
                relations: {}
            }
        };
        current._conflicts = ['c1'];

        const conflictedDocs: Array<Document> = [{
            _id: '1',
            created: { user: '', date: new Date() },
            modified: [],
            resource: {
                id: '1',
                type: 'Object',
                aField: 'aValue',
                relations: {}
            },
            '_rev': 'c1'
        }];

        const result = solveProjectDocumentConflict(
            current,
            conflictedDocs);

        expect(result[0].resource['aField']).toEqual('aValue');
        expect(result[1]).toEqual(['c1']);
    });


    it('current is empty', () => {

        const current: Document = {
            _id: '1',
            created: { user: '', date: new Date() },
            modified: [],
            resource: {
                id: '1',
                type: 'Object',
                relations: {}
            }
        };
        current._conflicts = ['c1'];

        const conflictedDocs: Array<Document> = [{
            _id: '1',
            created: { user: '', date: new Date() },
            modified: [],
            resource: {
                id: '1',
                type: 'Object',
                aField: 'aValue',
                relations: {}
            },
            _rev: 'c1'

        }];

        const result = solveProjectDocumentConflict(
            current,
            conflictedDocs);

        expect(result[0].resource['aField']).toEqual('aValue');
        expect(result[1]).toEqual(['c1']);
    });


    it('conflicted is empty', () => {

        const current: Document = {
            _id: '1',
            created: { user: '', date: new Date() },
            modified: [],
            resource: {
                id: '1',
                type: 'Object',
                aField: 'aValue',
                relations: {}
            }
        };
        current._conflicts = ['c1'];

        const conflictedDocs: Array<Document> = [{
            _id: '1',
            created: { user: '', date: new Date() },
            modified: [],
            resource: {
                id: '1',
                type: 'Object',
                relations: {}
            },
            _rev: 'c1'
        }];

        const result = solveProjectDocumentConflict(
            current,
            conflictedDocs);

        expect(result[0].resource['aField']).toEqual('aValue');
        expect(result[1]).toEqual(['c1']);
    });


    it('solve rightmost 2 of 3 - thereby unify staff', () => {

        const current: Document = {
            _id: '1',
            created: { user: '', date: new Date() },
            modified: [],
            resource: {
                id: '1',
                type: 'Object',
                staff: ['a'],
                relations: {}
            }
        };
        current._conflicts = ['c1', 'c2', 'c3'];

        const conflictedDocs: Array<Document> = [

            {
                _id: '1',
                created: { user: '', date: new Date('2017') },
                modified: [],
                resource: {
                    id: '1',
                    type: 'Object',
                    'aField': 'aValue',
                    relations: {}
                }
            },
            {
                _id: '1',
                created: { user: '', date: new Date('2018') },
                modified: [],
                resource: {
                    id: '1',
                    type: 'Object',
                    staff: ['b'],
                    relations: {}
                }
            },
            {
                _id: '1',
                created: { user: '', date: new Date('2019') },
                modified: [],
                resource: {
                    id: '1',
                    type: 'Object',
                    staff: ['c'],
                    relations: {}
                }
            }
        ];

        conflictedDocs[0]._rev = 'c1';
        conflictedDocs[1]._rev = 'c2';
        conflictedDocs[2]._rev = 'c3';

        const result = solveProjectDocumentConflict(
            current,
            conflictedDocs);

        expect(sameset(result[0].resource['staff'])(['a', 'b', 'c'])).toBeTruthy();
        expect(result[1]).toEqual(['c2', 'c3']);
    });


    it('solve c1 and c3 - thereby unify campaigns', () => {

        const current: Document = {
            _id: '1',
            created: { user: '', date: new Date() },
            modified: [],
            resource: {
                id: '1',
                type: 'Object',
                campaigns: ['1'],
                relations: {}
            }
        };
        current._conflicts = ['c1', 'c2', 'c3'];

        const conflictedDocs: Array<Document> = [
            {
                _id: '1',
                created: { user: '', date: new Date('2017') },
                modified: [],
                resource: {
                    id: '1',
                    type: 'Object',
                    campaigns: ['2'],
                    relations: {}
                }
            },
            {
                _id: '1',
                created: { user: '', date: new Date('2018') },
                modified: [],
                resource: {
                    id: '1',
                    type: 'Object',
                    aField: 'aValue',
                    relations: { }
                }
            },
            {
                _id: '1',
                created: { user: '', date: new Date('2019') },
                modified: [],
                resource: {
                    id: '1',
                    type: 'Object',
                    campaigns: ['3'],
                    relations: { }
                }
            }
        ];

        conflictedDocs[0]._rev = 'c1';
        conflictedDocs[1]._rev = 'c2';
        conflictedDocs[2]._rev = 'c3';

        const result = solveProjectDocumentConflict(
            current,
            conflictedDocs);

        expect(sameset(result[0].resource['campaigns'])(['1', '2', '3'])).toBeTruthy();
        expect(result[1]).toEqual(['c1', 'c3']);
    });


    it('solve all', () => {

        const current: Document = {
            _id: '1',
            created: { user: '', date: new Date() },
            modified: [],
            resource: {
                id: '1',
                type: 'Object',
                relations: {}
            }
        };
        current._conflicts = ['c1', 'c2', 'c3'];

        const conflictedDocs: Array<Document> = [
            {
                _id: '1',
                created: { user: '', date: new Date('2017') },
                modified: [],
                resource: {
                    id: '1',
                    type: 'Object',
                    relations: {}
                }
            },
            {
                _id: '1',
                created: { user: '', date: new Date('2018') },
                modified: [],
                resource: {
                    id: '1',
                    type: 'Object',
                    relations: {}
                }
            },
            {
                _id: '1',
                created: { user: '', date: new Date('2019') },
                modified: [],
                resource: {
                    id: '1',
                    type: 'Object',
                    relations: {}
                }
            }
        ];

        conflictedDocs[0]._rev = 'c1';
        conflictedDocs[1]._rev = 'c2';
        conflictedDocs[2]._rev = 'c3';

        const result = solveProjectDocumentConflict(
            current,
            conflictedDocs);

        expect(result[1]).toEqual(['c1', 'c2', 'c3']);
    });


    it('crush after unsuccesful resolution', () => {

        const current: Document = {
            _id: '1',
            created: { user: '', date: new Date() },
            modified: [],
            resource: {
                id: '1',
                type: 'Object',
                aField: 'aValue',
                relations: {}
            }
        };
        current._conflicts = ['c1', 'c2', 'c3'];

        const conflictedDocs: Array<Document> = [
            {
                _id: '1',
                created: { user: '', date: new Date('2017') },
                modified: [],
                resource: {
                    id: '1',
                    type: 'Object',
                    campaigns: ['1', '3'],
                    aField: 'aValue2',
                    relations: { }
                }
            },
            {
                _id: '1',
                created: { user: '', date: new Date('2018') },
                modified: [],
                resource: {
                    id: '1',
                    campaigns: ['1', '2'],
                    type: 'Object',
                    aField: 'aValue2',
                    relations: { }
                }
            },
            {
                _id: '1',
                created: { user: '', date: new Date('2019') },
                modified: [],
                resource: {
                    id: '1',
                    type: 'Object',
                    campaigns: ['2', '3'],
                    aField: 'aValue3',
                    relations: { }
                }
            }
        ];

        conflictedDocs[0]._rev = 'c1';
        conflictedDocs[1]._rev = 'c2';
        conflictedDocs[2]._rev = 'c3';

        const result = solveProjectDocumentConflict(
            current,
            conflictedDocs);

        expect(sameset(result[0].resource['campaigns'])(['1', '2', '3'])).toBeTruthy();
        expect(result[0].resource['aField']).toEqual('aValue');
        expect(result[1]).toEqual([]);
    });
});