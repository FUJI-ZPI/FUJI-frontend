
export const TOTAL_LEVELS = 60;
export const KANJI_PER_LEVEL = 10;
export const totalKanjiCount = TOTAL_LEVELS * KANJI_PER_LEVEL;

export const mockUser = {
  name: 'Tomasz',
  email: 'tomasz@gmail.com',
  avatar: '学',
  streak: 7,
  level: 5,
  rank: 12,
  experience: 1050,
};

export const mockKanji = Array.from({ length: totalKanjiCount }, (_, i) => ({
  id: i + 1,
  character: String.fromCharCode(0x4e00 + (i % 80)),
  learned: i % 3 !== 0, // Ok. 66% nauczonych
  level: Math.floor(i / KANJI_PER_LEVEL) + 1, // Przypisanie do poziomów 1-60
}));


export const mockAchievements = [
  { id: 1, title: 'First Steps', description: 'Complete your first practice session.', icon: '⭐', unlocked: true, unlockedAt: new Date(2024, 0, 5) },
  { id: 2, title: '7-Day Streak', description: 'Maintain a 7-day practice streak.', icon: '🔥', unlocked: true, unlockedAt: new Date(2024, 0, 15) },
  { id: 3, title: 'Kanji Master I', description: 'Learn 50 total kanji.', icon: '🥇', unlocked: true, unlockedAt: new Date(2024, 1, 1) },
  { id: 4, title: 'Level 10', description: 'Reach Level 10.', icon: '🚀', unlocked: false, unlockedAt: null },
  { id: 5, title: 'Intermediate Start', description: 'Begin learning intermediate kanji.', icon: '📘', unlocked: true, unlockedAt: new Date(2024, 1, 10) },
  { id: 6, title: 'Accuracy King', description: 'Achieve 95% accuracy in a session.', icon: '🎯', unlocked: false, unlockedAt: null },
];