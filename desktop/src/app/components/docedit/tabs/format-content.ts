import { flow, isArray, isObject, isString } from 'tsfun';
import { Dating, Dimension, Labels, Literature, OptionalRange, Resource } from 'idai-field-core';

export type InnerHTML = string;


/**
 * @author Daniel de Oliveira
 */
export function formatContent(resource: Resource, field: any,
                              getTranslation: (key: string) => string,
                              transform: (value: any) => string|null,
                              labels: Labels): InnerHTML {

    const fieldContent = resource[field.name];

    return isArray(fieldContent)
        ? flow(fieldContent,
            convertArray(field, getTranslation, transform, labels),
            formatArray)
        : isObject(fieldContent)
        ? flow(fieldContent,
            convertObject(field, getTranslation, labels),
            formatObject)
        : formatSingleValue(fieldContent, field, getTranslation);
}


function formatArray(fieldContent: Array<string>): InnerHTML {

    let contentString: string = '<div>';
    for (let i = 0; i < fieldContent.length; i++) {
        if (contentString.length > 6) contentString;
        if (i !== 0) contentString += '<br>';
        contentString += fieldContent[i];
    }
    return contentString += '</div>';
}


function formatObject(fieldContent: string): InnerHTML {

    return fieldContent; // currently not special handling
}


const formatSingleValue = (fieldContent: any, field: any, getTranslation: (key: string) => string) => {

    if (field.inputType === 'boolean') {
        return getTranslation(JSON.stringify(fieldContent));
    } else {
        return fieldContent;
    }
};


const convertObject = (field: any, getTranslation: (key: string) => string, labels: Labels) =>
        (fieldContent: any) => {

    if (field.inputType === 'dropdownRange' && OptionalRange.buildIsOptionalRange(isString)(fieldContent)) {
        return OptionalRange.generateLabel(
            fieldContent,
            getTranslation,
            (value: string) => labels.getValueLabel(field.valuelist, value)
        );
    } else {
        return JSON.stringify(fieldContent);
    }
};


const convertArray = (field: any, getTranslation: (key: string) => string, transform: (value: any) => string|null, labels: Labels) =>
        (fieldContent: Array<any>): Array<string> => {

    return fieldContent.map(element => {

        if (field.inputType === 'dimension' && Dimension.isDimension(element)) {
            return Dimension.generateLabel(element, transform, getTranslation,
                labels.getValueLabel(field.valuelist, element.measurementPosition));
        } else if (field.inputType === 'dating' && Dating.isDating(element)) {
            return Dating.generateLabel(element, getTranslation);
        } else if (field.inputType === 'literature' && Literature.isLiterature(element)) {
            return Literature.generateLabel(element, getTranslation)
        } else if (isString(element)) {
            return field.valuelist ? labels.getValueLabel(field.valuelist, element) : element;
        } else {
            return JSON.stringify(element);
        }
    });
};
