import {Component, Input, Output, OnInit, EventEmitter} from '@angular/core';
import {IdaiFieldDocument} from 'idai-components-2/idai-field-model';
import {ConfigLoader, IdaiType, ProjectConfiguration} from 'idai-components-2/configuration';
import {IdaiFieldDatastore,} from '../../datastore/idai-field-datastore';
import {ResourcesComponent} from '../resources.component';
import {Query} from 'idai-components-2/datastore';

@Component({
    selector: 'list',
    moduleId: module.id,
    templateUrl: './list.html'
})

/**
 * @author Fabian Z.
 * @author Thomas Kleinke
 */
export class ListComponent implements OnInit {

    private selectedMainTypeDocument: IdaiFieldDocument;

    private documents: {[type: string]: IdaiFieldDocument};
    private topDocuments: IdaiFieldDocument[];
    private searchResults: IdaiFieldDocument[];

    private query: string = '';

    @Output() onDocumentCreation: EventEmitter<IdaiFieldDocument> = new EventEmitter<IdaiFieldDocument>();

    public typesMap: { [type: string]: IdaiType };

    private childrenShownForIds: string[] = [];

    private awaitsReload:boolean = false;
    
    constructor(

        private datastore: IdaiFieldDatastore,
        private resourcesComponent: ResourcesComponent,
        configLoader: ConfigLoader
    ) {

        configLoader.getProjectConfiguration().then(projectConfiguration => {
            this.typesMap = projectConfiguration.getTypesMap();
        });

        const self = this;
        datastore.documentChangesNotifications().subscribe(result => {
            self.handleChange(<IdaiFieldDocument>result);
        });
    }

    ngOnInit() {
        this.resourcesComponent.getSelectedMainTypeDocument().subscribe(result => {
            this.selectedMainTypeDocument = result as IdaiFieldDocument;
            this.populateFirstLevel(this.selectedMainTypeDocument);
        });

        this.resourcesComponent.getDocuments().subscribe(result => {
            if (this.resourcesComponent.query.q != "" && this.query != this.resourcesComponent.query.q) {
                this.searchResults = <IdaiFieldDocument[]>result;
                this.decorateSearchResults();
                this.query = this.resourcesComponent.query.q;
            } else {
                if (this.resourcesComponent.query.q == '' && this.query != '') {
                    this.query = '';
                    this.childrenShownForIds = [];
                    this.handleChange("");
                }
            }
        });
    }



    public toggleChildrenForId(id:string) {
        let index = this.childrenShownForIds.indexOf(id);
        if (index != -1) {
            this.childrenShownForIds.splice(index, 1);
        } else {
            this.childrenShownForIds.push(id);
        }
    }

    public childrenHiddenFor(id: string) {
        return this.childrenShownForIds.indexOf(id) == -1
    }


    private decorateSearchResults() {
        this.topDocuments = [];
        this.documents = {};

        this.searchResults.forEach((doc, i) => {
            this.documents[doc.resource.id] = doc as IdaiFieldDocument;

            if (!doc.resource.relations["liesWithin"]) {
                this.topDocuments.push(doc as IdaiFieldDocument);
            } else {
                this.datastore.get(doc.resource.relations['liesWithin'][0]).then(pdoc => { // only first parent for simplification
                    this.topDocuments.push(<IdaiFieldDocument>pdoc);
                    this.childrenShownForIds.push(pdoc.resource.id);
                });
            }
        });
    }

    private populateFirstLevel(mainTypeDoc: IdaiFieldDocument) {
        this.topDocuments = [];
        this.documents = {};

        const query: Query = {
            constraints: {
                'resource.relations.isRecordedIn' : mainTypeDoc.resource.id,
            }
        };

        this.datastore.find(query).then( docs => {
            docs.forEach((doc, i) => {
                this.documents[doc.resource.id] = doc as IdaiFieldDocument;

                if (!doc.resource.relations["liesWithin"]) {
                    this.topDocuments.push(doc as IdaiFieldDocument);
                }
            });
            this.awaitsReload = false;
        });
    }

    private handleChange(result: any) {
        if (!this.awaitsReload) {
            this.awaitsReload = true;
            setTimeout(() => {this.populateFirstLevel(this.selectedMainTypeDocument)}, 200);
        }
    }
}