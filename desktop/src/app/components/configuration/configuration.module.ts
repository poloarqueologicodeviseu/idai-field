import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ConfigurationComponent } from './configuration.component';
import { WidgetsModule } from '../widgets/widgets.module';
import { ConfigurationFieldComponent } from './browse/configuration-field.component';
import { MultiLanguageInputComponent } from './editor/widgets/multi-language-input.component';
import { ConfigurationCategoryComponent } from './browse/configuration-category.component';
import { AddFieldModalComponent } from './add/field/add-field-modal.component';
import { FieldEditorModalComponent } from './editor/field-editor-modal.component';
import { CategoryEditorModalComponent } from './editor/category-editor-modal.component';
import { CategoryPreviewComponent } from './add/category/category-preview.component';
import { CategoryListingComponent } from './add/category/category-listing.component';
import { AddCategoryFormModalComponent } from './add/category/add-category-form-modal.component';
import { ConfigurationFieldDragElement } from './browse/configuration-field-drag-element.component';
import { AddGroupModalComponent } from './add/group/add-group-modal.component';
import { GroupEditorModalComponent } from './editor/group-editor-modal.component';
import { ConfigurationContextMenuComponent } from './context-menu/configuration-context-menu.component';
import { DeleteFieldModalComponent } from './delete/delete-field-modal.component';
import { DeleteGroupModalComponent } from './delete/delete-group-modal.component';
import { DeleteCategoryModalComponent } from './delete/delete-category-modal.component';
import { SaveProcessModalComponent } from './save/save-process-modal.component';
import { FieldListingComponent } from './add/field/field-listing.component';
import { FieldPreviewComponent } from './add/field/field-preview.component';
import { ValuelistViewComponent } from './widgets/valuelist-view.component';
import { ManageValuelistsModalComponent } from './add/valuelist/manage-valuelists-modal.component';
import { ValuelistListingComponent } from './add/valuelist/valuelist-listing.component';
import { ValuelistPreviewComponent } from './add/valuelist/valuelist-preview.component';
import { ValuelistEditorModalComponent } from './editor/valuelist-editor-modal.component';
import { ValueEditorModalComponent } from './editor/value-editor-modal.component';
import { AddValuelistModalComponent } from './add/valuelist/add-valuelist-modal.component';
import { DeleteValuelistModalComponent } from './delete/delete-valuelist-modal.component';
import { ValuelistSearchBarComponent } from './add/valuelist/valuelist-search-bar.component';
import { SwapCategoryFormModalComponent } from './add/category/swap-category-form-modal.component';
import { ExtendValuelistModalComponent } from './add/valuelist/extend-valuelist-modal.component';
import { ReferencesInputComponent } from './editor/widgets/references-input.component';
import { ConfigurationChangeNotifications } from './notifications/configuration-change-notifications';
import { ConfigurationChangeNotificationModalComponent } from './notifications/configuration-change-notification-modal.component';
import { DoceditModule } from '../docedit/docedit.module';
import { ConfigurationConflictsModalComponent } from './conflicts/configuration-conflicts-modal.component';
import { SaveModalComponent } from './save/save-modal.component';
import { ConfigurationGuard } from './configuration-guard';
import { GroupListingComponent } from './add/group/group-listing.component';
import { HierarchicalRelationsInfoComponent } from './browse/hierarchical-relations-info.component';
import { ConfigurationState } from './configuration-state';
import { ImportConfigurationModalComponent } from './import/import-configuration-modal.component';


@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        NgbModule,
        WidgetsModule,
        DragDropModule,
        ScrollingModule,
        DoceditModule
    ],
    declarations: [
        ConfigurationComponent,
        ConfigurationFieldComponent,
        ConfigurationCategoryComponent,
        MultiLanguageInputComponent,
        ReferencesInputComponent,
        AddFieldModalComponent,
        AddGroupModalComponent,
        AddCategoryFormModalComponent,
        AddValuelistModalComponent,
        ManageValuelistsModalComponent,
        CategoryPreviewComponent,
        FieldPreviewComponent,
        ValuelistPreviewComponent,
        CategoryListingComponent,
        FieldListingComponent,
        GroupListingComponent,
        ValuelistListingComponent,
        FieldEditorModalComponent,
        GroupEditorModalComponent,
        CategoryEditorModalComponent,
        ValuelistEditorModalComponent,
        ValueEditorModalComponent,
        ConfigurationFieldDragElement,
        ConfigurationContextMenuComponent,
        DeleteFieldModalComponent,
        DeleteGroupModalComponent,
        DeleteCategoryModalComponent,
        DeleteValuelistModalComponent,
        ValuelistSearchBarComponent,
        SwapCategoryFormModalComponent,
        SaveModalComponent,
        SaveProcessModalComponent,
        ValuelistViewComponent,
        ExtendValuelistModalComponent,
        ConfigurationChangeNotificationModalComponent,
        ConfigurationConflictsModalComponent,
        HierarchicalRelationsInfoComponent,
        ImportConfigurationModalComponent
    ],
    providers: [
        ConfigurationChangeNotifications,
        ConfigurationGuard,
        ConfigurationState
    ],
    exports: [
        ConfigurationComponent
    ],
    entryComponents: [
        ConfigurationComponent,
        AddFieldModalComponent,
        AddGroupModalComponent,
        AddValuelistModalComponent,
        FieldEditorModalComponent,
        GroupEditorModalComponent,
        CategoryEditorModalComponent,
        ValuelistEditorModalComponent,
        ValueEditorModalComponent,
        DeleteFieldModalComponent,
        DeleteGroupModalComponent,
        DeleteCategoryModalComponent,
        DeleteValuelistModalComponent,
        ValuelistSearchBarComponent,
        SwapCategoryFormModalComponent,
        ExtendValuelistModalComponent,
        SaveModalComponent,
        SaveProcessModalComponent,
        ConfigurationChangeNotificationModalComponent,
        ConfigurationConflictsModalComponent,
        ImportConfigurationModalComponent
    ]
})

export class ConfigurationModule {}
