// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Файлы переводов
import enTranslation from './locales/en/translation.json';
import ruTranslation from './locales/ru/translation.json';

i18n
    .use(LanguageDetector) // Определяет язык браузера
    .use(initReactI18next) // Передает экземпляр i18n в react-i18next
    .init({
        fallbackLng: 'en', // Язык по умолчанию, если текущий не найден
        debug: true,
        resources: {
            en: {
                translation: enTranslation,
            },
            ru: {
                translation: ruTranslation,
            },
        },
        interpolation: {
            escapeValue: false, // React уже защищает от XSS
        },
    });

export default i18n;