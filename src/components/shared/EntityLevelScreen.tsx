import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from "react-native-svg";

import { colors } from '../../theme/styles';
import { EntityType, LevelStyleConfig, useEntityLevels } from '../../hooks/useEntityLevels';

const JP_THEME = {
  ink: '#1F2937',
  primary: '#4673aa',
  accent: '#f74f73',
  paperWhite: '#FFFFFF',
  sand: '#E5E0D6',
  textMuted: '#64748b',
};

const { width } = Dimensions.get('window');

const GRID_PADDING = 24;
const ITEM_MARGIN = 10;
const ITEMS_PER_ROW = 4;
const ITEM_WIDTH = (width - (GRID_PADDING * 2) - (ITEM_MARGIN * (ITEMS_PER_ROW - 1))) / ITEMS_PER_ROW;

const HeaderTorii = () => (
  <View style={styles.toriiContainer} pointerEvents="none">
    <Svg width="160" height="80" viewBox="0 0 120 60" style={{ opacity: 0.6 }}>
       <Defs>
          <SvgLinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={JP_THEME.accent} stopOpacity="1" />
            <Stop offset="1" stopColor="#c23b22" stopOpacity="1" />
          </SvgLinearGradient>
       </Defs>
       <Path d="M 10 20 Q 60 10 110 20 L 112 28 Q 60 18 8 28 Z" fill="url(#grad)" />
       <Rect x="25" y="28" width="6" height="30" rx="1" fill="#c0392b" />
       <Rect x="89" y="28" width="6" height="30" rx="1" fill="#c0392b" />
    </Svg>
  </View>
);

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
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    
    const { entityName, totalLevels, levelsPerLoad, getLevelStyle, onSelectLevel } = config;

    const [visibleRange, setVisibleRange] = useState<{ min: number; max: number }>({
        min: 1,
        max: levelsPerLoad,
    });

    const { displayedLevels, hasMore, loadingMore, loadMore } = useEntityLevels({
        totalLevels,
        levelsPerLoad,
        getLevelStyle,
    });

    const getMidpointLevel = () => {
        const mid = Math.floor((visibleRange.min + visibleRange.max) / 2);
        return Math.max(1, Math.min(mid, totalLevels));
    };

    const currentGroupStyle = getLevelStyle(getMidpointLevel());

    const handleViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            const visibleLevels = viewableItems.map((item: any) => item.item);
            const min = Math.min(...visibleLevels);
            const max = Math.max(...visibleLevels);
            setVisibleRange({ min, max });
        }
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

    const handleLoadMore = () => {
        if (hasMore && !loadingMore) {
            loadMore();
        }
    };

    const renderFooter = () => {
        if (!loadingMore) return <View style={{ height: 40 }} />;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#10B981" />
                <Text style={styles.loadingMoreText}>Loading more...</Text>
            </View>
        );
    };

    return (
        <View 
            style={[
                styles.container, 
                { 
                    paddingTop: insets.top,
                    paddingLeft: insets.left,
                    paddingRight: insets.right
                }
            ]}
        >
            
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()} 
                    style={styles.backButton}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={20} color={JP_THEME.ink} />
                </TouchableOpacity>
                
                <View style={styles.headerTitleContainer}>
                    <HeaderTorii />
                    <Text style={styles.headerTitle}>{t(entityName) || entityName}</Text>
                    <Text style={[styles.headerSubtitle, { color: currentGroupStyle.color }]}>
                        {currentGroupStyle.text}
                    </Text>
                </View>

                <View style={{ width: 40 }} /> 
            </View>

            <FlatList
                key={ITEMS_PER_ROW.toString()}
                data={displayedLevels}
                keyExtractor={item => item.toString()}
                numColumns={ITEMS_PER_ROW}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: insets.bottom + 20 }
                ]}
                columnWrapperStyle={styles.levelsRow}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                onViewableItemsChanged={handleViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                ListFooterComponent={renderFooter}
                showsVerticalScrollIndicator={false}
                renderItem={({ item: level }) => {
                    const style = getLevelStyle(level);
                    return (
                        <TouchableOpacity
                            key={level}
                            onPress={() => onSelectLevel(level)}
                            activeOpacity={0.7}
                            style={{ width: ITEM_WIDTH }}
                        >
                            <View
                                style={[
                                    styles.levelCard,
                                    {
                                        borderColor: style.borderColor || style.color,
                                    },
                                ]}>
                                
                                <View style={[styles.colorStrip, { backgroundColor: style.color }]} />
                                
                                <Text style={styles.levelNumber}>
                                    {level}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1,
        backgroundColor: colors.background 
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 8,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: JP_THEME.paperWhite, 
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    toriiContainer: {
        position: 'absolute',
        top: -15,
        opacity: 0.5,
    },
    headerTitle: {
        fontSize: 25,
        fontWeight: '800',
        color: JP_THEME.ink,
        textTransform: 'capitalize',
    },
    headerSubtitle: {
        fontSize: 25,
        fontWeight: '700',
        marginTop: 2,
        letterSpacing: 0.5,
    },

    scrollContent: {
        paddingHorizontal: GRID_PADDING,
        paddingTop: 10,
    },
    levelsRow: {
        justifyContent: 'space-between',
        marginBottom: ITEM_MARGIN,
    },

    levelCard: {
        backgroundColor: JP_THEME.paperWhite,
        borderRadius: 12,
        borderWidth: 1,
        height: ITEM_WIDTH, 
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: JP_THEME.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        overflow: 'hidden',
        position: 'relative',
    },
    colorStrip: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 6,
        opacity: 0.8,
    },
    levelNumber: {
        fontSize: 24,
        fontWeight: '800',
        color: JP_THEME.ink,
        fontVariant: ['tabular-nums'],
    },

    footerLoader: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
        gap: 8,
    },
    loadingMoreText: {
        fontSize: 12,
        color: JP_THEME.textMuted,
        fontWeight: '600',
    },
});