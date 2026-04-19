import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../src/AuthContext';
import { apiAddProduct, apiDeleteProduct } from '../src/api';
import { gs1GetThumbnailUrl } from '../src/api';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../src/theme';
import { FontAwesome as Icon } from '@expo/vector-icons';

export default function ProductScreen({ route }) {
  const navigation = useNavigation();
  const { apiKey } = useAuth();
  const { text, semitext, action, barcode_data } = route.params;
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const isInPantry = action === 'remove';

  useEffect(() => {
    gs1GetThumbnailUrl(barcode_data).then((url) => {
      setThumbnailUrl(url);
      if (!url) setImageLoading(false);
    });
  }, [barcode_data]);

  const handleAdd = async () => {
    setLoading(true);
    try {
      await apiAddProduct(barcode_data, text, apiKey);
      navigation.goBack();
    } catch (error) {
      console.error('Add product error:', error);
      Alert.alert('Fel', 'Kunde inte lägga till produkt');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    Alert.alert(
      'Ta bort produkt',
      'Vad vill du göra med produkten?',
      [
        {
          text: 'Flytta till inköpslista',
          onPress: async () => {
            setLoading(true);
            try {
              await apiAddProduct(barcode_data, text, apiKey, 'shopping');
              await apiDeleteProduct(barcode_data, apiKey);
              navigation.goBack();
            } catch (error) {
              console.error('Move to shopping error:', error);
              Alert.alert('Fel', 'Kunde inte flytta produkt');
            } finally {
              setLoading(false);
            }
          },
        },
        {
          text: 'Radera',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await apiDeleteProduct(barcode_data, apiKey);
              navigation.goBack();
            } catch (error) {
              console.error('Delete product error:', error);
              Alert.alert('Fel', 'Kunde inte radera produkt');
            } finally {
              setLoading(false);
            }
          },
        },
        { text: 'Avbryt', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          {thumbnailUrl ? (
            <>
              {imageLoading && (
                <ActivityIndicator size="large" color={COLORS.primary} />
              )}
              <Image
                source={{ uri: thumbnailUrl }}
                style={[styles.thumbnail, imageLoading && styles.hidden]}
                resizeMode="contain"
                onLoad={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
              />
            </>
          ) : (
            <View style={styles.placeholderImage}>
              <Icon name="cube" size={60} color={COLORS.textLight} />
            </View>
          )}
        </View>

        <View style={styles.infoSection}>
          <View
            style={[
              styles.statusBadge,
              isInPantry ? styles.statusInPantry : styles.statusNotInPantry,
            ]}
          >
            <Icon
              name={isInPantry ? 'check-circle' : 'plus-circle'}
              size={14}
              color={isInPantry ? COLORS.accent : COLORS.primary}
            />
            <Text
              style={[
                styles.statusText,
                isInPantry ? styles.statusTextInPantry : styles.statusTextNotInPantry,
              ]}
            >
              {semitext}
            </Text>
          </View>

          <Text style={styles.productName}>{text}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        {isInPantry ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.removeButton]}
            onPress={handleRemove}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Icon name="minus-circle" size={20} color={COLORS.white} />
                <Text style={styles.actionButtonText}>Ta bort produkt</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, styles.addButton]}
            onPress={handleAdd}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Icon name="plus-circle" size={20} color={COLORS.white} />
                <Text style={styles.actionButtonText}>Lägg till i skafferiet</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    marginTop: SPACING.lg,
    ...SHADOW.sm,
  },
  thumbnail: {
    width: '80%',
    height: '80%',
  },
  hidden: {
    opacity: 0,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.full,
  },
  statusInPantry: {
    backgroundColor: `${COLORS.accent}18`,
  },
  statusNotInPantry: {
    backgroundColor: `${COLORS.primary}18`,
  },
  statusText: {
    fontSize: FONT.size.sm,
    ...FONT.semibold,
  },
  statusTextInPantry: {
    color: COLORS.accent,
  },
  statusTextNotInPantry: {
    color: COLORS.primary,
  },
  productName: {
    fontSize: FONT.size.xxl,
    ...FONT.bold,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 38,
  },
  actions: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md + 2,
    borderRadius: RADIUS.md,
    ...SHADOW.md,
  },
  addButton: {
    backgroundColor: COLORS.primary,
  },
  removeButton: {
    backgroundColor: COLORS.danger,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: FONT.size.lg,
    ...FONT.bold,
  },
});
