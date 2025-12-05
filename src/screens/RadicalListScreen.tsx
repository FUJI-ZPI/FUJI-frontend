import React from 'react';
import {EntityListScreen} from '../components/shared/EntityListScreen';

type RadicalItem = {
    uuid: string;
    character: string;
};

const RadicalListScreen = ({navigation, route}: any) => {
    return (
        <EntityListScreen
            navigation={navigation}
            route={route}
            config={{
                entityType: 'radical',
                itemsPerRow: 4,
                rowsPerPage: 5,
                itemFontSize: 38,
                translationKeys: {
                    loading: 'Loading radicals...',
                    noItems: 'No radicals found for this level.',
                },
                getItemCharacter: (item) => (item as RadicalItem).character || '',
                getNavigationParams: (item) => ({
                    screen: 'RadicalDetail',
                    params: {
                        radicalUuid: item.uuid,
                        character: (item as RadicalItem).character,
                    },
                }),
            }}
        />
    );
};

export default RadicalListScreen;

