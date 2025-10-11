import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { StatCard } from '../components/dashboard/StatCard';
import { LevelSelector } from '../components/dashboard/LevelSelector';
import { ActionButtons } from '../components/dashboard/ActionButtons';
import { themeStyles, colors } from '../theme/styles';
import { mockUser, mockKanji, totalKanjiCount } from '../data/mockData';
import { useTranslation } from 'react-i18next'; 

interface ScreenProps {
    navigation: any;
    route: any;
}

export const DashboardScreen: React.FC<ScreenProps> = ({ navigation }) => {

  const { t } = useTranslation();
  
  const { learnedKanji, totalKanji } = useMemo(() => {
    const learnedKanji = mockKanji.filter(k => k.learned).length;
    const totalKanji = totalKanjiCount;
    return { learnedKanji, totalKanji };
  }, []);

  const handleStartPractice = () => {
    navigation.navigate('Practice'); 
  }

  const handleNavigateToVocabulary = () => {
    navigation.navigate('Vocabulary');
  }

  return (
    <View style={themeStyles.flex1}>
      <ScrollView style={themeStyles.flex1} contentContainerStyle={themeStyles.scrollContent}> 
        <View style={themeStyles.paddingContainer}>
          
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {t('dashboard.greeting', { userName: mockUser.name })}
            </Text>
            <Text style={themeStyles.textSubtitle}>{t('dashboard.subtitle')}</Text>
          </View>

          <View style={styles.statsGrid}>
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

          <LevelSelector 
            mockKanji={mockKanji} 
            TOTAL_LEVELS={60} 
          />
          
          <ActionButtons 
            onStartPractice={handleStartPractice} 
            onNavigateToVocabulary={handleNavigateToVocabulary}
          />

        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { textAlign: 'center', paddingVertical: 16, alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 4 },
  
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
});

export default DashboardScreen;
