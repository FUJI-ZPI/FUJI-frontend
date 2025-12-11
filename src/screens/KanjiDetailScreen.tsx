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
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {colors, spacing, themeStyles} from '../theme/styles';
import * as SecureStore from 'expo-secure-store';
import {Card} from '../components/ui/Card';
import {MnemonicTooltipButton} from '../components/ui/MnemonicTooltipButton';

import Svg, {Path, Defs, LinearGradient as SvgLinearGradient, Stop, Rect} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

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
  type: 'onyomi' | 'kunyomi' | 'nanori' | string;
  primary: boolean;
  reading: string;
}
interface AuxiliaryMeaning {
  type: string;
  meaning: string;
}
interface KanjiData {
  slug: string;
  level: number;
  meanings: Meaning[];
  auxiliary_meanings: AuxiliaryMeaning[];
  readings: Reading[];
  characters: string;
  document_url: string;
  meaning_mnemonic: string;
  reading_mnemonic: string;
  meaning_hint?: string;
  reading_hint?: string;
  component_subject_ids: number[];
  amalgamation_subject_ids: number[];
  visually_similar_subject_ids: number[];
}

interface RadicalDto {
  uuid: string;
  character: string;
}
interface KanjiDto {
  uuid: string;
  character: string;
}
interface VocabularyDto {
  uuid: string;
  characters: string;
}

interface KanjiDetailsDto {
  uuid: string;
  level: number;
  character: string;
  unicodeCharacter: string | null;
  details: {
    id: number;
    object: string;
    url: string;
    data: KanjiData;
  };
  svgPath: string[];
  componentRadicals: RadicalDto[];
  relatedVocabulary: VocabularyDto[];
  visuallySimilarKanji: KanjiDto[];
}

type TabName = 'meaning' | 'info' | 'related';
interface ScreenProps {
  navigation: any;
  route: {params: {kanjiUuid: string; character: string}};
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
    style={[
      localStyles.tabButton,
      isActive && {backgroundColor: '#D1FAE5'},
    ]}
    onPress={onPress}>
    <Ionicons
      name={icon}
      size={18}
      color={isActive ? primaryGreen : colors.textMuted}
    />
    <Text
      style={[
        localStyles.tabLabel,
        isActive && localStyles.tabLabelActive,
      ]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const RelatedSubjectTile: React.FC<{
  character: string;
  onPress: () => void;
}> = ({character, onPress}) => (
<TouchableOpacity
    onPress={onPress}
    style={localStyles.kanjiTile}>
    <Text
      style={localStyles.kanjiTileCharacter}
      numberOfLines={1}
      adjustsFontSizeToFit>
      {character}
    </Text>
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

const ReadingGroup: React.FC<{title: string; readings: Reading[]}> = ({
  title,
  readings,
}) => {
  if (readings.length === 0) return null;
  return (
    <View style={localStyles.readingGroupContainer}>
      <Text style={localStyles.groupTitle}>{title}</Text>
      <View style={localStyles.tagContainer}>
        {readings.map(r => (
          <View
            key={r.reading}
            style={[localStyles.tag, r.primary && localStyles.primaryTag]}>
            <Text
              style={[
                localStyles.tagText,
                r.primary && localStyles.primaryTagText,
              ]}>
              {r.reading}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const AnimatedStroke: React.FC<{
  d: string;
  index: number;
  isActive: boolean;
  color: string;
}> = ({d, index, isActive, color}) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    const strokeDuration = 200;
    const strokeDelay = 150;
    const startDelay = 300;

    if (isActive) {
      opacity.value = withDelay(
        startDelay + index * strokeDelay,
        withTiming(1, {duration: strokeDuration, easing: Easing.ease}),
      );
    } else {
      opacity.value = 0;
    }
  }, [isActive, d, index]);

  const animatedProps = useAnimatedProps(() => {
    return {opacity: opacity.value};
  });

  return (
    <AnimatedPath
      d={d}
      stroke={color}
      strokeWidth={5}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      animatedProps={animatedProps}
    />
  );
};

interface AnimatedKanjiProps {
  size: number;
  color: string;
  isActive: boolean;
  paths: string[];
  viewBox?: string;
}

const AnimatedKanji: React.FC<AnimatedKanjiProps> = ({
  size,
  color,
  isActive,
  paths,
  viewBox = '0 0 109 109',
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox={viewBox}
      style={localStyles.svgKanji}>
      {paths.map((d, index) => (
        <AnimatedStroke
          key={index}
          d={d}
          index={index}
          isActive={isActive}
          color={color}
        />
      ))}
    </Svg>
  );
};

const KanjiDetailScreen: React.FC<ScreenProps> = ({navigation, route}) => {
  const {kanjiUuid} = route.params;
  
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<KanjiDetailsDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabName>('meaning');
  const [kanjiDisplayMode, setKanjiDisplayMode] = useState<
    'character' | 'animation'
  >('character');

  const fetchKanjiDetails = async (uuid: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (!token) {
        throw new Error(
          'Authentication token not found. Please log in again.',
        );
      }
      const headers = {Authorization: `Bearer ${token}`};
      const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/v1/kanji/${uuid}`;
      const res = await fetch(url, {headers});
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error(
            'Authorization error. Please try logging in again.',
          );
        }
        throw new Error(`Server error: ${res.status}`);
      }
      const jsonData: KanjiDetailsDto = await res.json();
      setData(jsonData);
    } catch (e: any) {
      setError(e.message || 'Unknown error.');
      Alert.alert('Error', e.message || 'Could not fetch data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKanjiDetails(kanjiUuid);
  }, [kanjiUuid]);

  const navigateToRadical = (radicalUuid: string) => {
    navigation.navigate('Radicals', { 
      screen: 'RadicalDetail',
      params: {
        radicalUuid: radicalUuid,
        character: '', 
      },
    });
  };

  const navigateToKanji = (uuid: string) => {
    navigation.push('KanjiDetail', {
      kanjiUuid: uuid,
      character: '',
    });
  };

  const navigateToVocabulary = (vocabularyUuid: string) => {
    navigation.navigate('Vocabulary', { 
      screen: 'VocabularyDetail',
      params: {
        vocabularyUuid: vocabularyUuid,
        character: '', 
      },
    });
  };

  if (loading) {
    return (
      <View style={[localStyles.centered, {paddingTop: insets.top}]}>
        <ActivityIndicator size="large" color={primaryGreen} />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={[localStyles.centered, {paddingTop: insets.top}]}>
        <Text style={localStyles.errorText}>
          Error: {error || 'Data not found.'}
        </Text>
      </View>
    );
  }

  const kanjiData = data.details.data;
  const primaryReading =
    kanjiData.readings.find(r => r.primary)?.reading ||
    kanjiData.readings[0]?.reading ||
    '';
  const primaryMeaning =
    kanjiData.meanings.find(m => m.primary)?.meaning || '';
  const otherMainMeanings = kanjiData.meanings.filter(m => !m.primary);
  const whitelistMeanings = kanjiData.auxiliary_meanings.filter(
    m => m.type === 'whitelist',
  );
  const onyomiReadings = kanjiData.readings.filter(r => r.type === 'onyomi');
  const kunyomiReadings = kanjiData.readings.filter(r => r.type === 'kunyomi');
  const nanoriReadings = kanjiData.readings.filter(r => r.type === 'nanori');

  const componentRadicals = data.componentRadicals || [];
  const relatedVocabulary = data.relatedVocabulary || [];
  const visuallySimilarKanji = data.visuallySimilarKanji || [];

  const renderMeaningTab = () => (
    <Card style={localStyles.tabContentCard}>
      <View style={localStyles.sectionHeader}>
        <Text style={localStyles.groupTitle}>Meaning</Text>
        <MnemonicTooltipButton
          icon="bulb-outline"
          mnemonicText={kanjiData.meaning_mnemonic}
        />
      </View>
      <Text style={localStyles.primaryMeaning}>{primaryMeaning}</Text>
      {otherMainMeanings.length > 0 && (
        <>
          <Text
            style={[
              localStyles.groupTitle,
              {
                fontSize: 14,
                marginTop: spacing.small,
                marginBottom: spacing.small,
              },
            ]}>
            Other Meanings
          </Text>
          <View
            style={[
              localStyles.tagContainer,
              {marginBottom: spacing.base},
            ]}>
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
          <View
            style={[localStyles.tagContainer, {marginTop: spacing.base}]}>
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
      {kanjiData.meaning_hint && (
        <View style={localStyles.hintContainer}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={accentBlue}
          />
          <Text style={localStyles.hintText}>
            {kanjiData.meaning_hint.replace(/<.*?>/g, '')}
          </Text>
        </View>
      )}
    </Card>
  );

  const renderReadingTab = () => (
    <Card style={localStyles.tabContentCard}>
      <View style={localStyles.sectionHeader}>
        <Text style={localStyles.groupTitle}>Reading</Text>
      </View>
      <ReadingGroup title="On'yomi" readings={onyomiReadings} />
      <ReadingGroup title="Kun'yomi" readings={kunyomiReadings} />
      <ReadingGroup title="Nanori" readings={nanoriReadings} />
      {kanjiData.reading_hint && (
        <View
          style={[localStyles.hintContainer, {marginTop: spacing.base}]}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={accentBlue}
          />
          <Text style={localStyles.hintText}>
            {kanjiData.reading_hint.replace(/<.*?>/g, '')}
          </Text>
        </View>
      )}
    </Card>
  );

  const renderRelatedTab = () => (
    <>
      {componentRadicals.length > 0 && (
        <Card style={localStyles.tabContentCard}>
          <Text style={localStyles.groupTitle}>Component Radicals</Text>
          <View style={localStyles.kanjiGrid}>
            {componentRadicals.map(radical => (
              <RelatedSubjectTile
                key={radical.uuid}
                character={radical.character}
                onPress={() => navigateToRadical(radical.uuid)}
              />
            ))}
          </View>
        </Card>
      )}
      {visuallySimilarKanji.length > 0 && (
        <Card style={localStyles.tabContentCard}>
          <Text style={localStyles.groupTitle}>Visually Similar Kanji</Text>
          <View style={localStyles.kanjiGrid}>
            {visuallySimilarKanji.map(kanji => (
              <RelatedSubjectTile
                key={kanji.uuid}
                character={kanji.character}
                onPress={() => navigateToKanji(kanji.uuid)}
              />
            ))}
          </View>
        </Card>
      )}
      {relatedVocabulary.length > 0 && (
        <Card style={localStyles.tabContentCard}>
          <Text style={localStyles.groupTitle}>Used in Vocabulary</Text>
          <View style={localStyles.kanjiGrid}>
            {relatedVocabulary.map(vocab => (
              <RelatedSubjectTile
                key={vocab.uuid}
                character={vocab.characters}
                onPress={() => navigateToVocabulary(vocab.uuid)}
              />
            ))}
          </View>
        </Card>
      )}
      {componentRadicals.length === 0 &&
        relatedVocabulary.length === 0 &&
        visuallySimilarKanji.length === 0 && (
          <Text style={localStyles.noItemsText}>
            No related items found.
          </Text>
        )}
    </>
  );

  return (
    <View
      style={[
        themeStyles.flex1, 
        {
            backgroundColor: colors.background,
            paddingTop: insets.top,
            paddingLeft: insets.left,
            paddingRight: insets.right
        }
    ]}>
      
      <View style={localStyles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={localStyles.backButton}>
            <Ionicons name="arrow-back" size={20} color={JP_THEME.ink} />
          </TouchableOpacity>
          
          <View style={localStyles.headerTitleContainer}>
                <HeaderTorii />
                <Text style={localStyles.headerTitle}>Kanji Details</Text>
                <Text style={localStyles.headerSubtitle}>{primaryMeaning}</Text>
          </View>

          <View style={{width: 40}} />
      </View>

      <ScrollView contentContainerStyle={[
          localStyles.scrollContent, 
          { paddingBottom: insets.bottom + 20 }
        ]}>
        
        <View style={localStyles.characterBox}>
          <View style={localStyles.displayModeToggle}>
            <TouchableOpacity
              style={[
                localStyles.toggleButton,
                kanjiDisplayMode === 'character' &&
                  localStyles.toggleButtonActive,
              ]}
              onPress={() => setKanjiDisplayMode('character')}>
              <Ionicons
                name="language-outline"
                size={18}
                color={
                  kanjiDisplayMode === 'character'
                    ? accentBlue
                    : colors.textMuted
                }
              />
              <Text
                style={[
                  localStyles.toggleLabel,
                  kanjiDisplayMode === 'character' &&
                    localStyles.toggleLabelActive,
                ]}>
                Character
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                localStyles.toggleButton,
                kanjiDisplayMode === 'animation' &&
                  localStyles.toggleButtonActive,
              ]}
              onPress={() => setKanjiDisplayMode('animation')}>
              <Ionicons
                name="play-outline"
                size={18}
                color={
                  kanjiDisplayMode === 'animation'
                    ? accentBlue
                    : colors.textMuted
                }
              />
              <Text
                style={[
                  localStyles.toggleLabel,
                  kanjiDisplayMode === 'animation' &&
                    localStyles.toggleLabelActive,
                ]}>
                Animation
              </Text>
            </TouchableOpacity>
          </View>

          <View style={localStyles.kanjiDisplayArea}>
            {kanjiDisplayMode === 'character' && (
              <Text style={localStyles.characterText}>
                {data.character}
              </Text>
            )}
            {kanjiDisplayMode === 'animation' && (
              <AnimatedKanji
                size={90}
                color={primaryGreen}
                isActive={kanjiDisplayMode === 'animation'}
                paths={data.svgPath}
              />
            )}
          </View>

          <View style={localStyles.readingContainer}>
            <Text style={localStyles.readingText}>{primaryReading}</Text>
            <MnemonicTooltipButton
              icon="chatbubble-ellipses-outline"
              mnemonicText={kanjiData.reading_mnemonic}
            />
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
            icon="chatbubbles-outline"
            label="Reading"
            isActive={activeTab === 'info'}
            onPress={() => setActiveTab('info')}
          />
          <TabButton
            icon="git-network-outline"
            label="Related"
            isActive={activeTab === 'related'}
            onPress={() => setActiveTab('related')}
          />
        </View>

        <View style={localStyles.tabContentContainer}>
          {activeTab === 'meaning' && renderMeaningTab()}
          {activeTab === 'info' && renderReadingTab()}
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
    // POPRAWKA: Usunięto zIndex: -1, teraz brama będzie widoczna
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
    paddingBottom: spacing.large,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: spacing.large,
    paddingTop: spacing.base,
  },
  displayModeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.lightBackground,
    borderRadius: 8,
    padding: 4,
    marginBottom: spacing.base,
    width: '100%',
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#E0F2FE',
  },
  toggleLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  toggleLabelActive: {
    color: accentBlue,
    fontWeight: '600',
  },
  kanjiDisplayArea: {
    width: '100%',
    height: 125,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: spacing.small,
  },
  characterText: {
    fontSize: 90,
    fontWeight: '400',
    color: primaryGreen,
  },
  svgKanji: {
    position: 'absolute',
  },
  readingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readingText: {
    fontSize: 24,
    color: colors.textMuted,
    marginRight: spacing.small,
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
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.small,
  },
  tag: {
    backgroundColor: colors.lightBackground,
    borderRadius: 8,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.small,
  },
  tagText: {color: colors.textMuted, fontSize: 14},
  posTag: {
    backgroundColor: '#D1FAE5',
    borderColor: primaryGreen,
    borderWidth: 1,
  },
  posTagText: {color: primaryGreen, fontWeight: '500'},
  readingGroupContainer: {
    marginBottom: spacing.base,
  },
  primaryTag: {
    backgroundColor: '#E0F2FE',
    borderColor: accentBlue,
    borderWidth: 1,
  },
  primaryTagText: {
    color: accentBlue,
    fontWeight: '600',
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.small,
    backgroundColor: '#EFF6FF',
    padding: spacing.base,
    borderRadius: 8,
    marginTop: spacing.base,
  },
  hintText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
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

export default KanjiDetailScreen;