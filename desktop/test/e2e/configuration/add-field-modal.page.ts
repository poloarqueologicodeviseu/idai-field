import { click, getElement, typeIn } from '../app';


/**
 * @author Thomas Kleinke
 */
export class AddFieldModalPage {

    // click

    public static clickSelectField(fieldName: string) {

        return click(this.getSelectFieldButton(fieldName));
    }


    public static clickConfirmSelection() {

        return click('#confirm-selection-button');
    }


    // get

    public static getSelectFieldButton(fieldName: string) {

        return getElement('#select-field-' + fieldName);
    }


    // type in

    public static typeInSearchFilterInput(text: string) {

        return typeIn('#field-name', text);
    }
}
