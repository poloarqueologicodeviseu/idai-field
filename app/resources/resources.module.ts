import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {IdaiDocumentsModule} from 'idai-components-2/documents';
import {IdaiWidgetsModule} from 'idai-components-2/widgets'
import {ResourcesComponent} from './resources.component';
import {GeometryViewComponent} from './geometry-view.component';
import {EditableMapComponent} from './map/editable-map.component';
import {MapWrapperComponent} from './map-wrapper.component';
import {ListComponent} from './list/list.component';
import {RowComponent} from './list/row.component';
import {PlusButtonComponent} from './plus-button.component';
import {WidgetsModule} from '../widgets/widgets.module'
import {DoceditModule} from '../docedit/docedit.module';
import {ResourcesState} from './resources-state';
import {ResourcesStateSerializer} from './resources-state-serializer';
import {ThumbnailViewComponent} from "./thumbnail-view.component";
import {ImageGridModule} from "../imagegrid/image-grid.module";

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        NgbModule,
        IdaiDocumentsModule,
        WidgetsModule,
        ImageGridModule,
        IdaiWidgetsModule,
        DoceditModule
    ],
    declarations: [
        ResourcesComponent,
        GeometryViewComponent,
        EditableMapComponent,
        MapWrapperComponent,
        ListComponent,
        RowComponent,
        PlusButtonComponent,
        ThumbnailViewComponent
    ],
    providers: [
        ResourcesState,
        ResourcesStateSerializer
    ],
    exports: [
        GeometryViewComponent
    ]
})

export class ResourcesModule {}