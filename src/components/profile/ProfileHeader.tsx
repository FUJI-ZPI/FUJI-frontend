
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Badge } from '../ui/Badge';
import { themeStyles, colors, spacing } from '../../theme/styles';
import { User } from '../../context/UserContex';


interface ProfileHeaderProps {
  user: User | null;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {  
  return (
    <View style={[themeStyles.cardBase, styles.profileHeaderCard]}>
      <View style={styles.profileHeaderContent}>
        <View>
          <Image source={{ uri: user?.photo }} style={styles.avatar}/>
        </View>
        <View style={themeStyles.flex1}>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={styles.badgesRow}>
            <Badge variant="secondary">Level {5}</Badge>
            <Badge variant="secondary">Rank #{2}</Badge>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profileHeaderCard: {
    backgroundColor: colors.primary, 
    borderColor: colors.primary,
    shadowColor: colors.primary,
    color: '#fff',
    marginBottom: spacing.base,
  },
  profileHeaderContent: {
    ...themeStyles.flexRow,
    gap: spacing.base,
    marginBottom: spacing.base,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallback: {
    fontSize: 32,
    color: colors.primary,
    fontWeight: '700',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  userEmail: {
    opacity: 0.9,
    color: '#fff',
    fontSize: 14,
  },
  badgesRow: {
    ...themeStyles.flexRow,
    gap: 8,
    marginTop: 8,
  },
  xpSection: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ffffff20',
    gap: 8,
  },
  xpRow: {
    ...themeStyles.flexRow,
    ...themeStyles.justifyBetween,
    fontSize: 14,
  },
  xpText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  xpHint: {
    fontSize: 12,
    opacity: 0.75,
    textAlign: 'center',
    color: '#fff',
  },
});
