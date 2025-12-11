import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// 1. Hook insets
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {colors, spacing, themeStyles} from '../theme/styles';
import * as SecureStore from 'expo-secure-store';
import {Card} from '../components/ui/Card';
import {MnemonicTooltipButton} from '../components/ui/MnemonicTooltipButton';
import {Audio} from 'expo-av';
// 2. Importy SVG
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from "react-native-svg";

// --- THEME CONSTANTS ---
const JP_THEME = {
  ink: '#1F2937',
  primary: '#4673aa',
  accent: '#f74f73',
  paperWhite: '#FFFFFF',
  sand: '#E5E0D6',
  textMuted: '#64748b',
};

// --- HEADER ILLUSTRATION (TORII 160x80) ---
const HeaderTorii = () => (
  <View style={localStyles.toriiContainer} pointerEvents="none">
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

interface Meaning {
  meaning: string;
  primary: boolean;
}
interface Reading {
  primary: boolean;
  reading: string;
}
interface ContextSentence {
  en: string;
  ja: string;
}
interface PronunciationAudio {
  url: string;
  metadata: {gender: string};
  local_filename: string;
}
interface AuxiliaryMeaning {
  type: string;
  meaning: string;
}
interface VocabData {
  slug: string;
  level: number;
  meanings: Meaning[];
  auxiliary_meanings: AuxiliaryMeaning[];
  readings: Reading[];
  characters: string;
  document_url: string;
  parts_of_speech: string[];
  meaning_mnemonic: string;
  reading_mnemonic: string;
  context_sentences: ContextSentence[];
  pronunciation_audios: PronunciationAudio[];
  component_subject_ids: number[];
}

interface KanjiDto {
  uuid: string;
  character: string;
  subjectId: number;
}

interface VocabularyDetailsDto {
  level: number;
  characters: string;
  unicodeCharacters: string[] | null;
  details: {
    id: number;
    object: string;
    url: string;
    data: VocabData;
  };
  componentKanji: KanjiDto[];
}

type TabName = 'meaning' | 'examples' | 'kanji';

interface ScreenProps {
  navigation: any;
  route: {params: {vocabularyUuid: string; characters: string}};
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
      color={isActive ? accentBlue : colors.textMuted}
    />
    <Text style={[localStyles.tabLabel, isActive && localStyles.tabLabelActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const SentenceRow: React.FC<{sentence: ContextSentence}> = ({sentence}) => {
  const [showTranslation, setShowTranslation] = useState(false);
  return (
    <View style={localStyles.sentenceRow}>
      <Text style={localStyles.sentenceJa}>{sentence.ja}</Text>
      <TouchableOpacity
        onPress={() => setShowTranslation(!showTranslation)}
        style={localStyles.toggleButton}>
        <Ionicons
          name={showTranslation ? 'eye-off-outline' : 'eye-outline'}
          size={18}
          color={showTranslation ? accentBlue : primaryGreen}
          style={{marginRight: spacing.small}}
        />
        <Text style={localStyles.toggleTranslation}>
          {showTranslation ? ' Hide Translation' : ' Show Translation'}
        </Text>
      </TouchableOpacity>
      {showTranslation && <Text style={localStyles.sentenceEn}>{sentence.en}</Text>}
    </View>
  );
};

const RelatedKanjiTile: React.FC<{kanji: KanjiDto; onPress: () => void}> = ({
  kanji,
  onPress,
}) => (
  <TouchableOpacity onPress={onPress} style={localStyles.kanjiTile}>
    <Text style={localStyles.kanjiTileCharacter}>{kanji.character}</Text>
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

const VocabularyDetailScreen: React.FC<ScreenProps> = ({navigation, route}) => {
  const {vocabularyUuid} = route.params;

  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<VocabularyDetailsDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabName>('meaning');
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const fetchVocabularyDetails = async (uuid: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (!token)
        throw new Error('Authentication token not found. Please log in again.');
      const headers = {Authorization: `Bearer ${token}`};
      const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/v1/vocabulary/details/${uuid}`;
      console.log('Fetching from URL:', url);
      const res = await fetch(url, {headers});
      if (!res.ok) {
        if (res.status === 401 || res.status === 403)
          throw new Error('Authorization error. Please try logging in again.');
        throw new Error(`Server error: ${res.status}`);
      }
      const jsonData: VocabularyDetailsDto = await res.json();
      setData(jsonData);
    } catch (e: any) {
      console.error('Failed to fetch:', e);
      setError(e.message || 'Unknown error.');
      Alert.alert('Error', e.message || 'Could not fetch data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVocabularyDetails(vocabularyUuid);
  }, [vocabularyUuid]);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const playAudio = async (filename: string) => {
    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
      const token = await SecureStore.getItemAsync('accessToken');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      const audioUrl = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/v1/files/download/${filename}`;
      console.log(`🔊 [AUDIO] Fetching audio from: ${audioUrl}`);
      const response = await fetch(audioUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status}`);
      }
      const blob = await response.blob();
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64data = reader.result as string;
          resolve(base64data);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(blob);
      const base64data = await base64Promise;
      const {sound: newSound} = await Audio.Sound.createAsync(
        {uri: base64data},
        {shouldPlay: false},
      );
      setSound(newSound);
      await newSound.playAsync();
      console.log(`🔊 [AUDIO] Playing: ${filename}`);
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert(
        'Audio Error',
        `Failed to play audio: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  };

  const navigateToKanji = (kanjiUuid: string) => {
    navigation.navigate('Kanji', {
      screen: 'KanjiDetail',
      params: {
        kanjiUuid: kanjiUuid,
        character: '',
      },
    });
  };

  if (loading)
    return (
      <View style={[localStyles.centered, {paddingTop: insets.top}]}>
        <ActivityIndicator size="large" color={primaryGreen} />
      </View>
    );
  if (error || !data)
    return (
      <View style={[localStyles.centered, {paddingTop: insets.top}]}>
        <Text style={localStyles.errorText}>
          Error: {error || 'Data not found.'}
        </Text>
      </View>
    );

  const vocabData = data.details.data;
  const primaryReading = vocabData.readings.find(r => r.primary)?.reading || '';
  const primaryMeaning = vocabData.meanings.find(m => m.primary)?.meaning || '';
  const otherMainMeanings = vocabData.meanings.filter(m => !m.primary);
  const whitelistMeanings = vocabData.auxiliary_meanings.filter(
    m => m.type === 'whitelist',
  );
  const componentKanji = data.componentKanji || [];

  const renderMeaningTab = () => (
    <Card style={localStyles.tabContentCard}>
      <View style={localStyles.sectionHeader}>
        <Text style={localStyles.groupTitle}>Meaning</Text>
        <MnemonicTooltipButton
          icon="bulb-outline"
          mnemonicText={vocabData.meaning_mnemonic}
        />
      </View>

      <Text style={localStyles.primaryMeaning}>{primaryMeaning}</Text>

      {otherMainMeanings.length > 0 && (
        <>
          <Text
            style={[
              localStyles.groupTitle,
              {fontSize: 14, marginTop: spacing.small, marginBottom: spacing.small},
            ]}>
            Other Meanings
          </Text>
          <View
            style={[localStyles.tagContainer, {marginBottom: spacing.base}]}>
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
          count={whitelistMeanings.length}>
          <Text style={localStyles.auxiliaryInfoText}>
            These are synonyms or alternative meanings that are also accepted.
          </Text>

          <View style={[localStyles.tagContainer, {marginTop: spacing.base}]}>
            {whitelistMeanings.map(m => (
              <View
                key={m.meaning}
                style={[localStyles.tag, localStyles.auxiliaryTag]}>
                <Text style={localStyles.tagText}>{m.meaning}</Text>
              </View>
            ))}
          </View>
        </CollapsibleSection>
      )}

      <Text style={[localStyles.groupTitle, {marginTop: spacing.base}]}>
        Part of Speech
      </Text>
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
      {vocabData.context_sentences.length === 0 && (
        <Text style={localStyles.noItemsText}>
          No example sentences available.
        </Text>
      )}
    </Card>
  );

  const renderKanjiTab = () => (
    <>
      {componentKanji.length > 0 && (
        <Card style={localStyles.tabContentCard}>
          <Text style={localStyles.groupTitle}>Component Kanji</Text>
          <View style={localStyles.kanjiGrid}>
            {componentKanji.map(kanji => (
              <RelatedKanjiTile
                key={kanji.uuid}
                kanji={kanji}
                onPress={() => navigateToKanji(kanji.uuid)}
              />
            ))}
          </View>
        </Card>
      )}
      {componentKanji.length === 0 && (
        <Text style={localStyles.noItemsText}>
          This vocabulary word doesn't contain Kanji.
        </Text>
      )}
    </>
  );

  return (
    // GŁÓWNY WRAPPER Z PADDINGAMI
    <View style={[
      themeStyles.flex1, 
      {
        backgroundColor: colors.background,
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingRight: insets.right
      }
    ]}>
      
      {/* ZMIANA: Nagłówek wyciągnięty PRZED ScrollView */}
      <View style={localStyles.header}>
            <TouchableOpacity 
                onPress={() => navigation.goBack()} 
                style={localStyles.backButton}
                activeOpacity={0.7}
            >
                <Ionicons name="arrow-back" size={20} color={JP_THEME.ink} />
            </TouchableOpacity>
            
            <View style={localStyles.headerTitleContainer}>
                <HeaderTorii />
                <Text style={localStyles.headerTitle}>Vocabulary Details</Text>
                <Text style={localStyles.headerSubtitle}>{primaryMeaning}</Text>
            </View>

            <View style={{ width: 40 }} /> 
      </View>

      <ScrollView 
        contentContainerStyle={[
          localStyles.scrollContent, 
          { paddingBottom: insets.bottom + 20 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={localStyles.characterBox}>
          <Text style={localStyles.characterText}>{data.characters}</Text>
          <View style={localStyles.readingContainer}>
            <Text style={localStyles.readingText}>{primaryReading}</Text>
            <MnemonicTooltipButton
              icon="chatbubble-ellipses-outline"
              mnemonicText={vocabData.reading_mnemonic}
            />
          </View>
          <View style={localStyles.audioButtonsContainer}>
            <TouchableOpacity
              style={localStyles.audioButton}
              onPress={async () => {
                if (!data) return;
                const femaleAudio =
                  data.details.data.pronunciation_audios.find(
                    a => a.metadata.gender === 'female',
                  );
                if (femaleAudio) {
                  await playAudio(femaleAudio.local_filename);
                } else {
                  Alert.alert('Audio Not Found', 'No female audio file found.');
                }
              }}>
              <Ionicons
                name="volume-medium-outline"
                size={18}
                color={primaryGreen}
              />
              <Ionicons
                name="female-outline"
                size={18}
                color={accentBlue}
                style={{marginLeft: 4}}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={localStyles.audioButton}
              onPress={async () => {
                if (!data) return;
                const maleAudio = data.details.data.pronunciation_audios.find(
                  a => a.metadata.gender === 'male',
                );
                if (maleAudio) {
                  await playAudio(maleAudio.local_filename);
                } else {
                  Alert.alert('Audio Not Found', 'No male audio file found.');
                }
              }}>
              <Ionicons
                name="volume-medium-outline"
                size={18}
                color={primaryGreen}
              />
              <Ionicons
                name="male-outline"
                size={18}
                color={accentBlue}
                style={{marginLeft: 4}}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={localStyles.tabContainer}>
          <TabButton
            icon="book-outline"
            label="Meaning"
            isActive={activeTab === 'meaning'}
            onPress={() => setActiveTab('meaning')}
          />
          <TabButton
            icon="list-outline"
            label="Examples"
            isActive={activeTab === 'examples'}
            onPress={() => setActiveTab('examples')}
          />
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
    </View>
  );
};

const localStyles = StyleSheet.create({
  // STYLE HEADER - DOPASOWANE DO LISTY
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
    transform: [{ translateX: -80 }], 
    opacity: 0.5,
    // Brak zIndex: -1 aby było widoczne
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

  // POZOSTAŁE STYLE BEZ ZMIAN
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
  characterBox: {
    paddingTop: spacing.large * 1.5,
    paddingBottom: spacing.large,
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: spacing.large,
  },
  characterText: {
    fontSize: 60,
    fontWeight: '500',
    color: primaryGreen,
    marginBottom: spacing.small,
  },
  readingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.large,
  },
  readingText: {
    fontSize: 24,
    color: colors.textMuted,
    marginRight: spacing.small,
  },
  audioButtonsContainer: {flexDirection: 'row', gap: spacing.base},
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBackground,
    paddingVertical: spacing.small,
    paddingHorizontal: spacing.base,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
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

  scrollContent: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.base * 4,
    gap: spacing.base,
    paddingTop: 10, 
  },
  tabContentContainer: {
    gap: spacing.base,
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
  posTag: {backgroundColor: '#D1FAE5', borderColor: primaryGreen, borderWidth: 1},
  posTagText: {color: primaryGreen, fontWeight: '500'},
  mnemonicText: {fontSize: 14, color: colors.textMuted, lineHeight: 20},
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
    position: 'relative',
    justifyContent: 'center',
  },
  kanjiTileCharacter: {
    fontSize: 40,
    color: primaryGreen,
    marginBottom: 4,
  },
  kanjiTileText: {
    marginTop: 0,
    fontSize: 12,
    color: primaryGreen,
  },
  sentenceRow: {
    paddingVertical: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sentenceJa: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.small,
  },
  sentenceEn: {fontSize: 14, color: colors.textMuted, marginTop: spacing.base},
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
    ...themeStyles.gap8,
    alignSelf: 'flex-start',
    paddingVertical: 2,
  },
  toggleTranslation: {color: primaryGreen, fontSize: 12},
  mnemonicIconTouchable: {padding: 4},
  tooltipContent: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderRadius: 8,
    padding: spacing.base,
    maxWidth: '80%',
  },
  tooltipText: {color: 'white', fontSize: 14},
  tooltipArrow: {borderTopColor: 'rgba(0,0,0,0.85)'},
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
});

export default VocabularyDetailScreen;