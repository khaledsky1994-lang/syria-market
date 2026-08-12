import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from './ar.json';
import en from './en.json';

const savedLang = localStorage.getItem('language') || 'ar';

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
  },
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

function applyDirection(lang) {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
}

applyDirection(savedLang);

i18n.on('languageChanged', (lang) => {
  localStorage.setItem('language', lang);
  applyDirection(lang);
});

export default i18n;
