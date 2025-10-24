
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


export interface Kanji {
    id: string;
    character: string;
    meaning: string;
    learned: boolean;
}

export const mockKanji2: Kanji[] = [
    { id: '1', character: '一', meaning: 'one', learned: true },
    { id: '2', character: '二', meaning: 'two', learned: false },
    { id: '3', character: '三', meaning: 'three', learned: true },
    { id: '4', character: '四', meaning: 'four', learned: false },
    { id: '5', character: '五', meaning: 'five', learned: true },
    { id: '6', character: '六', meaning: 'six', learned: false },
    { id: '7', character: '七', meaning: 'seven', learned: true },
    { id: '8', character: '八', meaning: 'eight', learned: false },
    { id: '9', character: '九', meaning: 'nine', learned: true },
    { id: '10', character: '十', meaning: 'ten', learned: false },
    { id: '11', character: '人', meaning: 'person', learned: true },
    { id: '12', character: '口', meaning: 'mouth', learned: false },
    { id: '13', character: '日', meaning: 'sun', learned: true },
    { id: '14', character: '月', meaning: 'moon', learned: false },
    { id: '15', character: '田', meaning: 'field', learned: true },
    { id: '16', character: '力', meaning: 'power', learned: false },
    { id: '17', character: '山', meaning: 'mountain', learned: true },
    { id: '18', character: '川', meaning: 'river', learned: false },
    { id: '19', character: '大', meaning: 'big', learned: true },
    { id: '20', character: '女', meaning: 'woman', learned: false },
    { id: '21', character: '子', meaning: 'child', learned: true },
    { id: '22', character: '小', meaning: 'small', learned: false },
    { id: '23', character: '上', meaning: 'up', learned: true },
    { id: '24', character: '下', meaning: 'down', learned: false },
    { id: '25', character: '中', meaning: 'middle', learned: true },
    { id: '26', character: '本', meaning: 'book', learned: false },
    { id: '27', character: '円', meaning: 'yen', learned: true },
    { id: '28', character: '出', meaning: 'exit', learned: false },
    { id: '29', character: '右', meaning: 'right', learned: true },
    { id: '30', character: '左', meaning: 'left', learned: false },
    { id: '31', character: '王', meaning: 'king', learned: true },
    { id: '32', character: '生', meaning: 'life', learned: false },
    { id: '33', character: '花', meaning: 'flower', learned: true },
    { id: '34', character: '空', meaning: 'sky', learned: false },
    { id: '35', character: '見', meaning: 'see', learned: true },
    { id: '36', character: '聞', meaning: 'hear', learned: false },
    { id: '37', character: '行', meaning: 'go', learned: true },
    { id: '38', character: '来', meaning: 'come', learned: false },
    { id: '39', character: '学', meaning: 'study', learned: true },
    { id: '40', character: '校', meaning: 'school', learned: false },
    { id: '41', character: '名', meaning: 'name', learned: true },
    { id: '42', character: '雨', meaning: 'rain', learned: false },
    { id: '43', character: '車', meaning: 'car', learned: true },
    { id: '44', character: '話', meaning: 'speak', learned: false },
    { id: '45', character: '電', meaning: 'electricity', learned: true },
    { id: '46', character: '気', meaning: 'spirit', learned: false },
    { id: '47', character: '魚', meaning: 'fish', learned: true },
    { id: '48', character: '鳥', meaning: 'bird', learned: false },
    { id: '49', character: '立', meaning: 'stand', learned: true },
    { id: '50', character: '休', meaning: 'rest', learned: false },
];


// KanjiLevelsScreen
export interface KanjiLevel {
  id: number;
  level: number;
  title: string;
  kanjiLearned: number;
  kanjiTotal: number;
}

// KanjiListScreen
export interface KanjiCharacter {
  id: string;
  level: number;
  character: string;
  learned: boolean;
}

// KanjiDetailScreen
export interface KanjiDetail {
  id: string;
  character: string;
  strokeCount: number;

  meanings: string[];
  mnemonic: string;

  readings: {
    onyomi: { reading: string; label: string }[];
    kunyomi: { reading: string; label: string }[];
  };

  examples: {
    word: string;
    reading: string;
    meaning: string;
  }[];
}


// KanjiLevelsScreen.tsx
export const mockKanjiLevels: KanjiLevel[] = [
  { id: 1, level: 1, title: 'Beginner', kanjiLearned: 10, kanjiTotal: 60 },
  { id: 2, level: 2, title: 'Beginner', kanjiLearned: 7, kanjiTotal: 60 },
  { id: 3, level: 3, title: 'Beginner', kanjiLearned: 7, kanjiTotal: 60 },
  { id: 4, level: 4, title: 'Beginner', kanjiLearned: 7, kanjiTotal: 60 },
  { id: 5, level: 5, title: 'Beginner', kanjiLearned: 7, kanjiTotal: 60 },
  { id: 6, level: 6, title: 'Beginner', kanjiLearned: 7, kanjiTotal: 60 },
];

export const mockKanjiList_Level1: KanjiCharacter[] = [
  { id: 'k1', level: 1, character: '一', learned: true },
  { id: 'k2', level: 1, character: '二', learned: true },
  { id: 'k3', level: 1, character: '三', learned: false },
  { id: 'k4', level: 1, character: '四', learned: true },
  { id: 'k5', level: 1, character: '五', learned: false },
  { id: 'k6', level: 1, character: '六', learned: true },
  { id: 'k7', level: 1, character: '七', learned: true },
  { id: 'k8', level: 1, character: '八', learned: false },
  { id: 'k9', level: 1, character: '九', learned: true },
  { id: 'k10', level: 1, character: '十', learned: true },
  { id: 'k11', level: 1, character: '人', learned: false },
  { id: 'k13', level: 1, character: '日', learned: true },
  { id: 'k23', level: 1, character: '上', learned: true },
  { id: 'k-mizu', level: 1, character: '水', learned: true },
];


// KanjiDetailScreen.tsx
export const mockKanjiDetails: { [key: string]: KanjiDetail } = {
  
  'k23': {
    id: 'k23',
    character: '上',
    strokeCount: 3,
    meanings: ['Above', 'Up', 'Over'],
    mnemonic: 'You find a toe on the ground. It\'s weird, because it\'s above the ground, not where toes belong.',
    readings: {
      onyomi: [{ reading: 'ジョウ', label: 'Chinese' }],
      kunyomi: [
        { reading: 'うえ', label: 'Japanese' },
        { reading: 'あ', label: 'Japanese' },
        { reading: 'のぼ', label: 'Japanese' },
        { reading: 'うわ', label: 'Japanese' },
        { reading: 'かみ', label: 'Japanese' },
      ],
    },
    examples: [
      { word: '上', reading: 'うえ', meaning: 'Above, up, on top' },
      { word: '上げる', reading: 'あげる', meaning: 'To Lift Something' },
      { word: '上手', reading: 'じょうず', meaning: 'Good At, skillful' },
      { word: '上る', reading: 'のぼる', meaning: 'To Climb, to go up' },
    ],
  },
  
  'k1': {
    id: 'k1',
    character: '一',
    strokeCount: 1,
    meanings: ['One', '1'],
    mnemonic: 'Lying on the ground is something that looks just like the ground, the number One. Why is this One lying down? It\'s been shot by the number two.',
    readings: {
      onyomi: [{ reading: 'いち', label: 'Chinese' }, { reading: 'いつ', label: 'Chinese' }],
      kunyomi: [{ reading: 'ひと', label: 'Japanese' }],
    },
    examples: [
      { word: '一つ', reading: 'ひとつ', meaning: 'One thing' },
      { word: '一日', reading: 'いちにち', meaning: 'One day' },
      { word: '一番', reading: 'いちばん', meaning: 'Number one, the best' },
    ],
  },
  
  'k-mizu': { 
    id: 'k-mizu',
    character: '水',
    strokeCount: 4,
    meanings: ['Water'],
    mnemonic: 'A big splash of water in the middle, with smaller drops flying off to the sides.',
    readings: {
      onyomi: [{ reading: 'スイ', label: 'Chinese' }],
      kunyomi: [{ reading: 'みず', label: 'Japanese' }],
    },
    examples: [
      { word: '水', reading: 'みず', meaning: 'Water' },
      { word: '水曜日', reading: 'すいようび', meaning: 'Wednesday' },
    ],
  },
};