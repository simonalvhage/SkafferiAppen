import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';


export default function SettingsScreen({ handleLogin, handleLogout }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
    checkLoggedIn();
}));

const checkLoggedIn = async () => {
  try {
    const storedUsername = await AsyncStorage.getItem('username');
    const storedApiKey = await AsyncStorage.getItem('apiKey');

    if (storedUsername && storedApiKey) {
      // User is already logged in, navigate to the main app
      setIsLoggedIn(true);
      global.api_key = storedApiKey;

      // Set global.username from AsyncStorage only if it's not already set
      if (!global.username) {
        global.username = storedUsername;
      }
    }
  } catch (error) {
    console.error(error);
  }
};


  const handleLogoutPress = async () => {
    await AsyncStorage.removeItem('username');
    await AsyncStorage.removeItem('apiKey');
    global.api_key = null;
    setIsLoggedIn(false);
    navigation.navigate('Skanna');
  };

  const handleLoginPress = () => {
    navigation.navigate('Logga in');
  };


  const handleDelete = async () => {
    Alert.alert(
      'Godkännande',
      'Är du säker att du vill radera ditt konto :(',
      [
        {
          text: 'Avbryt :)',
          style: 'cancel',
        },
        {
          text: 'Radera konto :(',
          style: 'destructive',
          onPress: performDelete,
        },
      ]
    );
  };
  const handleDeleteAllPantry = async () => {
    Alert.alert(
      'Godkännande',
      'Är du säker att du vill rensa hela ditt skafferi?',
      [
        {
          text: 'Avbryt',
          style: 'cancel',
        },
        {
          text: 'Radera alla varor',
          style: 'destructive',
          onPress: performDeleteProducts,
        },
      ]
    );
  };
  const handleDeleteAllShopping = async () => {
    Alert.alert(
      'Godkännande',
      'Är du säker att du vill rensa hela din inköpslista?',
      [
        {
          text: 'Avbryt',
          style: 'cancel',
        },
        {
          text: 'Radera alla varor',
          style: 'destructive',
          onPress: performDeleteProductsShopping,
        },
      ]
    );
  };

  const performDeleteProducts = async () => {
    try {
      const response = await fetch('http://alvhage.se/api/delete.php?EAN=ALLPRODUCTS&api_key=' + global.api_key, {
        method: 'GET'
      });
      const json = await response.text();
      console.log(json);
    } catch (error) {
      console.error(error);
    }
  };

  const performDeleteProductsShopping = async () => {
    try {
      const response = await fetch('http://alvhage.se/api/delete.php?EAN=ALLPRODUCTS&api_key=' + global.api_key + '&list=shopping', {
        method: 'GET'
      });
      const json = await response.text();
      console.log(json);
    } catch (error) {
      console.error(error);
    }
  };

  const performDelete = async () => {
    AsyncStorage.removeItem('username');
    AsyncStorage.removeItem('apiKey');
    try {
      const response = await fetch('http://alvhage.se/api/delete_user.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `api_key=${global.api_key}`,
      });
      const json = await response.json();
      console.log(json);
      if (json.success) {
        Alert.alert('SUCCESS', 'Konto raderat, hoppas vi ses igen');
        handleLogoutPress();
      } else {
        Alert.alert('Error', json['error']);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Gick inte att radera konto, vänligen maila simon.alvhage@gmail.com');
    }
  };

  return (
    <View style={styles.container}>
        <Image source={require('../assets/person.png')} style={styles.profileIcon} />
        {!isLoggedIn ? (
            <TouchableOpacity style={styles.button} onPress={handleLoginPress}>
                <Text style={styles.buttonText}>Logga in/Skapa konto</Text>
            </TouchableOpacity>
        ) : (
            <>  
            <Text style={styles.username}>Välkommen {global.username}</Text>
         <TouchableOpacity style={styles.button} onPress={handleDeleteAllPantry}>
  <Text style={styles.buttonText}>Radera Skafferiet</Text>
</TouchableOpacity>
<TouchableOpacity style={styles.button} onPress={handleDeleteAllShopping}>
  <Text style={styles.buttonText}>Radera inköpslistan</Text>
</TouchableOpacity>
<TouchableOpacity style={styles.button} onPress={handleLogoutPress}>
  <Text style={styles.buttonText}>Logga ut</Text>
</TouchableOpacity>
<TouchableOpacity style={styles.button} onPress={handleDelete}>
  <Text style={styles.buttonText}>Radera konto</Text>
</TouchableOpacity>
            </>
        )}
    </View>
);
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      marginTop: 150,
      alignItems: 'center',
      justifyContent: 'center', // This will vertically center items
  },
  profileIcon: {
      width: 100,
      height: 129,
      marginBottom: 20, // Space between the icon and the buttons
  },
  button: {
      backgroundColor: '#FF9F79',
      padding: 10,
      borderRadius: 5,
      marginBottom: 30,
      width: '80%',
  },
  buttonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
  },
  username: {
    fontSize: 20,
    marginBottom: 150,
  }
});