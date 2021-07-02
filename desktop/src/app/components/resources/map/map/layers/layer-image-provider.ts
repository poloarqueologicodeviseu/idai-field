import { Injectable } from '@angular/core';
import { DataUrlMaker } from '../../../../../core/images/imagestore/data-url-maker';
import { ImageContainer } from '../../../../../core/images/imagestore/image-container';
import { Imagestore } from '../../../../../core/images/imagestore/imagestore';


@Injectable()
/**
 * @author Thomas Kleinke
 * @author Daniel de Oliveira
 */
export class LayerImageProvider {

    private imageContainers: { [resourceId: string]: ImageContainer } = {};


    constructor(private imagestore: Imagestore) {}


    public async getImageContainer(resourceId: string): Promise<ImageContainer> {

        if (!this.imageContainers[resourceId]) {
            this.imageContainers[resourceId] = await this.createImageContainer(resourceId);
        }

        return this.imageContainers[resourceId];
    }


    public reset() {

        for (let resourceId of Object.keys(this.imageContainers)) {
            const thumb: boolean = !this.imageContainers[resourceId].imgSrc;
            this.imagestore.revoke(resourceId, thumb);
        }

        this.imageContainers = {};
    }


    private async createImageContainer(resourceId: string): Promise<ImageContainer> {

        let url: string;
        try {
            url = await this.imagestore.read(resourceId, false);
        } catch (err) {
            console.error('Error while creating image container. Original image not found in imagestore ' +
                'for document:', document);
            return { imgSrc: DataUrlMaker.blackImg };
        }

        if (url !== '') {
            return { imgSrc: url };
        } else {
            try {
                return { thumbSrc: await this.imagestore.read(resourceId, true) };
            } catch (err) {
                return { imgSrc: DataUrlMaker.blackImg };
            }
        }
    }
}
