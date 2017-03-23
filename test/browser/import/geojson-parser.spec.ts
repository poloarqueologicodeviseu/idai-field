import {GeojsonParser} from "../../../app/import/geojson-parser";
import {Document} from "idai-components-2/core";
import {M} from "../../../app/m";

/**
 * @author Daniel de Oliveira
 */
export function main() {

    function expectErr(fileContent,which,done) {

        const parser = new GeojsonParser();
        parser.parse(fileContent).subscribe(() => {
            fail('should not emit next');
        }, err => {
            expect(err[0]).toBe(which);
            done();
        },()=>fail('should not complete'));
    }


    describe('GeojsonParser', () => {

        it('should take a feature collection and make documents', (done) => {

            const fileContent  = '{ "type": "FeatureCollection", "features": [' +
                '{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [102.0, 0.5] }, "properties": { "identifier": "122" } }, ' +
                '{ "type": "Feature", "geometry": { "type": "Polygon", "coordinates": [ [102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0] ] }, "properties" : {"identifier":"123"} }' +
                '] }';

            const parser = new GeojsonParser();
            const docs: Document[] = [];
            parser.parse(fileContent).subscribe(resultDocument => {
                expect(resultDocument).not.toBe(undefined);
                docs.push(resultDocument);
            }, err => {
                fail(err);
                done();
            }, () => {
                expect(docs[0].resource['identifier']).toEqual("122");
                expect(docs[0].resource['geometry']['type']).toEqual("Point");

                expect(docs[1].resource['identifier']).toEqual("123");
                expect(docs[1].resource['geometry']['type']).toEqual("Polygon");

                expect(docs.length).toEqual(2);
                // expect(parser.getWarnings()[0]).toEqual([M.IMPORTER_WARNING_NOMULTIPOLYGONSUPPORT]);
                done();
            });
        });

        it('should emit an error on invalid json', (done) => {

            expectErr('{ "type": "FeatureCollection", "features": [' +
                '{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [102.0, 0.5] }, "properties": { "identifier": "122" } }, ' +
                '{ "type": "Feature", "geometry": { "type": "LineString", "coordinates": [ [102.0, 0.0], [103.0, 1.0], [104.0, 0.0], [105.0, 1.0] ] }, "properties" : {"identifier":"123"} }' +
                '] ' // missing closing brace
                , M.IMPORT_FAILURE_INVALIDJSON, done);
        });

        it('should emit an error on invalid structure', (done) => {

            expectErr('{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [102.0, 0.5] }, "properties": { "identifier": "122" } } '
                , M.IMPORT_FAILURE_INVALID_GEOJSON_IMPORT_STRUCT, done);
        });

        it('should emit an error on unsupported type', (done) => {

            expectErr('{ "type": "FeatureCollection", "features": [' +
                '{ "type": "Feature", "geometry": { "type": "LineString", "coordinates": [102.0, 0.5] }, "properties": { "identifier": "122" } } ' +
                '] }'
                , M.IMPORT_FAILURE_INVALID_GEOJSON_IMPORT_STRUCT, done);
        });

        it('should emit an error missing identifier', (done) => {

            expectErr('{ "type": "FeatureCollection", "features": [' +
                '{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [102.0, 0.5] }, "properties": { } } ' +
                '] }'
                , M.IMPORT_FAILURE_MISSING_IDENTIFIER, done);
        });

        it('should emit an error missing properties', (done) => {

            expectErr('{ "type": "FeatureCollection", "features": [' +
                '{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [102.0, 0.5] }} ' +
                '] }'
                , M.IMPORT_FAILURE_MISSING_IDENTIFIER, done);
        });

        it('should emit on numerical identifier', (done) => {

            expectErr('{ "type": "FeatureCollection", "features": [' +
                '{ "type": "Feature", "geometry": { "type": "Point", "coordinates": [102.0, 0.5] }, "properties": { "identifier": 122 } } ' +
                '] }'
                , M.IMPORT_FAILURE_IDENTIFIER_FORMAT, done);
        });

    });
}