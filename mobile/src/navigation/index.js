import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ListingDetailScreen from '../screens/ListingDetailScreen';
import CreateListingScreen from '../screens/CreateListingScreen';
import ChatScreen from '../screens/ChatScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import AdminScreen from '../screens/AdminScreen';
import colors from '../theme/colors';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const ICONS = { HomeTab: '🏠', SearchTab: '🔍', ChatTab: '💬', ProfileTab: '👤' };

function Tabs() {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarIcon: () => <Text style={{ fontSize: 18 }}>{ICONS[route.name]}</Text>,
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: t('home') }} />
      <Tab.Screen name="SearchTab" component={SearchScreen} options={{ title: t('search') }} />
      <Tab.Screen name="ChatTab" component={ChatListScreen} options={{ title: t('messages') }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: t('profile') }} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { t } = useTranslation();
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Main" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen name="ListingDetail" component={ListingDetailScreen} options={{ title: '' }} />
        <Stack.Screen name="CreateListing" component={CreateListingScreen} options={{ title: t('postAd') }} />
        <Stack.Screen name="Chat" component={ChatScreen} options={{ title: '' }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: t('login') }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: t('register') }} />
        <Stack.Screen name="Admin" component={AdminScreen} options={{ title: t('adminDashboard') }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
