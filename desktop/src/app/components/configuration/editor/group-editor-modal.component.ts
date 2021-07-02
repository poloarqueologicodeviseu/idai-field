import { Component } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { I18n } from '@ngx-translate/i18n-polyfill';
import { equal, } from 'tsfun';
import { AppConfigurator, Group, GroupDefinition, I18nString } from 'idai-field-core';
import { SettingsProvider } from '../../../core/settings/settings-provider';
import { ConfigurationEditorModalComponent } from './configuration-editor-modal.component';
import { MenuService } from '../../menu-service';
import { Messages } from '../../messages/messages';
import { LanguageConfigurationUtil } from '../../../core/configuration/language-configuration-util';
import { ConfigurationUtil } from '../../../core/configuration/configuration-util';


@Component({
    templateUrl: './group-editor-modal.html',
    host: {
        '(window:keydown)': 'onKeyDown($event)',
        '(window:keyup)': 'onKeyUp($event)',
    }
})
/**
 * @author Thomas Kleinke
 */
export class GroupEditorModalComponent extends ConfigurationEditorModalComponent {

    public group: Group;
    public permanentlyHiddenFields: string[];

    protected changeMessage = this.i18n({
        id: 'docedit.saveModal.groupChanged', value: 'Die Gruppe wurde geändert.'
    });


    constructor(activeModal: NgbActiveModal,
                appConfigurator: AppConfigurator,
                settingsProvider: SettingsProvider,
                modalService: NgbModal,
                menuService: MenuService,
                messages: Messages,
                private i18n: I18n) {
        
        super(activeModal, appConfigurator, settingsProvider, modalService, menuService, messages);
    }


    public initialize() {

        super.initialize();

        if (this.new) {
            const groups: Array<GroupDefinition> = ConfigurationUtil.createGroupsConfiguration(
                this.category, this.permanentlyHiddenFields
            );
            groups.push({
                name: this.group.name,
                fields: []
            });
            this.getClonedCategoryDefinition().groups = groups;
        }
    }


    public isChanged(): boolean {

        return this.new || !equal(this.label)(this.clonedLabel);
    }


    protected getLabel(): I18nString {

        return this.group.label;
    }


    protected getDescription(): I18nString {

        return undefined;
    }


    protected updateCustomLanguageConfigurations() {

        LanguageConfigurationUtil.updateCustomLanguageConfigurations(
            this.getClonedLanguageConfigurations(), this.clonedLabel, undefined, undefined, undefined, this.group
        );
    }
}
