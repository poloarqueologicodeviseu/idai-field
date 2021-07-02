import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ImageDocument } from 'idai-field-core';
import { DataUrlMaker } from '../../../core/images/imagestore/data-url-maker';
import { ImageContainer } from '../../../core/images/imagestore/image-container';
import { Imagestore } from '../../../core/images/imagestore/imagestore';
import { M } from '../../messages/m';
import { Messages } from '../../messages/messages';
import { showMissingImageMessageOnConsole, showMissingOriginalImageMessageOnConsole } from '../log-messages';


@Component({
    selector: 'image-viewer',
    templateUrl: './image-viewer.html'
})
/**
 * @author Thomas Kleinke
 * @author Daniel de Oliveira
 */
export class ImageViewerComponent implements OnInit, OnChanges {

    @Input() image: ImageDocument;

    public imageContainer: ImageContainer;


    constructor(private imagestore: Imagestore,
                private messages: Messages,
                private sanitizer: DomSanitizer) {}


    ngOnInit() {

        if (!this.imagestore.getPath()) this.messages.add([M.IMAGESTORE_ERROR_INVALID_PATH_READ]);
    }


    async ngOnChanges() {

        if (this.image) this.imageContainer = await this.loadImage(this.image);
    }


    public containsOriginal(image: ImageContainer): boolean {

        return image.imgSrc !== undefined && image.imgSrc !== '';
    }


    private async loadImage(document: ImageDocument): Promise<ImageContainer> {

        const image: ImageContainer = { document: document };

        let imageUrl: string;
        try {
            imageUrl = await this.imagestore.read(document.resource.id, false);
        } catch (e) {
            imageUrl = DataUrlMaker.blackImg;
        }
        image.imgSrc = this.sanitizer.bypassSecurityTrustUrl(imageUrl);

        let thumbUrl: string;
        try {
            thumbUrl = await this.imagestore.read(document.resource.id, true);
        } catch (e) {
            image.thumbSrc = DataUrlMaker.blackImg;
        }
        image.thumbSrc = this.sanitizer.bypassSecurityTrustUrl(thumbUrl);

        this.showConsoleErrorIfImageIsMissing(image);

        return image;
    }


    private showConsoleErrorIfImageIsMissing(image: ImageContainer) {

        if (this.containsOriginal(image)) return;

        const imageId: string = image.document && image.document.resource
            ? image.document.resource.id
            : 'unknown';

        if (image.thumbSrc === DataUrlMaker.blackImg) {
            showMissingImageMessageOnConsole(imageId);
        } else {
            showMissingOriginalImageMessageOnConsole(imageId);
        }
    }
}
