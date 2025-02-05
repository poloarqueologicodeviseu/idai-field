import { click, getElement } from '../app';


/**
 * @author Thomas Kleinke
 */
export class SettingsPage {

    public static clickSaveSettingsButton() {

        return click('#save-settings-button');
    };


    public static clickOpenAdvancedSettings() {

        return click('#advanced-settings-button');
    }


    public static getImagestorePathInput() {

        return getElement('#imagestorepath-input');
    };
}
