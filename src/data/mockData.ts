
export const TOTAL_LEVELS = 60;
export const KANJI_PER_LEVEL = 10;
export const totalKanjiCount = TOTAL_LEVELS * KANJI_PER_LEVEL;

export const mockUser = {
  name: 'Tomasz',
  email: 'tomasz@gmail.com',
  avatar: '学',
  streak: 7,
  level: 5,
  level_name: 'Beginner Level',
  rank: 12,
  language: 'eng'
};

// Realistic kanji data for practice
export const mockKanji = [
    {
        id: 1,
        character: '水',
        meaning: 'water',
        learned: false,
        level: 1,
        difficulty: 'beginner',
        readings: {onyomi: ['スイ'], kunyomi: ['みず']}
    },
    {
        id: 2,
        character: '火',
        meaning: 'fire',
        learned: false,
        level: 1,
        difficulty: 'beginner',
        readings: {onyomi: ['カ'], kunyomi: ['ひ']}
    },
    {
        id: 3,
        character: '木',
        meaning: 'tree',
        learned: false,
        level: 1,
        difficulty: 'beginner',
        readings: {onyomi: ['モク', 'ボク'], kunyomi: ['き']}
    },
    {
        id: 4,
        character: '金',
        meaning: 'gold, money',
        learned: true,
        level: 1,
        difficulty: 'beginner',
        readings: {onyomi: ['キン'], kunyomi: ['かね']}
    },
    {
        id: 5,
        character: '土',
        meaning: 'earth',
        learned: false,
        level: 1,
        difficulty: 'beginner',
        readings: {onyomi: ['ド', 'ト'], kunyomi: ['つち']}
    },
    {
        id: 6,
        character: '日',
        meaning: 'sun, day',
        learned: true,
        level: 1,
        difficulty: 'beginner',
        readings: {onyomi: ['ニチ'], kunyomi: ['ひ', 'か']}
    },
    {
        id: 7,
        character: '月',
        meaning: 'moon, month',
        learned: false,
        level: 1,
        difficulty: 'beginner',
        readings: {onyomi: ['ゲツ', 'ガツ'], kunyomi: ['つき']}
    },
    {
        id: 8,
        character: '人',
        meaning: 'person',
        learned: true,
        level: 1,
        difficulty: 'beginner',
        readings: {onyomi: ['ジン', 'ニン'], kunyomi: ['ひと']}
    },
    {
        id: 9,
        character: '山',
        meaning: 'mountain',
        learned: false,
        level: 1,
        difficulty: 'beginner',
        readings: {onyomi: ['サン'], kunyomi: ['やま']}
    },
    {
        id: 10,
        character: '川',
        meaning: 'river',
        learned: false,
        level: 1,
        difficulty: 'beginner',
        readings: {onyomi: ['セン'], kunyomi: ['かわ']}
    },
    {
        id: 11,
        character: '大',
        meaning: 'big',
        learned: true,
        level: 2,
        difficulty: 'beginner',
        readings: {onyomi: ['ダイ', 'タイ'], kunyomi: ['おお']}
    },
    {
        id: 12,
        character: '小',
        meaning: 'small',
        learned: false,
        level: 2,
        difficulty: 'beginner',
        readings: {onyomi: ['ショウ'], kunyomi: ['ちい', 'こ']}
    },
    {
        id: 13,
        character: '中',
        meaning: 'middle, inside',
        learned: false,
        level: 2,
        difficulty: 'beginner',
        readings: {onyomi: ['チュウ'], kunyomi: ['なか']}
    },
    {
        id: 14,
        character: '上',
        meaning: 'up, above',
        learned: true,
        level: 2,
        difficulty: 'beginner',
        readings: {onyomi: ['ジョウ'], kunyomi: ['うえ', 'あ']}
    },
    {
        id: 15,
        character: '下',
        meaning: 'down, below',
        learned: false,
        level: 2,
        difficulty: 'beginner',
        readings: {onyomi: ['カ', 'ゲ'], kunyomi: ['した', 'さ', 'くだ']}
    },
    {
        id: 16,
        character: '左',
        meaning: 'left',
        learned: false,
        level: 2,
        difficulty: 'beginner',
        readings: {onyomi: ['サ'], kunyomi: ['ひだり']}
    },
    {
        id: 17,
        character: '右',
        meaning: 'right',
        learned: true,
        level: 2,
        difficulty: 'beginner',
        readings: {onyomi: ['ウ', 'ユウ'], kunyomi: ['みぎ']}
    },
    {
        id: 18,
        character: '本',
        meaning: 'book, origin',
        learned: false,
        level: 2,
        difficulty: 'beginner',
        readings: {onyomi: ['ホン'], kunyomi: ['もと']}
    },
    {
        id: 19,
        character: '車',
        meaning: 'car, vehicle',
        learned: false,
        level: 2,
        difficulty: 'intermediate',
        readings: {onyomi: ['シャ'], kunyomi: ['くるま']}
    },
    {
        id: 20,
        character: '学',
        meaning: 'learn, study',
        learned: true,
        level: 2,
        difficulty: 'intermediate',
        readings: {onyomi: ['ガク'], kunyomi: ['まな']}
    },
    ...Array.from({length: totalKanjiCount - 20}, (_, i) => ({
        id: i + 21,
        character: String.fromCharCode(0x4e00 + ((i + 20) % 80)),
        meaning: 'kanji',
        learned: (i + 20) % 3 !== 0,
        level: Math.floor((i + 20) / KANJI_PER_LEVEL) + 1,
        difficulty: (i + 20) % 3 === 0 ? 'beginner' : (i + 20) % 3 === 1 ? 'intermediate' : 'advanced',
        readings: {onyomi: ['カン'], kunyomi: ['かん']}
    }))
];


export const mockAchievements = [
  { id: 1, title: 'First Steps', description: 'Complete your first practice session.', icon: '⭐', unlocked: true, unlockedAt: new Date(2024, 0, 5) },
  { id: 2, title: '7-Day Streak', description: 'Maintain a 7-day practice streak.', icon: '🔥', unlocked: true, unlockedAt: new Date(2024, 0, 15) },
  { id: 3, title: 'Kanji Master I', description: 'Learn 50 total kanji.', icon: '🥇', unlocked: true, unlockedAt: new Date(2024, 1, 1) },
  { id: 4, title: 'Level 10', description: 'Reach Level 10.', icon: '🚀', unlocked: false, unlockedAt: null },
  { id: 5, title: 'Intermediate Start', description: 'Begin learning intermediate kanji.', icon: '📘', unlocked: true, unlockedAt: new Date(2024, 1, 10) },
  { id: 6, title: 'Accuracy King', description: 'Achieve 95% accuracy in a session.', icon: '🎯', unlocked: false, unlockedAt: null },
];
