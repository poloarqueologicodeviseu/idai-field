import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { I18n } from '@ngx-translate/i18n-polyfill';
import { FieldResource } from 'idai-field-core';
import { DataUrlMaker } from '../../../core/images/imagestore/data-url-maker';
import { Imagestore } from '../../../core/images/imagestore/imagestore';


@Component({
    selector: 'thumbnail',
    templateUrl: './thumbnail.html'
})
/**
 * @author Thomas Kleinke
 */
export class ThumbnailComponent implements OnChanges {

    @Input() resource: FieldResource;

    @Output() onClick: EventEmitter<void> = new EventEmitter<void>();

    public thumbnailUrl: SafeResourceUrl|undefined;


    constructor(private imagestore: Imagestore,
                private i18n: I18n,
                private sanitizer: DomSanitizer) {}


    public isThumbnailFound = (): boolean => this.thumbnailUrl !== DataUrlMaker.blackImg;

    public onImageClicked = () => this.onClick.emit();


    async ngOnChanges() {

        await this.updateThumbnailUrl();
    }


    public getNumberOfImagesTooltip(): string {

        return this.getNumberOfImages() === 1
            ? this.i18n({
                id: 'widgets.documentInfo.thumbnail.oneLinkedImage',
                value: 'Ein verknüpftes Bild'
            })
            : this.getNumberOfImages() + ' ' + this.i18n({
                id: 'widgets.documentInfo.thumbnail.linkedImages',
                value: 'verknüpfte Bilder'
            });
    }


    public getNumberOfImages(): number {

        return this.resource.relations.isDepictedIn
            ? this.resource.relations.isDepictedIn.length
            : 0;
    }


    private async updateThumbnailUrl() {

        this.thumbnailUrl = await this.getThumbnailUrl(this.resource.relations.isDepictedIn);
    }


    private async getThumbnailUrl(relations: string[]|undefined): Promise<SafeResourceUrl|undefined> {

        if (!relations || relations.length === 0) return undefined;

        let thumbUrl: string;
        try {
            thumbUrl = await this.imagestore.read(relations[0], true);
        } catch (e) {
            thumbUrl = DataUrlMaker.blackImg;
        }
        return this.sanitizer.bypassSecurityTrustUrl(thumbUrl);
    }
}
