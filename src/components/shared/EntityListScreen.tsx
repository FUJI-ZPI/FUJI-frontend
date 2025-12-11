import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// 1. ZMIANA IMPORTU: Usunięto SafeAreaView, dodano hook
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from "react-native-svg";

// Importy z Twojego projektu
import { colors } from '../../theme/styles';
import { EntityItem, EntityType, useEntityList } from '../../hooks/useEntityList';

// --- THEME CONSTANTS ---
const JP_THEME = {
  // bg: '#FDFBF7',  <- Używamy colors.background z Twojego theme
  ink: '#1F2937',        // Sumi Ink
  primary: '#4673aa',    // Fuji Blue
  accent: '#f74f73',     // Sun Red
  paperWhite: '#FFFFFF',
  sand: '#E5E0D6',
  textMuted: '#64748b',
};

const { width } = Dimensions.get('window');
// Dostosowane marginesy i paddingi
const GRID_PADDING = 24;
const ITEM_MARGIN = 12;

// --- HEADER ILLUSTRATION (TORII) ---
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
    const { t } = useTranslation();
    // 2. INICJALIZACJA HOOKA
    const insets = useSafeAreaInsets();
    
    const { level } = route.params;

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

    // Obliczenia szerokości
    const itemsPerPage = itemsPerRow * rowsPerPage;
    const itemWidth = (width - (GRID_PADDING * 2) - (ITEM_MARGIN * (itemsPerRow - 1))) / itemsPerRow;

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

    const onBack = () => navigation.goBack();

    const onSelectItem = (item: EntityItem) => {
        const { screen, params } = getNavigationParams(item);
        navigation.navigate(screen, params);
    };

    const handleLoadMore = () => {
        if (hasMore && !loadingMore) loadMore();
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

    if (loading) {
        return (
            // Zastąpiono SafeAreaView zwykłym View z paddingiem
            <View style={[styles.centerContainer, { backgroundColor: colors.background, paddingTop: insets.top }]}>
                <ActivityIndicator size="large" color="#10B981" />
                <Text style={styles.loadingText}>{t(translationKeys.loading)}</Text>
            </View>
        );
    }

    if (error) {
        return (
            // Zastąpiono SafeAreaView zwykłym View z paddingiem
            <View style={[styles.centerContainer, { backgroundColor: colors.background, paddingTop: insets.top }]}>
                <Text style={styles.errorTitle}>Error</Text>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.buttonPrimary} onPress={refetch}>
                    <Text style={styles.buttonTextWhite}>Try again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        // 3. GŁÓWNY KONTENER Z PADDINGAMI Z HOOKA
        <View
            style={[
                styles.container, 
                { 
                    backgroundColor: colors.background,
                    paddingTop: insets.top,
                    paddingLeft: insets.left,
                    paddingRight: insets.right
                }
            ]}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={onBack} 
                    style={styles.backButton}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={20} color={JP_THEME.ink} />
                </TouchableOpacity>
                
                <View style={styles.headerTitleContainer}>
                    <HeaderTorii />
                    <Text style={styles.headerTitle}>{t('Level {{level}}', { level })}</Text>
                    <Text style={styles.headerSubtitle}>
                        {config.entityType === 'kanji' 
                            ? 'Kanji List' 
                            : config.entityType === 'vocabulary' 
                                ? 'Vocabulary List' 
                                : 'Radicals List'}
                    </Text>
                </View>

                <View style={{ width: 40 }} /> 
            </View>

            {/* Grid */}
            <FlatList
                key={itemsPerRow.toString()}
                data={displayedItems}
                keyExtractor={item => item.uuid}
                numColumns={itemsPerRow}
                // 4. DODANO PADDING BOTTOM DO LISTY
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: 40 + insets.bottom }
                ]}
                columnWrapperStyle={styles.gridRow} // <-- Tutaj zastosowany styl
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => (
                    <TouchableOpacity
                        onPress={() => onSelectItem(item)}
                        activeOpacity={0.7}
                        style={{ width: itemWidth }}
                    >
                        <View
                            style={[
                                styles.itemCard,
                                { height: fixedCardHeight || itemWidth }
                            ]}
                        >
                            <View style={styles.indexBadge}>
                                <Text style={styles.indexText}>{index + 1}</Text>
                            </View>
                            
                            <Text 
                                style={[styles.itemText, { fontSize: itemFontSize }]}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                            >
                                {getItemCharacter(item)}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="documents-outline" size={48} color={JP_THEME.textMuted} />
                        <Text style={styles.noItemsText}>{t(translationKeys.noItems)}</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    
    // Loading/Error States
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    loadingText: { marginTop: 16, color: JP_THEME.textMuted, fontWeight: '600' },
    errorTitle: { fontSize: 24, fontWeight: '800', color: JP_THEME.ink, marginBottom: 8 },
    errorText: { fontSize: 16, color: JP_THEME.textMuted, marginBottom: 24, textAlign: 'center' },
    buttonPrimary: {
        backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 24,
        elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3
    },
    buttonTextWhite: { color: '#fff', fontSize: 16, fontWeight: '700' },

    // Header Styles
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8,
    },
    backButton: {
        width: 40, height: 40, justifyContent: 'center', alignItems: 'center',
        backgroundColor: JP_THEME.paperWhite, borderRadius: 20,
        // Shadow for the button to stand out on custom background
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2
    },
    headerTitleContainer: { alignItems: 'center' },
    toriiContainer: { position: 'absolute', top: -15, opacity: 0.5 },
    headerTitle: { fontSize: 25, fontWeight: '800', color: JP_THEME.ink },
    headerSubtitle: { fontSize: 20, color: JP_THEME.textMuted, fontWeight: '600', marginTop: 2, textTransform: 'uppercase' },

    // List & Grid Styles
    scrollContent: {
        paddingHorizontal: GRID_PADDING, paddingTop: 10, 
        // paddingBottom jest teraz nadpisywany dynamicznie w komponencie
    },
    // POPRAWKA: Używamy flex-start i gap, aby elementy były do lewej
    gridRow: {
        justifyContent: 'flex-start', 
        gap: ITEM_MARGIN,
        marginBottom: ITEM_MARGIN,
    },

    // Card Styles
    itemCard: {
        backgroundColor: JP_THEME.paperWhite,
        borderRadius: 12,
        borderWidth: 1, borderColor: '#F1F5F9',
        justifyContent: 'center', alignItems: 'center',
        // Shadow
        shadowColor: JP_THEME.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
        position: 'relative',
    },
    itemText: {
        fontWeight: '800',
        color: JP_THEME.ink,
        textAlign: 'center',
    },
    indexBadge: {
        position: 'absolute', top: 4, right: 4,
        backgroundColor: '#F8FAFC', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 6,
        borderWidth: 1, borderColor: '#E2E8F0'
    },
    indexText: {
        fontSize: 9, fontWeight: '700', color: JP_THEME.textMuted,
    },

    // Empty & Footer
    emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 40, gap: 10 },
    noItemsText: { fontSize: 16, color: JP_THEME.textMuted, textAlign: 'center' },
    footerLoader: {
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
        paddingVertical: 20, gap: 8,
    },
    loadingMoreText: { fontSize: 12, color: JP_THEME.textMuted, fontWeight: '600' },
});