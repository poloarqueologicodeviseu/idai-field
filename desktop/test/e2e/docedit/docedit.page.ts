import { waitForNotExist, click, waitForExist, getElements, getElement, typeIn, selectOption, getValue,
    getText } from '../app';
import { NavbarPage } from '../navbar.page';


/**
 * @author Daniel de Oliveira
 * @author Thomas Kleinke
 */
export class DoceditPage {

    private static async clickSaveInModal() {

        await click('#overview-save-confirmation-modal-save-button');
        return waitForNotExist('#document-edit-wrapper');
    }


    private static clickCancelInModal() {

        return click('#overview-save-confirmation-modal-cancel-button');
    }


    private static async clickDiscardInModal() {

        await click('#overview-save-confirmation-modal-discard-button');
        return waitForNotExist('#document-edit-wrapper');
    }


     public static async clickCloseEdit(action?: 'discard'|'cancel'|'save') {

        await waitForExist('#document-edit-button-goto-view');
        await click('#document-edit-button-goto-view');

        if (action === 'discard') return this.clickDiscardInModal();
        if (action === 'cancel') return this.clickCancelInModal();
        if (action === 'save') return this.clickSaveInModal();
    };


    public static clickGotoTimeTab() {

        return click('#edit-form-goto-time');
    };


    public static clickGotoPropertiesTab() {

        return click('#edit-form-goto-properties');
    }


    public static clickGotoImagesTab() {

        return click('#edit-form-goto-images');
    }


    public static clickGotoIdentificationTab() {

        return click('#edit-form-goto-identification');
    }


    public static clickGotoPositionTab() {

        return click('#edit-form-goto-position');
    }


    public static clickGotoDimensionTab() {

        return click('#edit-form-goto-dimension');
    }


    public static async clickSelectGroup(groupName: string) {

        return click(await this.getGroup(groupName));
    }


    public static async clickSaveDocument(clickMsgAway: boolean = false, waitForModalToClose: boolean = true) {

        await waitForExist('#document-edit-button-save-document');
        await click('#document-edit-button-save-document');
                    
        if (clickMsgAway) await NavbarPage.clickCloseAllMessages();
        if (waitForModalToClose) await waitForNotExist('#document-edit-wrapper');
    };


    public static async clickDuplicateDocument() {

        await click('#document-edit-button-dropdown');
        return click('#document-edit-button-duplicate-document');
    };


    public static async clickConfirmDuplicateInModal() {

        await click('#duplicate-confirm');
        return waitForNotExist('#document-edit-wrapper');
    };


    public static async clickChooseRightRevision() {

        const radioButton = (await getElements('input[type=radio]'))[1];
        return click(radioButton);
    };


    public static clickSolveConflictButton() {

        return click('#solve-conflict-button');
    };


    public static clickCategorySwitcherButton() {

        return click('#category-switcher-button');
    };


    public static clickCategorySwitcherOption(categoryName: string) {
    
        return click('#choose-category-option-' + categoryName);
    };


    public static async clickSelectOption(fieldName: string, optionValue: string) {

        return selectOption('#edit-form-element-' + fieldName + ' select', optionValue);
    };


    public static async clickCheckbox(fieldName: string, checkboxIndex: number) {

        await waitForExist('#edit-form-element-' + fieldName);
        const element = (await getElements('#edit-form-element-' + fieldName + ' .checkbox'))[checkboxIndex];
        return click(element);
    };


    public static async clickBooleanRadioButton(fieldName: string, radioButtonIndex: number) {

        await waitForExist('#edit-form-element-' + fieldName);
        const element = (await getElements('#edit-form-element-' + fieldName + ' input'))[radioButtonIndex];
        return click(element);
    }


    // get text

    public static async getInputFieldValue(index) {

        const element = (await getElements('dai-input input'))[index];
        return getValue(element);
    };


    public static async getFieldLabel(fieldName: string) {

        const fieldElement = await this.getField(fieldName);
        return getText(await fieldElement.$('.card-title'));
    }


    public static async getGroupLabel(groupName: string) {

        return getText(await this.getGroup(groupName));
    }


    // elements

    public static getNumberOfDuplicatesInputField() {

        return getElement('#duplicate-input');
    }


    public static getCheckboxes(fieldName: string) {

        return getElements('#edit-form-element-' + fieldName + ' .checkbox');
    }


    public static getGeometryEditWidget() {

        return getElement('dai-geometry');
    }


    public static getField(fieldName: string) {

        return getElement('#edit-form-element-' + fieldName.replace(':', '-'));
    }


    public static async getFieldFormGroup(fieldName: string) {

        return (await this.getField(fieldName)).$('.form-group');
    }


    public static getGroup(groupName: string) {

        return getElement('#edit-form-goto-' + groupName.replace(':', '-'));
    }


    // type in

    public static typeInInputField(fieldName: string, text: string) {

        return typeIn('#edit-form-element-' + fieldName + ' input', text);
    };


    public static async typeInNumberOfDuplicates(numberOfDuplicates: string) {

        return typeIn(await this.getNumberOfDuplicatesInputField(), numberOfDuplicates);
    }
}
