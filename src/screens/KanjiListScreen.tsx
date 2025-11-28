import React from 'react';
import {EntityListScreen} from '../components/shared/EntityListScreen';

type KanjiItem = {
    uuid: string;
    character: string;
};

const KanjiListScreen = ({navigation, route}: any) => {
    return (
        <EntityListScreen
            navigation={navigation}
            route={route}
            config={{
                entityType: 'kanji',
                itemsPerRow: 4,
                rowsPerPage: 5,
                itemFontSize: 38,
                translationKeys: {
                    loading: 'Loading kanji...',
                    noItems: 'No kanji found for this level.',
                },
                getItemCharacter: (item) => (item as KanjiItem).character || '',
                getNavigationParams: (item) => ({
                    screen: 'KanjiDetail',
                    params: {
                        kanjiUuid: item.uuid,
                        character: (item as KanjiItem).character,
                    },
                }),
            }}
        />
    );
};

export default KanjiListScreen;

