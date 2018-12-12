import * as fs from 'fs';
import {Feature, FeatureCollection, GeometryObject} from 'geojson';
import {jsonClone} from 'tsfun';
import {IdaiFieldDocument, IdaiFieldGeometry, Query} from 'idai-components-2';
import {IdaiFieldDocumentReadDatastore} from '../../core/datastore/field/idai-field-document-read-datastore';
import {M} from '../m';

/**
 * @author Thomas Kleinke
 */
export module GeoJsonExporter {

    export async function performExport(datastore: IdaiFieldDocumentReadDatastore, outputFilePath: string,
                                        operationId: string): Promise<void> {

        const documents: Array<IdaiFieldDocument> = await getGeometryDocuments(datastore, operationId);
        const featureCollection: FeatureCollection<GeometryObject> = createFeatureCollection(documents);

        return writeFile(outputFilePath, featureCollection);
    }


    async function getGeometryDocuments(datastore: IdaiFieldDocumentReadDatastore,
                                        operationId: string): Promise<Array<IdaiFieldDocument>> {

        const query: Query = createQuery(operationId);
        return (await datastore.find(query)).documents;
    }


    function createQuery(operationId: string): Query {

        const query: Query = {
            q: '',
            constraints: {
                'geometry:exist': 'KNOWN'
            }
        };

        if (operationId !== 'project') (query.constraints as any)['isRecordedIn:contain'] = operationId;

        return query;
    }


    function createFeatureCollection(documents: Array<IdaiFieldDocument>): FeatureCollection<GeometryObject> {

        return {
            type: 'FeatureCollection',
            features: documents.map(createFeature)
        };
    }


    function createFeature(document: IdaiFieldDocument): Feature<GeometryObject> {

        return {
            type: 'Feature',
            geometry: {
                type: (document.resource.geometry as IdaiFieldGeometry).type,
                coordinates: getCoordinates(document.resource.geometry as IdaiFieldGeometry)
            },
            properties: {
                identifier: document.resource.identifier
            }
        };
    }


    function writeFile(outputFilePath: string,
                       featureCollection: FeatureCollection<GeometryObject>): Promise<void> {

        return new Promise((resolve, reject) => {
            fs.writeFile(outputFilePath, JSON.stringify(featureCollection), (err: any) => {
                if (err) {
                    console.error(err);
                    reject([M.EXPORT_GEOJSON_ERROR_WRITE]);
                } else {
                    resolve();
                }
            });
        });
    }


    function getCoordinates(geometry: IdaiFieldGeometry): any {

        const coordinates: any = jsonClone(geometry.coordinates);

        if (geometry.type === 'Polygon') {
            closeRings(coordinates);
        } else if (geometry.type === 'MultiPolygon') {
            coordinates.forEach(closeRings);
        }

        return coordinates;
    }


    function closeRings(polygonCoordinates: number[][][]) {

        polygonCoordinates.forEach(ring => {
           if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) {
               ring.push([ring[0][0], ring[0][1]]);
           }
        });
    }
}