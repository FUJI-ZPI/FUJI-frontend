import React from 'react';
import {EntityListScreen} from '../components/shared/EntityListScreen';

type VocabularyItem = {
    uuid: string;
    characters: string;
};

const VocabularyListScreen = ({navigation, route}: any) => {
    return (
        <EntityListScreen
            navigation={navigation}
            route={route}
            config={{
                entityType: 'vocabulary',
                itemsPerRow: 2,
                rowsPerPage: 6,
                itemFontSize: 22,
                fixedCardHeight: 80,
                translationKeys: {
                    loading: 'Loading vocabulary...',
                    noItems: 'No vocabulary found for this level.',
                },
                getItemCharacter: (item) => (item as VocabularyItem).characters || '',
                getNavigationParams: (item) => ({
                    screen: 'VocabularyDetail',
                    params: {
                        vocabularyUuid: item.uuid,
                        characters: (item as VocabularyItem).characters,
                    },
                }),
            }}
        />
    );
};

export default VocabularyListScreen;

