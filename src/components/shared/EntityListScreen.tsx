import React from 'react';
import {ActivityIndicator, Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View,} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, spacing, themeStyles} from '../../theme/styles';
import {useTranslation} from 'react-i18next';
import {Card} from '../ui/Card';
import {EntityItem, EntityType, useEntityList} from '../../hooks/useEntityList';

const {width} = Dimensions.get('window');
const GRID_PADDING = spacing.base * 2;
const ITEM_MARGIN = 8;

interface EntityListScreenConfig {
    entityType: EntityType;
    itemsPerRow: number;
    rowsPerPage: number;
    itemFontSize: number;
    fixedCardHeight?: number;
    translationKeys: {
        loading: string;
        noItems: string;
    };
    getItemCharacter: (item: EntityItem) => string;
    getNavigationParams: (item: EntityItem) => { screen: string; params: any };
}

interface EntityListScreenProps {
    navigation: any;
    route: { params: { level: number } };
    config: EntityListScreenConfig;
}

export const EntityListScreen: React.FC<EntityListScreenProps> = ({
                                                                      navigation,
                                                                      route,
                                                                      config,
                                                                  }) => {
    const {t} = useTranslation();
    const {level} = route.params;

    const {
        entityType,
        itemsPerRow,
        rowsPerPage,
        itemFontSize,
        fixedCardHeight,
        translationKeys,
        getItemCharacter,
        getNavigationParams,
    } = config;

    const itemsPerPage = itemsPerRow * rowsPerPage;
    const totalMargins = ITEM_MARGIN * (itemsPerRow - 1);
    const itemWidth = (width - GRID_PADDING - totalMargins) / itemsPerRow;

    const {
        loading,
        loadingMore,
        error,
        displayedItems,
        hasMore,
        loadMore,
        refetch,
    } = useEntityList({
        entityType,
        level,
        itemsPerPage,
    });

    const onBack = () => {
        navigation.goBack();
    };

    const onSelectItem = (item: EntityItem) => {
        const {screen, params} = getNavigationParams(item);
        navigation.navigate(screen, params);
    };

    const handleLoadMore = () => {
        if (hasMore && !loadingMore) {
            loadMore();
        }
    };

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={colors.primary}/>
                <Text style={styles.loadingMoreText}>Loading more...</Text>
            </View>
        );
    };

    if (loading) {
        return (
            <SafeAreaView
                style={[themeStyles.flex1, styles.centered]}
                edges={['bottom', 'left', 'right']}>
                <ActivityIndicator size="large" color={colors.primary}/>
                <Text style={styles.pageInfo}>{t(translationKeys.loading)}</Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView
                style={[themeStyles.flex1, styles.centered]}
                edges={['bottom', 'left', 'right']}>
                <Text style={styles.errorText}>Error: {error}</Text>
                <TouchableOpacity onPress={refetch}>
                    <Text style={{color: colors.primary}}>Try again</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView
            style={[themeStyles.flex1, {backgroundColor: colors.background}]}
            edges={['bottom', 'left', 'right']}>
            <View style={[themeStyles.paddingContainer, themeStyles.flex1]}>
                <FlatList
                    key={itemsPerRow.toString()}
                    ListHeaderComponent={
                        <View style={styles.header}>
                            <TouchableOpacity onPress={onBack} style={styles.backButton}>
                                <Ionicons name="arrow-back" size={20} color={colors.text}/>
                                <Text style={styles.backButtonText}>
                                    {t('common.back') || 'Wstecz'}
                                </Text>
                            </TouchableOpacity>

                            <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
                                {t('Level {{level}}', {level}) || `Poziom ${level}`}
                            </Text>
                        </View>
                    }
                    data={displayedItems}
                    keyExtractor={item => item.uuid}
                    numColumns={itemsPerRow}
                    contentContainerStyle={styles.vocabGrid}
                    columnWrapperStyle={styles.gridRow}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    renderItem={({item, index}) => (
                        <TouchableOpacity
                            onPress={() => onSelectItem(item)}
                            style={fixedCardHeight ? {width: itemWidth} : undefined}>
                            <Card
                                style={{
                                    ...styles.vocabCard,
                                    width: itemWidth,
                                    height: fixedCardHeight || itemWidth,
                                }}>
                                <Text style={styles.tileNumber}>{index + 1}</Text>
                                <Text
                                    style={[styles.vocabText, {fontSize: itemFontSize}]}
                                    numberOfLines={1}
                                    adjustsFontSizeToFit>
                                    {getItemCharacter(item)}
                                </Text>
                            </Card>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <Text style={styles.noItemsText}>{t(translationKeys.noItems)}</Text>
                    }
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
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
        fontSize: 16,
        color: colors.textMuted,
        textAlign: 'center',
        marginTop: spacing.large,
    },
    footerLoader: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.large,
        gap: spacing.small,
    },
    loadingMoreText: {
        fontSize: 14,
        color: colors.textMuted,
        marginLeft: spacing.small,
    },
});

