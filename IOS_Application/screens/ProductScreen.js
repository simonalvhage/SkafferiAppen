import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity,Alert,Image,ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import bottleIcon from '../assets/bottle.png'; // Replace with your actual path
import skafferietImage from '../assets/skafferiet.jpeg'; // Replace with your actual path

function ProductScreen({ route }) {
    const navigation = useNavigation();
    const { text, semitext, action, barcode_data } = route.params;
    const [thumbnailUrl, setThumbnailUrl] = useState(null); // State to store the thumbnail URL
    

    useEffect(() => {
        // Fetch the thumbnail URL when the component mounts
        fetchProductThumbnail(barcode_data).then(url => {
            console.log(url)
            setThumbnailUrl(url);
        });
    }, [barcode_data]);

    const handleActionButton = () => {
        if (action === 'add') {
            handleAddPress(); // Call function to add product
        } else if (action === 'remove') {
            handleRemovePress(); // Call function to remove product
        }
    };

    const fetchProductThumbnail = async (data) => {
        try {
            // Make the first request to search for the product
            const response = await fetch("https://productsearch.gs1.se/foodservice/tradeItem/search", {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  "query": data,
                  "sortby": 0,
                  "sortDirection": 1
                })
            });
    
            const json = await response.json();
            
            // Check if the results array has at least one item and it has a thumbnail property
            if (json.results && json.results[0] && json.results[0].thumbnail) {
                const thumbnail = json.results[0].thumbnail;
                // Make the second request to get the thumbnail
                const thumbnailResponse = await fetch(`https://productsearch.gs1.se/foodservice/asset/${thumbnail}`);
    
                // Depending on what you want to do with the thumbnail response, you can process it here
                // For this example, I'll just return it as a blob (common for images)

                return thumbnailResponse.url;
            } else {
                console.log('Thumbnail not found in the response.');
            }
    
        } catch (error) {
            console.error("Error fetching product thumbnail:", error);
        }
    }
    

    const handleAddPress = async () => {
        console.log(`EAN=${barcode_data}&product=${text}`);
        if (barcode_data && text) {
          try {
            const response = await fetch('http://alvhage.se/api/post.php', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: `EAN=${barcode_data}&product=${text}&api_key=${global.api_key}`
            });
            const json = await response.text();
            console.log(json);
            navigation.goBack()
          } catch (error) {
            console.error(error);
          }
        }
      };

    const handleRemovePress = async () => {
    
        console.log(`EAN=${barcode_data}&product=${text}`);
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
                    body: `EAN=${barcode_data}&product=${text}&api_key=${global.api_key}&list=shopping`
                  });
                  const json = await response.text();
                  console.log(json);
                } catch (error) {
                  console.error(error);
                }
                
                try {
                  const response = await fetch('http://alvhage.se/api/delete.php?EAN=' + barcode_data + "&api_key=" + global.api_key, {
                    method: 'GET'
                  });
                  const json = await response.text();
                  console.log(json);
                  navigation.goBack()
                } catch (error) {
                  console.error(error);
                }
              },
            },
            {
              text: 'Radera',
              onPress: async () => {
                try {
                  const response = await fetch('http://alvhage.se/api/delete.php?EAN=' + barcode_data + "&api_key=" + global.api_key, {
                    method: 'GET'
                  });
                  const json = await response.text();
                  console.log(json);
                  navigation.goBack()
                } catch (error) {
                  console.error(error);
                }
              },
              style: 'destructive',
            },
            {text: 'Avbryt',
            onPress: async () => {},
          }
          ],
          { cancelable: true }
        );
      };

      return (
        <ImageBackground source={skafferietImage} style={styles.background}>
            <View style={styles.contentContainer}>
                <Image source={thumbnailUrl ? { uri: thumbnailUrl } : bottleIcon} style={styles.thumbnail} resizeMode='contain' />
                <Text style={styles.mainText}>{text}</Text>
                <TouchableOpacity style={styles.actionButton} onPress={handleActionButton}>
                    <Text style={styles.buttonText}>{action === 'add' ? 'Lägg till produkt' : 'Radera produkt'}</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
      }    

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'flex',
},
  contentContainer: {
      backgroundColor: 'rgba(255,255,255,1)',
      alignItems: 'center',
      padding: 20,
      borderRadius: 30,
      width: '100%',
      height: '80%',
      top: 300

  },
  thumbnail: {
    width: 150,
    height: 250,
    marginBottom: 10,
},
  mainText: {
      fontSize: 30,
      fontWeight: 'bold',
      textAlign: 'center',
  },
  actionButton: {
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderRadius: 10,
      backgroundColor: '#9EECFF',
      marginTop: 20,
      top: 0
  },
  buttonText: {
      color: 'white',
      fontSize: 20,
  },
});
export default ProductScreen;
