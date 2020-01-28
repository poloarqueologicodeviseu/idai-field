import {ImageDocument} from 'idai-components-2';
import {ImageRow} from '../../../../../app/core/images/row/image-row';


describe('ImageRow', () => {

    it('first page', () => {

        const imageDocuments = [
            {
                resource: {
                    type: 'Drawing', id: 'i1', identifier: 'I1', width: 100,
                    height: 100, relations: { depicts: []},
                    shortDescription: 'S1', originalFilename: 'blub'
                }
            }
        ] as unknown as Array<ImageDocument>;

        const imageRow = new ImageRow(1000, 100, 100, imageDocuments);

        const nextPageResult = imageRow.nextPage();
        expect(nextPageResult.newImageIds).toEqual(['i1']);
        expect(nextPageResult.scrollWidth).toBe(0);
    });
});