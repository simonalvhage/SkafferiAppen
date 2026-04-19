import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { FontAwesome as Icon } from '@expo/vector-icons';
import 'react-native-gesture-handler';

import { AuthProvider } from './src/AuthContext';
import { COLORS, FONT } from './src/theme';

import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import ForgotScreen from './screens/ForgotScreen';
import HomeScreen from './screens/HomeScreen';
import SkafferiScreen from './screens/SkafferiScreen';
import SettingsScreen from './screens/SettingsScreen';
import ShoppingScreen from './screens/ShoppingScreen';
import ProductScreen from './screens/ProductScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TAB_ICONS = {
  Skanna: 'barcode',
  'Mitt Skafferi': 'home',
  Inköpslista: 'shopping-cart',
  Inställningar: 'gear',
};

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <Icon name={TAB_ICONS[route.name]} color={color} size={size} />
        ),
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 85 : 65,
        },
        tabBarLabelStyle: {
          fontSize: FONT.size.xs,
          ...FONT.medium,
        },
      })}
    >
      <Tab.Screen name="Skanna" component={HomeScreen} />
      <Tab.Screen name="Mitt Skafferi" component={SkafferiScreen} />
      <Tab.Screen name="Inköpslista" component={ShoppingScreen} />
      <Tab.Screen name="Inställningar" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

const stackScreenOptions = {
  headerStyle: {
    backgroundColor: COLORS.white,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTintColor: COLORS.text,
  headerTitleStyle: {
    ...FONT.semibold,
    fontSize: FONT.size.lg,
  },
  headerBackTitleVisible: false,
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={stackScreenOptions}>
          <Stack.Screen
            name="Hem"
            component={TabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Logga in" component={LoginScreen} />
          <Stack.Screen name="Skapa konto" component={SignupScreen} />
          <Stack.Screen name="Glömt lösenord" component={ForgotScreen} />
          <Stack.Screen name="Produkt" component={ProductScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
