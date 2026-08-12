import React from 'react';
import { StatusBar } from 'expo-status-bar';
import './src/i18n';
import { AuthProvider } from './src/context/AuthContext';
import { LanguageProvider } from './src/context/LanguageContext';
import RootNavigator from './src/navigation';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <StatusBar style="auto" />
        <RootNavigator />
      </AuthProvider>
    </LanguageProvider>
  );
}
