import { Document } from 'idai-field-core';
import { Center, Text } from 'native-base';
import React from 'react';
import { StyleSheet } from 'react-native';

interface MapProps {
    documents: Document[]
}

const Map: React.FC<MapProps> = ({ documents }) => {

    return (
        <Center >
            <Text>map</Text>
            {documents && documents.map(document => (
                <Center key={ document._id }>
                    <Text>operation</Text>
                    <Text>{document.resource.id}</Text>
                </Center>
            ))}
        </Center>
    );
};

const styles= StyleSheet.create({
    card: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Map;