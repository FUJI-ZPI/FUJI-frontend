
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

export const mockKanji = Array.from({ length: totalKanjiCount }, (_, i) => ({
  id: i + 1,
  character: String.fromCharCode(0x4e00 + (i % 80)),
  learned: i % 3 !== 0,
  level: Math.floor(i / KANJI_PER_LEVEL) + 1,
}));


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