import { click, doubleClick, getElement, getElements, getValue, navigateTo, typeIn, uploadInFileInput,
    waitForExist, waitForNotExist } from '../app';
import { NavbarPage } from '../navbar.page';


export module ImageOverviewPage {

    export const selectedClass = 'selected';


    export function waitForCells() {

        return waitForExist('.cell');
    }


    // click

    export async function clickCell(index) {

        return click(await ImageOverviewPage.getCell(index));
    }


    export function chooseImageSubcategory(index) {

        return click('#choose-image-subcategory-option-' + index)
    }


    export function clickDeselectButton() {

        return click('#deselect-images');
    }


    export function clickDeleteButton() {

        return click('#delete-images');
    }


    export function clickConfirmUnlinkButton() {

        return click('#remove-link-confirm');
    }


    export function clickLinkButton() {

        return click('#create-link-btn');
    }


    export function clickUnlinkButton() {

        return click('#remove-link-btn');
    }


    export function clickCancelLinkModalButton() {

        return click('#link-modal-cancel-button');
    }


    export function clickConfirmDeleteButton() {

        return click('#delete-images-confirm');
    }


    export function clickCancelDeleteButton() {

        return click('#delete-images-cancel');
    }


    export function clickIncreaseGridSizeButton() {

        return click('#increase-grid-size-button');
    }


    // double click

    export async function doubleClickCell(index) {

        return doubleClick(await ImageOverviewPage.getCell(index));
    }


    // mouse moves

    export function clickUploadArea() {

        return click('.droparea');
    }


    // send keys

    export function uploadImage(filePath) {

        return uploadInFileInput('#file', filePath);
    }


    // text

    export async function getCellImageName(index) {

        const cell = await ImageOverviewPage.getCell(index);
        return (await cell.getAttribute('id')).substring('resource-'.length);
    }


    export async function getGridSizeSliderValue() {

        const element = await getElement('#grid-size-slider');
        return getValue(element);
    }


    // elements

    export function getAllCells() {

        return getElements('.cell');
    }


    export async function getCell(index) {

        return (await ImageOverviewPage.getAllCells())[index];
    }


    export function getCellByIdentifier(identifier: string) {

        return getElement('#resource-' + identifier.replace('.', '_'));
    }


    export function getDeleteConfirmationModal() {

        return getElement('.modal-dialog');
    }


    export function getLinkModal() {

        return getElement('#link-modal');
    }


    export async function getLinkModalListEntries() {

        await waitForExist('#document-picker ul');
        return getElements('#document-picker ul li');
    }


    export function getSuggestedResourcesInLinkModalByIdentifier(identifier) {

        return getElement('#document-picker-resource-' + identifier);
    }


    // type in

    export async function typeInIdentifierInLinkModal(identifier) {
        
        const linkModalElement = await ImageOverviewPage.getLinkModal();
        return typeIn(await linkModalElement.$('.search-bar-input'), identifier);
    }


    // sequences

    export async function createDepictsRelation(identifier) {

        const imageToConnect = await ImageOverviewPage.getCell(0);

        await click(imageToConnect);
        expect(await imageToConnect.getAttribute('class')).toMatch(selectedClass);
        await this.clickLinkButton();
        await this.typeInIdentifierInLinkModal(identifier);
        await click(await this.getSuggestedResourcesInLinkModalByIdentifier(identifier));
        await waitForNotExist('ngb-modal-backdrop');
        await NavbarPage.clickCloseNonResourcesTab();
        await NavbarPage.clickTab('project');
        return navigateTo('images');
    }
}
