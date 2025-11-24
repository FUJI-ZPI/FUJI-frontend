import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { FujiIllustration } from '../components/dashboard/FujiIllustration';
import { themeStyles, colors } from '../theme/styles';
import { mockUser, mockKanji, totalKanjiCount } from '../data/mockData';
import { FlyingClouds } from '../components/dashboard/FlyingClouds';
import { Feather } from '@expo/vector-icons';
import { CloudStatCard } from '../components/dashboard/CloudStatCard';
import { loadUser } from '../utils/user';
import { User } from '../utils/user';

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
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function init() {
      const u = await loadUser();
      if (u) {
        setUser(u);
      }
    }
    init();
  }, []);

  const { learnedKanji, totalKanji } = useMemo(() => {
    const learnedKanji = mockKanji.filter(k => k.learned).length;
    const totalKanji = totalKanjiCount;
    return { learnedKanji, totalKanji };
  }, []);

  const handleReviewSession = () => navigation.navigate('ReviewSession');
  const handleLearningSession = () => navigation.navigate('LearningSession');

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#ffd1ffb6', '#fad0c48a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.4 }}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.mainContainer} edges={['left', 'right']}>

        <View style={styles.absoluteStatsContainer} pointerEvents="none">
          <View style={{ position: 'absolute', top: 160, right: -55 }}>
            <CloudStatCard
              cloudType={2}
              iconName="flame"
              iconSet="Ionicons"
              iconColor={colors.warning}
              value={mockUser.streak}
              label={t('common.streak_label')}

              contentStyle={{ paddingRight: 72, paddingTop: 5 }}
            />
          </View>
          <View style={{ position: 'absolute', top: 175, left: 0 }} pointerEvents="none">
            <CloudStatCard
              cloudType={1}
              iconName="book-open"
              iconSet="Feather"
              iconColor={colors.secondary}
              value={learnedKanji}
              label={t('common.kanji_learned_label')}

              contentStyle={{ paddingRight: 72, paddingTop: 20 }}
            />
          </View>
        </View>

        <View>
          <View style={[styles.header, themeStyles.paddingContainer]}>
            <Text style={styles.headerTitle}>
              {t('dashboard.greeting', { userName: user?.name?.split(' ')[0]})}
            </Text>
            <Text style={themeStyles.textSubtitle}>{t('dashboard.subtitle')}</Text>
          </View>
        </View>

        <FlyingClouds />

        <View>
          <View style={styles.mountainContainer}>
            <View style={{ width: '100%', height: FUJI_HEIGHT }} pointerEvents='auto'>
              <FujiIllustration
                currentLevel={mockUser.level}
                maxLevel={60}
              />
            </View>
          </View>

          <View style={styles.grassSection}>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.buttonBase, styles.buttonSecondary]} onPress={handleLearningSession}>
                <View style={styles.buttonContentWrapper}>
                  <Text style={styles.buttonTextSecondary}>Learning Session</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.buttonBase, styles.buttonPrimary]} onPress={handleReviewSession}>
                <View style={styles.buttonContentWrapper}>
                  <Text style={styles.buttonTextPrimary}>Review Session</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
      <SafeAreaView
        style={{
          backgroundColor: '#698779',
        }}
        edges={['bottom']}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  absoluteStatsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 7,
    pointerEvents: "box-none"
  },
  header: {
    textAlign: 'center',
    paddingVertical: 16,
    marginTop: themeStyles.paddingContainer.padding * 2,
    alignItems: 'center',
    backgroundColor: 'transparent',
    zIndex: 40
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 5,
    zIndex: 40
  },
  statsGrid: {
    marginTop: 40,
    ...themeStyles.flexRow,
    ...themeStyles.gap16,
    marginBottom: themeStyles.paddingContainer.padding,
    justifyContent: 'space-between',
  },
  totalProgressCard: {
    marginBottom: themeStyles.paddingContainer.padding,
  },
  totalProgressSection: {
    paddingVertical: 4,
    gap: 8,
  },
  fontSemibold: {
    fontWeight: '600',
    color: colors.text
  },
  mountainContainer: {
    marginHorizontal: 0,
    backgroundColor: 'transparent',
    zIndex: 3
  },
  grassSection: {
    backgroundColor: '#698779',
    paddingTop: themeStyles.paddingContainer.padding,
    paddingHorizontal: themeStyles.paddingContainer.padding,
    paddingBottom: themeStyles.paddingContainer.padding * 1.5,
    marginTop: -themeStyles.paddingContainer.padding * 2,
    zIndex: 40
  },
  gradient: {
    flex: 1,
    position: 'relative',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: themeStyles.paddingContainer.padding,
  },
  buttonBase: {
    flex: 1,
    paddingVertical: 14,
    paddingLeft: themeStyles.paddingContainer.padding,
    paddingRight: themeStyles.paddingContainer.padding - 5,
    borderRadius: 26,
    elevation: 6,
  },
  buttonContentWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#4673aa',

  },
  buttonSecondary: {
    backgroundColor: '#ffffff',
  },
  buttonTextPrimary: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
    flex: 1,
    textAlign: 'center',
  },
  buttonTextSecondary: {
    color: 'black',
    fontWeight: '800',
    fontSize: 18,
    flex: 1,
    textAlign: 'center',
  },
  kanjiIconText: {
    color: 'black',
    fontWeight: '600',
    fontSize: 27,
    transform: [{ translateY: -5 }]
  },
  iconCircle: {
    width: 35,
    height: 35,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  iconCirclePrimary: {
    backgroundColor: "#f74f73",
  },
  iconCircleSecondary: {
    backgroundColor: '#FFFFFF',
  },
});

export default DashboardScreen;
