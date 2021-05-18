import { Document, ProjectConfiguration } from 'idai-field-core';
import { Avatar, HStack, Text, View } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Modal from 'react-native-modal';

interface MapBottomDrawerProps {
    document: Document | undefined;
    isVisible: boolean;
    closeHandler: () => void;
    config: ProjectConfiguration;
    navigateToDocument: (docId: string) => void;
}

const MapBottomDrawer: React.FC<MapBottomDrawerProps> = ({
    document, isVisible, closeHandler, config, navigateToDocument }) => {

    const animationDuration = 500;


    if(!document) return null;

    const documentPressHandler = () => {
        closeHandler();
        navigateToDocument(document.resource.id);
    };
    
    return (
        <Modal
            isVisible={ isVisible }
            animationInTiming={ animationDuration }
            animationOutTiming={ animationDuration }
            onBackdropPress={ closeHandler }
            backdropOpacity={ 0.0 }
            style={ styles.modal }>
            <View style={ styles.container }>
                <TouchableOpacity onPress={ documentPressHandler }>
                    <HStack p={ 4 } space={ 2 } alignItems="center">
                        <Avatar bg={ config.getColorForCategory(document.resource.category) }>
                                { document.resource.category[0].toUpperCase() }
                        </Avatar>
                        <Text fontSize="2xl" >{document.resource.identifier} </Text>
                    </HStack>
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    container: {
        width: '100%',
        height: '20%',
        justifyContent: 'flex-start',
        backgroundColor: 'white',
        borderRadius: 10
    }
});

export default MapBottomDrawer;