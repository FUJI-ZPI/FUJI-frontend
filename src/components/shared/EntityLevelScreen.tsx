import React from 'react';
import {ActivityIndicator, Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View,} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTranslation} from 'react-i18next';
import {colors, spacing, themeStyles} from '../../theme/styles';
import {EntityType, LevelStyleConfig, useEntityLevels} from '../../hooks/useEntityLevels';

const {width} = Dimensions.get('window');
const GRID_PADDING = spacing.base * 2;
const ITEM_MARGIN = spacing.small;
const ITEMS_PER_ROW = 4;
const ITEM_WIDTH = (width - GRID_PADDING - (ITEM_MARGIN * (ITEMS_PER_ROW - 1))) / ITEMS_PER_ROW;

interface EntityLevelScreenConfig {
    entityType: EntityType;
    entityName: string;
    totalLevels: number;
    levelsPerLoad: number;
    getLevelStyle: (level: number) => LevelStyleConfig;
    onSelectLevel: (level: number) => void;
}

interface EntityLevelScreenProps {
    navigation: any;
    config: EntityLevelScreenConfig;
}

export const EntityLevelScreen: React.FC<EntityLevelScreenProps> = ({
                                                                        navigation,
                                                                        config,
                                                                    }) => {
    const {t} = useTranslation();
    const {entityName, totalLevels, levelsPerLoad, getLevelStyle, onSelectLevel} = config;

    const [visibleRange, setVisibleRange] = React.useState<{ min: number; max: number }>({
        min: 1,
        max: levelsPerLoad,
    });

    const {displayedLevels, hasMore, loadingMore, loadMore} = useEntityLevels({
        totalLevels,
        levelsPerLoad,
        getLevelStyle,
    });

    // Oblicz styl nagłówka na podstawie środka widocznego zakresu
    const getMidpointLevel = () => {
        const mid = Math.floor((visibleRange.min + visibleRange.max) / 2);
        return Math.max(1, Math.min(mid, totalLevels));
    };

    const currentGroupStyle = getLevelStyle(getMidpointLevel());

    const handleViewableItemsChanged = React.useRef(({viewableItems}: any) => {
        if (viewableItems.length > 0) {
            const visibleLevels = viewableItems.map((item: any) => item.item);
            const min = Math.min(...visibleLevels);
            const max = Math.max(...visibleLevels);
            setVisibleRange({min, max});
        }
    }).current;

    const viewabilityConfig = React.useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

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

    return (
        <SafeAreaView style={themeStyles.flex1} edges={['bottom', 'left', 'right']}>
            <View style={[themeStyles.paddingContainer, themeStyles.flex1]}>
                {/* Sticky Header - zawsze widoczny */}
                <View style={styles.header}>
                    <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
                        {t(entityName) || entityName}{' '}
                        <Text style={{color: currentGroupStyle.color}}>
                            {currentGroupStyle.text}
                        </Text>
                    </Text>
                </View>

                {/* Scrollable Content */}
                <FlatList
                    key={ITEMS_PER_ROW.toString()}
                    data={displayedLevels}
                    keyExtractor={item => item.toString()}
                    numColumns={ITEMS_PER_ROW}
                    contentContainerStyle={styles.scrollContent}
                    columnWrapperStyle={styles.levelsRow}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    onViewableItemsChanged={handleViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
                    ListFooterComponent={renderFooter}
                    renderItem={({item: level}) => {
                        const style = getLevelStyle(level);
                        return (
                            <TouchableOpacity
                                key={level}
                                onPress={() => onSelectLevel(level)}
                                style={{width: ITEM_WIDTH}}>
                                <View
                                    style={[
                                        styles.levelCard,
                                        {
                                            backgroundColor: style.background,
                                            borderColor: style.borderColor,
                                        },
                                    ]}>
                                    <Text style={[styles.levelNumber, {color: style.color}]}>
                                        {level}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        backgroundColor: colors.background,
        paddingBottom: spacing.base * 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: spacing.base,
        paddingBottom: spacing.base,
        marginBottom: spacing.small,
        marginHorizontal: spacing.base,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.text,
        textAlign: 'center',
        flex: 1,
        marginHorizontal: spacing.small,
    },
    levelsRow: {
        justifyContent: 'space-between',
        marginBottom: spacing.small,
    },
    levelCard: {
        borderRadius: 12,
        borderWidth: 2,
        height: ITEM_WIDTH,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    levelNumber: {
        fontSize: 30,
        fontWeight: '700',
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

