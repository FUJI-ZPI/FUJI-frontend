import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { themeStyles, colors } from '../../theme/styles';

interface SettingItemProps {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  isFirst?: boolean;
}

export const SettingItem: React.FC<SettingItemProps> = ({
  label,
  description,
  value,
  onValueChange,
  isFirst = false,
}) => {
  return (
    <View style={[styles.settingItem, !isFirst && styles.separator]}>
      <View style={themeStyles.flex1}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.textMuted + '50', true: colors.primary }}
        thumbColor={value ? '#fff' : '#fff'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  settingItem: {
    ...themeStyles.flexRow,
    ...themeStyles.justifyBetween,
    alignItems: 'center',
    paddingVertical: 10,
  },
  separator: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  settingDescription: {
    fontSize: 13,
    color: colors.textMuted,
  },
});