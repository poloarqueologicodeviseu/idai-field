import {DatastoreErrors} from 'idai-components-2';
import {ValidationErrors} from '../../core/model/validation-errors';
import {M} from '../messages/m';
import {ProjectConfiguration} from '../../core/configuration/project-configuration';


/**
 * Converts datastore errors and messages of Validator to messages of M for DoceditComponent.
 *
 * @author Daniel de Oliveira
 * @author Thomas Kleinke
 */
export module MessagesConversion {

    export function convertMessage(msgWithParams: string[], projectConfiguration: ProjectConfiguration): string[] {

        if (msgWithParams.length === 0) return [];

        const msg = msgWithParams[0];

        if (msg === DatastoreErrors.GENERIC_ERROR) msgWithParams[0] = M.APP_ERROR_GENERIC_SAVE_ERROR;
        if (msg === DatastoreErrors.REMOVE_REVISIONS_ERROR) msgWithParams[0]= M.DOCEDIT_ERROR_RESOLVE_CONFLICT;

        if (msg === ValidationErrors.NO_ISRECORDEDIN) msgWithParams[0] = M.DOCEDIT_VALIDATION_ERROR_NO_RECORDEDIN;
        if (msg === ValidationErrors.NO_ISRECORDEDIN_TARGET) msgWithParams[0] = M.DOCEDIT_VALIDATION_ERROR_NO_RECORDEDIN_TARGET;
        if (msg === ValidationErrors.IDENTIFIER_ALREADY_EXISTS) msgWithParams[0] = M.MODEL_VALIDATION_IDENTIFIER_ALREADY_EXISTS;
        if (msg === ValidationErrors.GENERIC_DATASTORE) msgWithParams[0] = M.IMPORT_READER_GENERIC_DATASTORE;
        if (msg === ValidationErrors.INVALID_COORDINATES) msgWithParams[0] = M.MODEL_VALIDATION_INVALID_COORDINATES;
        if (msg === ValidationErrors.MISSING_COORDINATES) msgWithParams[0] = M.MODEL_VALIDATION_MISSING_COORDINATES;
        if (msg === ValidationErrors.MISSING_GEOMETRY_TYPE) msgWithParams[0] = M.MODEL_VALIDATION_MISSING_GEOMETRYTYPE;
        if (msg === ValidationErrors.UNSUPPORTED_GEOMETRY_TYPE) msgWithParams[0] = M.MODEL_VALIDATION_UNSUPPORTED_GEOMETRY_TYPE;

        if (msg === ValidationErrors.MISSING_PROPERTY) {
            msgWithParams[0] = M.DOCEDIT_VALIDATION_ERROR_MISSING_PROPERTY;
            msgWithParams[2] = replaceFieldNamesWithLabels(msgWithParams[2], msgWithParams[1], projectConfiguration);
            msgWithParams[1] = projectConfiguration.getLabelForType(msgWithParams[1]);
        }

        if (msg === ValidationErrors.INVALID_NUMERICAL_VALUES) {
            if (msgWithParams.length > 2 && msgWithParams[2].includes(',')) {
                msgWithParams[0] = M.DOCEDIT_VALIDATION_ERROR_INVALID_NUMERIC_VALUES;
                msgWithParams[2] = replaceFieldNamesWithLabels(msgWithParams[2], msgWithParams[1], projectConfiguration);
                msgWithParams[1] = projectConfiguration.getLabelForType(msgWithParams[1]);
            } else {
                msgWithParams[0] = M.DOCEDIT_VALIDATION_ERROR_INVALID_NUMERIC_VALUE;
                msgWithParams[2] = projectConfiguration.getFieldDefinitionLabel(msgWithParams[1], msgWithParams[2]);
                msgWithParams[1] = projectConfiguration.getLabelForType(msgWithParams[1]);
            }
        }

        if (msg === ValidationErrors.INVALID_DATING_VALUES) {
            if (msgWithParams.length > 2 && msgWithParams[2].includes(',')) {
                msgWithParams[0] = M.DOCEDIT_VALIDATION_ERROR_INVALID_DATING_VALUES;
                msgWithParams[2] = replaceFieldNamesWithLabels(msgWithParams[2], msgWithParams[1], projectConfiguration);
                msgWithParams[1] = projectConfiguration.getLabelForType(msgWithParams[1]);
            } else {
                msgWithParams[0] = M.DOCEDIT_VALIDATION_ERROR_INVALID_DATING_VALUE;
                msgWithParams[2] = projectConfiguration.getFieldDefinitionLabel(msgWithParams[1], msgWithParams[2]);
                msgWithParams[1] = projectConfiguration.getLabelForType(msgWithParams[1]);
            }
        }

        if (msg === ValidationErrors.INVALID_DIMENSION_VALUES) {
            if (msgWithParams.length > 2 && msgWithParams[2].includes(',')) {
                msgWithParams[0] = M.DOCEDIT_VALIDATION_ERROR_INVALID_DIMENSION_VALUES;
                msgWithParams[2] = replaceFieldNamesWithLabels(msgWithParams[2], msgWithParams[1], projectConfiguration);
                msgWithParams[1] = projectConfiguration.getLabelForType(msgWithParams[1]);
            } else {
                msgWithParams[0] = M.DOCEDIT_VALIDATION_ERROR_INVALID_DIMENSION_VALUE;
                msgWithParams[2] = projectConfiguration.getFieldDefinitionLabel(msgWithParams[1], msgWithParams[2]);
                msgWithParams[1] = projectConfiguration.getLabelForType(msgWithParams[1]);
            }
        }

        if (msg === ValidationErrors.INVALID_DECIMAL_SEPARATORS) {
            if (msgWithParams.length > 2 && msgWithParams[2].includes(',')) {
                msgWithParams[0] = M.DOCEDIT_VALIDATION_ERROR_INVALID_DECIMAL_SEPARATORS;
                msgWithParams[2] = replaceFieldNamesWithLabels(msgWithParams[2], msgWithParams[1], projectConfiguration);
                msgWithParams[1] = projectConfiguration.getLabelForType(msgWithParams[1]);
            } else {
                msgWithParams[0] = M.DOCEDIT_VALIDATION_ERROR_INVALID_DECIMAL_SEPARATOR;
                msgWithParams[2] = projectConfiguration.getFieldDefinitionLabel(msgWithParams[1], msgWithParams[2]);
                msgWithParams[1] = projectConfiguration.getLabelForType(msgWithParams[1]);
            }
        }

        return msgWithParams;
    }


    function replaceFieldNamesWithLabels(fieldNames: string, typeName: string,
                                         projectConfiguration: ProjectConfiguration): string {

        return fieldNames
            .split(', ')
            .map(fieldName => projectConfiguration.getFieldDefinitionLabel(typeName, fieldName))
            .join(', ');
    }
}