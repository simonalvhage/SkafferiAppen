import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../src/AuthContext';
import { apiGetProductByEAN, gs1Search } from '../src/api';
import { COLORS, FONT, RADIUS, SPACING } from '../src/theme';
import { FontAwesome as Icon } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCANNER_SIZE = SCREEN_WIDTH * 0.7;

export default function HomeScreen() {
  const [borderColor, setBorderColor] = useState('rgba(255,255,255,0.6)');
  const [isActive, setIsActive] = useState(true);
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const processingRef = useRef(false);

  const navigation = useNavigation();
  const { isLoggedIn, apiKey } = useAuth();

  useFocusEffect(
    React.useCallback(() => {
      setIsActive(true);
      setBorderColor('rgba(255,255,255,0.6)');
      setScanned(false);
      processingRef.current = false;
      return () => setIsActive(false);
    }, [])
  );

  const navigateToProduct = (text, semitext, action, barcode_data) => {
    setBorderColor(action === 'add' ? COLORS.warning : COLORS.accent);
    setTimeout(() => {
      navigation.navigate('Produkt', { text, semitext, action, barcode_data });
    }, 400);
  };

  const handleBarCodeScanned = async ({ data }) => {
    if (scanned || processingRef.current) return;
    processingRef.current = true;
    setScanned(true);

    if (!isLoggedIn) {
      Alert.alert(
        'Konto behövs',
        'Logga in eller skapa konto för att använda skannern',
        [
          { text: 'Avbryt', style: 'cancel', onPress: resetScanner },
          { text: 'Logga in', onPress: () => navigation.navigate('Logga in') },
        ]
      );
      return;
    }

    try {
      // 1. Check if product is in user's pantry
      const userResult = await apiGetProductByEAN(data, apiKey);
      if (userResult.status === 1) {
        navigateToProduct(
          userResult.info[0].product,
          'Finns i ditt skafferi',
          'remove',
          data
        );
        return;
      }

      // 2. Check if product exists in the database
      const dbResult = await apiGetProductByEAN(data);
      if (dbResult.status === 1) {
        navigateToProduct(
          dbResult.info[0].product,
          'Finns ej i ditt skafferi',
          'add',
          data
        );
        return;
      }

      // 3. Try GS1 lookup
      try {
        const gs1Result = await gs1Search(data);
        if (gs1Result.results?.[0]) {
          const item = gs1Result.results[0];
          const name = [item.brandName, item.functionalName].filter(Boolean).join(' ');
          navigateToProduct(name, 'Finns ej i ditt skafferi', 'add', data);
          return;
        }
      } catch {
        // GS1 failed, fall through to manual entry
      }

      // 4. Product not found anywhere - prompt manual entry
      setBorderColor(COLORS.danger);
      Alert.alert(
        'Produkt ej hittad',
        'Vill du lägga till produkten manuellt?',
        [
          {
            text: 'Lägg till',
            onPress: () => promptNewProduct(data),
          },
          {
            text: 'Avbryt',
            style: 'cancel',
            onPress: resetScanner,
          },
        ],
        { cancelable: true, onDismiss: resetScanner }
      );
    } catch (error) {
      console.error('Scan error:', error);
      setBorderColor(COLORS.danger);
      resetScanner();
    }
  };

  const promptNewProduct = (barcode) => {
    Alert.prompt(
      'Namnge produkten',
      "T.ex. 'Eldorado Kanel'",
      [
        { text: 'Avbryt', style: 'cancel', onPress: resetScanner },
        {
          text: 'OK',
          onPress: (name) => {
            if (name?.trim()) {
              navigateToProduct(name.trim(), 'Finns ej i ditt skafferi', 'add', barcode);
            } else {
              resetScanner();
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const resetScanner = () => {
    setBorderColor('rgba(255,255,255,0.6)');
    setScanned(false);
    processingRef.current = false;
  };

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.permissionText}>Laddar kamera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="camera" size={48} color={COLORS.textLight} />
        <Text style={styles.permissionTitle}>Kameraåtkomst behövs</Text>
        <Text style={styles.permissionText}>
          Vi behöver tillgång till kameran för att skanna streckkoder
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Ge tillgång</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {isActive && (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'] }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          enableTorch={torch}
        />
      )}

      {/* Overlay on top of camera using absolute positioning */}
      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.overlayTop} />
        <View style={styles.overlayMiddle} pointerEvents="box-none">
          <View style={styles.overlaySide} />
          <View style={[styles.scanWindow, { borderColor }]}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <View style={styles.overlaySide} />
        </View>
        <View style={styles.overlayBottom}>
          <Text style={styles.helpText}>
            {scanned ? 'Bearbetar...' : 'Rikta kameran mot streckkoden'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.torchButton, torch && styles.torchButtonOn]}
        onPress={() => setTorch((t) => !t)}
      >
        <Icon name="bolt" size={22} color={torch ? COLORS.warning : COLORS.white} />
      </TouchableOpacity>

      {scanned && (
        <TouchableOpacity style={styles.rescanButton} onPress={resetScanner}>
          <Icon name="refresh" size={16} color={COLORS.white} />
          <Text style={styles.rescanText}>Skanna igen</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xxl,
    gap: SPACING.md,
  },
  permissionTitle: {
    fontSize: FONT.size.xl,
    ...FONT.bold,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  permissionText: {
    fontSize: FONT.size.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
  },
  permissionButtonText: {
    color: COLORS.white,
    fontSize: FONT.size.md,
    ...FONT.bold,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  overlayMiddle: {
    flexDirection: 'row',
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    paddingTop: SPACING.xl,
  },
  scanWindow: {
    width: SCANNER_SIZE,
    height: SCANNER_SIZE * 0.65,
    borderWidth: 2,
    borderRadius: RADIUS.lg,
    backgroundColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: COLORS.white,
  },
  cornerTL: {
    top: -1,
    left: -1,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: RADIUS.lg,
  },
  cornerTR: {
    top: -1,
    right: -1,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: RADIUS.lg,
  },
  cornerBL: {
    bottom: -1,
    left: -1,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: RADIUS.lg,
  },
  cornerBR: {
    bottom: -1,
    right: -1,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: RADIUS.lg,
  },
  helpText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FONT.size.md,
    ...FONT.medium,
  },
  torchButton: {
    position: 'absolute',
    bottom: 100,
    right: SPACING.lg,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: RADIUS.full,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  torchButtonOn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  rescanButton: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full,
  },
  rescanText: {
    color: COLORS.white,
    fontSize: FONT.size.sm,
    ...FONT.semibold,
  },
});
