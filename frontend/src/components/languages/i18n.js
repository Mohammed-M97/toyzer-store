import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: 'http://localhost:5000/locales/{{lng}}.json', // URL to load the language files
    },
    fallbackLng: 'en',
    debug: true,
    detection: {
      order: ['queryString', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'htmlTag'],
      caches: ['cookie'],
    },
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;

/* detection: {
      order: [
        'htmlTag',
        'cookie',
        'localStorage',
        'sessionStorage',
        'navigator',
        'path',
        'subdomain'
      ],
      caches: ['cookie'],
    }, */