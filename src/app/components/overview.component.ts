import {Component, OnInit} from 'angular2/core';
import {Datastore} from '../services/datastore';
import {IdaiFieldObject} from '../model/idai-field-object';
import {ObjectEditComponent} from "./object-edit.component";


@Component({
    templateUrl: 'templates/overview.html',
    directives: [ObjectEditComponent]
})

/**
 * @author Sebastian Cuy
 * @author Daniel M. de Oliveira
 * @author Jan G. Wieners
 * @author Thomas Kleinke
 */
export class OverviewComponent implements OnInit {

    public selectedObject: IdaiFieldObject;
    public newObject: any;
    public objects: IdaiFieldObject[];

    constructor(
        private datastore: Datastore) {
    }

    onSelect(object: IdaiFieldObject) {

        if (this.newObject && object != this.newObject) this.checkNewObject(); 

        this.selectedObject = object;
    }

    public onCreate() {

        if (this.newObject) this.checkNewObject();

        if (!this.newObject) {
            this.newObject = {};
            this.objects.push(this.newObject);
        }

        this.selectedObject = this.newObject;
    }

    onKey(event:any) {

        if (event.target.value == "") {
            this.datastore.all({}).then(objects => {
                this.objects = objects;
            }).catch(err => console.error(err));
        } else {
            this.datastore.find(event.target.value, {}).then(objects => {
                this.objects = objects;
            }).catch(err => console.error(err));
        }
    }

    ngOnInit() {

        this.fetchObjects();
    }

    private fetchObjects() {

        this.datastore.all({}).then(objects => {
            this.objects = objects;
        }).catch(err => console.error(err));
    }

    private checkNewObject() {

        if (!this.newObject.id) {    // Replace with proper validation
            var index = this.objects.indexOf(this.newObject);
            this.objects.splice(index, 1);
        }
        this.newObject = undefined;
    }

}
