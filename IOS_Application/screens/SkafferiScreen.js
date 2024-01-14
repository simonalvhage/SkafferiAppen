import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, StyleSheet, FlatList, Alert, TextInput, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from 'react-native';
import {useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SkafferiScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);


  useFocusEffect(
    React.useCallback(() => {
    checkLoggedIn();
}));


  const checkLoggedIn = async () => {
    try{
    const storedUsername = await AsyncStorage.getItem('username');
    const storedApiKey = await AsyncStorage.getItem('apiKey');

    if (storedUsername && storedApiKey) {
      // User is already logged in, navigate to the main app
      setIsLoggedIn(true);
      global.api_key = storedApiKey;
    }
    else{
      setIsLoggedIn(false);
    }
    }
    catch{}
  };

  const fetchData = async () => {
    try {
      const response = await fetch('http://alvhage.se/api/get.php?api_key=' + global.api_key, {
        method: 'GET'
      });
      const json = await response.json();
      if (json && json.info) {
        setData(json.info);
        setFilteredData(json.info);
      }
      else {
        setData([]);
        setFilteredData([]);
      }
      //console.log(json);
    } catch (error) {
      console.error(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [navigation]),
  );

  const removeItem = async (item) => {
    Alert.alert(
      'Lägg till i inköpslistan?',
      'Vill du ta bort produkten och lägga till den i din inköpslista istället?',
      [
        {
          text: 'Lägg till i inköpslista',
          onPress: async () => {
            try {
              const response = await fetch('http://alvhage.se/api/post.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `EAN=${item.EAN}&product=${item.product}&api_key=${global.api_key}&list=shopping`
              });
              const json = await response.text();
              console.log(json);

            } catch (error) {
              console.error(error);
            }
            try {
              const response = await fetch('http://alvhage.se/api/delete.php?EAN=' + item.EAN + "&api_key=" + global.api_key, {
                method: 'GET'
              });
              const json = await response.text();
              console.log(json);
            } catch (error) {
              console.error(error);
            }
            const updatedData2 = data.filter((dataItem) => dataItem.EAN !== item.EAN);
            setData(updatedData2);
            setFilteredData(updatedData2);
          },
        },
        {
          text: 'Radera',
          onPress: async () => {
            try {
              const response = await fetch('http://alvhage.se/api/delete.php?EAN=' + item.EAN + "&api_key=" + global.api_key, {
                method: 'GET'
              });
              const json = await response.text();
              console.log(json);
            } catch (error) {
              console.error(error);
            }
            const updatedData = data.filter((dataItem) => dataItem.EAN !== item.EAN);
            setData(updatedData);
            setFilteredData(updatedData);
          },
          style: 'destructive',
        },
        { text: 'Avbryt', onPress: () => { } }
      ],
      { cancelable: true }
    );
  };

  const handleSearch = (text) => {
    setSearchText(text);
    const filteredItems = data.filter((item) =>
    item.product?.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredData(filteredItems);
  };

  const handleRemoveItem = (item) => () => {
    removeItem(item);
  }

  const handleAddPress = async (item) => {
    console.log(`EAN=${item}&product=${item}`);
    if (item) {
      try {
        const response = await fetch('http://alvhage.se/api/post.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `EAN=${item}&product=${item}&api_key=${global.api_key}`
        });
        const json = await response.text();
        console.log(json);
        
        // Assume the product was added successfully
        // Create a new object for the added item
        const newItem = { EAN: item, product: item };
  
        // Update the state
        setData((prevData = []) => [...prevData, newItem]);
        setFilteredData((prevFilteredData = []) => [...prevFilteredData, newItem]);
        
  
      } catch (error) {
        console.error(error);
      }
    }
  };
  

  const clearSearch = async() => {
    handleAddPress(searchText);;
    setSearchText('');
    await fetchData();
  };

  const ListItem = React.memo(({ item, onRemove }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemContent}>
        <Text style={styles.itemText}>{item.product}</Text>
        <Text style={styles.dateText}>Datum tillagt: {item.datum ? item.datum : '22/8/2023'}</Text>
      </View>
      <TouchableOpacity onPress={onRemove} style={styles.crossIconContainer}>
        <Text style={styles.crossIcon}>•••</Text>
      </TouchableOpacity>
    </View>
  ));
  
  
  
  

  return (
    <View style={styles.container}>
        {!isLoggedIn ? (
          <View style={styles.centerContainer}>
            <Text style={styles.centerText}>
              Logga in/Skapa konto om du vill använda denna funktionen 
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Mitt Skafferi</Text>
            </View>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Sök eller lägg till en produkt här"
                  value={searchText}
                  onChangeText={handleSearch}
                />
                {searchText !== '' && (
                  <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
                    <Text style={styles.clearButtonText}>Lägg till</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableWithoutFeedback>
            <FlatList
 data={filteredData}
 keyExtractor={(item) => item.EAN}
 renderItem={({ item }) => <ListItem item={item} onRemove={handleRemoveItem(item)} />}
 initialNumToRender={10}  // Adjust as needed
 windowSize={5}  // Adjust as needed
/>
          </>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 16,
    
  },

  centerText:{
    top:50,
    left: 5,
  },
  titleContainer: {
    marginTop: 40,
    marginBottom: 16,
    paddingHorizontal: 16, // Added padding here to keep the title indented
    
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16, // Added padding here to keep the search input indented
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    height: 35,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray'
  },
  clearButton: {
    marginLeft: 8,
    padding: 8,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8, // Reduced the vertical padding
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray'
  },
  crossIcon: {
    fontSize: 22,
    color: 'black',
    paddingHorizontal: 16, // Added padding here to ensure touch area and alignment are good
  },
  itemText: {
    left: 20,
    fontSize: 15,
    fontWeight: 'bold',
    color: 'black',
  },
  dateText: {
    left: 20,
    fontSize: 14,
    color: 'gray',
    paddingHorizontal: 0,  // Padding added here
    paddingTop: 4,
  },
  crossIcon: {
    right: 10,
    fontSize: 22,
    color: 'lightgray',
  },
});
