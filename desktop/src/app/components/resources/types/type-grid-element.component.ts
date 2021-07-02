import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
    @Input() images?: Array<string>;

    public imageUrls: Array<SafeResourceUrl> = [];


    constructor(private sanitizer: DomSanitizer) {}


    async ngOnChanges(changes: SimpleChanges) {

        if (changes['document'] || changes['images']) await this.loadImages();
    }


    private async loadImages() {

        this.imageUrls = [];

        if (!this.images) return;

        for (let image of this.images) {
            const safeUrl = this.sanitizer.bypassSecurityTrustUrl(image);
            this.imageUrls.push(safeUrl);
        }
    }
}
