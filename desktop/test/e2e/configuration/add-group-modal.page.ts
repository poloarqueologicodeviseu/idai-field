import { click, typeIn } from '../app';


/**
 * @author Thomas Kleinke
 */
export class AddGroupModalPage {

    // click

    public static clickSelectGroup(groupName: string) {

        return click('#select-group-' + groupName.replace(':', '-'));
    }


    public static clickCreateNewGroup() {

        return click('.new-entry-button');
    }


    public static clickConfirmSelection() {

        return click('#confirm-selection-button');
    }


    // type in

    public static typeInSearchFilterInput(text: string) {

        return typeIn('#group-name', text);
    }
}
