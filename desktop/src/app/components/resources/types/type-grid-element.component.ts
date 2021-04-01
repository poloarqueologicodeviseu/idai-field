import {Input, Component, OnChanges, SimpleChanges} from '@angular/core';
import {SafeResourceUrl} from '@angular/platform-browser';
import {ReadImagestore} from '../../../core/images/imagestore/read-imagestore';
import {FieldDatastore} from '../../../core/datastore/field/field-datastore';
import {ImageDatastore} from '../../../core/datastore/field/image-datastore';
import {BlobMaker} from '../../../core/images/imagestore/blob-maker';
import { FieldDocument } from 'idai-field-core';

@Component({
    selector: 'type-grid-element',
    templateUrl: './type-grid-element.html'
})
/**
 * @author Thomas Kleinke
 * @author Sebastian Cuy
 */
export class TypeGridElementComponent implements OnChanges {

    @Input() document: FieldDocument;
    @Input() subtype?: FieldDocument;
    @Input() images?: Array<Blob>;

    public imageUrls: Array<SafeResourceUrl> = [];


    constructor(imagestore: ReadImagestore, // TODO unused
                fieldDatastore: FieldDatastore,
                imageDatastore: ImageDatastore,
                private blobMaker: BlobMaker) {}


    async ngOnChanges(changes: SimpleChanges) {

        if (changes['document'] || changes['images']) await this.loadImages();
    }


    private async loadImages() {

        this.imageUrls = [];

        if (!this.images) return;

        for (let blob of this.images) {
            const url = this.blobMaker.makeBlob(blob);
            this.imageUrls.push(url.safeResourceUrl);
        }
    }
}
