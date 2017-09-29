import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Datastore} from 'idai-components-2/datastore';
import {Messages} from 'idai-components-2/messages';
import {IdaiFieldDocument} from 'idai-components-2/idai-field-model';
import {DocumentEditChangeMonitor} from 'idai-components-2/documents';
import {Imagestore} from '../imagestore/imagestore';
import {DoceditComponent} from '../docedit/docedit.component';
import {ViewUtility} from '../common/view-utility';
import {ObjectUtil} from '../util/object-util';
import {BlobMaker} from "../imagestore/blob-maker";
import {M} from "../m";
import {ImageContainer} from "../imagestore/image-container";
import {IdaiFieldImageDocument} from "../model/idai-field-image-document";

@Component({
    moduleId: module.id,
    templateUrl: './image-view.html'
})
/**
 * @author Daniel de Oliveira
 */
export class ImageViewComponent implements OnInit {

    protected image: ImageContainer = {};
    protected activeTab: string;

    private originalNotFound = false;

    constructor(
        private route: ActivatedRoute,
        private datastore: Datastore,
        private imagestore: Imagestore,
        private messages: Messages,
        private router: Router,
        private modalService: NgbModal,
        private documentEditChangeMonitor: DocumentEditChangeMonitor,
        private viewUtility: ViewUtility
    ) { }

    ngOnInit() {

        this.getRouteParams((id) => {
            this.fetchDocAndImage(id);
        });
        window.getSelection().removeAllRanges();
    }

    public jumpToRelationTarget(documentToJumpTo: IdaiFieldDocument) {

        this.viewUtility.getViewNameForDocument(documentToJumpTo)
            .then(viewName => this.router.navigate(['resources', viewName, documentToJumpTo.resource.id,
                'view', 'images']));
    }

    public deselect() {

        this.router.navigate(['images']);
    }

    public startEdit(doc: IdaiFieldDocument) {

        const detailModalRef = this.modalService.open(DoceditComponent, {size: 'lg', backdrop: 'static'});
        const detailModal = detailModalRef.componentInstance;

        detailModalRef.result.then(result => {
            if (result.document) this.image.document = result.document;
        }, closeReason => {
            this.documentEditChangeMonitor.reset();
            if (closeReason == 'deleted') this.deselect();
        });

        detailModal.setDocument(doc);
    }

    public hasRelations() {

        return !ObjectUtil.isEmpty(this.image.document.resource.relations);
    }

    private fetchDocAndImage(id) {

        if (!this.imagestore.getPath()) return this.messages.add([M.IMAGESTORE_ERROR_INVALID_PATH_READ]);

        this.datastore.get(id).then(
            doc => {
                this.image.document = doc as IdaiFieldImageDocument;
                if (doc.resource.filename) {
                    // read original (empty if not present)
                    this.imagestore.read(doc.resource.id, false, false)
                        .then(url => {
                            if (!url || url == '') this.originalNotFound = true;
                            this.image.imgSrc = url;
                        })
                        // read thumb
                        .then(() => this.imagestore.read(doc.resource.id, false, true))
                        .then(url => this.image.thumbSrc = url)
                        .catch(() => {
                            this.image.imgSrc = BlobMaker.blackImg;
                            this.messages.add([M.IMAGES_ONE_NOT_FOUND]);
                        });
                }
            },
            () => {
                console.error("Fatal error: could not load document for id ", id);
            });
    }

    private getRouteParams(callback) {
        this.route.params.forEach((params: Params) => {
            this.activeTab = params['tab'];
            callback(params['id']);
        });
    }
}
