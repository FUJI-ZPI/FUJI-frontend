import React, {useState} from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useTranslation} from 'react-i18next';
import {themeStyles, colors, spacing} from '../theme/styles';
import {SafeAreaView} from 'react-native-safe-area-context';

const {width} = Dimensions.get('window');
const GRID_PADDING = spacing.base * 2;
const ITEM_MARGIN = spacing.base;
const ITEMS_PER_ROW = 2;
const ITEM_WIDTH = (width - GRID_PADDING - (ITEM_MARGIN * (ITEMS_PER_ROW - 1))) / ITEMS_PER_ROW;

interface ScreenProps {
    navigation: any;
}

const VocabularyLevelScreen: React.FC<ScreenProps> = ({ navigation }) => {
    const { t } = useTranslation();
    
    const [currentPage, setCurrentPage] = useState(0);
    const totalLevels = 60;
    const levelsPerPage = 10;
    const totalPages = Math.ceil(totalLevels / levelsPerPage);
    
    const startLevel = currentPage * levelsPerPage + 1;
    const endLevel = Math.min((currentPage + 1) * levelsPerPage, totalLevels);
    const levels = Array.from({ length: endLevel - startLevel + 1 }, (_, i) => startLevel + i);

    const getLevelStyle = (level: number) => {
        if (level <= 20) return { 
            text: 'Beginner', 
            color: colors.secondary, 
            background: '#D1FAE5',
            borderColor: colors.secondary 
        };
        if (level <= 40) return { 
            text: 'Intermediate', 
            color: colors.warning, 
            background: '#FEF3C7',
            borderColor: colors.warning 
        };
        return { 
            text: 'Advanced', 
            color: colors.danger, 
            background: '#FEE2E2',
            borderColor: colors.danger 
        };
    };
    
    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };
    
    const handlePrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleSelectLevel = (level: number) => {
        navigation.navigate('VocabularyList', { level: level });
    };

    return (
        <SafeAreaView style={themeStyles.flex1} edges={['bottom', 'left', 'right']}>
            <ScrollView style={themeStyles.flex1} contentContainerStyle={localStyles.scrollContent}>
                <View style={themeStyles.paddingContainer}>
                    
                    <View style={localStyles.header}>
                        {/* ZMIANA: Tytuł */}
                        <Text style={localStyles.title}>{t('Vocabulary Levels') || 'Poziomy Słownictwa'}</Text>

                        <View style={localStyles.paginationControls}>
                            <TouchableOpacity
                                onPress={handlePrevPage}
                                disabled={currentPage === 0}
                                style={[localStyles.paginationButton, currentPage === 0 && localStyles.paginationDisabled]}
                            >
                                <Ionicons name="chevron-back" size={20} color={currentPage === 0 ? colors.textMuted : colors.text} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleNextPage}
                                disabled={currentPage === totalPages - 1}
                                style={[localStyles.paginationButton, currentPage === totalPages - 1 && localStyles.paginationDisabled]}
                            >
                                <Ionicons name="chevron-forward" size={20} color={currentPage === totalPages - 1 ? colors.textMuted : colors.text} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Text style={localStyles.pageInfo}>
                        {t('Levels {{start}}-{{end}} of {{total}}', { start: startLevel, end: endLevel, total: totalLevels })}
                    </Text>

                    <View style={localStyles.levelsGrid}>
                        {levels.map((level) => {
                            const style = getLevelStyle(level);
                            return (
                                <TouchableOpacity
                                    key={level}
                                    onPress={() => handleSelectLevel(level)}
                                    style={{ width: ITEM_WIDTH }}
                                >
                                    <View style={[
                                        localStyles.levelCard,
                                        { backgroundColor: style.background, borderColor: style.borderColor }
                                    ]}>
                                        <View style={localStyles.cardContent}>
                                            <Text style={[localStyles.levelNumber, { color: style.color }]}>
                                                {level}
                                            </Text>
                                            <Text style={localStyles.levelName}>
                                                {style.text}
                                            </Text>
                                            <Text style={localStyles.levelHint}>
                                                Level {level}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const localStyles = StyleSheet.create({
    scrollContent: { 
        backgroundColor: colors.background, 
        paddingBottom: spacing.base * 4,
    },
    header: {
        ...themeStyles.flexRow,
        ...themeStyles.justifyBetween,
        paddingTop: spacing.base,
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        textAlign: 'center',
        flex: 1,
    },
    paginationControls: {
        ...themeStyles.flexRow,
        gap: spacing.small,
        position: 'absolute',
        right: 0,
        zIndex: 10,
    },
    paginationButton: {
        width: 32,
        height: 32,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
    },
    paginationDisabled: {
        opacity: 0.5,
    },
    pageInfo: {
        fontSize: 14,
        color: colors.textMuted,
        textAlign: 'center',
        marginTop: spacing.large,
        marginBottom: spacing.base * 2,
    },
    levelsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: spacing.base,
        marginBottom: spacing.base,
    },
    levelCard: {
        borderRadius: 12,
        borderWidth: 2,
        height: ITEM_WIDTH,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    cardContent: {
        padding: spacing.base,
        alignItems: 'center',
    },
    levelNumber: {
        fontSize: 36,
        fontWeight: '700',
        marginBottom: 4,
    },
    levelName: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    levelHint: {
        fontSize: 10,
        marginTop: 2,
        opacity: 0.7,
        color: colors.textMuted,
    }
});

export default VocabularyLevelScreen;
