import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
        "login.card_title": "Welcome to FUJI",
        "login.card_description": "Master Japanese characters with interactive learning",
        "login.button": "Continue with Google",
        "login.loading": "Loading...",

        "drawer.app_title": "FUJI",
        "drawer.app_subtitle": "Kanji Learning Platform",
        "drawer.user_name_default": "学習者",
        "drawer.logout": "Logout",

        "nav.dashboard": "Dashboard",
        "nav.practice": "Practice",
        "nav.vocabulary": "Vocabulary",
        "nav.chat": "Chat",
        "nav.leaderboard": "Leaderboard",
        "nav.profile": "Profile",
        "nav.settings": "Settings",

        "dashboard.greeting": "おはよう, {{userName}}! 👋",
        "dashboard.subtitle": "Ready to continue your Japanese journey?",
        
        "common.streak_label": "Day Streak",
        "common.level_label": "Current Level",
        "common.kanji_learned_label": "Kanji Learned",
        "common.practice": "Practice",
        "common.vocabulary": "Vocabulary",
        "common.back": "Back",
        "common.pl": "Polish",
        "common.en": "English",
        
        "profile.joined": "Joined",
        "profile.best_rank": "Best Rank",
        "profile.accuracy": "Accuracy",
        "profile.best_streak": "Best Streak",
        
        "profile.notifications_card_title": "Notifications",
        "profile.push_notifications_label": "Push Notifications",
        "profile.push_notifications_desc": "Receive important updates and reminders",
        "profile.reminders_label": "Practice Reminders",
        "profile.reminders_desc": "Daily reminders to keep your streak",
        
        "profile.notifications_saved": "Notification preferences saved!",
        "profile.reminders_updated": "Practice reminders updated.",

        'chat.placeholder': 'Type a message...',
        'chat.thinking': '考えています...',
        'chat.sessionInfo': 'The chatbot messages are not saved and will disappear after the session is cleared.'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', 
    fallbackLng: 'en', 
    interpolation: {
      escapeValue: false,
    }
  });

export default i18n;