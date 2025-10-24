import React, { useMemo } from 'react'; // <-- Dodaj useMemo
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { themeStyles, colors, spacing } from '../theme/styles';
import { useTranslation } from 'react-i18next';
import { mockKanjiList_Level1, KanjiCharacter } from '../data/mockData' 
import KanjiItem from '../components/kanji-list/KanjiItem'; 

const { width } = Dimensions.get('window');
const GRID_PADDING = spacing.base * 2;
const ITEM_MARGIN = 8;
const ITEMS_PER_ROW = 4;
const totalMargins = ITEM_MARGIN * (ITEMS_PER_ROW - 1);
const ITEM_WIDTH = (width - GRID_PADDING - totalMargins) / ITEMS_PER_ROW;


interface ScreenProps {
    navigation: any;
    route: { params: { level: number } };
}

const KanjiListScreen: React.FC<ScreenProps> = ({ navigation, route }) => {
    const { t } = useTranslation();
    const { level } = route.params;

    const onBack = () => {
        navigation.goBack();
    };

    const kanjiList = useMemo(() => {
        return mockKanjiList_Level1.filter(k => k.level === level);
    }, [level]);

    const onSelectKanji = (kanjiId: string) => {
        const selectedKanji = kanjiList.find(k => k.id === kanjiId);
        if (!selectedKanji) return;

        navigation.navigate('KanjiDetail', { 
            kanjiId: selectedKanji.id,
            character: selectedKanji.character 
        });
    };

    return (
        <SafeAreaView style={themeStyles.flex1}>
            <ScrollView contentContainerStyle={localStyles.scrollContent}>
                <View style={themeStyles.paddingContainer}>
                    
                    <View style={localStyles.header}>
                        <TouchableOpacity
                            onPress={onBack}
                            style={localStyles.backButton}
                        >
                            <Ionicons name="arrow-back" size={20} color={colors.text} />
                            <Text style={localStyles.backButtonText}>{t('common.back') || 'Back'}</Text>
                        </TouchableOpacity>

                        <Text style={localStyles.title}>{t('Level {{level}}', { level }) || `Level ${level}`}</Text>
                        
                        <View style={{ width: 60 }} />
                    </View>

                    <Text style={localStyles.pageInfo}>
                        {t('Tap a kanji to learn more ({{count}} found)', { count: kanjiList.length })}
                    </Text>

                    <View style={localStyles.kanjiGrid}>
                        {kanjiList.map((kanji) => (
                            <KanjiItem
                                key={kanji.id}
                                kanji={kanji}
                                itemWidth={ITEM_WIDTH}
                                onSelect={onSelectKanji}
                            />
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const localStyles = StyleSheet.create({
    scrollContent: { 
        flexGrow: 1,
        backgroundColor: colors.background,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.base,
        paddingTop: spacing.base,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.small,
    },
    backButtonText: {
        fontSize: 16,
        marginLeft: 4,
        color: colors.text,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        textAlign: 'center',
    },
    pageInfo: {
        fontSize: 14,
        color: colors.textMuted,
        textAlign: 'center',
        marginBottom: spacing.large,
    },
    kanjiGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: ITEM_MARGIN,
        marginBottom: spacing.base,
    },
    noKanjiText: {
        textAlign: 'center',
        marginTop: spacing.large * 2,
        fontSize: 16,
        color: colors.textMuted,
    }
});

export default KanjiListScreen;