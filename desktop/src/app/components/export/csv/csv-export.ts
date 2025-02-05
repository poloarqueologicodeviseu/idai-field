import { flow, includedIn, isDefined, isNot, isnt, map, cond, dense, compose, remove, on, is } from 'tsfun';
import { Resource, FieldResource, StringUtils, Relation, Field } from 'idai-field-core';
import { CSVMatrixExpansion } from './csv-matrix-expansion';
import { CsvExportUtils } from './csv-export-utils';
import { CsvExportConsts, Heading, Headings, HeadingsAndMatrix, Matrix } from './csv-export-consts';
import OBJECT_SEPARATOR = CsvExportConsts.OBJECT_SEPARATOR;
import RELATIONS_IS_CHILD_OF = CsvExportConsts.RELATIONS_IS_CHILD_OF;
import ARRAY_SEPARATOR = CsvExportConsts.ARRAY_SEPARATOR;


export type CSVExportResult = {
    csvData: string[];
    invalidFields: Array<InvalidField>;
}


export type InvalidField = {
    identifier: string;
    fieldName: string;
};


/**
 * @author Daniel de Oliveira
 */
export module CSVExport {

    const SEPARATOR = ',';

    const getUsableFieldNames =
        remove(includedIn(
            ['id', 'category', 'geometry', 'georeference', 'originalFilename', 'filename', 'featureVectors']));

    /**
     * Creates a header line and lines for each record.
     * If resources is empty, still a header line gets created.
     *
     * @param resources
     * @param fieldDefinitions
     * @param relations
     */
    export function createExportable(resources: Array<FieldResource>,
                                     fieldDefinitions: Array<Field>,
                                     relations: Array<string>) {

        fieldDefinitions = fieldDefinitions.filter(field => field.inputType !== Field.InputType.RELATION);

        const headings: string[] = makeHeadings(fieldDefinitions, relations);
        const matrix = resources
            .map(CsvExportUtils.convertToResourceWithFlattenedRelations)
            .map(toRowsArrangedBy(headings));

        const invalidFields: Array<InvalidField> = removeInvalidFieldData(
            headings, matrix, fieldDefinitions
        );

        const csvData: string[] = flow(
            [headings, matrix],
            CSVMatrixExpansion.expandOptionalRangeVal(fieldDefinitions),
            CSVMatrixExpansion.expandDating(fieldDefinitions),
            CSVMatrixExpansion.expandDimension(fieldDefinitions),
            CSVMatrixExpansion.expandLiterature(fieldDefinitions),
            combine
        );

        return { csvData, invalidFields };
    }


    function combine([headings, matrix]: HeadingsAndMatrix) {

        return [headings].concat(matrix).map(toCsvLine);
    }


    function makeHeadings(fieldDefinitions: Array<Field>, relations: string[]) {

        return extractExportableFields(fieldDefinitions)
            .concat(
                relations
                    .filter(isNot(includedIn(Relation.Hierarchy.ALL)))
                    .map(s => Resource.RELATIONS + OBJECT_SEPARATOR + s))
            .concat(relations.find(includedIn(Relation.Hierarchy.ALL)) ? [RELATIONS_IS_CHILD_OF] : []);
    }


    function toRowsArrangedBy(headings: Heading[]) {

        return (resource: FieldResource) => {

            return getUsableFieldNames(Object.keys(resource))
                .reduce((row, fieldName) => {

                    const indexOfFoundElement = headings.indexOf(fieldName);
                    if (indexOfFoundElement !== -1) {
                        row[indexOfFoundElement] = (resource as any)[fieldName];
                    }

                    return row;
                }, dense(headings.length));
        }
    }


    function removeInvalidFieldData(headings: Headings, matrix: Matrix,
                                    fieldDefinitions: Array<Field>): Array<InvalidField> {

        const invalidFields: Array<InvalidField> = [];
        const identifierIndex: number = headings.indexOf(Resource.IDENTIFIER);

        headings.forEach((heading, index) => {
            const field: Field = fieldDefinitions.find(on(Field.NAME, is(heading)));
            if (!field) return;

            matrix.filter(row => {
                return row[index] !== undefined && !Field.InputType.isValidFieldData(row[index], field.inputType);
            }).forEach(row => {
                delete row[index];
                invalidFields.push({ identifier: row[identifierIndex], fieldName: field.name });
            });
        });

        return invalidFields;
    }


    function extractExportableFields(fieldDefinitions: Array<Field>): string[] {

        let fieldNames = getUsableFieldNames(fieldDefinitions.map(_ => _.name));
        const indexOfShortDescription = fieldNames.indexOf(FieldResource.SHORTDESCRIPTION);
        if (indexOfShortDescription !== -1) {
            fieldNames.splice(indexOfShortDescription, 1);
            fieldNames.unshift(FieldResource.SHORTDESCRIPTION);
        }
        fieldNames = fieldNames.filter(isnt(Resource.IDENTIFIER));
        fieldNames.unshift(Resource.IDENTIFIER);

        return fieldNames;
    }


    function toCsvLine(fields: string[]): string {

        return flow(
            fields,
            map(
                cond(isDefined,
                    compose(getFieldValue,
                        StringUtils.append('"'),
                        StringUtils.prepend('"')),
                    '""')),
            StringUtils.join(SEPARATOR));
    }


    function getFieldValue(field: any): string {

        const value: string = Array.isArray(field)
            ? field.join(ARRAY_SEPARATOR)
            : field + '';   // Convert numbers to strings

        return value.replace(new RegExp('"', 'g'), '""');
    }
}
