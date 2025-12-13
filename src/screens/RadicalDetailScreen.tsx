import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View,} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {colors, spacing, themeStyles} from '../theme/styles';
import * as SecureStore from 'expo-secure-store';
import {Card} from '../components/ui/Card';
import {MnemonicTooltipButton} from '../components/ui/MnemonicTooltipButton';

import Svg, {Defs, LinearGradient as SvgLinearGradient, Path, Rect, Stop} from 'react-native-svg';

const JP_THEME = {
    ink: '#1F2937',
    primary: '#4673aa',
    accent: '#f74f73',
    paperWhite: '#FFFFFF',
    sand: '#E5E0D6',
    textMuted: '#64748b',
};

const HeaderTorii = () => (
    <View style={localStyles.toriiContainer} pointerEvents="none">
        <Svg width="160" height="80" viewBox="0 0 120 60" style={{opacity: 0.6}}>
            <Defs>
                <SvgLinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor={JP_THEME.accent} stopOpacity="1"/>
                    <Stop offset="1" stopColor="#c23b22" stopOpacity="1"/>
                </SvgLinearGradient>
            </Defs>
            <Path d="M 10 20 Q 60 10 110 20 L 112 28 Q 60 18 8 28 Z" fill="url(#grad)"/>
            <Rect x="25" y="28" width="6" height="30" rx="1" fill="#c0392b"/>
            <Rect x="89" y="28" width="6" height="30" rx="1" fill="#c0392b"/>
        </Svg>
    </View>
);

interface Meaning {
    meaning: string;
    primary: boolean;
    accepted_answer?: boolean;
}

interface AuxiliaryMeaning {
    type: string;
    meaning: string;
}

interface KanjiDto {
    uuid: string;
    character: string;
    subjectId: number;
}

interface RadicalData {
    slug: string;
    level: number;
    meanings: Meaning[];
    auxiliary_meanings: AuxiliaryMeaning[];
    characters: string | null;
    document_url: string;
    meaning_mnemonic: string;
    amalgamation_subject_ids: number[];
    hidden_at: string | null;
    created_at: string;
    lesson_position: number;
    spaced_repetition_system_id: number;
}

interface RadicalDetailsDto {
    level: number;
    character: string;
    unicodeCharacter: string | null;
    slug: string;
    details: {
        id: number;
        object: string;
        url: string;
        data: RadicalData;
        data_updated_at: string;
    };
    kanjiDto: KanjiDto[];
}

type TabName = 'meaning' | 'related';

interface ScreenProps {
    navigation: any;
    route: { params: { radicalUuid: string; character: string } };
}

const primaryGreen = '#10B981';
const accentBlue = '#3B82F6';

const TabButton: React.FC<{
    icon: any;
    label: string;
    isActive: boolean;
    onPress: () => void;
}> = ({icon, label, isActive, onPress}) => (
    <TouchableOpacity
        style={[localStyles.tabButton, isActive && localStyles.tabButtonActive]}
        onPress={onPress}>
        <Ionicons
            name={icon}
            size={18}
            color={isActive ? primaryGreen : colors.textMuted}
        />
        <Text
            style={[localStyles.tabLabel, isActive && localStyles.tabLabelActive]}>
            {label}
        </Text>
    </TouchableOpacity>
);

const RelatedSubjectTile: React.FC<{
    character: string;
    onPress: () => void;
}> = ({character, onPress}) => (
    <TouchableOpacity onPress={onPress} style={localStyles.kanjiTile}>
        <Text style={localStyles.kanjiTileCharacter}>{character}</Text>
    </TouchableOpacity>
);

const CollapsibleSection: React.FC<{
    title: string;
    count: number;
    children: React.ReactNode;
}> = ({title, count, children}) => {
    const [isCollapsed, setIsCollapsed] = useState(true);

    return (
        <View style={localStyles.collapsibleContainer}>
            <TouchableOpacity
                style={localStyles.collapsibleHeader}
                onPress={() => setIsCollapsed(!isCollapsed)}
                activeOpacity={0.7}>
                <Text style={localStyles.collapsibleTitle}>
                    {`${title} (${count})`}
                </Text>
                <Ionicons
                    name={isCollapsed ? 'chevron-down-outline' : 'chevron-up-outline'}
                    size={20}
                    color={colors.textMuted}
                />
            </TouchableOpacity>
            {!isCollapsed && (
                <View style={localStyles.collapsibleContent}>{children}</View>
            )}
        </View>
    );
};

const RadicalDetailScreen: React.FC<ScreenProps> = ({navigation, route}) => {
    const {radicalUuid} = route.params;

    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<RadicalDetailsDto | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabName>('meaning');

    const fetchRadicalDetails = async (uuid: string) => {
        setLoading(true);
        setError(null);
        try {
            const token = await SecureStore.getItemAsync('accessToken');
            if (!token) throw new Error('Authentication token not found.');
            const headers = {Authorization: `Bearer ${token}`};
            const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/v1/radical/${uuid}`;
            const res = await fetch(url, {headers});
            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            const jsonData: RadicalDetailsDto = await res.json();
            setData(jsonData);
        } catch (e: any) {
            setError(e.message || 'Unknown error.');
            Alert.alert('Error', e.message || 'Could not fetch data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRadicalDetails(radicalUuid);
    }, [radicalUuid]);

    const navigateToKanji = (kanjiUuid: string) => {
        navigation.navigate('Kanji', {
            screen: 'KanjiDetail',
            params: {kanjiUuid: kanjiUuid, character: ''},
        });
    };

    if (loading) {
        return (
            <View style={[localStyles.centered, {paddingTop: insets.top}]}>
                <ActivityIndicator size="large" color={primaryGreen}/>
            </View>
        );
    }

    if (error || !data) {
        return (
            <View style={[localStyles.centered, {paddingTop: insets.top}]}>
                <Text style={localStyles.errorText}>Error: {error || 'Data not found.'}</Text>
            </View>
        );
    }

    const radicalData = data.details.data;
    const primaryMeaning = radicalData.meanings.find(m => m.primary)?.meaning || '';
    const otherMainMeanings = radicalData.meanings.filter(m => !m.primary);
    const whitelistMeanings = radicalData.auxiliary_meanings.filter(m => m.type === 'whitelist');
    const relatedKanjis = data.kanjiDto || [];

    const renderMeaningTab = () => (
        <Card style={localStyles.tabContentCard}>
            <View style={localStyles.sectionHeader}>
                <Text style={localStyles.groupTitle}>Meaning</Text>
                <MnemonicTooltipButton
                    icon="bulb-outline"
                    mnemonicText={radicalData.meaning_mnemonic}
                />
            </View>
            <Text style={localStyles.primaryMeaning}>{primaryMeaning}</Text>
            {otherMainMeanings.length > 0 && (
                <>
                    <Text style={[localStyles.groupTitle, {fontSize: 14, marginVertical: spacing.small}]}>
                        Other Meanings
                    </Text>
                    <View style={[localStyles.tagContainer, {marginBottom: spacing.base}]}>
                        {otherMainMeanings.map(m => (
                            <View key={m.meaning} style={localStyles.tag}>
                                <Text style={localStyles.tagText}>{m.meaning}</Text>
                            </View>
                        ))}
                    </View>
                </>
            )}
            {whitelistMeanings.length > 0 && (
                <CollapsibleSection title="Auxiliary Meanings" count={whitelistMeanings.length}>
                    <Text style={localStyles.auxiliaryInfoText}>Synonyms or alternative meanings.</Text>
                    <View style={[localStyles.tagContainer, {marginTop: spacing.base}]}>
                        {whitelistMeanings.map(m => (
                            <View key={m.meaning} style={[localStyles.tag, localStyles.auxiliaryTag]}>
                                <Text style={localStyles.tagText}>{m.meaning}</Text>
                            </View>
                        ))}
                    </View>
                </CollapsibleSection>
            )}
        </Card>
    );

    const renderRelatedTab = () => (
        <>
            {relatedKanjis.length > 0 ? (
                <Card style={localStyles.tabContentCard}>
                    <Text style={localStyles.groupTitle}>Found in Kanji</Text>
                    <View style={localStyles.kanjiGrid}>
                        {relatedKanjis.map(kanji => (
                            <RelatedSubjectTile
                                key={kanji.uuid}
                                character={kanji.character}
                                onPress={() => navigateToKanji(kanji.uuid)}
                            />
                        ))}
                    </View>
                </Card>
            ) : (
                <Text style={localStyles.noItemsText}>No related Kanji found.</Text>
            )}
        </>
    );

    return (
        <View style={[
            themeStyles.flex1,
            {
                backgroundColor: colors.background,
                // GŁÓWNY PADDING GÓRNY Z HOOKA
                paddingTop: insets.top,
                paddingLeft: insets.left,
                paddingRight: insets.right
            }
        ]}>

            {/* ZMIANA: NAGŁÓWEK WYCIĄGNIĘTY PRZED ScrollView.
         Teraz pozycja strzałki "Back" jest niezależna od paddingu contentu ScrollView
         i będzie identyczna jak w EntityListScreen.
      */}
            <View style={localStyles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={localStyles.backButton}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={20} color={JP_THEME.ink}/>
                </TouchableOpacity>

                <View style={localStyles.headerTitleContainer}>
                    <HeaderTorii/>
                    <Text style={localStyles.headerTitle}>Radical Details</Text>
                    <Text style={localStyles.headerSubtitle}>{primaryMeaning}</Text>
                </View>

                {/* Pusty widok dla równowagi */}
                <View style={{width: 40}}/>
            </View>

            <ScrollView
                contentContainerStyle={[
                    localStyles.scrollContent,
                    {paddingBottom: insets.bottom + 20}
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* RESZTA TREŚCI */}
                <View style={localStyles.characterBox}>
                    <Text style={localStyles.characterText}>{data.character || '?'}</Text>
                </View>

                <View style={localStyles.tabContainer}>
                    <TabButton
                        icon="book-outline"
                        label="Meaning"
                        isActive={activeTab === 'meaning'}
                        onPress={() => setActiveTab('meaning')}
                    />
                    <TabButton
                        icon="link-outline"
                        label="Found in Kanji"
                        isActive={activeTab === 'related'}
                        onPress={() => setActiveTab('related')}
                    />
                </View>

                <View style={localStyles.tabContentContainer}>
                    {activeTab === 'meaning' && renderMeaningTab()}
                    {activeTab === 'related' && renderRelatedTab()}
                </View>
            </ScrollView>
        </View>
    );
};

const localStyles = StyleSheet.create({
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
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    headerTitleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    toriiContainer: {
        position: 'absolute',
        top: -15,
        left: '50%',
        transform: [{translateX: -80}], // Połowa z 160
        opacity: 0.5,
        // Usunięto zIndex: -1, aby brama była widoczna nad tłem, ale pod tekstem (w kolejności renderowania)
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: JP_THEME.ink,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 2,
        color: JP_THEME.primary,
        textTransform: 'capitalize',
        textAlign: 'center',
    },

    // COMMON
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    errorText: {
        fontSize: 16,
        color: colors.danger,
        textAlign: 'center',
        margin: 20,
    },

    // CHARACTER BOX
    characterBox: {
        paddingVertical: spacing.large,
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        paddingHorizontal: spacing.large,
        justifyContent: 'center',
        minHeight: 150,
        marginBottom: spacing.base,
    },
    characterText: {
        fontSize: 60,
        fontWeight: '500',
        color: primaryGreen,
    },

    // TABS
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: colors.cardBackground,
        padding: spacing.small,
        borderRadius: 12,
        gap: spacing.small,
    },
    tabButton: {
        alignItems: 'center',
        paddingVertical: spacing.small,
        paddingHorizontal: spacing.base,
        borderRadius: 8,
        ...themeStyles.gap8,
        flex: 1,
    },
    tabButtonActive: {backgroundColor: '#D1FAE5'},
    tabLabel: {fontSize: 14, color: colors.textMuted},
    tabLabelActive: {color: primaryGreen, fontWeight: '600'},

    // CONTENT
    scrollContent: {
        paddingHorizontal: spacing.base,
        paddingTop: 10,
        gap: spacing.base,
    },
    tabContentContainer: {
        gap: spacing.base,
        marginTop: spacing.base,
    },
    tabContentCard: {
        padding: spacing.base,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
    },
    noItemsText: {
        textAlign: 'center',
        marginTop: spacing.large,
        fontSize: 14,
        color: colors.textMuted,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.base,
    },
    groupTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textMuted,
        flexShrink: 1,
    },
    primaryMeaning: {
        fontSize: 22,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.base,
    },
    tagContainer: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.small},
    tag: {
        backgroundColor: colors.lightBackground,
        borderRadius: 8,
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.small,
    },
    tagText: {color: colors.textMuted, fontSize: 14},
    collapsibleContainer: {
        marginTop: spacing.base,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    collapsibleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.base,
    },
    collapsibleTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.textMuted,
    },
    collapsibleContent: {
        paddingTop: spacing.small,
        paddingBottom: spacing.base,
        paddingHorizontal: spacing.small,
    },
    auxiliaryInfoText: {
        fontSize: 13,
        color: colors.textMuted,
        fontStyle: 'italic',
        marginBottom: spacing.small,
    },
    auxiliaryTag: {
        backgroundColor: colors.background,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: colors.border,
    },
    kanjiGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.base,
        justifyContent: 'center',
        marginTop: spacing.base,
    },
    kanjiTile: {
        backgroundColor: colors.lightBackground,
        padding: spacing.base,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        width: 90,
        height: 90,
        justifyContent: 'center',
    },
    kanjiTileCharacter: {
        fontSize: 40,
        color: primaryGreen,
    },
});

export default RadicalDetailScreen;