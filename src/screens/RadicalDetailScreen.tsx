import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View,} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Ionicons} from '@expo/vector-icons';
import {colors, spacing, themeStyles} from '../theme/styles';
import * as SecureStore from 'expo-secure-store';
import {Card} from '../components/ui/Card';
import {MnemonicTooltipButton} from '../components/ui/MnemonicTooltipButton';

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
  route: {params: {radicalUuid: string; character: string}};
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
  <TouchableOpacity onPress={onPress} style={localStyles.kanjiTile}>
    <Text style={localStyles.kanjiTileCharacter}>{character}</Text>
  </TouchableOpacity>
);

const RadicalDetailScreen: React.FC<ScreenProps> = ({navigation, route}) => {
  const {radicalUuid} = route.params;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<RadicalDetailsDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabName>('meaning');

  const fetchRadicalDetails = async (uuid: string) => {
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
      const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/v1/radical/${uuid}`;
      const res = await fetch(url, {headers});
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error(
            'Authorization error. Please try logging in again.',
          );
        }
        throw new Error(`Server error: ${res.status}`);
      }
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
    navigation.navigate(
        'Kanji',
        {
        screen: 'KanjiDetail',
        params: {
            kanjiUuid: kanjiUuid,
            character: '',
        },
        }
    );
    };

  if (loading) {
    return (
      <SafeAreaView
        style={[themeStyles.flex1, localStyles.centered]}>
        <ActivityIndicator size="large" color={primaryGreen} />
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView
        style={[themeStyles.flex1, localStyles.centered]}>
        <Text style={localStyles.errorText}>
          Error: {error || 'Data not found.'}
        </Text>
      </SafeAreaView>
    );
  }

  const radicalData = data.details.data;
  const primaryMeaning =
    radicalData.meanings.find(m => m.primary)?.meaning || '';
  const otherMainMeanings = radicalData.meanings.filter(m => !m.primary);
  const whitelistMeanings = radicalData.auxiliary_meanings.filter(
    m => m.type === 'whitelist',
  );

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
        <>
          <Text
            style={[
              localStyles.groupTitle,
              {
                fontSize: 14,
                marginTop: spacing.base,
                marginBottom: spacing.small,
              },
            ]}>
            Auxiliary Meanings
          </Text>
          <View style={localStyles.tagContainer}>
            {whitelistMeanings.map(m => (
              <View
                key={m.meaning}
                style={[
                  localStyles.tag,
                  localStyles.auxiliaryTag,
                ]}>
                <Text style={localStyles.tagText}>{m.meaning}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </Card>
  );

  const renderRelatedTab = () => (
    <>
      {relatedKanjis.length > 0 && (
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
      )}
    </>
  );

  return (
    <SafeAreaView
      style={[themeStyles.flex1, {backgroundColor: colors.background}]}
      edges={['bottom', 'left', 'right']}>
      <View style={[themeStyles.paddingContainer, themeStyles.flex1]}>
        <View style={localStyles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={localStyles.backButton}>
            <Ionicons
              name="arrow-back"
              size={20}
              color={colors.text}
            />
            <Text style={localStyles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <Text style={localStyles.title}>Radical Details</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: spacing.base * 2}}>
          <Card style={localStyles.characterCard}>
            <View style={localStyles.characterBox}>
              <Text style={localStyles.character}>{data.character}</Text>
            </View>
            <Text style={localStyles.characterSubtitle}>
              {primaryMeaning}
            </Text>
          </Card>

          <View style={localStyles.tabs}>
            <TabButton
              icon="book-outline"
              label="Meaning"
              isActive={activeTab === 'meaning'}
              onPress={() => setActiveTab('meaning')}
            />
            <TabButton
              icon="link-outline"
              label="Related"
              isActive={activeTab === 'related'}
              onPress={() => setActiveTab('related')}
            />
          </View>

          {activeTab === 'meaning' && renderMeaningTab()}
          {activeTab === 'related' && renderRelatedTab()}
        </ScrollView>
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
  },
  characterCard: {
    padding: spacing.large,
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  characterBox: {
    width: 140,
    height: 140,
    borderRadius: 12,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: accentBlue,
    marginBottom: spacing.base,
  },
  character: {
    fontSize: 80,
    fontWeight: '700',
    color: accentBlue,
  },
  characterSubtitle: {
    fontSize: 18,
    color: colors.textMuted,
    marginTop: spacing.small,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.base,
    gap: 6,
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: accentBlue,
  },
  tabLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: accentBlue,
    fontWeight: '600',
  },
  tabContentCard: {
    padding: spacing.large,
    marginBottom: spacing.base,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.small,
  },
  primaryMeaning: {
    fontSize: 24,
    fontWeight: '600',
    color: primaryGreen,
    marginBottom: spacing.base,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.small,
  },
  tag: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.small,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  primaryTag: {
    backgroundColor: primaryGreen + '20',
    borderColor: primaryGreen,
  },
  auxiliaryTag: {
    backgroundColor: accentBlue + '10',
    borderColor: accentBlue + '40',
  },
  tagText: {
    fontSize: 14,
    color: colors.text,
  },
  primaryTagText: {
    color: primaryGreen,
    fontWeight: '600',
  },
  kanjiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.small,
    marginTop: spacing.base,
  },
  kanjiTile: {
      width: '31.5%',
    height: 100,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    padding: spacing.small,
  },
  kanjiTileCharacter: {
    fontSize: 40,
    color: primaryGreen,
  },
  kanjiTileText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default RadicalDetailScreen;