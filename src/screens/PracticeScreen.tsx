import React, {useState} from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {Card} from '../components/ui/Card';
import {Button} from '../components/ui/Button';
import {Progress} from '../components/ui/Progress';
import {mockKanji} from '../data/mockData';
import KanjiCanvas from '../components/practice/KanjiCanvas';
import {useToast} from '../hooks/use-toast';

export default function PracticeScreen({navigation}: any) {
    const {toast} = useToast();
    const [currentKanjiIndex, setCurrentKanjiIndex] = useState(0);
    const [sessionScore, setSessionScore] = useState(0);
    const [completedKanji, setCompletedKanji] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [lastAccuracy, setLastAccuracy] = useState(0);

    const practiceKanji = mockKanji.filter(k => !k.learned);
    const currentKanji = practiceKanji[currentKanjiIndex];
    const totalKanji = practiceKanji.length;
    const progress = (completedKanji / totalKanji) * 100;

    const handleKanjiComplete = (accuracy: number) => {
        setLastAccuracy(accuracy);
        setSessionScore(prev => prev + accuracy);
        setCompletedKanji(prev => prev + 1);
        setShowResult(true);

        if (accuracy >= 90) {
            toast({
                title: 'Excellent! 🎉',
                description: `Perfect drawing! ${accuracy}% accuracy`,
                variant: 'success',
            });
        } else if (accuracy >= 70) {
            toast({
                title: 'Good job! 👍',
                description: `Nice work! ${accuracy}% accuracy`,
                variant: 'success',
            });
        } else {
            toast({
                title: 'Keep trying! 💪',
                description: `${accuracy}% accuracy. Practice makes perfect!`,
                variant: 'info',
            });
        }

        setTimeout(() => {
            nextKanji();
        }, 2000);
    };

    const handleSkip = () => {
        setCompletedKanji(prev => prev + 1);
        nextKanji();
        toast({
            title: 'Skipped',
            description: "Don't worry, you can practice this kanji later!",
            variant: 'info',
        });
    };

    const nextKanji = () => {
        setShowResult(false);
        if (currentKanjiIndex < practiceKanji.length - 1) {
            setCurrentKanjiIndex(prev => prev + 1);
        } else {
            const averageScore = completedKanji > 0 ? Math.round(sessionScore / completedKanji) : 0;
            toast({
                title: 'Session Complete! 🎊',
                description: `Average accuracy: ${averageScore}%. Great work!`,
                variant: 'success',
            });
            navigation.goBack();
        }
    };

    const restartSession = () => {
        setCurrentKanjiIndex(0);
        setSessionScore(0);
        setCompletedKanji(0);
        setShowResult(false);
        setLastAccuracy(0);
    };

    if (!currentKanji) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No kanji to practice!</Text>
                <Text style={styles.emptyText}>You've learned all available kanji.</Text>
                <Button onPress={() => navigation.goBack()}>
                    <Text style={styles.buttonTextWhite}>Return to Dashboard</Text>
                </Button>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <Ionicons name="arrow-back" size={20} color="#666"/>
                    <Text style={styles.headerButtonText}>Back</Text>
                </TouchableOpacity>

                <View style={styles.progressInfo}>
                    <Text style={styles.progressLabel}>Progress</Text>
                    <Text style={styles.progressValue}>{completedKanji} / {totalKanji}</Text>
                </View>

                <TouchableOpacity onPress={restartSession} style={styles.headerButton}>
                    <Ionicons name="reload" size={20} color="#666"/>
                    <Text style={styles.headerButtonText}>Restart</Text>
                </TouchableOpacity>
            </View>

            <Card style={styles.card}>
                <Progress value={progress} height={8}/>
                <View style={styles.progressTextContainer}>
                    <Text style={styles.progressText}>Session Progress</Text>
                    <Text style={styles.progressText}>{Math.round(progress)}%</Text>
                </View>
            </Card>

            <Card style={styles.card}>
                <Text style={styles.sectionTitle}>Learn This Kanji</Text>
                <View style={styles.kanjiDisplay}>
                    <Text style={styles.kanjiCharacter}>{currentKanji.character}</Text>
                    <Text style={styles.kanjiMeaning}>{currentKanji.meaning}</Text>
                </View>

                <View style={styles.readingsContainer}>
                    <View style={styles.readingItem}>
                        <Text style={styles.readingLabel}>On'yomi (音読み)</Text>
                        <Text style={styles.readingValue}>{currentKanji.readings.onyomi.join(', ')}</Text>
                    </View>
                    <View style={styles.readingItem}>
                        <Text style={styles.readingLabel}>Kun'yomi (訓読み)</Text>
                        <Text style={styles.readingValue}>{currentKanji.readings.kunyomi.join(', ')}</Text>
                    </View>
                </View>

                <View style={styles.difficultyContainer}>
                    <Text style={styles.difficultyLabel}>Difficulty:</Text>
                    <View style={styles.stars}>
                        {[...Array(3)].map((_, i) => (
                            <Ionicons
                                key={i}
                                name={i < (currentKanji.difficulty === 'beginner' ? 1 : currentKanji.difficulty === 'intermediate' ? 2 : 3) ? 'star' : 'star-outline'}
                                size={16}
                                color={i < (currentKanji.difficulty === 'beginner' ? 1 : currentKanji.difficulty === 'intermediate' ? 2 : 3) ? '#F59E0B' : '#D1D5DB'}
                            />
                        ))}
                    </View>
                    <Text style={styles.difficultyText}>{currentKanji.difficulty}</Text>
                </View>
            </Card>

            {showResult ? (
                <Card style={styles.resultCard}>
                    <Text style={styles.resultEmoji}>{lastAccuracy >= 90 ? '🎉' : lastAccuracy >= 70 ? '👍' : '💪'}</Text>
                    <Text
                        style={styles.resultTitle}>{lastAccuracy >= 90 ? 'Excellent!' : lastAccuracy >= 70 ? 'Good Job!' : 'Keep Trying!'}</Text>
                    <Text style={styles.resultAccuracy}>Accuracy: <Text
                        style={styles.resultAccuracyValue}>{lastAccuracy}%</Text></Text>
                    <Text style={styles.resultMessage}>Moving to next kanji...</Text>
                </Card>
            ) : (
                <KanjiCanvas targetKanji={currentKanji.character} onComplete={handleKanjiComplete} onSkip={handleSkip}/>
            )}

            <Card style={styles.card}>
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{completedKanji}</Text>
                        <Text style={styles.statLabel}>Completed</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text
                            style={[styles.statValue, styles.statValueAccent]}>{completedKanji > 0 ? Math.round(sessionScore / completedKanji) : 0}%</Text>
                        <Text style={styles.statLabel}>Avg. Accuracy</Text>
                    </View>
                </View>
            </Card>

            <View style={styles.bottomSpacer}/>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: '#F5F7FA'},
    contentContainer: {padding: 16},
    header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16},
    headerButton: {flexDirection: 'row', alignItems: 'center', gap: 4, padding: 8},
    headerButtonText: {fontSize: 14, color: '#666', fontWeight: '600'},
    progressInfo: {alignItems: 'center'},
    progressLabel: {fontSize: 12, color: '#666'},
    progressValue: {fontSize: 16, fontWeight: '600', color: '#333'},
    card: {padding: 16, marginBottom: 16},
    progressTextContainer: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 8},
    progressText: {fontSize: 12, color: '#666'},
    sectionTitle: {fontSize: 18, fontWeight: '600', color: '#333', textAlign: 'center', marginBottom: 16},
    kanjiDisplay: {alignItems: 'center', marginBottom: 16},
    kanjiCharacter: {fontSize: 56, fontWeight: 'bold', color: '#4A90E2', marginBottom: 8},
    kanjiMeaning: {fontSize: 18, fontWeight: '500', color: '#333'},
    readingsContainer: {flexDirection: 'row', gap: 16, marginBottom: 16},
    readingItem: {flex: 1},
    readingLabel: {fontSize: 12, fontWeight: '500', color: '#666', marginBottom: 4},
    readingValue: {fontSize: 14, color: '#333'},
    difficultyContainer: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8},
    difficultyLabel: {fontSize: 14, color: '#666'},
    stars: {flexDirection: 'row', gap: 4},
    difficultyText: {fontSize: 14, fontWeight: '600', color: '#333', textTransform: 'capitalize'},
    resultCard: {padding: 24, alignItems: 'center', marginBottom: 16},
    resultEmoji: {fontSize: 64, marginBottom: 16},
    resultTitle: {fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 8},
    resultAccuracy: {fontSize: 18, color: '#666', marginBottom: 8},
    resultAccuracyValue: {fontWeight: 'bold', color: '#4A90E2'},
    resultMessage: {fontSize: 14, color: '#999'},
    statsContainer: {flexDirection: 'row', justifyContent: 'space-around'},
    statItem: {alignItems: 'center'},
    statValue: {fontSize: 24, fontWeight: 'bold', color: '#4A90E2', marginBottom: 4},
    statValueAccent: {color: '#F59E0B'},
    statLabel: {fontSize: 12, color: '#666'},
    emptyContainer: {flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24},
    emptyTitle: {fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 8},
    emptyText: {fontSize: 16, color: '#666', marginBottom: 24, textAlign: 'center'},
    buttonTextWhite: {color: '#fff', fontSize: 14, fontWeight: '600'},
    bottomSpacer: {height: 24},
});

