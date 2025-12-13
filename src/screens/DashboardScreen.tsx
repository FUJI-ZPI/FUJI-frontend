import React, { useCallback, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { FujiIllustration } from '../components/dashboard/FujiIllustration';
import { colors, themeStyles } from '../theme/styles';
import { FlyingClouds } from '../components/dashboard/FlyingClouds';
import { CloudStatCard } from '../components/dashboard/CloudStatCard';
import { loadUser, User } from '../utils/user';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { useToast } from '../hooks/use-toast';

interface ScreenProps {
    navigation: any;
    route: any;
}

interface DailyStreakDto {
    streak: number;
}

interface KanjiLearnedDto {
    amount: number;
}

interface UserLevelDto {
    level: number;
}

const { width: screenWidth } = Dimensions.get('window');
const SVG_VIEWBOX_WIDTH = 320.0216;
const SVG_VIEWBOX_HEIGHT = 346.01524;
const ASPECT_RATIO = SVG_VIEWBOX_HEIGHT / SVG_VIEWBOX_WIDTH;
const FUJI_HEIGHT = screenWidth * ASPECT_RATIO;

export const DashboardScreen: React.FC<ScreenProps> = ({ navigation }: any) => {
    const { t } = useTranslation();
    const [user, setUser] = useState<User | null>(null);

    const [dailyStreak, setDailyStreak] = useState<number>(0);
    const [kanjiLearned, setKanjiLearned] = useState<number>(0);
    const [userLevel, setUserLevel] = useState<number>(1);
    const [kanjiRemaining, setKanjiRemaining] = useState<number | null>(null);
    const [campProgressData, setCampProgressData] = useState<Record<number, number>>({});
    const CAMP_LEVELS = [10, 20, 30, 40, 50, 60];

    const { toast } = useToast();

    const fetchWithAuth = async <T,>(endpoint: string): Promise<T> => {
        const token = await SecureStore.getItemAsync('accessToken');
        if (!token) throw new Error('No token');

        const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}${endpoint}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json'
            },
        });

        if (!response.ok) {
            const body = await response.text().catch(() => '');
            throw new Error(`API Error: ${response.status} ${body}`);
        }

        return response.json();
    };

    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            async function init() {
                const u = await loadUser();
                let currentLvl = 1;
                if (isActive && u) {
                    setUser(u);
                    if (u.level) {
                        setUserLevel(u.level);
                        currentLvl = u.level;
                    }
                }

                try {
                    const data = await fetchWithAuth<DailyStreakDto>('/api/v1/progress/daily-streak');
                    if (isActive && data && typeof data.streak === 'number') {
                        setDailyStreak(data.streak);
                    }
                } catch (err) {
                    console.warn('Error fetching daily streak:', err);
                }

                try {
                    const data = await fetchWithAuth<KanjiLearnedDto>('/api/v1/progress/kanji-learned');
                    if (isActive && data && typeof data.amount === 'number') {
                        setKanjiLearned(data.amount);
                    }
                } catch (err) {
                    console.warn('Error fetching kanji learned:', err);
                }

                try {
                    const data = await fetchWithAuth<UserLevelDto>('/api/v1/progress/level');
                    if (isActive && data && typeof data.level === 'number') {
                        setUserLevel(data.level);
                    }
                } catch (err) {
                    console.warn('Error fetching user level:', err);
                }

                fetchWithAuth<{ amount: number }>(`/api/v1/progress/kanji-remaining?level=${currentLvl + 1}`)
                    .then(d => isActive && setKanjiRemaining(d.amount)).catch(() => { });

                const promises = CAMP_LEVELS.map(async (lvl) => {
                    try {
                        const res = await fetchWithAuth<{ amount: number }>(`/api/v1/progress/kanji-remaining?level=${lvl}`);
                        return { level: lvl, amount: res.amount };
                    } catch (err) {
                        console.warn('Error fetching camp remaining kanji:', err);
                    }
                });

                Promise.all(promises).then((results) => {
                    if (!isActive) return;
                    const newMap: Record<number, number> = {};
                    results.forEach(r => {
                        if (r) newMap[r.level] = r.amount;
                    });
                    setCampProgressData(newMap);
                });
            }

            init();

            return () => {
                isActive = false;
            };
        }, [])
    );

    const handleReviewSession = () => navigation.navigate('ReviewSession');
    const handleLearningSession = () => navigation.navigate('LearningSession');

    return (
        <View style={{ flex: 1 }}>
            <LinearGradient
                colors={['#ffd1ffb6', '#fad0c48a']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 0.4 }}
                style={StyleSheet.absoluteFillObject}
            />

            <SafeAreaView style={styles.mainContainer} edges={['left', 'right']}>

                <View style={styles.absoluteStatsContainer} pointerEvents="none">
                    <View style={{ position: 'absolute', top: 160, right: -55 }}>
                        <CloudStatCard
                            cloudType={2}
                            iconName="flame"
                            iconSet="Ionicons"
                            iconColor={colors.warning}
                            value={dailyStreak}
                            label={t('common.streak_label')}
                            contentStyle={{ paddingRight: 72, paddingTop: 5 }}
                        />
                    </View>
                    <View style={{ position: 'absolute', top: 175, left: 0 }} pointerEvents="none">
                        <CloudStatCard
                            cloudType={1}
                            iconName="book-open"
                            iconSet="Feather"
                            iconColor={colors.secondary}
                            value={kanjiLearned}
                            label={t('common.kanji_learned_label')}
                            contentStyle={{ paddingRight: 72, paddingTop: 20 }}
                        />
                    </View>
                </View>

                <View>
                    <View style={[styles.header, themeStyles.paddingContainer]}>
                        <Text style={styles.headerTitle}>
                            {t('dashboard.greeting', { userName: user?.name?.split(' ')[0] })}
                        </Text>
                        <Text style={themeStyles.textSubtitle}>{t('dashboard.subtitle')}</Text>
                    </View>
                </View>

                <FlyingClouds />

                <View>
                    <View style={styles.mountainContainer}>
                        <View style={{ width: '100%', height: FUJI_HEIGHT }} pointerEvents='auto'>
                            <FujiIllustration
                                currentLevel={userLevel}
                                maxLevel={60}
                                kanjiRemaining={kanjiRemaining}
                                campProgressData={campProgressData}
                            />
                        </View>
                    </View>

                    <View style={styles.grassSection}>
                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={[styles.buttonBase, styles.buttonSecondary]}
                                onPress={handleLearningSession}>
                                <Text style={styles.buttonTextSecondary}>Learning</Text>
                                <Text style={styles.buttonTextSecondary}>Session</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.buttonBase, styles.buttonPrimary]}
                                onPress={handleReviewSession}>
                                <Text style={styles.buttonTextPrimary}>Review</Text>
                                <Text style={styles.buttonTextPrimary}>Session</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
            <SafeAreaView
                style={{
                    backgroundColor: '#698779',
                }}
                edges={['bottom']}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'space-between',
    },
    absoluteStatsContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 7,
        pointerEvents: "box-none"
    },
    header: {
        textAlign: 'center',
        paddingVertical: 16,
        marginTop: themeStyles.paddingContainer.padding * 2,
        alignItems: 'center',
        backgroundColor: 'transparent',
        zIndex: 40
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 5,
        zIndex: 40
    },
    statsGrid: {
        marginTop: 40,
        ...themeStyles.flexRow,
        ...themeStyles.gap16,
        marginBottom: themeStyles.paddingContainer.padding,
        justifyContent: 'space-between',
    },
    totalProgressCard: {
        marginBottom: themeStyles.paddingContainer.padding,
    },
    totalProgressSection: {
        paddingVertical: 4,
        gap: 8,
    },
    fontSemibold: {
        fontWeight: '600',
        color: colors.text
    },
    mountainContainer: {
        marginHorizontal: 0,
        backgroundColor: 'transparent',
        zIndex: 3
    },
    grassSection: {
        backgroundColor: '#698779',
        paddingTop: themeStyles.paddingContainer.padding,
        paddingHorizontal: themeStyles.paddingContainer.padding,
        paddingBottom: themeStyles.paddingContainer.padding * 1.5,
        marginTop: -themeStyles.paddingContainer.padding * 2,
        zIndex: 40
    },
    gradient: {
        flex: 1,
        position: 'relative',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: themeStyles.paddingContainer.padding,
    },
    buttonBase: {
        flex: 1,
        paddingVertical: 14,
        paddingLeft: themeStyles.paddingContainer.padding,
        paddingRight: themeStyles.paddingContainer.padding - 5,
        borderRadius: 999,
        elevation: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonPrimary: {
        backgroundColor: '#4673aa',
    },
    buttonSecondary: {
        backgroundColor: '#ffffff',
    },
    buttonTextPrimary: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 18,
        textAlign: 'center',
        lineHeight: 25,
    },
    buttonTextSecondary: {
        color: 'black',
        fontWeight: '800',
        fontSize: 18,
        textAlign: 'center',
        lineHeight: 25,

    },
    kanjiIconText: {
        color: 'black',
        fontWeight: '600',
        fontSize: 27,
        transform: [{ translateY: -5 }]
    },
    iconCircle: {
        width: 35,
        height: 35,
        borderRadius: 999,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'visible',
    },
    iconCirclePrimary: {
        backgroundColor: "#f74f73",
    },
    iconCircleSecondary: {
        backgroundColor: '#FFFFFF',
    },
});

export default DashboardScreen;
