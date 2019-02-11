import {Observer, Observable} from 'rxjs';
import {FieldDocument} from 'idai-components-2';
import {ResourcesState} from './state/resources-state';
import {StateSerializer} from '../../../common/state-serializer';
import {OperationViews} from './state/operation-views';
import {ViewState} from './state/view-state';
import {NavigationPath} from './state/navigation-path';
import {ObserverUtil} from '../../../core/util/observer-util';
import {FieldReadDatastore} from '../../../core/datastore/field/field-read-datastore';
import {clone} from '../../../core/util/object-util';
import {IndexFacade} from '../../../core/datastore/index/index-facade';


/**
 * Holds the reference to the current ResourcesState and replaces it by a modified
 * version on write access. Serializes parts of it on certain events.
 *
 * Holds a reference to the OperationViews
 *
 * @author Thomas Kleinke
 * @author Daniel de Oliveira
 */
export class ResourcesStateManager {

    public loaded: boolean = false;

    public navigationPathNotifications = (): Observable<NavigationPath> =>
        ObserverUtil.register(this.navigationPathObservers);

    private resourcesState = ResourcesState.makeDefaults();
    private navigationPathObservers: Array<Observer<NavigationPath>> = [];

    /**
     * Clients can obtain the latest ResourcesState with this method.
     * Its fields are readonly and the ResourcesState's companion module's
     * setter methods return always copies. So the only way to modify
     * the resources state is via the setters of ResourcesStateManager,
     * which replace the whole ResourcesState in a proper transformation
     * on every change.
     */
    public get = (): ResourcesState => this.resourcesState;


    constructor(
        private datastore: FieldReadDatastore,
        private indexFacade: IndexFacade,
        private serializer: StateSerializer,
        // private views: OperationViews,
        // private additionalOverviewTypeNames: string[],
        private project: string,
        private suppressLoadMapInTestProject: boolean = false,
    ) {}


    public resetForE2E = () => this.resourcesState = ResourcesState.makeDefaults();

    // public getViewType = () => this.isInOverview() ? 'Project' : this.getOperationSubtypeForViewName(this.resourcesState.view);

    public isInOverview = () => this.resourcesState.view === 'project';

    // public getViews = () => this.views.get();

    // public getLabelForName = (name: string) => this.views.getLabelForName(name);

    // public getOperationSubtypeForViewName = (name: string) => this.views.getOperationSubtypeForViewName(name);


    // public getViewNameForMainType(name: string) {
    //
    //     return (name === 'Project')
    //         ? 'project'
    //         : this.views.getViewNameForOperationSubtype(name);
    // }


    public async initialize(viewName: 'project' | string): Promise<any> {

        if (!this.loaded) {
            this.resourcesState = await this.load();
            this.loaded = true;
        }

        this.resourcesState.view = viewName;

        if (viewName === 'project' && !this.resourcesState.overviewState) {

            this.resourcesState.overviewState = ViewState.default();

        }  else if (!this.resourcesState.operationViewStates[viewName]) {

            this.resourcesState.operationViewStates[viewName] = ViewState.default();
        }


        this.setActiveDocumentViewTab(undefined);
    }


    public getOverviewTypeNames() {

        // TODO use typeUtilily
        return ['Place', 'Trench', 'Survey', 'Building'];
        // return this.views.get()
        //     .map(_ => _.operationSubtype)
        //     .concat(this.additionalOverviewTypeNames);
    }


    public setActiveDocumentViewTab(activeDocumentViewTab: string|undefined) {

        this.resourcesState = ResourcesState.setActiveDocumentViewTab(this.resourcesState, activeDocumentViewTab);
    }


    public setSelectedDocument(document: FieldDocument|undefined) {

        ResourcesState.setSelectedDocument(this.resourcesState, document);
    }


    public setQueryString(q: string) {

        ResourcesState.setQueryString(this.resourcesState, q);
    }


    public setTypeFilters(types: string[]) {

        ResourcesState.setTypeFilters(this.resourcesState, types);
    }


    public setCustomConstraints(constraints: { [name: string]: string}) {

        ResourcesState.setCustomConstraints(this.resourcesState, constraints);
    }


    public setMode(mode: 'map' | 'list') {

        ResourcesState.setMode(this.resourcesState, mode);
    }

    public setBypassHierarchy(bypassHierarchy: boolean) {

        ResourcesState.setBypassHierarchy(this.resourcesState, bypassHierarchy);
        this.notifyNavigationPathObservers();
    }


    public setSelectAllOperationsOnBypassHierarchy(selectAllOperationsOnBypassHierarchy: boolean) {

        ResourcesState.setSelectAllOperationsOnBypassHierarchy(this.resourcesState,
            selectAllOperationsOnBypassHierarchy);
        this.notifyNavigationPathObservers();
    }


    public setActiveLayersIds(activeLayersIds: string[]) {

        ResourcesState.setActiveLayerIds(this.resourcesState, activeLayersIds);
        this.serialize();
    }


    public removeActiveLayersIds() {

        ResourcesState.removeActiveLayersIds(this.resourcesState);
        this.serialize();
    }


    public async moveInto(document: FieldDocument|undefined) {

        const invalidSegment = await NavigationPath.findInvalidSegment(
            this.resourcesState.view,
            ResourcesState.getNavigationPath(this.resourcesState),
            (resourceId: string) => {
                return this.indexFacade.getCount('id:match', resourceId) > 0;
            });

        const validatedNavigationPath = invalidSegment
            ? NavigationPath.shorten(ResourcesState.getNavigationPath(this.resourcesState), invalidSegment)
            : ResourcesState.getNavigationPath(this.resourcesState);

        const updatedNavigationPath = NavigationPath.setNewSelectedSegmentDoc(validatedNavigationPath, document);

        ResourcesState.updateNavigationPath(
            this.resourcesState,
            await this.updateSelectedDocument(updatedNavigationPath)
        );

        this.notifyNavigationPathObservers();
    }


    public async rebuildNavigationPath() {

        const segment = NavigationPath.getSelectedSegment(ResourcesState.getNavigationPath(this.resourcesState));
        await this.moveInto(segment ? segment.document : undefined);
    }


    public setMainTypeDocument(resourceId: string|undefined) {

        this.resourcesState.view = resourceId ? resourceId : 'overview';

        // this.resourcesState = ResourcesState.setMainTypeDocumentResourceId(this.resourcesState, resourceId);
        //
        // if (resourceId && !this.resourcesState.operationViewStates[this.resourcesState.view].navigationPaths[resourceId]) {
        //     this.resourcesState.operationViewStates[this.resourcesState.view].navigationPaths[resourceId]
        //         = NavigationPath.empty();
        // }
        //
        // this.notifyNavigationPathObservers();
    }


    public async updateNavigationPathForDocument(document: FieldDocument) {

        this.setBypassHierarchy(false);

        if (!NavigationPath.isPartOfNavigationPath(document, ResourcesState.getNavigationPath(this.resourcesState),
                this.resourcesState.view)) {
            await this.createNavigationPathForDocument(document);
        }
    }


    private notifyNavigationPathObservers() {

        ObserverUtil.notify(this.navigationPathObservers, clone(ResourcesState.getNavigationPath(this.resourcesState)));
    }


    private async createNavigationPathForDocument(document: FieldDocument) {

        const segments = await NavigationPath.makeSegments(document, resourceId => this.datastore.get(resourceId));
        if (segments.length === 0) return await this.moveInto(undefined);

        const navPath = NavigationPath.replaceSegmentsIfNecessary(
            ResourcesState.getNavigationPath(this.resourcesState), segments, segments[segments.length - 1].document.resource.id);

        ResourcesState.updateNavigationPath(this.resourcesState, navPath);
        this.notifyNavigationPathObservers();
    }


    private serialize() {

        this.serializer.store(ResourcesStateManager.createObjectToSerialize(this.resourcesState),
            'resources-state');
    }


    private async load(): Promise<ResourcesState> {

        let resourcesState = ResourcesState.makeDefaults();

        if (this.project === 'test' || this.project === 'synctest') {
            if (!this.suppressLoadMapInTestProject) resourcesState = ResourcesState.makeSampleDefaults()
        } else {
            (resourcesState as any).operationViewStates = await this.serializer.load('resources-state');
            resourcesState = ResourcesState.complete(resourcesState);
        }

        return resourcesState;
    }


    private async updateSelectedDocument(navigationPath: NavigationPath): Promise<NavigationPath> {

        const selectedDocument: FieldDocument|undefined
            = NavigationPath.getSelectedDocument(navigationPath);

        if (!selectedDocument) return navigationPath;

        return NavigationPath.setSelectedDocument(
            navigationPath,
            await this.datastore.get(selectedDocument.resource.id)
        );
    }


    private static createObjectToSerialize(state: ResourcesState) : { [viewName: string]: ViewState } {

        const objectToSerialize: { [viewName: string]: ViewState } = {};

        // for (let viewName of Object.keys(state.operationViewStates)) {
        //     objectToSerialize[viewName] = {} as any;
        //     if (ResourcesState.getLayerIds(state)) {
        //         (objectToSerialize[viewName] as any).layerIds = ResourcesState.getLayerIds(state);
        //     }
        // }

        return objectToSerialize;
    }
}