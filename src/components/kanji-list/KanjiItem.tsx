import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing } from '../../theme/styles';
import { KanjiCharacter } from '../../data/mockData';

interface KanjiItemProps {
    kanji: KanjiCharacter;
    itemWidth: number;
    onSelect: (kanjiId: string) => void;
}

const KanjiItem: React.FC<KanjiItemProps> = ({ kanji, itemWidth, onSelect }) => {
    const isLearned = kanji.learned;
    const cardStyle = isLearned ? localStyles.learnedCard : localStyles.unlearnedCard;
    const textStyle = isLearned ? localStyles.learnedText : localStyles.unlearnedText;
    
    return (
        <TouchableOpacity
            key={kanji.id}
            style={[localStyles.kanjiItem, { width: itemWidth, height: itemWidth }, cardStyle]}
            onPress={() => onSelect(kanji.id)}
        >
            <View style={localStyles.kanjiContent}>
                <Text style={[localStyles.kanjiCharacter, textStyle]}>
                    {kanji.character}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const localStyles = StyleSheet.create({
    kanjiItem: {
        borderRadius: 8,
        borderWidth: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    kanjiContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        aspectRatio: 1,
    },
    kanjiCharacter: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    learnedCard: {
        backgroundColor: '#D1FAE5',
        borderColor: '#059669',
    },
    learnedText: {
        color: '#047857',
    },
    unlearnedCard: {
        backgroundColor: colors.cardBackground,
        borderColor: colors.border,
    },
    unlearnedText: {
        color: colors.text,
    },
});

export default KanjiItem