import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, themeStyles } from '../theme/styles'; 
import { Card } from '../components/ui/Card';
import { Toast } from 'toastify-react-native';

type Language = 'pl' | 'en';

interface SettingsCardProps {
    currentLanguage: Language; 
    onLanguageChange: (lang: Language) => void;
}

const SettingRow: React.FC<{ 
    label: string, 
    description: string, 
    iconName: keyof typeof Ionicons.glyphMap,
    children: React.ReactNode 
}> = ({ label, description, iconName, children }) => (
    <View style={localStyles.settingRow}>
        <Ionicons name={iconName} size={24} color={colors.primary} style={localStyles.settingIcon} />
        <View style={localStyles.settingTextContainer}>
            <Text style={localStyles.settingLabel}>{label}</Text>
            <Text style={localStyles.settingDescription}>{description}</Text>
        </View>
        {children}
    </View>
);

const SettingsCard: React.FC<SettingsCardProps> = ({ currentLanguage, onLanguageChange }) => {
    const { t } = useTranslation();

    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [listeningLessonsEnabled, setListeningLessonsEnabled] = useState(true);
    const [notificationFrequency, setNotificationFrequency] = useState('daily');

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
        <View style={[themeStyles.flex1, themeStyles.paddingContainer]}>
            <Card title={`${t('profile.settings_title')}`}>
                <View>
                    <SettingRow
                        label={t('profile.push_notifications_label')}
                        description={t('profile.push_notifications_desc')}
                        iconName="notifications"
                    >
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={setNotificationsEnabled}
                            trackColor={{ false: colors.textMuted, true: colors.primary }}
                            thumbColor={'#f4f3f4'}
                        />
                    </SettingRow>

                    <SettingRow
                        label={t('profile.listening_lessons_label')}
                        description={t('profile.listening_lessons_desc')}
                        iconName="volume-medium"
                    >
                        <Switch
                            value={listeningLessonsEnabled}
                            onValueChange={setListeningLessonsEnabled}
                            trackColor={{ false: colors.textMuted, true: colors.primary }}
                            thumbColor={'#f4f3f4'}
                        />
                    </SettingRow>

                    <View style={localStyles.separator} />

                    <View style={localStyles.pickerContainer}>
                        <Text style={localStyles.pickerLabel}>
                            {t('profile.frequency_label')}
                        </Text>
                        <Text style={localStyles.pickerDescription}>
                            {t('profile.frequency_desc')}
                        </Text>
                        <View style={localStyles.pickerWrapper}>
                            <Picker
                                selectedValue={notificationFrequency}
                                onValueChange={(itemValue) => setNotificationFrequency(itemValue)}
                                style={localStyles.picker}
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
                            <Ionicons name="chevron-down" size={20} color={colors.textMuted} style={localStyles.pickerIcon} />
                        </View>
                    </View>

                    <View style={localStyles.pickerContainer}>
                        <Text style={localStyles.pickerLabel}>
                            {t('profile.current_language_label')}
                        </Text>
                        <Text style={localStyles.pickerDescription}>
                            {t('profile.language_desc')}
                        </Text>
                        <View style={localStyles.pickerWrapper}>
                            <Picker
                                selectedValue={currentLanguage}
                                onValueChange={(itemValue: Language) => onLanguageChange(itemValue)}
                                style={localStyles.picker}
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
                            <Ionicons name="chevron-down" size={20} color={colors.textMuted} style={localStyles.pickerIcon} />
                        </View>
                    </View>

                </View>
            </Card>
        </View>
    );
};


const localStyles = StyleSheet.create({
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.base,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightBackground,
    },
    settingIcon: {
        marginRight: spacing.small,
    },
    settingTextContainer: {
        flex: 1,
        marginRight: spacing.base,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.text,
    },
    settingDescription: {
        fontSize: 12,
        color: colors.textMuted,
        marginTop: 2,
    },
    separator: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: spacing.base,
    },
    pickerContainer: {
        marginBottom: spacing.base * 1.5,
    },
    pickerLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.text,
        marginBottom: spacing.small,
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
    },
    picker: {
        width: '100%',
        height: 60,
        color: colors.text,
    },
    pickerIcon: {
        position: 'absolute',
        right: 12,
        top: 14,
        display: Platform.OS === 'android' ? 'none' : 'flex',
    }
});

export default SettingsCard;
