import { doc, Document } from 'idai-field-core';
import { Button, Center, Icon, IconButton } from 'native-base';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import AppHeader from '../components/AppHeader';
import Map from '../components/Map';
import Settings from '../components/Settings';
import { DocumentRepository } from '../repositories/document-repository';


interface HomeScreenProps {
    repository?: DocumentRepository;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ repository }) => {

    const [documents, setDocuments] = useState<Document[]>([]);
    const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);


    useEffect(() => {
        const operation = doc('test doc', '1', 'Operation');
        repository?.create(operation, 'test467')
        .then(() => new Promise<void>(resolve => setTimeout(() => resolve(), 100)))
        .then(() => repository && repository.find({ q: '*' }))
        .then(result => {
            console.log('DOCS', result);
            setDocuments(result.documents);})
         .catch(err => console.log(err));


         repository && repository.changed().subscribe(doc => {
            console.log('subscriBBBE',doc);
            repository && repository.find({ q: '*' })
                .then(result => {
                    console.log('RES HERE??', result);
                    setDocuments(result.documents);})
                .catch(err => console.log(err));
        }
        );
    }, [repository]);


    return (
        <Center style={ styles.container }>
            <Button onPress={
                () => {
                    repository?.find({ q: '*' }).then(res => {
                        console.log('LOS DOCOS locos', res.documents);
                        setDocuments(res.documents);});
                } }>synch</Button>
            <Settings
                show={ showSettingsModal }
                onClose={ () => setShowSettingsModal(false) }
                repository={ repository } />
            <AppHeader
                title={ 'iDAI field mobile' }
                right={
                    <IconButton
                        colorScheme="blue"
                        variant="outline"
                        icon={ <Icon name={ 'settings' } /> }
                        onPress={ () => setShowSettingsModal(true) }
                    />
                } />
            <Map documents={ documents } />:
        </Center>
    );
};


const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    }
});


export default HomeScreen;
