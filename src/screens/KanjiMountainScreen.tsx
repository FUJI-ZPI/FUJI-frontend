import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Line, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { useTranslation } from 'react-i18next';

// Zaimportuj style i kolory, których używaliśmy wcześniej
import { themeStyles, colors, spacing } from '../theme/styles';

// --- Symulacja komponentów UI ---
// W React Native nie używamy klas Tailwind, więc musimy zastąpić je własnymi komponentami/stylami

// Card - prosty komponent opakowujący View
const Card: React.FC<any> = ({ children, style, ...props }) => (
    <View style={[localStyles.card, style]} {...props}>
        {children}
    </View>
);

// Badge - prosty komponent tekstowy
const Badge: React.FC<any> = ({ children, style }) => (
    <View style={[localStyles.badge, style]}>
        <Text style={localStyles.badgeText}>{children}</Text>
    </View>
);

// Button - używamy TouchableOpacity
const Button: React.FC<any> = ({ children, onPress, style }) => (
    <TouchableOpacity onPress={onPress} style={[style]}>
        {children}
    </TouchableOpacity>
);

// Progress Bar
const Progress: React.FC<{ value: number, style?: any }> = ({ value, style }) => (
    <View style={[localStyles.progressBarContainer, style]}>
        <View style={[localStyles.progressBar, { width: `${value}%` }]} />
    </View>
);

// Avatar (uproszczona)
const Avatar: React.FC<any> = ({ children, style }) => (
    <View>
        {children}
    </View>
);

// Ikonki (zastępujemy Lucide-react przez Ionicons lub prosty Text/View)
const MountainIcon = ({ style }: any) => <Ionicons name="cloudy-outline" size={24} style={style} />;
const LockIcon = ({ style }: any) => <Ionicons name="lock-closed-outline" size={18} style={style} />;
const CheckIcon = ({ style }: any) => <Ionicons name="checkmark" size={12} style={style} />;
const StarIcon = ({ style }: any) => <Ionicons name="star-outline" size={20} style={style} />;
const TargetIcon = ({ style }: any) => <Ionicons name="star-outline" size={20} style={style} />;
const CrownIcon = ({ style }: any) => <Ionicons name="key-outline" size={20} style={style} />;
const ZapIcon = ({ style }: any) => <Ionicons name="flash-outline" size={20} style={style} />;


// Generowanie poziomów (logika pozostaje ta sama)
const generateLevels = () => {
    const generatedLevels = [];
    
    for (let i = 1; i <= 60; i++) {
        // Uproszczona logika dla celu w RN
        const baseKanji = 50 + (i * 10);
        const completed = i <= 12 ? Math.floor(Math.random() * baseKanji) : (i === 13 ? Math.floor(baseKanji * 0.3) : 0);
        const unlocked = i <= 13;
        
        generatedLevels.push({
            id: i,
            name: `Poziom ${i}`,
            kanjiCount: baseKanji,
            completed: completed,
            unlocked: unlocked,
            position: i,
        });
    }
    
    return generatedLevels;
};

const { height: screenHeight } = Dimensions.get('window');
const MOUNTAIN_HEIGHT_PX = 700;

interface KanjiMountainPageProps {
    navigation: any;
}

const KanjiMountainPage: React.FC<KanjiMountainPageProps> = ({ navigation }) => {
    const { t } = useTranslation();
    
    const levels = useMemo(generateLevels, []);

    const totalProgress = levels.reduce((sum, level) => sum + level.completed, 0);
    const totalKanji = levels.reduce((sum, level) => sum + level.kanjiCount, 0);
    const currentLevel = 40
    
    const climberProgress = (currentLevel / 60) * 100;
    
    const climberTopPosition = MOUNTAIN_HEIGHT_PX * (1 - (climberProgress / 100)) - 40;

    const onBack = () => navigation.navigate('Dashboard');

    return (
        <SafeAreaView style={themeStyles.flex1}>
            <ScrollView contentContainerStyle={localStyles.scrollContent}>
                
                {/* <View style={localStyles.headerContainer}>
                    <View style={localStyles.headerFlex}>
                        <Text style={localStyles.title}>
                            {t('Kanji Mountain') || '🗻 Góra Kanji'}
                        </Text>
                        <Button onPress={onBack} style={localStyles.backButtonGhost}>
                            <Text style={localStyles.backButtonText}>← {t('common.back') || 'Powrót'}</Text>
                        </Button>
                    </View> */}
                    
                    {/* <Card style={localStyles.progressCard}>
                        <View style={localStyles.progressCardFlex}>
                            <MountainIcon style={localStyles.primaryText} />
                            <View style={themeStyles.flex1}>
                                <Text style={localStyles.cardTextMedium}>{t('Your climbing progress') || 'Twój postęp wspinaczki'}</Text>
                                <Text style={localStyles.cardTextSmall}>{totalProgress} / {totalKanji} kanji • {t('Level {{level}}/60', { level: currentLevel })}</Text>
                            </View>
                            <Badge style={localStyles.badgePrimary}>
                                {Math.round(climberProgress)}%
                            </Badge>
                        </View>
                        <Progress value={climberProgress} style={localStyles.progressBarHeight} />
                    </Card> */}
                {/* </View> */}

                <View style={localStyles.mountainVisualContainer}>
                    <View style={localStyles.mountainWrapper}>
                        
                        <View style={localStyles.mountainShape}>
                            <Svg height="100%" width="100%" viewBox="0 0 400 700" preserveAspectRatio="none">
                                
                                <Defs>
                                    <LinearGradient id="mountainMain" x1="0%" y1="100%" x2="0%" y2="0%">
                                        <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.4" />
                                        <Stop offset="50%" stopColor={colors.primary} stopOpacity="0.2" />
                                        <Stop offset="100%" stopColor={colors.primary} stopOpacity="0.1" />
                                    </LinearGradient>
                                    <LinearGradient id="mountainBackground" x1="0%" y1="100%" x2="0%" y2="0%">
                                        <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.3" />
                                        <Stop offset="100%" stopColor="#87CEEB" stopOpacity="0.1" />
                                    </LinearGradient>
                                </Defs>
                                
                                <Path d="M 0 700 L 80 500 L 150 300 L 200 100 L 250 300 L 320 500 L 400 700 Z" fill="url(#mountainMain)" />
                        
                                <Line x1="200" y1="100" x2="150" y2="300" stroke={colors.primary} strokeWidth="2" strokeOpacity="0.2" />
                                <Line x1="200" y1="100" x2="250" y2="300" stroke={colors.primary} strokeWidth="2" strokeOpacity="0.2" />
                            </Svg>
                        </View>
                        
                        <View style={localStyles.mountainPath}>
                            <Svg height="100%" width="100%" viewBox="0 0 300 700" preserveAspectRatio="none">
                                <Path 
                                    d="M 50 680 L 100 600 L 80 520 L 130 440 L 110 360 L 160 280 L 140 200 L 190 120 L 150 60" 
                                    stroke={colors.primary} 
                                    strokeWidth="3" 
                                    strokeDasharray="10,5"
                                    fill="none"
                                    opacity="0.6"
                                />
                            </Svg>
                        </View>

                        <View style={localStyles.mountainMilestones}>
                            {[
                                { level: 60, pos: 5, label: 'Szczyt', icon: '🏔️', color: colors.primary, align: 'flex-start' },
                                { level: 50, pos: 20, label: 'Obóz 5', icon: '⛺', color: colors.primary, align: 'flex-end' },
                                { level: 40, pos: 35, label: 'Obóz 4', icon: '🏕️', color: colors.primary, align: 'flex-start' },
                                { level: 30, pos: 50, label: 'Obóz 3', icon: '⛺', color: colors.primary, align: 'flex-end' },
                                { level: 20, pos: 65, label: 'Obóz 2', icon: '🏕️', color: colors.primary, align: 'flex-start' },
                                { level: 10, pos: 80, label: 'Obóz 1', icon: '⛺', color: colors.primary, align: 'flex-end' },
                                { level: 1, pos: 95, label: 'Baza', icon: '🏕️', color: colors.primary, align: 'flex-start' },
                            ].map((camp) => {
                                const isPassed = currentLevel >= camp.level;
                                const isCurrent = currentLevel >= camp.level - 5 && currentLevel < camp.level + 5;
                                
                                return (
                                    <View
                                        key={camp.level}
                                        style={[localStyles.milestonePoint, { top: `${camp.pos}%`, alignItems: camp.align === 'flex-start' ? 'flex-start' : 'flex-end' }]}
                                    >
                                        <Card style={[
                                            localStyles.milestoneCard,
                                            { borderColor: isPassed ? colors.primary : colors.border, opacity: isPassed ? 1 : 0.5 },
                                            isCurrent && localStyles.milestoneCurrent
                                        ]}>
                                            <View style={localStyles.milestoneCardContent}>
                                                <Text style={localStyles.milestoneIcon}>{camp.icon}</Text>
                                                <View>
                                                    <Text style={localStyles.milestoneLabel}>{camp.label}</Text>
                                                    <Text style={localStyles.milestoneLevel}>Poziom {camp.level}</Text>
                                                </View>
                                                {isPassed && (<CheckIcon style={localStyles.successText} />)}
                                            </View>
                                        </Card>
                                    </View>
                                );
                            })}
                        </View>
                    
                        <View 
                            style={[
                                localStyles.climberAvatarWrapper,
                                { top: climberTopPosition }
                            ]}
                        >
                            <View style={localStyles.climberAvatarInner}>
                                
                                <View style={localStyles.climberAvatarContent}>
                                    <Avatar style={localStyles.climberAvatar}>
                                        <Text style={localStyles.climberAvatarText}>🧗</Text>
                                    </Avatar>
                                    <Badge style={localStyles.climberBadge}>
                                        LVL {currentLevel}
                                    </Badge>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export const localStyles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        backgroundColor: colors.background,
        paddingBottom: spacing.large * 2,
    },
    headerContainer: {
        marginBottom: spacing.large,
        paddingHorizontal: spacing.base,
        paddingTop: spacing.base,
    },
    headerFlex: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.base,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
    },
    backButtonGhost: {
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.small,
    },
    backButtonText: {
        color: colors.textMuted,
        fontSize: 16,
    },
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        padding: spacing.base,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        borderWidth: 1,
        borderColor: colors.border,
    },
    badge: {
        backgroundColor: colors.primary,
        borderRadius: 16,
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.base,
        alignSelf: 'flex-start',
    },
    badgeText: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: '600',
    },
    badgePrimary: {
        backgroundColor: colors.primary + '1A',
        borderColor: colors.primary + '33',
        borderWidth: 1,
    },
    progressCard: {
        borderColor: colors.primary + '66',
        padding: spacing.base,
        backgroundColor: colors.cardBackground,
    },
    progressCardFlex: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.base,
        marginBottom: spacing.small,
    },
    cardTextMedium: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    cardTextSmall: {
        fontSize: 10,
        color: colors.textMuted,
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: colors.border,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 4,
    },
    progressBarHeight: {
        height: 6,
    },
    mountainVisualContainer: {
        paddingHorizontal: spacing.base,
        marginBottom: spacing.large * 2,
    },
    mountainWrapper: {
        position: 'relative',
        width: '100%',
        height: MOUNTAIN_HEIGHT_PX,
        maxWidth: 400,
        alignSelf: 'center',
        overflow: 'hidden',
        borderRadius: 24,
        backgroundColor: colors.primary + '33',
        borderWidth: 2,
        borderColor: colors.primary + '66',
    },
    mountainShape: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    mountainPath: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 32,
        paddingVertical: 24,
    },
    mountainMilestones: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 24,
    },
    milestonePoint: {
        position: 'absolute',
        width: '100%',
        paddingHorizontal: 20,
    },
    milestoneCard: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: colors.cardBackground + 'E6',
    },
    milestoneCurrent: {
        borderWidth: 2,
        borderColor: colors.border,
        transform: [{ scale: 1.05 }],
    },
    milestoneCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.small,
    },
    milestoneIcon: {
        fontSize: 18,
    },
    milestoneLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.text,
    },
    milestoneLevel: {
        fontSize: 10,
        color: colors.textMuted,
    },
    // --- Climber Avatar ---
    climberAvatarWrapper: {
        position: 'absolute',
        left: '50%',
        transform: [{ translateX: -40 }], // 40px jest połową szerokości/wysokości Avatar
        zIndex: 20,
        width: 80, // Szerokość Avatara
        height: 80, // Wysokość Avatara
    },
    climberAvatarInner: {
        position: 'relative',
        width: '100%',
        height: '100%',
    },
    climbingRope: {
        position: 'absolute',
        left: '50%',
        width: 2,
        height: 100, // Wysokość liny (np. 100px)
        backgroundColor: colors.primary + '99',
        top: -100,
        transform: [{ translateX: -1 }],
    },
    climberAvatarContent: {
        position: 'relative',
    },
    climberAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: colors.primary,
        backgroundColor: colors.cardBackground,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    climberAvatarText: {
        fontSize: 40,
    },
    climberBadge: {
        position: 'absolute',
        bottom: -12,
        left: '50%',
        transform: [{ translateX: -30 }], // 30px to połowa szerokości badge
        backgroundColor: colors.border,
        borderColor: colors.border + '66',
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 4,
        zIndex: 20,
    },
    progressRingContainer: {
        position: 'absolute',
        top: -8,
        left: -8,
        width: 96,
        height: 96,
        // Tutaj SVG jest renderowane
    },
    // --- Side Stats ---
    sideStatsContainer: {
        position: 'absolute',
        right: 0,
        top: '25%', // top-1/4
        paddingRight: 16,
        gap: spacing.base,
        zIndex: 10,
    },
    sideStatCard: {
        padding: 12,
        backgroundColor: colors.cardBackground + 'F2', // card/95
        borderColor: colors.primary + '4D', // primary/30
        width: 80,
    },
    sideStatCardSuccess: {
        borderColor: colors.primary + '4D',
    },
    sideStatCardAccent: {
        borderColor: colors.primary + '4D',
    },
    sideStatContent: {
        alignItems: 'center',
    },
    sideStatValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
        marginTop: 4,
    },
    sideStatLabel: {
        fontSize: 10,
        color: colors.textMuted,
    },
    // --- Achievement Stats ---
    achievementStatsContainer: {
        paddingHorizontal: spacing.base,
        marginBottom: spacing.base * 2,
    },
    achievementGrid: {
        flexDirection: 'row',
        gap: spacing.base,
        justifyContent: 'space-between',
    },
    achievementCard: {
        flex: 1,
        borderColor: colors.primary + '33',
        padding: spacing.base,
    },
    achievementCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.base,
    },
    achievementIconPrimary: {
        padding: 12,
        backgroundColor: colors.primary + '1A',
        borderRadius: 12,
    },
    achievementIconAccent: {
        padding: 12,
        backgroundColor: colors.primary + '1A',
        borderRadius: 12,
    },
    achievementLabel: {
        fontSize: 12,
        color: colors.textMuted,
    },
    achievementValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.text,
    },
    // --- Motivational Banner ---
    motivationalBannerContainer: {
        paddingHorizontal: spacing.base,
    },
    motivationalCard: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    motivationalCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.base,
    },
    motivationalIcon: {
        width: 40,
        height: 40,
        color: colors.primary,
    },
    motivationalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 4,
    },
    motivationalText: {
        fontSize: 12,
        color: colors.primary,
        opacity: 0.9,
    },
    // --- Text Styles for consistency ---
    primaryText: { color: colors.primary },
    successText: { color: colors.primary },
    accentText: { color: colors.primary },
});

export default KanjiMountainPage;