import React, { createContext, useContext, useState, useEffect } from 'react';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import i18n from '../i18n';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState('ar');

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('language');
      if (saved) {
        setLanguageState(saved);
        i18n.changeLanguage(saved);
      }
    })();
  }, []);

  // Switching language changes text direction (RTL for Arabic).
  // A full RTL layout flip requires an app reload, which is standard
  // behavior for React Native apps that support RTL languages.
  const setLanguage = async (lang) => {
    const isRTL = lang === 'ar';
    await AsyncStorage.setItem('language', lang);
    i18n.changeLanguage(lang);
    setLanguageState(lang);

    if (I18nManager.isRTL !== isRTL) {
      I18nManager.forceRTL(isRTL);
      try {
        await Updates.reloadAsync();
      } catch (e) {
        // Updates.reloadAsync only works in a built app / dev client.
        // In Expo Go, the user may need to manually restart.
      }
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRTL: language === 'ar' }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
