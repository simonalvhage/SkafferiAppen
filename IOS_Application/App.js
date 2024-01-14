import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import ForgotScreen from './screens/ForgotScreen';
import HomeScreen from './screens/HomeScreen';
import SkafferiScreen from './screens/SkafferiScreen';
import SettingsScreen from './screens/SettingsScreen';
import ShoppingScreen from './screens/ShoppingScreen';
import ProductScreen from './screens/ProductScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Dimensions } from 'react-native';


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function App() {

  const [loggedIn, setLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [refresh, setRefresh] = useState(false);

const window = Dimensions.get('window');
const headerHeight = window.height * 0.1; 


  const handleLogin = (data) => {
    setLoggedIn(true);
    setUserData(data);
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setUserData(null);
    setRefresh(!refresh);
  };

  return (
    <NavigationContainer key={refresh}>
      <Stack.Navigator>
        <Stack.Screen
          name="Tillbaka"
          component={TabStack}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Logga in"
          component={LoginScreen}
          options={{ headerShown: true, headerStyle: { height: headerHeight } }}
        />
         <Stack.Screen
          name="Skapa konto"
          component={SignupScreen}
          options={{ headerShown: true, headerStyle: { height: headerHeight } }}
        />
         <Stack.Screen
          name="Glömt lösenord"
          component={ForgotScreen}
          options={{ headerShown: true, headerStyle: { height: headerHeight } }}
        />
        <Stack.Screen
          name="Produkt"
          component={ProductScreen}
          options={{ headerShown: true, headerStyle: { height: headerHeight } }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function TabStack() {
  const window = Dimensions.get('window');
const headerHeight = window.height * 0.1; 
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Skanna"
        component={HomeScreen}
        options={{
          headerShown: false, 
          tabBarIcon: ({ color, size }) => (
            <Icon name="barcode" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Mitt Skafferi"
        component={SkafferiScreen}
        options={{
          headerShown: false, headerStyle: { height: headerHeight },
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Inköpslista"
        component={ShoppingScreen}
        options={{
          headerShown: false, headerStyle: { height: headerHeight },
          tabBarIcon: ({ color, size }) => (
            <Icon name="shopping-cart" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Inställningar"
        component={SettingsScreen}
        options={{
          headerShown: false, headerStyle: { height: headerHeight },
          tabBarIcon: ({ color, size }) => (
            <Icon name="gear" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
