import React, { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  StyleSheet,
  ImageBackground,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import background from '../assets/skafferiet.jpeg';
import { Dimensions } from 'react-native';

export default function LoginScreen(props) {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [keyboardOffset] = useState(new Animated.Value(0));
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const Tab = createBottomTabNavigator();
  const Stack = createStackNavigator();
  const navigation = useNavigation();
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    const window = Dimensions.get('window');
    const headerHeightRatio = Platform.OS === 'ios' ? 0.4 : 0.3;
    setHeaderHeight(window.height * headerHeightRatio); 

    checkLoggedIn();
    const keyboardShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      keyboardWillShow
    );
    const keyboardHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      keyboardWillHide
    );

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
}, []);

  const checkLoggedIn = async () => {
    try{
    const storedUsername = await AsyncStorage.getItem('username');
    const storedApiKey = await AsyncStorage.getItem('apiKey');

    if (storedUsername && storedApiKey) {
      // User is already logged in, navigate to the main app
      setIsLoggedIn(true);
      global.api_key = storedApiKey;
    }
    }
    catch{}
  };

  const keyboardWillShow = (event) => {
    Animated.timing(keyboardOffset, {
        toValue: -150, // Adjust this value to control how much the overlay moves up
        duration: event.duration,
        useNativeDriver: true,
    }).start();
};


const keyboardWillHide = (event) => {
  Animated.timing(keyboardOffset, {
      toValue: 0,
      duration: event.duration,
      useNativeDriver: true,
  }).start();
};


  const handleLogin = async () => {
    try {
      console.log(`username=${username}&pin=${pin}`)
      const response = await fetch('http://alvhage.se/api/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `username=${username}&pin=${pin}`,
      });

      const json = await response.json();
      console.log(json)
      if (json.api_key) {
        // Save the username and API key
        await AsyncStorage.setItem('username', username);
        await AsyncStorage.setItem('apiKey', json.api_key);

        //rops.handleLogin(json.api_key);
        global.api_key = json.api_key;
        global.username = username;
        navigation.navigate('Skanna');
      } else {
        alert('Fel pinkod/login');
      }
    } catch (error) {
      alert('Gick inte att logga in');
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        <ImageBackground source={background} style={styles.backgroundImage}>
        <Animated.View style={[styles.overlay, { transform: [{ translateY: keyboardOffset }], top: headerHeight }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.contentContainer}
          >
            <Text style={styles.title}>Välkommen!</Text>
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Användarnamn"
                onChangeText={(text) => setUsername(text)}
                value={username}
              />
              <TextInput
                keyboardType="number-pad"
                style={styles.input}
                placeholder="Pin"
                onChangeText={(text) => setPin(text)}
                value={pin}
              />
              <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Log in</Text>
              </TouchableOpacity>
              <Text style={styles.title3} onPress={() => navigation.navigate("Glömt lösenord")}>Glömt Lösenord?</Text>
              <Text style={styles.title2}>Ny till SkafferiAppen?</Text>
              <TouchableOpacity
                style={styles.createAccountButton}
                onPress={() => navigation.navigate("Skapa konto")}
              >
                <Text style={styles.createAccountButtonText}>
                  Skapa nytt konto
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
          </Animated.View>
        </ImageBackground>
      </View>
    </TouchableWithoutFeedback>
  );
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    borderRadius: 30,
    backgroundColor: '#faf2f2',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  title: {
    fontSize: 30,
    marginBottom: 10,
  },
  title2: {
    fontSize: 20,
    marginBottom: 10,
    marginTop: 30,
  },
  title3: {
    fontSize: 13,
    marginTop: 0,
    textDecorationLine: 'underline',
  },
  form: {
    width: '80%',
  },
  input: {
    fontSize: 16,
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#FF9F79',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  createAccountButton: {
    backgroundColor: '#f8bea7',
    padding: 10,
    borderRadius: 5,
  },
  createAccountButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
