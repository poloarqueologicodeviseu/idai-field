import { Modal } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
import { DocumentRepository } from '../repositories/document-repository';
import ConnectPouchForm from './ConnectPouchForm';

interface SettingsProps {
    show: boolean;
    onClose: () => void;
    repository?: DocumentRepository;
}

const Settings: React.FC<SettingsProps> = ({ show, onClose, repository }) => {
    
    const disconnectHandler = () => {
        repository!.stopSync();
    };

    const connectHandler = async (dbName: string, remotePassword: string) => {

        const url = `https://${dbName}:${remotePassword}@field.dainst.org/sync`;
        const syncResult = await repository!.setupSync(url, dbName);
        syncResult.observer.subscribe(
            status => console.log('STAT', status),
            err => console.log('SYNCERR', err)
        );
        //.then(result => console.log('process', result))
        //.catch(err => console.log('ERRORHERE',err));
    };


    return (
        <Modal
            isOpen={ show }
            onClose={ onClose }>
            <Modal.CloseButton />
            <Modal.Content style={ styles.container }>
                <ConnectPouchForm dbSetupHandler={ connectHandler } />
                    {/* {isDbConnected() ?
                        <DisconectPouchForm
                            dbName={ dbName } disconnectHandler={ disconnectHandler } />:
                        <ConnectPouchForm dbSetupHandler={ connectHandler } /> } */}
            </Modal.Content>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 50,
    }
});


export default Settings;