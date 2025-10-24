import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { themeStyles, colors, spacing, levelStyles } from '../theme/styles'; // Importuj też levelStyles
import { useTranslation } from 'react-i18next';
import { mockKanjiDetails } from '../data/mockData';
import { Card } from '../components/ui/Card';

type TabName = 'meaning' | 'reading' | 'examples';

interface ScreenProps {
    navigation: any;
    route: { params: { kanjiId: string, character: string } };
}

const colorStyles = {
  meaning: {
    bg: levelStyles.getColors(1).background,
    border: colors.secondary,
    text: colors.secondary,
  },
  onyomi: {
    bg: levelStyles.getColors(100).background,
    border: colors.danger,
    text: colors.danger,
  },
  kunyomi: {
    bg: levelStyles.getColors(1).background,
    border: colors.secondary,
    text: colors.secondary,
  },
  mnemonic: {
    bg: levelStyles.getColors(30).background,
    border: colors.warning,
    text: colors.warning,
  }
};

const KanjiDetailScreen: React.FC<ScreenProps> = ({ navigation, route }) => {
    const { t } = useTranslation();
    const { kanjiId, character } = route.params;
    const [activeTab, setActiveTab] = useState<TabName>('meaning');

    const kanji = useMemo(() => {
        return mockKanjiDetails[kanjiId];
    }, [kanjiId]);

    if (!kanji) {
        return (
            <SafeAreaView style={themeStyles.flex1}>
                <View style={[themeStyles.flex1, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Text>Error: Kanji details not found.</Text>
                </View>
            </SafeAreaView>
        );
    }
    
    const renderMeaningTab = () => (
        <Card style={localStyles.tabContentCard}>
            <View style={localStyles.meaningGroup}>
                <Text style={localStyles.groupTitle}>Meanings</Text>
                <View style={localStyles.tagContainer}>
                    {kanji.meanings.map((meaning) => (
                        <View key={meaning} style={[localStyles.tag, localStyles.meaningTag]}>
                            <Text style={localStyles.meaningTagText}>{meaning}</Text>
                        </View>
                    ))}
                </View>
            </View>
            <View style={[localStyles.mnemonicBox, { backgroundColor: colorStyles.mnemonic.bg, borderColor: colorStyles.mnemonic.border }]}>
                <View style={themeStyles.flexRow}>
                    <Ionicons name="bulb-outline" size={16} color={colorStyles.mnemonic.text} />
                    <Text style={[localStyles.mnemonicTitle, { color: colorStyles.mnemonic.text }]}>Mnemonic</Text>
                </View>
                <Text style={localStyles.mnemonicText}>{kanji.mnemonic}</Text>
            </View>
        </Card>
    );

    const renderReadingTab = () => (
        <>
            <Card style={[localStyles.tabContentCard, { backgroundColor: colorStyles.onyomi.bg, borderColor: colorStyles.onyomi.border }]}>
                <Text style={[localStyles.groupTitle, { color: colorStyles.onyomi.text }]}>
                    音読み (On'yomi) - {kanji.readings.onyomi[0].label}
                </Text>
                <View style={localStyles.tagContainer}>
                    {kanji.readings.onyomi.map((r) => (
                        <TouchableOpacity key={r.reading} style={[localStyles.readingTag, { backgroundColor: colors.cardBackground }]}>
                            <Ionicons name="volume-medium-outline" size={18} color={colorStyles.onyomi.text} />
                            <Text style={[localStyles.readingTagText, { color: colorStyles.onyomi.text }]}>{r.reading}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </Card>
            <Card style={[localStyles.tabContentCard, { backgroundColor: colorStyles.kunyomi.bg, borderColor: colorStyles.kunyomi.border }]}>
                <Text style={[localStyles.groupTitle, { color: colorStyles.kunyomi.text }]}>
                    訓読み (Kun'yomi) - {kanji.readings.kunyomi[0].label}
                </Text>
                <View style={localStyles.tagContainer}>
                    {kanji.readings.kunyomi.map((r) => (
                        <TouchableOpacity key={r.reading} style={[localStyles.readingTag, { backgroundColor: colors.cardBackground }]}>
                            <Ionicons name="volume-medium-outline" size={18} color={colorStyles.kunyomi.text} />
                            <Text style={[localStyles.readingTagText, { color: colorStyles.kunyomi.text }]}>{r.reading}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </Card>
        </>
    );

    const renderExamplesTab = () => (
        <Card style={localStyles.tabContentCard}>
            {kanji.examples.map((ex) => (
                <View key={ex.word} style={localStyles.exampleRow}>
                    <View style={themeStyles.flex1}>
                        <Text style={localStyles.exampleWord}>{ex.word}</Text>
                        <Text style={localStyles.exampleReading}>{ex.reading}</Text>
                        <Text style={localStyles.exampleMeaning}>{ex.meaning}</Text>
                    </View>
                    <TouchableOpacity>
                        <Ionicons name="volume-medium-outline" size={24} color={colors.textMuted} />
                    </TouchableOpacity>
                </View>
            ))}
        </Card>
    );


    return (
        <SafeAreaView style={[themeStyles.flex1, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={localStyles.scrollContent}>
                
                <View style={localStyles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={localStyles.backButton}>
                        <Ionicons name="arrow-back" size={20} color={colors.text} />
                        <Text style={localStyles.backButtonText}>{t('common.back')}</Text>
                    </TouchableOpacity>
                    <Text style={localStyles.title}>{t('Learn Kanji')}</Text>
                    <View style={{ width: 60 }} />
                </View>
                
                {/* Główny znak Kanji */}
                <View style={localStyles.characterBox}>
                    <Text style={localStyles.characterText}>{kanji.character}</Text>
                    <TouchableOpacity style={localStyles.pronounceButton}>
                        <Ionicons name="volume-medium-outline" size={16} color={colors.text} />
                        <Text style={localStyles.pronounceText}>Reading</Text>
                    </TouchableOpacity>
                </View>
                
                {/* Przełącznik zakładek */}
                <View style={localStyles.tabContainer}>
                    <TabButton 
                        icon="book-outline" 
                        label="Meaning" 
                        isActive={activeTab === 'meaning'} 
                        onPress={() => setActiveTab('meaning')}
                    />
                    <TabButton 
                        icon="volume-medium-outline" 
                        label="Reading" 
                        isActive={activeTab === 'reading'} 
                        onPress={() => setActiveTab('reading')}
                    />
                    <TabButton 
                        icon="bulb-outline" 
                        label="Examples" 
                        isActive={activeTab === 'examples'} 
                        onPress={() => setActiveTab('examples')}
                    />
                </View>

                {/* Kontener na zawartość zakładek */}
                <View style={localStyles.tabContentContainer}>
                    {activeTab === 'meaning' && renderMeaningTab()}
                    {activeTab === 'reading' && renderReadingTab()}
                    {activeTab === 'examples' && renderExamplesTab()}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// Komponent pomocniczy dla przycisków zakładek
const TabButton: React.FC<{icon: any, label: string, isActive: boolean, onPress: () => void}> = 
  ({ icon, label, isActive, onPress }) => (
    <TouchableOpacity 
        style={[localStyles.tabButton, isActive && localStyles.tabButtonActive]}
        onPress={onPress}
    >
        <Ionicons name={icon} size={18} color={isActive ? colors.secondary : colors.textMuted} />
        <Text style={[localStyles.tabLabel, isActive && localStyles.tabLabelActive]}>
            {label}
        </Text>
    </TouchableOpacity>
);

const localStyles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.base,
        paddingHorizontal: spacing.base,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.small,
    },
    backButtonText: {
        fontSize: 16,
        marginLeft: 4,
        color: colors.text,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        textAlign: 'center',
    },
    scrollContent: { 
        paddingBottom: spacing.base * 4,
    },
    characterBox: {
        paddingVertical: spacing.large,
        marginTop: spacing.base,
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        marginHorizontal: spacing.base,
    },
    characterText: {
        fontSize: 100,
        fontWeight: '500',
        color: colors.text,
        marginBottom: spacing.base,
    },
    pronounceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.lightBackground,
        paddingVertical: spacing.small,
        paddingHorizontal: spacing.base,
        borderRadius: 20,
        ...themeStyles.gap8,
    },
    pronounceText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.text,
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: colors.cardBackground,
        paddingHorizontal: spacing.base,
        paddingTop: spacing.base,
        paddingBottom: spacing.small,
        borderRadius: 12,
        marginTop: spacing.base,
        marginHorizontal: spacing.base,
    },
    tabButton: {
        alignItems: 'center',
        paddingVertical: spacing.small,
        paddingHorizontal: spacing.base,
        borderRadius: 8,
        ...themeStyles.gap4,
        flex: 1,
    },
    tabButtonActive: {
        backgroundColor: colorStyles.meaning.bg,
    },
    tabLabel: {
        fontSize: 14,
        color: colors.textMuted,
    },
    tabLabelActive: {
        color: colors.secondary,
        fontWeight: '600',
    },
    tabContentContainer: {
        marginTop: spacing.base,
        paddingHorizontal: spacing.base,
    },
    tabContentCard: {
        borderWidth: 1,
    },
    groupTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textMuted,
        marginBottom: spacing.base,
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.small,
    },
    tag: {
        backgroundColor: colors.lightBackground,
        borderRadius: 8,
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.small,
    },
    meaningTag: {
        backgroundColor: colorStyles.meaning.bg,
        borderColor: colorStyles.meaning.border,
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.small,
    },
    meaningTagText: {
        fontSize: 16,
        fontWeight: '500',
        color: colorStyles.meaning.text,
    },
    readingTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.cardBackground,
        borderRadius: 20,
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.small,
        ...themeStyles.gap8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    readingTagText: {
        fontSize: 18,
        fontWeight: '500',
        color: colors.text,
    },
    mnemonicBox: {
        borderWidth: 1,
        borderRadius: 8,
        padding: spacing.base,
        marginTop: spacing.base,
    },
    mnemonicTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: spacing.small,
    },
    mnemonicText: {
        fontSize: 14,
        color: colors.textMuted,
        marginTop: spacing.small,
        lineHeight: 20,
    },
    exampleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.base,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    exampleWord: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.text,
    },
    exampleReading: {
        fontSize: 14,
        color: colors.textMuted,
    },
    exampleMeaning: {
        fontSize: 14,
        color: colors.text,
        marginTop: 2,
    },
});

export default KanjiDetailScreen;

