import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TextInput,
  TouchableOpacity,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '../src/AuthContext';
import { apiGetProducts, apiAddProduct, apiDeleteProduct } from '../src/api';
import { COLORS, SPACING, FONT, RADIUS } from '../src/theme';
import { FontAwesome as Icon } from '@expo/vector-icons';

function ListItem({ item, onAction }) {
  return (
    <TouchableOpacity style={styles.itemContainer} onPress={onAction} activeOpacity={0.6}>
      <View style={styles.itemContent}>
        <Text style={styles.itemText} numberOfLines={1}>{item.product}</Text>
        <Text style={styles.dateText}>
          {item.datum ? `Tillagt: ${item.datum}` : 'Tillagt: okänt datum'}
        </Text>
      </View>
      <Icon name="ellipsis-h" size={18} color={COLORS.textLight} />
    </TouchableOpacity>
  );
}

export default function ShoppingScreen() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const { isLoggedIn, apiKey } = useAuth();
  const navigation = useNavigation();

  const fetchData = useCallback(async () => {
    if (!apiKey) return;
    setLoading(true);
    try {
      const json = await apiGetProducts(apiKey, 'shopping');
      const items = json?.info || [];
      setData(items);
      setFilteredData(items);
    } catch (error) {
      console.error('Fetch shopping error:', error);
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  useFocusEffect(
    useCallback(() => {
      if (isLoggedIn) fetchData();
    }, [isLoggedIn, fetchData])
  );

  const handleSearch = (text) => {
    setSearchText(text);
    if (!text.trim()) {
      setFilteredData(data);
      return;
    }
    const filtered = data.filter((item) =>
      item.product?.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const handleAddManual = async () => {
    if (!searchText.trim()) return;
    const name = searchText.trim();
    try {
      await apiAddProduct(name, name, apiKey, 'shopping');
      setSearchText('');
      Keyboard.dismiss();
      await fetchData();
    } catch (error) {
      console.error('Add to shopping error:', error);
      Alert.alert('Fel', 'Kunde inte lägga till produkt');
    }
  };

  const handleItemAction = (item) => {
    Alert.alert(
      item.product,
      'Vad vill du göra?',
      [
        {
          text: 'Flytta till skafferiet',
          onPress: async () => {
            try {
              await apiAddProduct(item.EAN, item.product, apiKey);
              await apiDeleteProduct(item.EAN, apiKey, 'shopping');
              const updated = data.filter((d) => d.EAN !== item.EAN);
              setData(updated);
              setFilteredData(updated);
            } catch (error) {
              console.error('Move to pantry error:', error);
            }
          },
        },
        {
          text: 'Radera',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiDeleteProduct(item.EAN, apiKey, 'shopping');
              const updated = data.filter((d) => d.EAN !== item.EAN);
              setData(updated);
              setFilteredData(updated);
            } catch (error) {
              console.error('Delete shopping item error:', error);
            }
          },
        },
        { text: 'Avbryt', style: 'cancel' },
      ]
    );
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Icon name="shopping-cart" size={48} color={COLORS.textLight} />
          <Text style={styles.emptyTitle}>Inköpslista</Text>
          <Text style={styles.emptyText}>
            Logga in eller skapa konto för att se din inköpslista
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Logga in')}
          >
            <Text style={styles.loginButtonText}>Logga in</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Inköpslista</Text>
        <Text style={styles.subtitle}>{data.length} produkter</Text>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={16} color={COLORS.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Sök eller lägg till produkt..."
          placeholderTextColor={COLORS.textLight}
          value={searchText}
          onChangeText={handleSearch}
          returnKeyType="done"
          onSubmitEditing={searchText.trim() ? handleAddManual : undefined}
        />
        {searchText !== '' && (
          <TouchableOpacity style={styles.addButton} onPress={handleAddManual}>
            <Icon name="plus" size={14} color={COLORS.white} />
            <Text style={styles.addButtonText}>Lägg till</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.EAN}
          renderItem={({ item }) => (
            <ListItem item={item} onAction={() => handleItemAction(item)} />
          )}
          contentContainerStyle={filteredData.length === 0 && styles.emptyList}
          ListEmptyComponent={
            <View style={styles.emptyListContent}>
              <Icon name="shopping-cart" size={40} color={COLORS.textLight} />
              <Text style={styles.emptyListText}>
                {searchText ? 'Inga matchande produkter' : 'Din inköpslista är tom'}
              </Text>
            </View>
          }
          keyboardShouldPersistTaps="handled"
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT.size.title,
    ...FONT.bold,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT.size.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingLeft: SPACING.md,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    fontSize: FONT.size.md,
    color: COLORS.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
    marginRight: SPACING.xs,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: FONT.size.sm,
    ...FONT.semibold,
  },
  loader: {
    marginTop: SPACING.xxl,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemContent: {
    flex: 1,
    marginRight: SPACING.md,
  },
  itemText: {
    fontSize: FONT.size.md,
    ...FONT.semibold,
    color: COLORS.text,
  },
  dateText: {
    fontSize: FONT.size.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
    gap: SPACING.sm,
  },
  emptyTitle: {
    fontSize: FONT.size.xl,
    ...FONT.bold,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptyText: {
    fontSize: FONT.size.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: FONT.size.md,
    ...FONT.bold,
  },
  emptyList: {
    flex: 1,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  emptyListText: {
    fontSize: FONT.size.md,
    color: COLORS.textSecondary,
  },
});
