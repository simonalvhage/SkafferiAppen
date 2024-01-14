import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert,ImageBackground, Animated, TouchableWithoutFeedback,Keyboard,KeyboardAvoidingView } from 'react-native';
import background from '../assets/skafferiet.jpeg';
import { Dimensions } from 'react-native';
import { Platform } from 'react-native';

export default function ForgotScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [keyboardOffset] = useState(new Animated.Value(0));
    const [headerHeight, setHeaderHeight] = useState(0);

    useEffect(() => {
      const window = Dimensions.get('window');
      setHeaderHeight(window.height * 0.6); 
  
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

  const keyboardWillShow = (event) => {
    Animated.timing(keyboardOffset, {
        toValue: -300, // Adjust this value to control how much the overlay moves up
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

  const handleForgot = async () => {
    try {
      const response = await fetch('http://alvhage.se/api/forgot.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `email=${email}`,
      });
      const json = await response.json();
      console.log(json);
      if (json.message == "OK") {
        Alert.alert('SUCCESS', 'Skickat, Kolla din mail');
        navigation.navigate('LoginScreen');
      } else {
        Alert.alert('Error', json['error']);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Gick ej att skicka mail');
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
            <Text style={styles.title}>Återställ lösenord!</Text>
            <View style={styles.form}>
            <TextInput
                placeholder="E-mail"
                style={styles.input}
                onChangeText={(text) => setEmail(text)}
                value={email}
              />
              <TouchableOpacity style={styles.button} onPress={handleForgot}>
                <Text style={styles.buttonText}>Skicka!</Text>
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
  },
  title: {
    marginTop: 10,
    fontSize: 30,
  },
  title2: {
    fontSize: 20,
    marginBottom: 10,
    marginTop: 40,
  },
  form: {
    width: '80%',
    top: '4%',
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
