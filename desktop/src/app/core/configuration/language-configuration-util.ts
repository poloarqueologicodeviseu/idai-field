import { Category, FieldDefinition, I18nString, Inplace, LanguageConfiguration } from 'idai-field-core';


export type CustomLanguageConfigurations = { [language: string]: LanguageConfiguration };


/**
 * @author Thomas Kleinke
 */
export module LanguageConfigurationUtil {

    export function updateCustomLanguageConfigurations(customLanguageConfigurations: CustomLanguageConfigurations,
                                                       editedLabel: I18nString, editedDescription: I18nString,
                                                       category: Category, field?: FieldDefinition) {

        updateCustomLanguageConfigurationSection(
            customLanguageConfigurations, 'label', editedLabel, category, field
        );
        updateCustomLanguageConfigurationSection(
            customLanguageConfigurations, 'description', editedDescription, category, field
        );
    }


    function updateCustomLanguageConfigurationSection(customLanguageConfigurations: CustomLanguageConfigurations,
                                                      section: 'label'|'description', editedI18nString: I18nString,
                                                      category: Category, field?: FieldDefinition) {

        Object.keys(editedI18nString).forEach(languageCode => {
            handleNewTextInCustomLanguageConfigurationSection(
                customLanguageConfigurations, section, editedI18nString[languageCode], languageCode, category, field
            );
        });

        Object.keys(customLanguageConfigurations)
            .filter(languageCode => !editedI18nString[languageCode])
            .forEach(languageCode => {
                deleteFromCustomLanguageConfigurationSection(
                    customLanguageConfigurations, section, languageCode, category.name, field?.name
                );
            });
    }


    function handleNewTextInCustomLanguageConfigurationSection(customLanguageConfigurations: CustomLanguageConfigurations,
                                                               section: 'label'|'description', newText: string,
                                                               languageCode: string, category: Category,
                                                               field?: FieldDefinition) {

        const definition = field ?? category;

        if (newText === definition[section === 'label' ? 'defaultLabel' : 'defaultDescription']?.[languageCode]) {
            deleteFromCustomLanguageConfigurationSection(
                customLanguageConfigurations, section, languageCode, category.name, field?.name
            );
        } else {
            addToCustomLanguageConfigurationSection(
                customLanguageConfigurations, section, newText, languageCode, category.name, field?.name
            );
        }
    }


    function deleteFromCustomLanguageConfigurationSection(customLanguageConfigurations: CustomLanguageConfigurations,
                                                          section: 'label'|'description', languageCode: string,
                                                          categoryName: string, fieldName?: string) {

        Inplace.removeFrom(
            customLanguageConfigurations,
            fieldName
                ? [languageCode, 'categories', categoryName, 'fields', fieldName, section]
                : [languageCode, 'categories', categoryName, section]
        );
    }


    function addToCustomLanguageConfigurationSection(customLanguageConfigurations: CustomLanguageConfigurations,
                                                     section: 'label'|'description', newText: string,
                                                     languageCode: string, categoryName: string,
                                                     fieldName?: string) {

        Inplace.setOn(
            customLanguageConfigurations,
            fieldName
                ? [languageCode, 'categories', categoryName, 'fields', fieldName, section]
                : [languageCode, 'categories', categoryName, section]
        )(newText);
    }
}
