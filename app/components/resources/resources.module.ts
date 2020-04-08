import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {ResourcesComponent} from './resources.component';
import {GeometryViewComponent} from './map/list/geometry-view.component';
import {EditableMapComponent} from './map/map/editable-map.component';
import {ResourcesMapComponent} from './map/resources-map.component';
import {ListComponent} from './list/list.component';
import {RowComponent} from './list/row.component';
import {PlusButtonComponent} from './plus-button.component';
import {WidgetsModule} from '../widgets/widgets.module';
import {DoceditModule} from '../docedit/docedit.module';
import {ImageGridModule} from '../image/grid/image-grid.module';
import {RoutingService} from '../routing-service';
import {DoceditLauncher} from './service/docedit-launcher';
import {SettingsService} from '../../core/settings/settings-service';
import {SidebarListComponent} from './map/list/sidebar-list.component';
import {FieldDatastore} from '../../core/datastore/field/field-datastore';
import {LayerManager} from './map/map/layer-manager';
import {LayerImageProvider} from './map/map/layer-image-provider';
import {LayerMenuComponent} from './map/map/layer-menu.component';
import {ChangesStream} from '../../core/datastore/changes/changes-stream';
import {NavigationComponent} from './navigation/navigation.component';
import {ResourcesSearchBarComponent} from './searchbar/resources-search-bar.component';
import {SearchSuggestionsComponent} from './searchbar/search-suggestions.component';
import {StandardStateSerializer} from '../../core/common/standard-state-serializer';
import {StateSerializer} from '../../core/common/state-serializer';
import {Loading} from '../widgets/loading';
import {FieldReadDatastore} from '../../core/datastore/field/field-read-datastore';
import {LayerMapComponent} from './map/map/layer-map.component';
import {ResourcesSearchConstraintsComponent} from './searchbar/resources-search-constraints.component';
import {IndexFacade} from '../../core/datastore/index/index-facade';
import {MoveModalComponent} from './move-modal.component';
import {ProjectCategories} from '../../core/configuration/project-categories';
import {ContextMenuComponent} from './widgets/context-menu.component';
import {ResourceDeletion} from './deletion/resource-deletion';
import {DeletionInProgressModalComponent} from './deletion/deletion-in-progress-modal.component';
import {ListButtonGroupComponent} from './widgets/list-button-group.component';
import {ChildrenViewComponent} from './widgets/popovermenu/children-view.component';
import {ProjectConfiguration} from '../../core/configuration/project-configuration';
import {MapComponent} from './map/map/map.component';
import {TabManager} from '../../core/tabs/tab-manager';
import {ResourcesStateManager} from '../../core/resources/view/resources-state-manager';
import {ViewFacade} from '../../core/resources/view/view-facade';
import {NavigationService} from '../../core/resources/navigation/navigation-service';
import {PopoverMenuComponent} from './widgets/popovermenu/popover-menu.component';
import {ViewModalLauncher} from './service/view-modal-launcher';
import {ImageViewerModule} from '../image/viewer/image-viewer.module';
import {TypeGridComponent} from './typegrid/type-grid.component';
import {TypeIconComponent} from './typegrid/type-icon.component';

const remote = require('electron').remote;

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        NgbModule,
        WidgetsModule,
        ImageGridModule,
        DoceditModule,
        ImageViewerModule
    ],
    declarations: [
        ResourcesComponent,
        GeometryViewComponent,
        MapComponent,
        LayerMapComponent,
        EditableMapComponent,
        ResourcesMapComponent,
        TypeGridComponent,
        TypeIconComponent,
        LayerMenuComponent,
        ListComponent,
        RowComponent,
        PlusButtonComponent,
        SidebarListComponent,
        ListButtonGroupComponent,
        PopoverMenuComponent,
        NavigationComponent,
        ResourcesSearchBarComponent,
        ResourcesSearchConstraintsComponent,
        SearchSuggestionsComponent,
        ContextMenuComponent,
        MoveModalComponent,
        DeletionInProgressModalComponent,
        ChildrenViewComponent
    ],
    providers: [
        { provide: StateSerializer, useClass: StandardStateSerializer },
        RoutingService,
        DoceditLauncher,
        ViewModalLauncher,
        LayerManager,
        LayerImageProvider,
        ResourceDeletion,
        {
            provide: NavigationService,
            useFactory: (projectConfiguration: ProjectConfiguration,
                         routingService: RoutingService,
                         viewFacade: ViewFacade) => {

                return new NavigationService(projectConfiguration, routingService, viewFacade);
            },
            deps: [ProjectConfiguration, RoutingService, ViewFacade]
        },
        {
            provide: ResourcesStateManager,
            useFactory: (datastore: FieldReadDatastore,
                         indexFacade: IndexFacade,
                         stateSerializer: StateSerializer,
                         projectConfiguration: ProjectConfiguration,
                         settingsService: SettingsService,
                         projectTypes: ProjectCategories,
                         tabManager: TabManager) => {

                const projectName = settingsService.getSelectedProject();
                if (!projectName) throw 'project not set';

                return new ResourcesStateManager(
                    datastore,
                    indexFacade,
                    stateSerializer,
                    projectTypes,
                    tabManager,
                    projectName,
                    remote.getGlobal('switches').suppress_map_load_for_test
                );
            },
            deps: [
                FieldReadDatastore, IndexFacade, StateSerializer, ProjectConfiguration, SettingsService,
                ProjectCategories, TabManager
            ]
        },
        {
            provide: ViewFacade,
            useFactory: function(
                projectConfiguration: ProjectConfiguration,
                datastore: FieldDatastore,
                changesStream: ChangesStream,
                resourcesStateManager: ResourcesStateManager,
                loading: Loading,
                indexFacade: IndexFacade
            ) {
                return new ViewFacade(
                    projectConfiguration,
                    datastore,
                    changesStream,
                    resourcesStateManager,
                    loading,
                    indexFacade
                );
            },
            deps: [
                ProjectConfiguration,
                FieldDatastore,
                ChangesStream,
                ResourcesStateManager,
                Loading,
                IndexFacade
            ]
        },
    ],
    exports: [
        GeometryViewComponent
    ],
    entryComponents: [
        MoveModalComponent,
        DeletionInProgressModalComponent
    ]
})

export class ResourcesModule {}