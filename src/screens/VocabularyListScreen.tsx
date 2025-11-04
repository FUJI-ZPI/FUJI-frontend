import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Alert, Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, spacing, themeStyles} from '../theme/styles';
import {useTranslation} from 'react-i18next';
import * as SecureStore from 'expo-secure-store';
import {Card} from '../components/ui/Card';

const { width } = Dimensions.get('window');
const GRID_PADDING = spacing.base * 2;
const ITEM_MARGIN = 8;
const ITEMS_PER_ROW = 2;
const totalMargins = ITEM_MARGIN * (ITEMS_PER_ROW - 1);
const ITEM_WIDTH = (width - GRID_PADDING - totalMargins) / ITEMS_PER_ROW;

const ROWS_PER_PAGE = 6;
const ITEMS_PER_PAGE = ITEMS_PER_ROW * ROWS_PER_PAGE;

type VocabularyItem = {
    uuid: string;
    characters: string;
};

interface ScreenProps {
    navigation: any;
    route: { params: { level: number } };
}

const VocabularyListScreen: React.FC<ScreenProps> = ({ navigation, route }) => {
    const { t } = useTranslation();
    const { level } = route.params;

    const [loading, setLoading] = useState(true);
    const [vocabularyList, setVocabularyList] = useState<VocabularyItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchVocabularyList = async (level: number) => {
        setLoading(true);
        setError(null);
        try {
            const token = await SecureStore.getItemAsync('accessToken');
            if (!token) {
                throw new Error("No authorization token. Please log in again.");
            }

            const headers = {
                'Authorization': `Bearer ${token}`
            };

            const res = await fetch(
                `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/v1/vocabulary/${level}`,
                { headers }
            );

            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    throw new Error("Authorization error. Please try logging in again.");
                }
                throw new Error(`Server error: ${res.status}`);
            }

            const data: VocabularyItem[] = await res.json();
            setVocabularyList(data);

            const totalItems = data.length;
            setTotalPages(Math.ceil(totalItems / ITEMS_PER_PAGE));
            setCurrentPage(0);

        } catch (e: any) {
            console.error('Failed to fetch word list:', e);
            setError(e.message || "An unknown error occurred.");
            Alert.alert('Error', e.message || "Unable to download data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVocabularyList(level);
    }, [level]);

    const onBack = () => {
        navigation.goBack();
    };

    const onSelectVocabulary = (item: VocabularyItem) => {
        navigation.navigate('VocabularyDetail', {
            vocabularyUuid: item.uuid,
            characters: item.characters
        });
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

    if (loading) {
        return (
            <SafeAreaView
                style={[themeStyles.flex1, localStyles.centered]}
                edges={['bottom', 'left', 'right']}
            >
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={localStyles.pageInfo}>Loading vocabulary...</Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView
                style={[themeStyles.flex1, localStyles.centered]}
                edges={['bottom', 'left', 'right']}
            >
                <Text style={localStyles.errorText}>Error: {error}</Text>
                <TouchableOpacity onPress={() => fetchVocabularyList(level)}>
                    <Text style={{ color: colors.primary }}>Try again</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const totalCount = vocabularyList.length;
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const endItemNumber = Math.min((currentPage + 1) * ITEMS_PER_PAGE, totalCount);
    const currentVocabularyPage = vocabularyList.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <SafeAreaView style={[themeStyles.flex1, { backgroundColor: colors.background }]} edges={['bottom', 'left', 'right']}>
            <View style={[themeStyles.paddingContainer, themeStyles.flex1]}>

                <FlatList
                    ListHeaderComponent={
                        <>
                            <View style={localStyles.header}>
                                <TouchableOpacity onPress={onBack} style={localStyles.backButton}>
                                    <Ionicons name="arrow-back" size={20} color={colors.text} />
                                    <Text style={localStyles.backButtonText}>{t('common.back') || 'Wstecz'}</Text>
                                </TouchableOpacity>

                                <Text style={localStyles.title} numberOfLines={1} adjustsFontSizeToFit>
                                    {t('Level {{level}}', { level }) || `Poziom ${level}`}
                                </Text>

                                <View style={localStyles.paginationControls}>
                                    {totalPages > 1 && (
                                        <>
                                            <TouchableOpacity
                                                onPress={handlePrevPage}
                                                disabled={currentPage === 0}
                                                style={[localStyles.paginationButton, currentPage === 0 && localStyles.paginationDisabled]}
                                            >
                                                <Ionicons name="chevron-back" size={20} color={currentPage === 0 ? colors.textMuted : colors.text} />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={handleNextPage}
                                                disabled={currentPage >= totalPages - 1}
                                                style={[localStyles.paginationButton, currentPage >= totalPages - 1 && localStyles.paginationDisabled]}
                                            >
                                                <Ionicons name="chevron-forward" size={20} color={currentPage >= totalPages - 1 ? colors.textMuted : colors.text} />
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </View>
                            </View>

                            <Text style={localStyles.pageInfo}>
                                {t('Words {{start}}-{{end}} of {{total}}', {
                                    start: startIndex + 1,
                                    end: endItemNumber,
                                    total: totalCount
                                })}
                            </Text>
                        </>
                    }

                    data={currentVocabularyPage}
                    keyExtractor={(item) => item.uuid}
                    numColumns={ITEMS_PER_ROW}
                    contentContainerStyle={localStyles.vocabGrid}
                    columnWrapperStyle={localStyles.gridRow}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => onSelectVocabulary(item)}
                            style={{ width: ITEM_WIDTH }}
                        >
                            <Card style={localStyles.vocabCard}>
                                <Text style={localStyles.vocabText} numberOfLines={1} adjustsFontSizeToFit>
                                    {item.characters}
                                </Text>
                            </Card>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <Text style={localStyles.noItemsText}>
                            {t('No vocabulary found for this level.')}
                        </Text>
                    }
                />
            </View>
        </SafeAreaView>
    );
};

const localStyles = StyleSheet.create({
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    errorText: {
        fontSize: 16,
        color: colors.danger,
        textAlign: 'center',
        marginBottom: 20,
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
        flexShrink: 1,
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
        flex: 1,
        marginHorizontal: spacing.small,
    },
    pageInfo: {
        fontSize: 14,
        color: colors.textMuted,
        textAlign: 'center',
        marginBottom: spacing.large,
    },
    vocabGrid: {
        paddingBottom: 40,
    },
    gridRow: {
        justifyContent: 'space-between',
        rowGap: ITEM_MARGIN,
        marginBottom: ITEM_MARGIN,
    },
    vocabCard: {
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.small,
    },
    vocabText: {
        fontSize: 22,
        fontWeight: '600',
        color: colors.text,
        textAlign: 'center',
    },
    noItemsText: {
        textAlign: 'center',
        marginTop: spacing.large * 2,
        fontSize: 16,
        color: colors.textMuted,
    },
    paginationControls: {
        flexDirection: 'row',
        gap: spacing.small,
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
});

export default VocabularyListScreen;
