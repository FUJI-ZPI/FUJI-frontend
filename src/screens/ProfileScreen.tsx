import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation, Modal, Pressable, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path, G } from "react-native-svg";
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';

import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ContributionGraph } from '../components/profile/ContributionGraph';
import { Card } from '../components/ui/Card'; 
import { useToast } from '../hooks/use-toast';

import { themeStyles, colors, spacing } from '../theme/styles';
import { User, loadUser } from '../utils/user';

// --- DEFINICJA KOLORÓW Z TWOJEGO PRZYKŁADU ---
const primaryGreen = '#10B981';
const accentBlue = '#3B82F6';

// --- NOWY KOMPONENT TAB BUTTON ---
const TabButton: React.FC<{
  icon: any;
  label: string;
  isActive: boolean;
  onPress: () => void;
}> = ({icon, label, isActive, onPress}) => (
  <TouchableOpacity
    style={[styles.tabButton, isActive && styles.tabButtonActive]}
    onPress={onPress}>
    <Ionicons
      name={icon}
      size={18}
      color={isActive ? primaryGreen : colors.textMuted}
    />
    <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

interface DailyActivityStat {
  date: string;
  count: number;
}

interface DailyActivityDetail {
  activityUuid: string;
  timestamp: string;
  kanjiCharacter: string;
  kanjiMeaning: string;
  type: 'LESSON' | 'REVIEW';
  accuracy: number;
}

interface ActivityPlaybackDetails {
  character: string;
  userStrokes: number[][][];
  referenceStrokes: number[][][];
  overallAccuracy: number;
  strokesAccuracy: number[];
}

const pointsArrayToPath = (points: number[][]) => {
  if (!points || points.length === 0) return "";
  return points.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(" ");
};

const formatTime = (isoString: string) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

// --- KOMPONENT VIEWERA ---
interface KanjiCanvasViewerProps {
  size?: number;
  userStrokes?: number[][][];
  referenceStrokes?: number[][][];
  strokesAccuracy?: number[];
}

const KanjiCanvasViewer = ({ 
  size = 280, 
  userStrokes = [], 
  referenceStrokes = [], 
  strokesAccuracy = [] 
}: KanjiCanvasViewerProps) => {
    return (
        <View style={[styles.canvasContainer, { width: size, height: size }]}>
            <Svg width="100%" height="100%" style={styles.canvas} viewBox={`0 0 256 256`}>
                <Path
                    d={`M 128 0 L 128 256 M 0 128 L 256 128`}
                    stroke="#F3F4F6"
                    strokeWidth={1}
                />
                <G>
                    {referenceStrokes.map((stroke, i) => (
                        <Path
                            key={`ref-${i}`}
                            d={pointsArrayToPath(stroke)}
                            stroke="#E5E7EB"
                            strokeWidth={4}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    ))}
                </G>
                <G>
                    {userStrokes.map((stroke, i) => {
                        const rawAccuracy = strokesAccuracy[i] || 0;
                        const accuracyPercent = rawAccuracy <= 1 ? rawAccuracy * 100 : rawAccuracy;
                        const strokeColor = accuracyPercent >= 70 ? '#22C55E' : '#EF4444';

                        return (
                            <Path
                                key={`user-${i}`}
                                d={pointsArrayToPath(stroke)}
                                stroke={strokeColor}
                                strokeWidth={4}
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        );
                    })}
                </G>
            </Svg>
        </View>
    );
};


interface ScreenProps {
    navigation: any;
    route: any;
    onLogout: () => void;
}

const INITIAL_VISIBLE_ITEMS = 8;
const ITEMS_PER_PAGE = 4;

const ProfileScreen: React.FC<ScreenProps> = ({ navigation, onLogout }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  
  const [activityMap, setActivityMap] = useState<{ [date: string]: number }>({});
  const [dailyHistory, setDailyHistory] = useState<DailyActivityDetail[]>([]);
  
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedCount, setSelectedCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'LESSON' | 'REVIEW'>('REVIEW');
  
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [visibleItemsCount, setVisibleItemsCount] = useState(INITIAL_VISIBLE_ITEMS);

  const [kanjiModalVisible, setKanjiModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [playbackDetails, setPlaybackDetails] = useState<ActivityPlaybackDetails | null>(null);

  const fetchWithAuth = async (endpoint: string) => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (!token) throw new Error('No token');
    
    const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
  };

  const fetchStats = async () => {
    try {
        const data: DailyActivityStat[] = await fetchWithAuth('/api/v1/activity/stats');
        
        const map: { [key: string]: number } = {};
        data.forEach(item => {
            map[item.date] = item.count;
        });
        setActivityMap(map);
        return map; 
    } catch (e) {
        console.error("Failed to fetch stats", e);
        return {};
    }
  };

  const fetchDailyHistory = async (dateStr: string) => {
      if (isLoadingHistory) return;
      
      setIsLoadingHistory(true);
      try {
          const data: DailyActivityDetail[] = await fetchWithAuth(`/api/v1/activity/history/${dateStr}`);
          setDailyHistory(data);
      } catch (e) {
          console.error("Failed to fetch history", e);
          setDailyHistory([]);
      } finally {
          setIsLoadingHistory(false);
      }
  };

  const fetchActivityDetails = async (uuid: string) => {
      setModalLoading(true);
      setPlaybackDetails(null);
      try {
          const data: ActivityPlaybackDetails = await fetchWithAuth(`/api/v1/activity/${uuid}`);
          setPlaybackDetails(data);
      } catch (e) {
          toast({ title: "Error", description: "Could not load drawing data." });
          setKanjiModalVisible(false);
      } finally {
          setModalLoading(false);
      }
  };

  useFocusEffect(
    useCallback(() => {
        const initData = async () => {
            try {
                const userDataPromise = loadUser();
                const statsPromise = fetchStats();

                const [userData, map] = await Promise.all([userDataPromise, statsPromise]);
                
                if (userData) setUser(userData);

                if (!selectedDate) {
                    const todayStr = new Date().toISOString().split('T')[0];
                    setSelectedDate(todayStr);
                    setSelectedCount(map[todayStr] || 0);
                }
            } catch (error) {
                console.error("Initialization error:", error);
            } finally {
                setIsInitialLoading(false);
            }
        };

        initData();
    }, [])
  );

  useEffect(() => {
      if (selectedDate) {
          fetchDailyHistory(selectedDate);
          if (activityMap[selectedDate] !== undefined) {
              setSelectedCount(activityMap[selectedDate]);
          }
      }
  }, [selectedDate]);

  useEffect(() => {
    setVisibleItemsCount(INITIAL_VISIBLE_ITEMS);
  }, [selectedDate, activeTab]);

  const handleLogoutPress = async () => {
    setUser(null);
    onLogout();
  };

  const handleDayPress = (date: string, count: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedDate(date);
    setSelectedCount(count);
    setActiveTab('REVIEW');
  };

  const handleKanjiPress = (item: DailyActivityDetail) => {
      if (modalLoading || kanjiModalVisible) return;

      setKanjiModalVisible(true);
      fetchActivityDetails(item.activityUuid);
  };

  const handleShowMore = () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setVisibleItemsCount(prev => prev + ITEMS_PER_PAGE);
  };

  const formatDatePretty = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'long' });
  };

  const filteredItems = useMemo(() => {
      const items = dailyHistory.filter(i => i.type === activeTab);
      return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [dailyHistory, activeTab]);

  const displayedItems = useMemo(() => {
      return filteredItems.slice(0, visibleItemsCount);
  }, [filteredItems, visibleItemsCount]);

  const hasMoreItems = filteredItems.length > visibleItemsCount;

  if (isInitialLoading) {
      return (
          <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={styles.emptyText}>Loading profile...</Text>
          </View>
      );
  }

  // Liczniki dla zakładek
  const reviewCount = dailyHistory.filter(i => i.type === 'REVIEW').length;
  const lessonCount = dailyHistory.filter(i => i.type === 'LESSON').length;

  return (
      <ScrollView style={themeStyles.flex1} contentContainerStyle={styles.scrollContent}>
        <View style={themeStyles.paddingContainer}>
          
          <ProfileHeader user={user} />

          <ContributionGraph 
            values={activityMap} 
            selectedDate={selectedDate}
            onDayPress={handleDayPress} 
          />

          {selectedDate && (
              <Card style={styles.detailsContainer}>
                  <View style={styles.detailsHeader}>
                      <View>
                        <Text style={styles.detailsDate}>{formatDatePretty(selectedDate)}</Text>
                        <Text style={styles.detailsSubtitle}>
                            {selectedCount > 0 
                                ? `${selectedCount} items studied total` 
                                : "No activity recorded"}
                        </Text>
                      </View>
                  </View>

                  {selectedCount > 0 && (
                    <View style={styles.tabContainer}>
                        <TabButton 
                            icon="repeat-outline"
                            label={`Reviews (${reviewCount})`}
                            isActive={activeTab === 'REVIEW'}
                            onPress={() => setActiveTab('REVIEW')}
                        />
                        <TabButton 
                            icon="book-outline"
                            label={`Lessons (${lessonCount})`}
                            isActive={activeTab === 'LESSON'}
                            onPress={() => setActiveTab('LESSON')}
                        />
                    </View>
                  )}

                  {isLoadingHistory ? (
                      <ActivityIndicator size="small" color={primaryGreen} style={{ margin: 20 }} />
                  ) : selectedCount > 0 ? (
                      <View>
                          <View style={styles.chipsGrid}>
                              {displayedItems.length > 0 ? (
                                  displayedItems.map((item) => (
                                      <TouchableOpacity 
                                        key={item.activityUuid} 
                                        style={[
                                            styles.chip, 
                                            // Kolory tła w zależności od poprawności
                                            Math.round(item.accuracy * 100) >= 70 ? styles.chipOk : styles.chipMiss
                                        ]}
                                        activeOpacity={0.7}
                                        onPress={() => handleKanjiPress(item)}
                                      >
                                          {/* ZMIANA: PRZYWRÓCONO WYŚWIETLANIE CZASU */}
                                          <View style={styles.chipHeader}>
                                              <Text style={styles.chipTime}>
                                                  {formatTime(item.timestamp)}
                                              </Text>
                                          </View>

                                          <View style={styles.chipContent}>
                                              <Text style={styles.chipChar}>{item.kanjiCharacter}</Text>
                                              <Text style={styles.chipMeaning} numberOfLines={1}>{item.kanjiMeaning}</Text>
                                          </View>
                                      </TouchableOpacity>
                                  ))
                              ) : (
                                  <Text style={styles.emptyTabParams}>No {activeTab.toLowerCase()}s this day.</Text>
                              )}
                          </View>

                          {hasMoreItems && (
                              <TouchableOpacity 
                                  style={styles.showMoreButton} 
                                  onPress={handleShowMore}
                                  activeOpacity={0.6}
                              >
                                  <Text style={styles.showMoreText}>Show More</Text>
                                  <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
                              </TouchableOpacity>
                          )}
                      </View>
                  ) : (
                      <View style={styles.emptyState}>
                          <Text style={styles.emptyText}>Rest day 😴</Text>
                      </View>
                  )}
              </Card>
          )}

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

        <Modal
            animationType="fade"
            transparent={true}
            visible={kanjiModalVisible}
            onRequestClose={() => setKanjiModalVisible(false)}
        >
            <Pressable style={styles.modalOverlay} onPress={() => setKanjiModalVisible(false)}>
                <Pressable style={styles.modalContent} onPress={() => {}}>
                    
                    {modalLoading ? (
                        <ActivityIndicator size="large" color={primaryGreen} />
                    ) : playbackDetails ? (
                        <>
                            <View style={styles.modalHeader}>
                                <View>
                                    <Text style={styles.modalTitle}>{playbackDetails.character}</Text>
                                    <Text style={styles.modalSubtitle}>
                                        Accuracy: {Math.round(playbackDetails.overallAccuracy * (playbackDetails.overallAccuracy <= 1 ? 100 : 1))}%
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => setKanjiModalVisible(false)}>
                                    <Ionicons name="close-circle" size={30} color={colors.textMuted} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.viewerContainer}>
                                <KanjiCanvasViewer 
                                    size={256} 
                                    userStrokes={playbackDetails.userStrokes} 
                                    referenceStrokes={playbackDetails.referenceStrokes}
                                    strokesAccuracy={playbackDetails.strokesAccuracy}
                                />
                                <Text style={styles.instructionText}>
                                    Your drawing
                                </Text>
                            </View>
                        </>
                    ) : (
                        <Text>No data available</Text>
                    )}

                </Pressable>
            </Pressable>
        </Modal>

      </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: { backgroundColor: colors.background, paddingBottom: 40 },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F5F7FA',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24, 
    textAlign: 'center',
    marginTop: 16 
  },

  canvasContainer: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#fff',
    alignSelf: 'center',
  },
  canvas: {
    backgroundColor: '#fff',
  },
  viewerContainer: {
      alignItems: 'center', 
      marginVertical: 20 
  },
  instructionText: {
      fontSize: 14, 
      color: '#666', 
      marginTop: -8
  },

  detailsContainer: {
    backgroundColor: '#fff', 
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  detailsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  detailsDate: { fontSize: 18, fontWeight: '700', color: colors.text },
  detailsSubtitle: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  
  // Style dla Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB', 
    padding: spacing.small,
    borderRadius: 12,
    gap: spacing.small,
    marginBottom: 16, 
  },
  tabButton: {
    alignItems: 'center',
    paddingVertical: spacing.small,
    paddingHorizontal: spacing.base,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8, 
    flex: 1,
  },
  tabButtonActive: {
    backgroundColor: '#D1FAE5',
  },
  tabLabel: {
    fontSize: 14, 
    color: colors.textMuted
  },
  tabLabelActive: {
    color: primaryGreen, 
    fontWeight: '600'
  },

  emptyTabParams: { color: colors.textMuted, fontStyle: 'italic', padding: 8 },

  chipsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  
  chip: { 
      width: '22%', 
      aspectRatio: 1, 
      backgroundColor: '#fff', 
      borderRadius: 10, 
      padding: 4,
      borderWidth: 1, 
      borderColor: '#eee',
  },
  chipOk: { backgroundColor: '#f0fdf4', borderColor: '#dcfce7' }, 
  chipMiss: { backgroundColor: '#fef2f2', borderColor: '#fee2e2' }, 
  
  chipHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      height: 14, 
  },
  chipTime: {
      fontSize: 9,
      color: '#9ca3af',
      fontWeight: '600'
  },

  chipContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: -4 
  },
  chipChar: { fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 2 },
  chipMeaning: { fontSize: 9, color: '#666', textAlign: 'center' },

  showMoreButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      marginTop: 8,
      gap: 4,
      borderTopWidth: 1,
      borderTopColor: '#F3F4F6'
  },
  showMoreText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textMuted
  },

  emptyState: { padding: 10, alignItems: 'center' },

  logoutButtonContainer: { marginTop: spacing.base },
  logoutContent: { ...themeStyles.flexRow, ...themeStyles.gap8, alignItems: 'center', justifyContent: 'center' },
  logoutText: { color: '#c0392b', fontSize: 16, fontWeight: '500' },

  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20
  },
  modalContent: {
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 24,
      width: '100%',
      maxWidth: 320, 
      alignItems: 'center',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 10,
      minHeight: 200,
      justifyContent: 'center'
  },
  modalHeader: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10
  },
  modalTitle: { fontSize: 32, fontWeight: 'bold', color: colors.text },
  modalSubtitle: { fontSize: 16, color: colors.textMuted, marginTop: -4 },
});

export default ProfileScreen;