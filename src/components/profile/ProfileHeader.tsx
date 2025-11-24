import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { themeStyles, colors, spacing } from '../../theme/styles';
import { User } from '../../utils/user';

interface ProfileHeaderProps {
  user: User | null;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {  
  return (
    <View style={styles.container}>
      <View style={styles.contentRow}>
        <View style={styles.avatarContainer}>
           {user?.photo ? (
              <Image source={{ uri: user?.photo }} style={styles.avatar}/>
           ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarFallbackText}>
                    {user?.name?.charAt(0).toUpperCase() || '?'}
                  </Text>
              </View>
           )}
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.userName} numberOfLines={1}>
            {user?.name || "Guest User"}
          </Text>
          <Text style={styles.userEmail} numberOfLines={1}>
            {user?.email || "Sign in to sync progress"}
          </Text>
          {/* Opcjonalnie: Tutaj można dodać mały badge np. "Pro Member" */}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    // Spójny cień z resztą aplikacji (ContributionGraph)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    // Opcjonalnie: delikatna ramka jak w activity
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    // Cień pod samym awatarem dla efektu głębi
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary || '#3498db',
  },
  avatarFallbackText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '700',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text || '#1F2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textMuted || '#6B7280',
    fontWeight: '500',
  },
});