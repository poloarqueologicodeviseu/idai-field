import { FileSyncPreference } from "idai-field-core";

const remote = typeof window !== 'undefined' ? window.require('@electron/remote') : undefined;


export interface SyncTarget {

    address: string;
    password: string;
    isSyncActive: boolean;
    fileSyncPreferences: FileSyncPreference[];
}


export interface Settings {

    languages: string[];
    isAutoUpdateActive: boolean;
    hostPassword: string;
    syncTargets: { [projectName: string]: SyncTarget };
    username: string;
    dbs: Array<string>;
    selectedProject: string;
    imagestorePath: string;
    hideHiddenFieldsInConfigurationEditor?: boolean;
    highlightCustomElements?: boolean;
    allowLargeFileUploads?: boolean;
}


export module Settings {

    export function getLocale(): string {

        return remote
            ? remote.getGlobal('getLocale')()
            : 'de'; // Return default locale if remote is not accessible (in unit tests)
    }
}
