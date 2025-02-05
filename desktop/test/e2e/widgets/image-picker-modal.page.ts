import { click, getElement, getElements, typeIn, waitForExist, waitForNotExist } from '../app';


/**
 * @author Daniel de Oliveira
 */
export class ImagePickerModalPage {

    // click

    public static clickAddImage() {

        return click('#image-picker-modal-header #add-image');
    }


    public static async clickAddImages() {

        await click('#image-picker-modal-header #add-images');
        return waitForNotExist(await getElement('.spinner'));
    }


    public static clickCloseButton() {
        
        return click('#image-picker-close-button');
    }


    // typeIn

    public static typeInIdentifierInSearchField(identifier) {

       return typeIn('#image-picker-modal .search-bar-input', identifier);
    }


    // elements

    public static getCells() {

        return getElements('.cell');
    }


    // wait
    
    public static waitForCells() {

        return waitForExist('.cell');
    }
}
