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
const ITEMS_PER_ROW = 4;
const totalMargins = ITEM_MARGIN * (ITEMS_PER_ROW - 1);
const ITEM_WIDTH = (width - GRID_PADDING - totalMargins) / ITEMS_PER_ROW;

const ROWS_PER_PAGE = 5;
const ITEMS_PER_PAGE = ITEMS_PER_ROW * ROWS_PER_PAGE;

type KanjiItem = {
    uuid: string;
    character: string;
};

interface ScreenProps {
    navigation: any;
    route: { params: { level: number } };
}

const KanjiListScreen: React.FC<ScreenProps> = ({ navigation, route }) => {
    const { t } = useTranslation();
    const { level } = route.params;

    const [loading, setLoading] = useState(true);
    const [kanjiList, setKanjiList] = useState<KanjiItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchKanjiList = async (level: number) => {
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
                `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/v1/kanji/level/${level}`,
                { headers }
            );

            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    throw new Error("Authorization error. Please try logging in again.");
                }
                throw new Error(`Server error: ${res.status}`);
            }

            const data: KanjiItem[] = await res.json();
            setKanjiList(data);

            const totalItems = data.length;
            setTotalPages(Math.ceil(totalItems / ITEMS_PER_PAGE));
            setCurrentPage(0);

        } catch (e: any) {
            console.error('Failed to fetch kanji list:', e);
            setError(e.message || "An unknown error occurred.");
            Alert.alert('Error', e.message || "Unable to download data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKanjiList(level);
    }, [level]);

    const onBack = () => {
        navigation.goBack();
    };

    const onSelectKanji = (item: KanjiItem) => {
        navigation.navigate('KanjiDetail', {
            kanjiUuid: item.uuid,
            character: item.character
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
                <Text style={localStyles.pageInfo}>Loading kanji...</Text>
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
                <TouchableOpacity onPress={() => fetchKanjiList(level)}>
                    <Text style={{ color: colors.primary }}>Try again</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const totalCount = kanjiList.length;
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const endItemNumber = Math.min((currentPage + 1) * ITEMS_PER_PAGE, totalCount);
    const currentKanjiPage = kanjiList.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <SafeAreaView style={[themeStyles.flex1, { backgroundColor: colors.background }]} edges={['bottom', 'left', 'right']}>
            <View style={[themeStyles.paddingContainer, themeStyles.flex1]}>

                <FlatList
                    key={ITEMS_PER_ROW.toString()}
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
                            </View>
                            
                            <View style={localStyles.paginationContainer}>
                                <TouchableOpacity
                                    onPress={handlePrevPage}
                                    disabled={currentPage === 0 || totalPages <= 1}
                                    style={[localStyles.paginationButton, (currentPage === 0 || totalPages <= 1) && localStyles.paginationDisabled]}
                                >
                                    <Ionicons name="chevron-back" size={20} color={(currentPage === 0 || totalPages <= 1) ? colors.textMuted : colors.text} />
                                </TouchableOpacity>

                                <Text style={localStyles.pageInfo}>
                                    {t('Kanji {{start}}-{{end}} of {{total}}', {
                                        start: startIndex + 1,
                                        end: endItemNumber,
                                        total: totalCount
                                    })}
                                </Text>

                                <TouchableOpacity
                                    onPress={handleNextPage}
                                    disabled={currentPage >= totalPages - 1 || totalPages <= 1}
                                    style={[localStyles.paginationButton, (currentPage >= totalPages - 1 || totalPages <= 1) && localStyles.paginationDisabled]}
                                >
                                    <Ionicons name="chevron-forward" size={20} color={(currentPage >= totalPages - 1 || totalPages <= 1) ? colors.textMuted : colors.text} />
                                </TouchableOpacity>
                            </View>
                        </>
                    }

                    data={currentKanjiPage}
                    keyExtractor={(item) => item.uuid}
                    numColumns={ITEMS_PER_ROW}
                    contentContainerStyle={localStyles.vocabGrid}
                    columnWrapperStyle={localStyles.gridRow}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity
                            onPress={() => onSelectKanji(item)}
                        >
                            <Card style={{
                                ...localStyles.vocabCard,
                                width: ITEM_WIDTH,
                                height: ITEM_WIDTH
                            }}>
                                <Text style={localStyles.tileNumber}>
                                    {startIndex + index + 1}
                                </Text>
                                <Text style={localStyles.vocabText} numberOfLines={1} adjustsFontSizeToFit>
                                    {item.character}
                                </Text>
                            </Card>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <Text style={localStyles.noItemsText}>
                            {t('No kanji found for this level.')}
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
        justifyContent: 'center',
        marginBottom: spacing.base,
        paddingTop: spacing.base,
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        left: 0,
        top: spacing.base,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.small,
        zIndex: 1,
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
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.large,
    },
    pageInfo: {
        fontSize: 14,
        color: colors.textMuted,
        textAlign: 'center',
        marginHorizontal: spacing.large,
        minWidth: 130, 
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
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.small,
        position: 'relative', 
    },
    vocabText: {
        fontSize: 38,
        fontWeight: '600',
        color: colors.text,
        textAlign: 'center',
    },
    tileNumber: {
        position: 'absolute',
        top: 4,
        right: 6,
        fontSize: 12,
        fontWeight: '600',
        color: colors.textMuted,
        opacity: 0.7,
    },
    noItemsText: {
        textAlign: 'center',
        marginTop: spacing.large * 2,
        fontSize: 16,
        color: colors.textMuted,
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

export default KanjiListScreen;
