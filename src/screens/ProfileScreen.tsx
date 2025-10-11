import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Toast } from 'toastify-react-native'; 
import { useTranslation } from 'react-i18next';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/dashboard/StatCard';
import { ProfileHeader } from '../components/profile/ProfileHeader'
import { AchievementList } from '../components/profile/AchivmentList';
import { SettingItem } from '../components/profile/SettingItem';
import { StatsSummaryCard } from '../components/profile/StatsSummaryCard';
import { themeStyles, colors, spacing } from '../theme/styles';
import { mockUser, mockKanji, mockAchievements } from '../data/mockData';

interface ScreenProps {
    navigation: any;
    route: any;
}

const ProfileScreen: React.FC<ScreenProps> = () => {
  const { t } = useTranslation();
    
  const [notifications, setNotifications] = useState(true);
  const [practiceReminders, setPracticeReminders] = useState(true);
  
  const { learnedKanji, totalKanji } = useMemo(() => {
    const learnedKanji = mockKanji.filter(k => k.learned).length;
    const totalKanji = mockKanji.length;
    return { learnedKanji, totalKanji };
  }, []);

  const handleNotificationChange = (value: boolean) => {
    setNotifications(value);
    Toast.success(t('profile.notifications_saved'));
  };

  const handleRemindersChange = (value: boolean) => {
    setPracticeReminders(value);
    Toast.success(t('profile.reminders_updated'));
  };

  return (
    <ScrollView style={themeStyles.flex1} contentContainerStyle={styles.scrollContent}>
      <View style={themeStyles.paddingContainer}>
        
        <ProfileHeader user={mockUser} />

        <View style={styles.statsGrid}>
          <StatCard 
            iconName="flame" 
            iconSet="Ionicons" 
            iconColor={colors.warning} 
            value={mockUser.streak} 
            label={t('common.streak_label')}
          />

          <StatCard
            iconName="book-open"
            iconSet="Feather"
            iconColor={colors.secondary}
            value={learnedKanji}
            label={t('common.kanji_learned_label')}
          />
        </View>

        <AchievementList achievements={mockAchievements} />

        <StatsSummaryCard
          stats={[
            { iconSet: 'Feather', iconName: 'calendar', label: t('profile.joined'), value: 'January 2024' },
            { iconSet: 'Ionicons', iconName: 'trophy-outline', label: t('profile.best_rank'), value: '#2' },
            { iconSet: 'Feather', iconName: 'target', label: t('profile.accuracy'), value: '87%' },
            { iconSet: 'Ionicons', iconName: 'flame-outline', label: t('profile.best_streak'), value: '12 days' },
        ]}
        />

        <Card title={t('profile.notifications_card_title')}>
          <SettingItem
            label={t('profile.push_notifications_label')}
            description={t('profile.push_notifications_desc')}
            value={notifications}
            onValueChange={handleNotificationChange}
            isFirst={true}
          />
          <SettingItem
            label={t('profile.reminders_label')}
            description={t('profile.reminders_desc')}
            value={practiceReminders}
            onValueChange={handleRemindersChange}
          />
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: { backgroundColor: colors.background, minHeight: '100%' },

  statsGrid: { 
    ...themeStyles.flexRow, 
    ...themeStyles.gap16, 
    marginBottom: spacing.base, 
    justifyContent: 'space-between' 
  },
  statCard: {
    width: '48%', 
    padding: 12,
    marginBottom: 0,
    alignItems: 'center', 
  },
  quickStatContent: { alignItems: 'center', gap: 4 },
  quickStatValue: { fontSize: 24, fontWeight: '700', color: colors.text },
  quickStatLabel: { fontSize: 14, color: colors.textMuted },
  quickStatHint: { fontSize: 12, color: colors.textMuted, marginTop: 4 },

  statsSummaryGrid: { 
    ...themeStyles.flexRow, 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
    rowGap: 16,
    paddingTop: 8,
  },
  statSummaryItem: { 
    width: '45%', 
  },
  statSummaryRow: {
    ...themeStyles.flexRow,
    ...themeStyles.gap8,
    marginBottom: 4,
  },
  statSummaryValue: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 22, 
    color: colors.text,
  },

});

export default ProfileScreen;