import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTranslation } from 'react-i18next';
import { Toast } from 'toastify-react-native';
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, themeStyles } from '../../theme/styles';
import { Card } from '../ui/Card';
import { SettingItem } from './SettingItem';

type Language = 'pl' | 'en';

export const SettingsCard: React.FC = () => {
  const { t } = useTranslation();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [listeningLessonsEnabled, setListeningLessonsEnabled] = useState(true);
  const [notificationFrequency, setNotificationFrequency] = useState('daily');
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  const handleLanguageChange = (lang: Language) => {
    setCurrentLanguage(lang);
    Toast.success(t('profile.language_changed')); 
  };

  const frequencyOptions = [
    { value: 'none', label: t('frequency.none') },
    { value: 'daily', label: t('frequency.daily') },
    { value: 'every-other-day', label: t('frequency.everyOtherDay') },
    { value: 'three-times-week', label: t('frequency.threeTimesWeek') },
    { value: 'weekly', label: t('frequency.weekly') },
  ];

  const languageOptions = [
    { value: 'pl', label: `🇵🇱 ${t('common.pl')}` },
    { value: 'en', label: `🇬🇧 ${t('common.en')}` },
  ];

  return (
    <Card title={t('profile.settings_title')}>
      <SettingItem
        label={t('profile.push_notifications_label')}
        description={t('profile.push_notifications_desc')}
        value={notificationsEnabled}
        onValueChange={setNotificationsEnabled}
        isFirst={true}
      />
      <SettingItem
        label={t('profile.listening_lessons_label')}
        description={t('profile.listening_lessons_desc')}
        value={listeningLessonsEnabled}
        onValueChange={setListeningLessonsEnabled}
      />

      <View style={styles.separator} /> 

      {/* Picker częstotliwości */}
      <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>
              {t('profile.frequency_label')}
          </Text>
          <Text style={styles.pickerDescription}>
              {t('profile.frequency_desc')}
          </Text>
          <View style={styles.pickerWrapper}>
              <Picker
                  selectedValue={notificationFrequency}
                  onValueChange={(itemValue) => setNotificationFrequency(itemValue)}
                  style={styles.picker}
                  mode="dropdown"
              >
                  {frequencyOptions.map(option => (
                      <Picker.Item 
                          key={option.value} 
                          label={option.label} 
                          value={option.value} 
                          color={colors.text} 
                      />
                  ))}
              </Picker>
              <Ionicons name="chevron-down" size={20} color={colors.textMuted} style={styles.pickerIcon} />
          </View>
      </View>

      {/* Picker języka */}
      <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>
              {t('profile.current_language_label')}
          </Text>
          <Text style={styles.pickerDescription}>
              {t('profile.language_desc')}
          </Text>
          <View style={styles.pickerWrapper}>
              <Picker
                  selectedValue={currentLanguage}
                  onValueChange={(itemValue: Language) => handleLanguageChange(itemValue)}
                  style={styles.picker}
                  mode="dropdown"
              >
                  {languageOptions.map(option => (
                      <Picker.Item 
                          key={option.value} 
                          label={option.label} 
                          value={option.value} 
                          color={colors.text}
                      />
                  ))}
              </Picker>
              <Ionicons name="chevron-down" size={20} color={colors.textMuted} style={styles.pickerIcon} />
          </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.base,
  },
  pickerContainer: {
    paddingTop: spacing.small,
    marginBottom: spacing.small,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.small / 2,
  },
  pickerDescription: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.small,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
    height: 48,
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: colors.lightBackground,
  },
  picker: {
    width: '100%',
    color: colors.text,
    ...Platform.select({
      android: {
        backgroundColor: 'transparent',
      },
      ios: {
      }
    }),
  },
  pickerIcon: {
    position: 'absolute',
    right: 12,
    top: 14,
    display: Platform.OS === 'android' ? 'none' : 'flex',
  }
});