import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import Svg, {Defs, LinearGradient as SvgLinearGradient, Path, Rect, Stop} from "react-native-svg";
import {User} from '../../utils/user';

const JP_THEME = {
    ink: '#1F2937',
    primary: '#4673aa',
    accent: '#f74f73',
    paperWhite: '#FFFFFF',
    sand: '#E5E0D6',
    textMuted: '#64748b',
};

const ToriiGateIllustration = () => (
    <View style={styles.toriiContainer} pointerEvents="none">
        <Svg width="300" height="150" viewBox="0 0 300 150" style={{opacity: 0.9}}>
            <Defs>
                <SvgLinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor={JP_THEME.accent} stopOpacity="1"/>
                    <Stop offset="1" stopColor="#c23b22" stopOpacity="1"/>
                </SvgLinearGradient>
            </Defs>
            <Path
                d="M 40 40 Q 150 20 260 40 L 265 55 Q 150 35 35 55 Z"
                fill="url(#grad)"
            />
            <Rect x="55" y="65" width="190" height="12" rx="2" fill="#d64541"/>

            <Rect x="75" y="55" width="14" height="145" rx="2" fill="#c0392b"/>
            <Rect x="211" y="55" width="14" height="145" rx="2" fill="#c0392b"/>

            <Rect x="55" y="90" width="190" height="10" rx="2" fill="#d64541"/>
        </Svg>
    </View>
);

interface ProfileHeaderProps {
    user: User | null;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({user}) => {
    return (
        <View style={styles.container}>

            <ToriiGateIllustration/>

            <View style={styles.contentColumn}>
                <View style={styles.avatarWrapper}>
                    <View style={styles.avatarBorder}>
                        {user?.photo ? (
                            <Image source={{uri: user?.photo}} style={styles.avatar}/>
                        ) : (
                            <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                <Text style={styles.avatarFallbackText}>
                                    {user?.name?.charAt(0).toUpperCase() || '?'}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.infoContainer}>
                    <Text style={styles.userName} numberOfLines={1}>
                        {user?.name || "Guest User"}
                    </Text>
                    <Text style={styles.userEmail} numberOfLines={1}>
                        {user?.email || "Traveller"}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 20,
        paddingBottom: 10,
        marginBottom: 10,
    },
    toriiContainer: {
        position: 'absolute',
        top: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: -1,
    },
    contentColumn: {
        alignItems: 'center',
        marginTop: 80,
    },
    avatarWrapper: {
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 8,
    },
    avatarBorder: {
        padding: 4,
        backgroundColor: '#fff',
        borderRadius: 60,
    },
    avatar: {
        width: 84,
        height: 84,
        borderRadius: 42,
        backgroundColor: '#f8f9fa',
    },
    avatarPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: JP_THEME.primary,
    },
    avatarFallbackText: {
        fontSize: 32,
        color: '#fff',
        fontWeight: '700',
    },
    infoContainer: {
        alignItems: 'center',
    },
    userName: {
        fontSize: 24,
        fontWeight: '800',
        color: JP_THEME.ink,
        marginBottom: 2,
        textAlign: 'center',
    },
    userEmail: {
        fontSize: 14,
        color: JP_THEME.textMuted,
        fontWeight: '500',
        marginBottom: 8,
    },
    levelBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        backgroundColor: 'rgba(255,255,255,0.6)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    levelText: {
        fontSize: 12,
        fontWeight: '600',
        color: JP_THEME.primary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});