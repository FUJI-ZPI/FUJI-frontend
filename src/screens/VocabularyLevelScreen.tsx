import React from 'react';
import {EntityLevelScreen} from '../components/shared/EntityLevelScreen';
import {colors} from '../theme/styles';

const VocabularyLevelScreen = ({navigation}: any) => {
    const getLevelStyle = (level: number) => {
        if (level <= 20)
            return {
                text: 'Beginner',
                color: colors.secondary,
                background: '#D1FAE5',
                borderColor: colors.secondary,
            };
        if (level <= 40)
            return {
                text: 'Intermediate',
                color: colors.warning,
                background: '#FEF3C7',
                borderColor: colors.warning,
            };
        return {
            text: 'Advanced',
            color: colors.danger,
            background: '#FEE2E2',
            borderColor: colors.danger,
        };
    };

    return (
        <EntityLevelScreen
            navigation={navigation}
            config={{
                entityType: 'vocabulary',
                entityName: 'Vocabulary',
                totalLevels: 60,
                levelsPerLoad: 20,
                getLevelStyle,
                onSelectLevel: (level: number) => {
                    navigation.navigate('VocabularyList', {level});
                },
            }}
        />
    );
};

export default VocabularyLevelScreen;

