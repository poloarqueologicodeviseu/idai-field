import AppLoading from 'expo-app-loading';
import { NativeBaseProvider } from 'native-base';
import PouchDB from 'pouchdb-react-native';
import React, { Dispatch, ReactElement, SetStateAction, useState } from 'react';
import { enableScreens } from 'react-native-screens';
import { DocumentRepository } from './src/repositories/document-repository';
import HomeScreen from './src/screens/HomeScreen';


enableScreens();

type SetDocumentRepository = Dispatch<SetStateAction<DocumentRepository | undefined>>;


export default function App(): ReactElement {

    const [documentRepository, setDocumentRepository] = useState<DocumentRepository>();
    const [finishedLoading, setFinishedLoading] = useState<boolean>(false);

    if(!finishedLoading){
        return <AppLoading
                    startAsync={ initializeApp(setDocumentRepository) }
                    onFinish={ () => setFinishedLoading(true) }
                    onError={ (err) => console.log(err) } />;
    }

    return (
        <NativeBaseProvider>
            <HomeScreen repository={ documentRepository } />
        </NativeBaseProvider>
    );
}


const initializeApp = (setDocumentRepository: SetDocumentRepository) => async () => {
    await setupRepository(setDocumentRepository);

};


const setupRepository = async (setDocumentRepository: SetDocumentRepository) => {
    const repository = await DocumentRepository.init('test', (name: string) => new PouchDB(name));
    setDocumentRepository(repository);
};
