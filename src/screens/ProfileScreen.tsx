import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation, Modal, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path, G } from "react-native-svg";

// Components (Mock imports assumed based on context, adjusted for single-file portability if needed)
// In a real app, ensure these paths are correct or replace with inline components
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ContributionGraph } from '../components/profile/ContributionGraph';
import { Card } from '../components/ui/Card'; 

import { themeStyles, colors, spacing } from '../theme/styles';
import { User, loadUser } from '../utils/user';

// --- HELPER FUNCTIONS ---

const pointsToPath = (points: {x: number; y: number}[]) => {
  if (points.length === 0) return "";
  return points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");
};

// Mock Data
const MOCK_USER_STROKES = [
    { points: [{x: 140, y: 40}, {x: 140, y: 100}] }, 
    { points: [{x: 60, y: 140}, {x: 220, y: 140}] }, 
    { points: [{x: 140, y: 140}, {x: 100, y: 240}] }, 
    { points: [{x: 140, y: 140}, {x: 180, y: 240}] }, 
];

const MOCK_REF_STROKES = [
    { points: [{x: 140, y: 35}, {x: 140, y: 105}] }, 
    { points: [{x: 55, y: 140}, {x: 225, y: 140}] }, 
    { points: [{x: 140, y: 140}, {x: 95, y: 245}] }, 
    { points: [{x: 140, y: 140}, {x: 185, y: 245}] }, 
];

// --- COMPONENT: KANJI VIEWER ---
// Stylized exactly like the requested 'KanjiCanvas'
const KanjiCanvasViewer = ({ size = 280, userStrokes = [], refStrokes = [] }: { size?: number, userStrokes?: any[], refStrokes?: any[] }) => {
    return (
        <View style={[styles.canvasContainer, { width: size, height: size }]}>
            <Svg width="100%" height="100%" style={styles.canvas}>
                {/* Grid Lines */}
                <Path
                    d={`M ${size / 2} 0 L ${size / 2} ${size} M 0 ${size / 2} L ${size} ${size / 2}`}
                    stroke="#F3F4F6"
                    strokeWidth={1}
                />
                
                {/* 1. Placeholder (Reference) */}
                <G>
                    {refStrokes.map((stroke, i) => (
                        <Path
                            key={`ref-${i}`}
                            d={pointsToPath(stroke.points)}
                            stroke="#E5E7EB" 
                            strokeWidth={4}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    ))}
                </G>

                {/* 2. User Strokes */}
                <G>
                    {userStrokes.map((stroke, i) => (
                        <Path
                            key={`user-${i}`}
                            d={pointsToPath(stroke.points)}
                            stroke="#1F2937"
                            strokeWidth={4}
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    ))}
                </G>
            </Svg>
        </View>
    );
};

// --- DATA GENERATORS ---

const generateMockActivity = () => {
    const data: { [date: string]: number } = {};
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    data[todayStr] = 8; 

    for (let i = 1; i < 110; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const rand = Math.random();
        if (rand > 0.7) data[d.toISOString().split('T')[0]] = Math.floor(Math.random() * 12) + 1;
    }
    return data;
};

const getMockDetailsForDate = (count: number) => {
    if (count === 0) return [];
    const kanjiPool = ["木", "火", "土", "金", "水"];
    return Array.from({ length: Math.min(count, 12) }).map((_, i) => ({
        id: i,
        char: kanjiPool[i % kanjiPool.length],
        meaning: ["Tree", "Fire", "Earth", "Gold", "Water"][i % 5],
        type: i % 3 === 0 ? "New" : "Review",
        status: i % 4 === 0 ? "miss" : "ok"
    }));
};

// --- MAIN SCREEN ---

interface ScreenProps {
    navigation: any;
    route: any;
    onLogout: () => void;
}

const ProfileScreen: React.FC<ScreenProps> = ({ navigation, onLogout }) => {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  
  // State
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedCount, setSelectedCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'lessons' | 'reviews'>('reviews');

  // Modal State
  const [kanjiModalVisible, setKanjiModalVisible] = useState(false);
  const [selectedKanji, setSelectedKanji] = useState<any>(null);

  const activityData = useMemo(() => generateMockActivity(), []);
  const dailyDetails = useMemo(() => getMockDetailsForDate(selectedCount), [selectedCount, selectedDate]);

  const filteredItems = useMemo(() => {
      if (activeTab === 'lessons') return dailyDetails.filter(i => i.type === 'New');
      return dailyDetails.filter(i => i.type === 'Review');
  }, [dailyDetails, activeTab]);

  useEffect(() => {
    loadUser().then(u => u && setUser(u));
    
    const todayStr = new Date().toISOString().split('T')[0];
    setSelectedDate(todayStr);
    setSelectedCount(activityData[todayStr] || 0);
    setActiveTab('reviews');
  }, [activityData]);

  const handleLogoutPress = async () => {
    setUser(null);
    onLogout();
  };

  const handleDayPress = (date: string, count: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedDate(date);
    setSelectedCount(count);
    setActiveTab('reviews');
  };

  const handleKanjiPress = (item: any) => {
      setSelectedKanji(item);
      setKanjiModalVisible(true);
  };

  const formatDatePretty = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'long' });
  };

  return (
      <ScrollView style={themeStyles.flex1} contentContainerStyle={styles.scrollContent}>
        <View style={themeStyles.paddingContainer}>
          
          <ProfileHeader user={user} />

          <ContributionGraph 
            values={activityData} 
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
                    <View style={styles.tabsRow}>
                        <TouchableOpacity 
                            style={[styles.tabButton, activeTab === 'reviews' && styles.activeTabButton]}
                            onPress={() => setActiveTab('reviews')}
                        >
                            <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
                                Reviews ({dailyDetails.filter(i => i.type === 'Review').length})
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.tabButton, activeTab === 'lessons' && styles.activeTabButton]}
                            onPress={() => setActiveTab('lessons')}
                        >
                            <Text style={[styles.tabText, activeTab === 'lessons' && styles.activeTabText]}>
                                Lessons ({dailyDetails.filter(i => i.type === 'New').length})
                            </Text>
                        </TouchableOpacity>
                    </View>
                  )}

                  {selectedCount > 0 ? (
                      <View style={styles.chipsGrid}>
                          {filteredItems.length > 0 ? (
                              filteredItems.map((item, idx) => (
                                  <TouchableOpacity 
                                    key={idx} 
                                    style={[styles.chip, item.status === 'miss' ? styles.chipMiss : styles.chipOk]}
                                    activeOpacity={0.7}
                                    onPress={() => handleKanjiPress(item)}
                                  >
                                      <View style={styles.chipTop}>
                                          <Text style={styles.chipChar}>{item.char}</Text>
                                          {item.type === 'New' && <View style={styles.newDot} />}
                                      </View>
                                      <Text style={styles.chipMeaning} numberOfLines={1}>{item.meaning}</Text>
                                  </TouchableOpacity>
                              ))
                          ) : (
                              <Text style={styles.emptyTabParams}>No {activeTab} this day.</Text>
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

        {/* --- MODAL --- */}
        <Modal
            animationType="fade"
            transparent={true}
            visible={kanjiModalVisible}
            onRequestClose={() => setKanjiModalVisible(false)}
        >
            <Pressable style={styles.modalOverlay} onPress={() => setKanjiModalVisible(false)}>
                <Pressable style={styles.modalContent} onPress={() => {}}>
                    
                    {/* Header Modal */}
                    <View style={styles.modalHeader}>
                         <View>
                            <Text style={styles.modalTitle}>{selectedKanji?.char}</Text>
                            <Text style={styles.modalSubtitle}>{selectedKanji?.meaning}</Text>
                         </View>
                         <TouchableOpacity onPress={() => setKanjiModalVisible(false)}>
                            <Ionicons name="close-circle" size={30} color={colors.textMuted} />
                         </TouchableOpacity>
                    </View>

                    {/* KANJI VIEWER - UPDATED STYLING */}
                    <View style={styles.viewerContainer}>
                         <KanjiCanvasViewer 
                            size={256} 
                            userStrokes={MOCK_USER_STROKES} 
                            refStrokes={MOCK_REF_STROKES}
                         />
                         <Text style={styles.instructionText}>
                            Your stroke vs Reference
                         </Text>
                    </View>

                </Pressable>
            </Pressable>
        </Modal>

      </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: { backgroundColor: colors.background, paddingBottom: 40 },
  
  // --- UPDATED KANJI CANVAS STYLES ---
  // This matches the structure provided in the prompt (no shadows, specific border)
  canvasContainer: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#fff',
    alignSelf: 'center',
    // Width and Height are handled dynamically via props
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
      marginTop: -8 // Adjusted since canvasContainer has marginBottom
  },

  // Details Section
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
  
  // Tabs
  tabsRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginBottom: 12 },
  tabButton: { paddingVertical: 8, paddingHorizontal: 12, marginRight: 8, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTabButton: { borderBottomColor: colors.primary || '#3498db' },
  tabText: { fontSize: 14, color: colors.textMuted, fontWeight: '500' },
  activeTabText: { color: colors.primary || '#3498db', fontWeight: '700' },
  emptyTabParams: { color: colors.textMuted, fontStyle: 'italic', padding: 8 },

  // Chips
  chipsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { width: '22%', aspectRatio: 1, backgroundColor: '#f8f9fa', borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  chipOk: { backgroundColor: '#f0fdf4', borderColor: '#dcfce7' }, 
  chipMiss: { backgroundColor: '#fef2f2', borderColor: '#fee2e2' }, 
  chipTop: { flexDirection: 'row', alignItems: 'flex-start' },
  chipChar: { fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 2 },
  newDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#3498db', position: 'absolute', right: -8, top: 0 },
  chipMeaning: { fontSize: 10, color: '#666' },

  emptyState: { padding: 10, alignItems: 'center' },
  emptyText: { color: colors.textMuted, fontStyle: 'italic' },

  logoutButtonContainer: { marginTop: spacing.base },
  logoutContent: { ...themeStyles.flexRow, ...themeStyles.gap8, alignItems: 'center', justifyContent: 'center' },
  logoutText: { color: '#c0392b', fontSize: 16, fontWeight: '500' },

  // --- MODAL STYLES ---
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
      elevation: 10
  },
  modalHeader: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10
  },
  modalTitle: { fontSize: 32, fontWeight: 'bold', color: colors.text },
  modalSubtitle: { fontSize: 18, color: colors.textMuted, marginTop: -4 },
});

export default ProfileScreen;