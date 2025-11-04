import React, { useState, useMemo, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Platform } from 'react-native';
import { Toast } from 'toastify-react-native'; 
import { useTranslation } from 'react-i18next';
import { Card } from '../components/ui/Card';
import { ProfileHeader } from '../components/profile/ProfileHeader'
import { AchievementList } from '../components/profile/AchivmentList';
import { SettingItem } from '../components/profile/SettingItem';
import { StatsSummaryCard } from '../components/profile/StatsSummaryCard';
import { SettingsCard } from '../components/profile/SettingsCard';
import { themeStyles, colors, spacing } from '../theme/styles';
import { mockUser, mockKanji, mockAchievements } from '../data/mockData';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserContext } from '../context/UserContex';
import { Ionicons } from "@expo/vector-icons";

interface ScreenProps {
    navigation: any;
    route: any;
    onLogout: () => void;
}

const ProfileScreen: React.FC<ScreenProps> = ({ navigation, onLogout }: any) => {
  const { t } = useTranslation();
  const { user, setUser } = useContext(UserContext)!

  const handleLogoutPress = async () => {
    setUser(null);
    onLogout();
  };
    
  const { learnedKanji, totalKanji } = useMemo(() => {
    const learnedKanji = mockKanji.filter(k => k.learned).length;
    const totalKanji = mockKanji.length;
    return { learnedKanji, totalKanji };
  }, []);

  return (
    <SafeAreaView style={themeStyles.flex1} edges={['bottom', 'left', 'right']}>
      <ScrollView style={themeStyles.flex1} contentContainerStyle={styles.scrollContent}>
        <View style={themeStyles.paddingContainer}>
          
          {/* 1. Karta użytkownika */}
          <ProfileHeader user={user} />

          {/* 3. Statistics */}
          <StatsSummaryCard
            stats={[
              { iconSet: 'Feather', iconName: 'calendar', label: t('profile.joined'), value: 'January 2024' },
              { iconSet: 'Ionicons', iconName: 'trophy-outline', label: t('profile.best_rank'), value: '#2' },
              { iconSet: 'Feather', iconName: 'target', label: t('profile.accuracy'), value: '87%' },
              { iconSet: 'Ionicons', iconName: 'flame-outline', label: t('profile.best_streak'), value: '12 days' },
          ]}
          />

          {/* 4. Nowa Karta Ustawień (z ../components/profile/SettingsCard') */}
          <SettingsCard  />

          {/* 5. Achievements */}
          <AchievementList achievements={mockAchievements} />

          {/* 6. Przycisk wylogowania */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleLogoutPress}
            style={styles.logoutButtonContainer}
          >
            <Card>
              <View style={styles.logoutContent}>
                <Ionicons name="log-out-outline" size={22} color="#c0392b" />
                <Text style={styles.logoutText}>{t("drawer.logout")}</Text>
              </View>
            </Card>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContent: { backgroundColor: colors.background, minHeight: '100%', paddingBottom: spacing.base },

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
  logoutButtonContainer: {
    marginTop: spacing.base,
  },
  logoutContent: {
    ...themeStyles.flexRow,
    ...themeStyles.gap8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#c0392b',
    fontSize: 16,
    fontWeight: '500',
  },

});

export default ProfileScreen;