import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

// Get the base URL - in production it will be your Render URL, in development it will be localhost
const getBaseURL = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://toyzer-store.onrender.com';
  }
  return 'http://localhost:5000';
};

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: `${getBaseURL()}/locales/{{lng}}.json`, // Dynamic URL based on environment
    },
    fallbackLng: 'en',
    debug: false,
    detection: {
      order: ['queryString', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'htmlTag'],
      caches: ['cookie'],
    },
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;