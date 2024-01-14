import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Alert,TouchableOpacity, Dimensions} from 'react-native';
import { Camera } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const scannerWidth = windowWidth * 0.7;
const scannerHeight = windowHeight * 0.2;

export default function HomeScreen() {
  const [borderColors, setBorderColors] = useState('white'); // Add this for dynamic border color change
  const [isActive, setIsActive] = useState(true);
  const [scanned, setScanned] = useState(false);
  const [text, setText] = useState('Not yet scanned');
  const [barcode_data, setBarcode_data] = useState('');
  const [athome, setAthome] = useState(false);
  const [unknownproduct,SetUnknownproduct] = useState(false)
  const [alertShown, setAlertShown] = useState(false);
  const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
    checkLoggedIn();
}));

const toggleFlashlight = () => {
  if (flashMode === Camera.Constants.FlashMode.off) {
    setFlashMode(Camera.Constants.FlashMode.torch);
  } else {
    setFlashMode(Camera.Constants.FlashMode.off);
  }
};

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

  const handleNewProductPress = async () => {
    Alert.prompt(
      "Skriv in produktens namn!",
      "Skriv gärna in produkt och varumärke t.ex 'Eldorado Kanel'",
      [
        {
          text: "Cancel",
          onPress: () => {console.log("Cancel Pressed"),                  
          setBorderColors('white'); // Reset border color to white
          setScanned(false); // Reset scanned state to false, enabling scanning again
        },
          style: "cancel"
          
        },
        {
          text: "OK",
          onPress: new_product => {
            onPressItem(new_product)
          }
        }
      ],
      "plain-text"
    );
  };

  const onPressItem =(new_product)=>{
    console.log(new_product);
    setText(new_product);
    SetUnknownproduct(false)
    setBorderColors('green');
    setTimeout(() => {
      navigation.navigate('Produkt', {
        text: new_product,
        semitext: "Finns inte i ditt skafferi",
        action: "add",
        barcode_data: barcode_data
    });
  }, 500); // 1-second delay
}


const showLoginAlert = () => {
    if (alertShown) return; // If the alert has been shown, exit early

    Alert.alert(
        "Konto behövs",
        "Logga in/Skapa konto för att använda funktionen",
        [
            {
                text: "Avbryt",
                style: "cancel"
            },
            {
                text: "Logga in/Skapa konto",
                onPress: () => navigation.navigate('Logga in')
            }
        ],
        { cancelable: true }
    );

    setAlertShown(true); // Mark the alert as shown
};



  const askForCameraPermission = () => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(status === 'granted');
    })();
  };

  useEffect(() => {
    // Ask for camera permission
    askForCameraPermission();

    const unsubscribeBlur = navigation.addListener('blur', () => {
        setIsActive(false);
    });

    const unsubscribeFocus = navigation.addListener('focus', () => {
        // Reset the border color and set the scanned state to false when the screen is focused
        setBorderColors('white');
        setScanned(false);
        setIsActive(true);
    });
    
    return () => {
        unsubscribeBlur();
        unsubscribeFocus();
    };
}, [navigation]);


const showAddProductAlert = () => {
  Alert.alert(
      "Produkt ej hittad", // Alert title
      "Skapa produkten här", // Alert message
      [
          {
              text: "Lägg till produkt",
              onPress: () => handleNewProductPress(),
              style: "default"
          },
          {
              text: "Avbryt",
              onPress: () => {
                  console.log("Cancel Pressed");
                  setBorderColors('white'); // Reset border color to white
                  setScanned(false); // Reset scanned state to false, enabling scanning again
              },
              style: "cancel"
          }
      ],
      {
          cancelable: true, // Whether tapping outside the alert will close it
          onDismiss: () => { // This will ensure that even if the user taps outside to dismiss the alert, it will still reset the states
              setBorderColors('white');
              setScanned(false);
          }
      }
  );
}


  
  

  const handleBarCodeScanned = async ({ type, data }) => {
    if (!isLoggedIn) {
      showLoginAlert();
      setBorderColors('red'); // Set border color to red
      return; // Exit the function early
  }
    setScanned(true);
    console.log(data);
    setBarcode_data(data);
    const response = await fetch("http://alvhage.se/api/get.php?EAN=" + data + "&api_key=" + global.api_key);
    const json = await response.json();
    console.log(json);
    if (json.status == 1) {
      setText(json.info[0].product);
      setAthome(true);
      setBorderColors('green'); // Set border color to red
      setTimeout(() => {
      navigation.navigate('Produkt', {
        text: json.info[0].product,
        semitext: "Finns i ditt skafferi",
        action: "remove",
        barcode_data: data
    });
  }, 500); // 1-second delay

      //Should be redirected to ProductScreen, the product is at home, asking if want to remove


    } else {
      const response = await fetch("http://alvhage.se/api/get.php?EAN=" + data);
      const json = await response.json();
      console.log(json);
      if (json.status == 1) {
        setBorderColors('orange'); // Set border color to red
        setTimeout(() => {
          navigation.navigate('Produkt', {
            text: json.info[0].product,
            semitext: "Finns ej i ditt skafferi",
            action: "add",
            barcode_data: data
          });
        }, 500); // 1-second delay
        
      }
      else {
        try {
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
          console.log(json.results[0].brandName + " " +json.results[0].functionalName)
          setBorderColors('orange'); // Set border color to red
          setTimeout(() => {
          navigation.navigate('Produkt', {
            text: json.results[0].brandName + " " +json.results[0].functionalName,
            semitext: "Finns ej i ditt skafferi",
            action: "add",
            barcode_data: data
        });
      }, 500); // 1-second delay

          //Redirect to ProductScreen and ask if the user wants to add product



        } catch (error) {
          SetUnknownproduct(true);
          setBorderColors('red'); // Set border color to red
          setTimeout(() => {
          showAddProductAlert();
        }, 500); // 1-second delay
        }
      }
    }
  };

  if (cameraPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Begär kamerarättigheter</Text>
      </View>
    );
  }
  if (cameraPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={{ margin: 10 }}>Kamera ej tillgänglig</Text>
        <Button title={'Allow Camera'} onPress={() => askForCameraPermission()} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
        <View style={styles.barcodeContainer}>
            {isActive && (
                <Camera
                    type={type}
                    onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                    style={{ flex: 1 }}
                    flashMode={flashMode}
                >
                    <View style={styles.overlay}>
                      
                        <View style={styles.overlayFiller} />
                        <View style={styles.overlayRow}>
                            <View style={styles.overlayFiller} />
                            <View style={[styles.overlayWindow, { borderColor: borderColors }]}>
                                <Text style={styles.helptext}>Skanna sträckkoden här!</Text>
                            </View>
                            <View style={styles.overlayFiller} />
                        </View>
                        <View style={styles.overlayFiller} />
                    </View>
                    <TouchableOpacity style={[ styles.flashlightButton, flashMode === Camera.Constants.FlashMode.torch ? styles.flashlightOn : {}]} 
                      onPress={toggleFlashlight}>
                      <Text style={styles.flashlightText}>
                      ⚡
                      </Text>
                      </TouchableOpacity>

                </Camera>
            )}
        </View>
    </View>
);


 }

const styles = StyleSheet.create({
  barcodeContainer: {
    flex: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    overflow: 'hidden', // Add this line to hide the overflow content
  },
  storageContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 60,
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 20,
    zIndex: 1
  },
  storageItem: {
    marginVertical: 10
  },
  textContainer: {
    width: '100%',
    maxWidth: 225,
    backgroundColor: 'white',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    top: "50%",
    position: 'absolute',
    alignSelf: 'center', // Add this line to center the container horizontally
    backgroundColor: '#faf2f2',
},
  maintext: {
    fontWeight: 'bold',
    marginBottom: 15,
    fontSize: 16,
  },
  semitext: {
    fontSize: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    margin: 10
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    marginTop: -30,
  },
  backArrow: {
    position: 'absolute',
    top: 0,
    left: 5,
    padding: 5,
    fontWeight: 'normal',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  instructionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  instructions: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  overlay: {
    flex: 1,
    
  },
  instructions: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  overlayRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  overlayFiller: {
    flex: 1,
  },
  overlayWindow: {
    borderWidth: 6,
    borderColor: 'white',
    borderRadius: 15, // rounded corners
    width: scannerWidth,
    height: scannerWidth/1.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },

  helptext: {
    color: "white",
    top: 70,
    fontSize: 17
  },
  flashlightButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // ensure the button is above other elements
  },
  
  flashlightText: {
    fontSize: 25,
  },
  flashlightOn: {
    backgroundColor: 'rgba(255,255,255,0.5)',
  }
  
});
