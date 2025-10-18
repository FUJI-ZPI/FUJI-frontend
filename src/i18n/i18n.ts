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
    }
  },
  pl: {
    translation: {
        "login.card_title": "Witaj w FUJI",
        "login.card_description": "Opanuj japońskie znaki dzięki interaktywnej nauce",
        "login.button": "Kontynuuj z Google",
        "login.loading": "Ładowanie...",

        "drawer.app_title": "FUJI",
        "drawer.app_subtitle": "Platforma do Nauki Kanji",
        "drawer.user_name_default": "Uczeń",
        "drawer.logout": "Wyloguj",

        "nav.dashboard": "Panel Główny",
        "nav.practice": "Ćwiczenia",
        "nav.vocabulary": "Słownictwo",
        "nav.chat": "Czat",
        "nav.leaderboard": "Ranking",
        "nav.profile": "Profil",
        "nav.settings": "Ustawienia",

        "dashboard.greeting": "Dzień dobry, {{userName}}! 👋",
        "dashboard.subtitle": "Gotów kontynuować swoją japońską podróż?",
        
        "common.streak_label": "Seria Dni",
        "common.level_label": "Aktualny Poziom",
        "common.kanji_learned_label": "Nauczone Kanji",
        "common.practice": "Ćwicz",
        "common.vocabulary": "Słownictwo",
        "common.back": "Powrót",
        "common.pl": "Polski",
        "common.en": "Angielski",
        
        "profile.joined": "Dołączono",
        "profile.best_rank": "Najlepsza Pozycja",
        "profile.accuracy": "Dokładność",
        "profile.best_streak": "Najdłuższa Seria",
        
        "profile.settings_title": "Ustawienia", 

        "profile.notifications_card_title": "Powiadomienia",
        "profile.push_notifications_label": "Powiadomienia Push",
        "profile.push_notifications_desc": "Otrzymuj ważne aktualizacje i przypomnienia",
        "profile.reminders_label": "Przypomnienia o Ćwiczeniach",
        "profile.reminders_desc": "Codzienne przypomnienia, aby utrzymać serię",

        "profile.listening_lessons_label": "Lekcje ze słuchu", 
        "profile.listening_lessons_desc": "Trenuj wymowę i rozpoznawanie dźwięków",
        "profile.lessons_updated": "Ustawienia lekcji zapisane.",

        "profile.frequency_label": "Częstotliwość powiadomień",
        "profile.frequency_desc": "Wybierz jak często chcesz otrzymywać przypomnienia o nauce",
        "profile.frequency_updated": "Częstotliwość zaktualizowana.",
        
        "profile.select_frequency_title": "Wybierz częstotliwość",

        "profile.notifications_saved": "Ustawienia powiadomień zapisane!",
        "profile.reminders_updated": "Przypomnienia o ćwiczeniach zaktualizowane.",

        "profile.language_card_title": "Język", 
        "profile.current_language_label": "Wybierz język",
        "profile.language_label": "Język / Language", 
        "profile.language_desc": "Wybierz preferowany język aplikacji",
        "profile.language_changed_success": "Język zmieniony na {{lang}}.",
        "profile.select_language_title": "Wybierz język aplikacji",

        'chat.placeholder': 'Wpisz wiadomość...',
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