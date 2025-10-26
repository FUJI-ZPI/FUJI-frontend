import React, {useState, useEffect} from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, Alert
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {themeStyles, colors, spacing, levelStyles} from '../theme/styles';
import {useTranslation} from 'react-i18next';
import * as SecureStore from 'expo-secure-store';
import {Card} from '../components/ui/Card';
import {MnemonicTooltipButton} from '../components/ui/MnemonicTooltipButton';

interface Meaning { meaning: string; primary: boolean; }
interface Reading { primary: boolean; reading: string; }
interface ContextSentence { en: string; ja: string; }
interface PronunciationAudio { url: string; metadata: { gender: string; }; local_filename: string; }
interface AuxiliaryMeaning { type: string; meaning: string; }
interface VocabData {
    slug: string; level: number; meanings: Meaning[]; auxiliary_meanings: AuxiliaryMeaning[];
    readings: Reading[]; characters: string; document_url: string; parts_of_speech: string[];
    meaning_mnemonic: string; reading_mnemonic: string; context_sentences: ContextSentence[];
    pronunciation_audios: PronunciationAudio[]; component_subject_ids: number[];
}
interface VocabularyDetailsDto {
    level: number; characters: string; unicodeCharacters: string[] | null;
    details: { id: number; object: string; url: string; data: VocabData; }
}

type TabName = 'meaning' | 'examples' | 'kanji';

interface ScreenProps {
    navigation: any;
    route: { params: { vocabularyUuid: string, characters: string } };
}

const primaryGreen = '#10B981';
const accentBlue = '#3B82F6';

const TabButton: React.FC<{ icon: any, label: string, isActive: boolean, onPress: () => void }> =
    ({ icon, label, isActive, onPress }) => (
        <TouchableOpacity
            style={[localStyles.tabButton, isActive && localStyles.tabButtonActive]}
            onPress={onPress}
        >
            <Ionicons name={icon} size={18} color={isActive ? accentBlue : colors.textMuted} />
            <Text style={[localStyles.tabLabel, isActive && localStyles.tabLabelActive]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

const SentenceRow: React.FC<{ sentence: ContextSentence }> = ({ sentence }) => {
    const [showTranslation, setShowTranslation] = useState(false);
    return (
        <View style={localStyles.sentenceRow}>
            <Text style={localStyles.sentenceJa}>{sentence.ja}</Text>
            <TouchableOpacity
                onPress={() => setShowTranslation(!showTranslation)}
                style={localStyles.toggleButton}
            >
                <Ionicons
                    name={showTranslation ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color={showTranslation ? accentBlue : primaryGreen}
                    style={{ marginRight: spacing.small }}
                />
                <Text style={localStyles.toggleTranslation}>
                    {showTranslation ? ' Hide Translation' : ' Show Translation'}
                </Text>
            </TouchableOpacity>
            {showTranslation && <Text style={localStyles.sentenceEn}>{sentence.en}</Text>}
        </View>
    );
};

const KanjiTilePlaceholder: React.FC<{ kanjiId: number, onPress: () => void }> = ({ kanjiId, onPress }) => (
    <TouchableOpacity onPress={onPress} style={localStyles.kanjiTile}>
        <Ionicons name="apps-outline" size={28} color={primaryGreen} />
        <Text style={localStyles.kanjiTileText}>Kanji #{kanjiId}</Text>
        <Ionicons name="link-outline" size={14} color={accentBlue} style={{ position: 'absolute', top: 4, right: 4 }} />
    </TouchableOpacity>
);

const CollapsibleSection: React.FC<{ title: string, count: number, children: React.ReactNode }> = ({ title, count, children }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);

    return (
        <View style={localStyles.collapsibleContainer}>
            <TouchableOpacity
                style={localStyles.collapsibleHeader}
                onPress={() => setIsCollapsed(!isCollapsed)}
                activeOpacity={0.7}
            >
                <Text style={localStyles.collapsibleTitle}>
                    {`${title} (${count})`}
                </Text>
                
                <Ionicons
                    name={isCollapsed ? "chevron-down-outline" : "chevron-up-outline"}
                    size={20}
                    color={colors.textMuted}
                />
            </TouchableOpacity>

            {!isCollapsed && (
                <View style={localStyles.collapsibleContent}>
                    {children}
                </View>
            )}
        </View>
    );
};

const VocabularyDetailScreen: React.FC<ScreenProps> = ({ navigation, route }) => {
    const { t } = useTranslation();
    const { vocabularyUuid, characters } = route.params;

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<VocabularyDetailsDto | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabName>('meaning');

    const fetchVocabularyDetails = async (uuid: string) => {
        setLoading(true); setError(null);
        try {
            const token = await SecureStore.getItemAsync('accessToken');
            if (!token) throw new Error("Authentication token not found. Please log in again.");
            const headers = { 'Authorization': `Bearer ${token}` };
            const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/vocabulary/v1/vocabulary/details/${uuid}`, { headers });
            if (!res.ok) {
                if (res.status === 401 || res.status === 403) throw new Error("Authorization error. Please try logging in again.");
                throw new Error(`Server error: ${res.status}`);
            }
            const jsonData: VocabularyDetailsDto = await res.json();
            setData(jsonData);
        } catch (e: any) {
            console.error('Failed to fetch:', e); setError(e.message || "Unknown error."); Alert.alert('Error', e.message || "Could not fetch data.");
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchVocabularyDetails(vocabularyUuid); }, [vocabularyUuid]);

    const navigateToKanji = (kanjiId: number) => {
    console.log(`📘 [KANJI] Would navigate to Kanji #${kanjiId}`);
    Alert.alert(
        "Kanji Navigation Placeholder",
        `Would open details for Kanji #${kanjiId}`
    );
    };

    if (loading) return <SafeAreaView style={[themeStyles.flex1, localStyles.centered]} edges={['bottom', 'left', 'right']}><ActivityIndicator size="large" color={primaryGreen} /></SafeAreaView>;
    if (error || !data) return <SafeAreaView style={[themeStyles.flex1, localStyles.centered]} edges={['bottom', 'left', 'right']}><Text style={localStyles.errorText}>Error: {error || 'Data not found.'}</Text></SafeAreaView>;

    const vocabData = data.details.data;
    const primaryReading = vocabData.readings.find(r => r.primary)?.reading || '';
    const primaryMeaning = vocabData.meanings.find(m => m.primary)?.meaning || '';
    const otherMainMeanings = vocabData.meanings.filter(m => !m.primary);
    const whitelistMeanings = vocabData.auxiliary_meanings.filter(
            m => m.type === 'whitelist'
        );

    const renderMeaningTab = () => (
        <Card style={localStyles.tabContentCard}>
                <View style={localStyles.sectionHeader}>
                    <Text style={localStyles.groupTitle}>Meaning</Text>
                    <MnemonicTooltipButton icon="bulb-outline" mnemonicText={vocabData.meaning_mnemonic} />
                </View>

                <Text style={localStyles.primaryMeaning}>{primaryMeaning}</Text>

                {otherMainMeanings.length > 0 && (
                    <>
                        <Text style={[localStyles.groupTitle, { fontSize: 14, marginTop: spacing.small, marginBottom: spacing.small }]}>
                            Other Meanings
                        </Text>
                        <View style={[localStyles.tagContainer, { marginBottom: spacing.base }]}>
                            {otherMainMeanings.map(m => (
                                <View key={m.meaning} style={localStyles.tag}>
                                    <Text style={localStyles.tagText}>{m.meaning}</Text>
                                </View>
                            ))}
                        </View>
                    </>
                )}

                {whitelistMeanings.length > 0 && (
                    <CollapsibleSection 
                        title="Auxiliary Meanings (Synonyms)" 
                        count={whitelistMeanings.length}
                    >
                        <Text style={localStyles.auxiliaryInfoText}>
                            These are synonyms or alternative answers that are also accepted.
                        </Text>
                        
                        <View style={[localStyles.tagContainer, { marginTop: spacing.base }]}>
                            {whitelistMeanings.map(m => (
                                <View key={m.meaning} style={[localStyles.tag, localStyles.auxiliaryTag]}>
                                    <Text style={localStyles.tagText}>{m.meaning}</Text>
                                </View>
                            ))}
                        </View>
                    </CollapsibleSection>
                )}
                
                <Text style={[localStyles.groupTitle, { marginTop: spacing.base }]}>Part of Speech</Text>
                <View style={localStyles.tagContainer}>
                    {vocabData.parts_of_speech.map(pos => (
                        <View key={pos} style={[localStyles.tag, localStyles.posTag]}>
                            <Text style={localStyles.posTagText}>{pos}</Text>
                        </View>
                    ))}
                </View>
            </Card>
    );

    const renderExamplesTab = () => (
        <Card style={localStyles.tabContentCard}>
            <Text style={localStyles.groupTitle}>Example Sentences</Text>
            {vocabData.context_sentences.map((sentence, index) => (
                <SentenceRow key={index} sentence={sentence} />
            ))}
            {vocabData.context_sentences.length === 0 && <Text style={localStyles.noItemsText}>No example sentences available.</Text>}
        </Card>
    );

    const renderKanjiTab = () => (
        <>
            {vocabData.component_subject_ids.length > 0 && (
                <Card style={localStyles.tabContentCard}>
                    <Text style={localStyles.groupTitle}>Component Kanji</Text>
                    <View style={localStyles.kanjiGrid}>
                        {vocabData.component_subject_ids.map(kanjiId => (
                            <KanjiTilePlaceholder
                                key={kanjiId}
                                kanjiId={kanjiId}
                                onPress={() => navigateToKanji(kanjiId)}
                            />
                        ))}
                    </View>
                </Card>
            )}
            {vocabData.component_subject_ids.length === 0 && <Text style={localStyles.noItemsText}>This vocabulary word doesn't contain Kanji.</Text>}
        </>
    );

    return (
        <SafeAreaView style={[themeStyles.flex1, { backgroundColor: colors.background }]} edges={['bottom', 'left', 'right']}>
            <ScrollView contentContainerStyle={localStyles.scrollContent}>
                <View style={localStyles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={localStyles.backButton}>
                        <Ionicons name="arrow-back" size={20} color={colors.text} />
                        <Text style={localStyles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                    <Text style={localStyles.title}>Vocabulary Details</Text>
                    <View style={{ width: 60 }} />
                </View>

                <View style={localStyles.characterBox}>
                    <Text style={localStyles.characterText}>{data.characters}</Text>
                    {/* Czytanie z dymkiem obok */}
                    <View style={localStyles.readingContainer}>
                        <Text style={localStyles.readingText}>{primaryReading}</Text>
                        <MnemonicTooltipButton icon="chatbubble-ellipses-outline" mnemonicText={vocabData.reading_mnemonic} />
                    </View>
                    <View style={localStyles.audioButtonsContainer}>
                    {/* FEMALE */}
                    <TouchableOpacity
                        style={localStyles.audioButton}
                        onPress={() => {
                        if (!data) return;
                        const femaleAudio = data.details.data.pronunciation_audios.find(a => a.metadata.gender === 'female');
                        if (femaleAudio) {
                            console.log(`🔊 [AUDIO] Would play: ${femaleAudio.local_filename}`);
                            Alert.alert(
                            "Audio Placeholder",
                            `Would play female voice: ${femaleAudio.local_filename}`
                            );
                        } else {
                            Alert.alert("Audio Not Found", "No female audio file found.");
                        }
                        }}
                    >
                        <Ionicons name="volume-medium-outline" size={18} color={primaryGreen} />
                        <Ionicons name="female-outline" size={18} color={accentBlue} style={{ marginLeft: 4 }} />
                    </TouchableOpacity>

                    {/* MALE */}
                    <TouchableOpacity
                        style={localStyles.audioButton}
                        onPress={() => {
                        if (!data) return;
                        const maleAudio = data.details.data.pronunciation_audios.find(a => a.metadata.gender === 'male');
                        if (maleAudio) {
                            console.log(`🔊 [AUDIO] Would play: ${maleAudio.local_filename}`);
                            Alert.alert(
                            "Audio Placeholder",
                            `Would play male voice: ${maleAudio.local_filename}`
                            );
                        } else {
                            Alert.alert("Audio Not Found", "No male audio file found.");
                        }
                        }}
                    >
                        <Ionicons name="volume-medium-outline" size={18} color={primaryGreen} />
                        <Ionicons name="male-outline" size={18} color={accentBlue} style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                    </View>


                </View>

                <View style={localStyles.tabContainer}>
                    <TabButton icon="book-outline" label="Meaning" isActive={activeTab === 'meaning'} onPress={() => setActiveTab('meaning')} />
                    <TabButton icon="list-outline" label="Examples" isActive={activeTab === 'examples'} onPress={() => setActiveTab('examples')} />
                    <TabButton
                        icon="language-outline"
                        label="Kanji"
                        isActive={activeTab === 'kanji'}
                        onPress={() => setActiveTab('kanji')}
                    />
                </View>

                <View style={localStyles.tabContentContainer}>
                    {activeTab === 'meaning' && renderMeaningTab()}
                    {activeTab === 'examples' && renderExamplesTab()}
                    {activeTab === 'kanji' && renderKanjiTab()}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};


const localStyles = StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.base },
    backButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.small },
    backButtonText: { fontSize: 16, marginLeft: 4, color: colors.text },
    title: { fontSize: 20, fontWeight: 'bold', color: colors.text, textAlign: 'center' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    errorText: { fontSize: 16, color: colors.danger, textAlign: 'center', margin: 20 },
    characterBox: {
        paddingTop: spacing.large * 1.5,
        paddingBottom: spacing.large,
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        paddingHorizontal: spacing.large
    },
    characterText: { fontSize: 60, fontWeight: '500', color: primaryGreen, marginBottom: spacing.small },
    readingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.large, },
    readingText: { fontSize: 24, color: colors.textMuted, marginRight: spacing.small },
    audioButtonsContainer: { flexDirection: 'row', gap: spacing.base, },
    audioButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.lightBackground, paddingVertical: spacing.small, paddingHorizontal: spacing.base, borderRadius: 20, borderWidth: 1, borderColor: colors.border, },
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
        ...themeStyles.gap4,
        flex: 1,
    },
    tabButtonActive: { backgroundColor: '#D1FAE5', },
    tabLabel: { fontSize: 14, color: colors.textMuted, },
    tabLabelActive: { color: primaryGreen, fontWeight: '600', },

    scrollContent: {
        paddingHorizontal: spacing.base,
        paddingBottom: spacing.base * 4,
        gap: spacing.base,
    },
    tabContentContainer: {
        gap: spacing.base,
    },
    tabContentCard: { padding: spacing.base, borderWidth: 1, borderColor: colors.border, },
    noItemsText: { textAlign: 'center', marginTop: spacing.large, fontSize: 14, color: colors.textMuted },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.base, },
    groupTitle: { fontSize: 16, fontWeight: '600', color: colors.textMuted, flexShrink: 1 },
    primaryMeaning: { fontSize: 22, fontWeight: '600', color: colors.text, marginBottom: spacing.base, },
    tagContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.small, },
    tag: { backgroundColor: colors.lightBackground, borderRadius: 8, paddingHorizontal: spacing.base, paddingVertical: spacing.small, },
    tagText: { color: colors.textMuted, fontSize: 14, },
    posTag: { backgroundColor: '#D1FAE5', borderColor: primaryGreen, borderWidth: 1, },
    posTagText: { color: primaryGreen, fontWeight: '500', },
    mnemonicText: { fontSize: 14, color: colors.textMuted, lineHeight: 20, },
    kanjiGrid: {
        flexDirection: 'row', flexWrap: 'wrap', gap: spacing.base, justifyContent: 'center', marginTop:
            spacing.base
    },
    kanjiTile: { backgroundColor: colors.lightBackground, padding: spacing.base, borderRadius: 8, borderWidth: 1, borderColor: colors.border, alignItems: 'center', minWidth: 90, position: 'relative' },
    kanjiTileText: { marginTop: spacing.small, fontSize: 12, color: primaryGreen, },
    sentenceRow: { paddingVertical: spacing.base, borderBottomWidth: 1, borderBottomColor: colors.border, },
    sentenceJa: { fontSize: 18, fontWeight: '500', color: colors.text, marginBottom: spacing.small, },
    sentenceEn: { fontSize: 14, color: colors.textMuted, marginTop: spacing.tiny },
    toggleButton: { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 8, ...themeStyles.gap4, alignSelf: 'flex-start', paddingVertical: 2 },
    toggleTranslation: { color: primaryGreen, fontSize: 12, },
    mnemonicIconTouchable: { padding: 4, },
    tooltipContent: { backgroundColor: 'rgba(0,0,0,0.85)', borderRadius: 8, padding: spacing.base, maxWidth: '80%' },
    tooltipText: { color: 'white', fontSize: 14 },
    tooltipArrow: { borderTopColor: 'rgba(0,0,0,0.85)' },
    collapsibleContainer: { 
        marginTop: spacing.base, 
        borderTopWidth: 1, 
        borderTopColor: colors.border 
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
});

export default VocabularyDetailScreen;
