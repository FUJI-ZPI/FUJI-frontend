import React, { useContext, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { StatCard } from '../components/dashboard/StatCard';
import { LevelSelector } from '../components/dashboard/LevelSelector';
import { ActionButtons } from '../components/dashboard/ActionButtons';
import { FujiIllustration } from '../components/dashboard/FujiIllustration';
import { UserContext } from '../context/UserContex';
import { themeStyles, colors } from '../theme/styles';
import { mockUser, mockKanji, totalKanjiCount } from '../data/mockData';
import { FlyingClouds } from '../components/dashboard/FlyingClouds';

interface ScreenProps {
  navigation: any;
  route: any;
}

const { width: screenWidth } = Dimensions.get('window');
const SVG_VIEWBOX_WIDTH = 320.0216;
const SVG_VIEWBOX_HEIGHT = 346.01524;
const ASPECT_RATIO = SVG_VIEWBOX_HEIGHT / SVG_VIEWBOX_WIDTH;
const FUJI_HEIGHT = screenWidth * ASPECT_RATIO;

export const DashboardScreen: React.FC<ScreenProps> = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { user } = useContext(UserContext)!;

  const { learnedKanji, totalKanji } = useMemo(() => {
    const learnedKanji = mockKanji.filter(k => k.learned).length;
    const totalKanji = totalKanjiCount;
    return { learnedKanji, totalKanji };
  }, []);

  const handleStartPractice = () => navigation.navigate('Practice');
  const handleNavigateToVocabulary = () => navigation.navigate('Vocabulary');

  return (
    <View style={{ flex: 1 }}>
      {/* 🌄 TŁO - gradient zawsze pod wszystkim */}
      <LinearGradient
        colors={[ '#ffd1ffb6', '#fad0c48a']}
        // colors={[ '#ffd1ffb6', '#fad0c48a']}
        // colors={['#A1C4FD', '#C2E9FB']}
        // colors={['#E0EAFC', '#CFDEF3']}
        // colors={['#a1c4fdbe', '#fad0c48a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.4 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* 📱 GŁÓWNA TREŚĆ */}
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} edges={['left', 'right']}>
        <ScrollView
          style={{ flex: 1, backgroundColor: 'transparent' }}
          contentContainerStyle={{ paddingBottom: 0, paddingTop: themeStyles.paddingContainer.padding }}
        >
          {/* Nagłówek */}
          <View style={[styles.header, themeStyles.paddingContainer]}>
            <Text style={styles.headerTitle}>
              {t('dashboard.greeting', { userName: user?.name })}
            </Text>
            <Text style={themeStyles.textSubtitle}>{t('dashboard.subtitle')}</Text>
          </View>

          {/* Statystyki */}
          <View style={[styles.statsGrid, themeStyles.paddingContainer]}>
            <StatCard
              iconName="flame"
              iconSet="Ionicons"
              iconColor={colors.warning}
              value={mockUser.streak}
              label={t('common.streak_label')}
            />
            <StatCard
              iconName="target"
              iconSet="Feather"
              iconColor={colors.secondary}
              value={mockUser.level}
              label={t('common.level_label')}
            />
          </View>

          <FlyingClouds />

          {/* Fuji */}
          <View style={styles.mountainContainer}>
            <View style={{ width: '100%', height: FUJI_HEIGHT }}>
              <FujiIllustration 
                    currentLevel={mockUser.level} 
                    maxLevel={60}
                  />
            </View>
          </View>

          {/* Sekcja trawy */}
          <View style={styles.grassSection}>
            <ActionButtons
              onStartPractice={handleStartPractice}
              onNavigateToVocabulary={handleNavigateToVocabulary}
            />
            
            <LevelSelector mockKanji={mockKanji} TOTAL_LEVELS={60} />
          </View>
        </ScrollView>
      </SafeAreaView>
      {/* Dolny pasek (inne tło dla bottom edge) */}
    <SafeAreaView
      style={{
        backgroundColor: '#698779', // np. kolor trawy
      }}
      edges={['bottom']}
    />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    textAlign: 'center',
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statsGrid: { 
    ...themeStyles.flexRow, 
    ...themeStyles.gap16, 
    marginBottom: themeStyles.paddingContainer.padding, 
    justifyContent: 'space-between' 
  },

  totalProgressCard: {
    marginBottom: themeStyles.paddingContainer.padding,
  },
    totalProgressSection: { 
    paddingVertical: 4, 
    gap: 8,
  }, 
  fontSemibold: { fontWeight: '600', color: colors.text },
  mountainContainer: {
    marginHorizontal: 0,
    backgroundColor: 'transparent',
  },
  grassSection: {
    backgroundColor: '#698779',
    paddingTop: 0,
    paddingHorizontal: themeStyles.paddingContainer.padding,
    paddingBottom: themeStyles.paddingContainer.padding,
    gap: themeStyles.paddingContainer.padding,
    marginTop: -themeStyles.paddingContainer.padding*2
  },
  gradient: {
        flex: 1,
        position: 'relative',
      },
});

export default DashboardScreen;
