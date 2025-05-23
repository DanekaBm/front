// frontend/src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector'; // Optional: detects user language

// Файлы переводов
import enTranslation from './locales/en/translation.json';
import ruTranslation from './locales/ru/translation.json';

i18n
  // detect user language
  // https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    fallbackLng: 'en', // Default language if translation for current language is missing
    debug: true, // Set to true for development, false for production (changed to true)

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default (React already protects against XSS)
    },
    // resources: Directly load translation files
    resources: {
        en: {
            translation: enTranslation,
        },
        ru: {
            translation: ruTranslation,
        },
    },
    ns: ['translation'], // Default namespace
    defaultNS: 'translation',
    react: {
      useSuspense: false // Set to true if you are using React.Suspense
    }
  });

export default i18n;
