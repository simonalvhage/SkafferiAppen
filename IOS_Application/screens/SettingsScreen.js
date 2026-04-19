import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../src/AuthContext';
import { apiDeleteAllProducts, apiDeleteUser } from '../src/api';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../src/theme';
import { FontAwesome as Icon } from '@expo/vector-icons';

function SettingsButton({ icon, label, onPress, destructive = false }) {
  return (
    <TouchableOpacity
      style={[styles.settingsButton, destructive && styles.destructiveButton]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconCircle, destructive && styles.destructiveIcon]}>
        <Icon
          name={icon}
          size={16}
          color={destructive ? COLORS.danger : COLORS.primary}
        />
      </View>
      <Text style={[styles.settingsButtonText, destructive && styles.destructiveText]}>
        {label}
      </Text>
      <Icon name="chevron-right" size={14} color={COLORS.textLight} />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { isLoggedIn, username, apiKey, logout } = useAuth();
  const navigation = useNavigation();

  const handleLogout = async () => {
    await logout();
    navigation.navigate('Hem');
  };

  const confirmAction = (title, message, onConfirm, confirmText = 'Bekräfta') => {
    Alert.alert(title, message, [
      { text: 'Avbryt', style: 'cancel' },
      { text: confirmText, style: 'destructive', onPress: onConfirm },
    ]);
  };

  const handleDeletePantry = () => {
    confirmAction(
      'Rensa skafferiet',
      'Är du säker? Alla produkter i skafferiet tas bort.',
      async () => {
        try {
          await apiDeleteAllProducts(apiKey);
          Alert.alert('Klart', 'Skafferiet har rensats');
        } catch (error) {
          console.error('Delete pantry error:', error);
          Alert.alert('Fel', 'Kunde inte rensa skafferiet');
        }
      },
      'Radera alla'
    );
  };

  const handleDeleteShopping = () => {
    confirmAction(
      'Rensa inköpslistan',
      'Är du säker? Alla produkter i inköpslistan tas bort.',
      async () => {
        try {
          await apiDeleteAllProducts(apiKey, 'shopping');
          Alert.alert('Klart', 'Inköpslistan har rensats');
        } catch (error) {
          console.error('Delete shopping error:', error);
          Alert.alert('Fel', 'Kunde inte rensa inköpslistan');
        }
      },
      'Radera alla'
    );
  };

  const handleDeleteAccount = () => {
    confirmAction(
      'Radera konto',
      'Är du säker? Ditt konto och all data raderas permanent.',
      async () => {
        try {
          const json = await apiDeleteUser(apiKey);
          if (json.success) {
            Alert.alert('Kontot raderat', 'Hoppas vi ses igen!');
            handleLogout();
          } else {
            Alert.alert('Fel', json.error || 'Kunde inte radera konto');
          }
        } catch (error) {
          console.error('Delete account error:', error);
          Alert.alert('Fel', 'Gick inte att radera konto');
        }
      },
      'Radera konto'
    );
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loggedOutContainer}>
          <View style={styles.avatarCircle}>
            <Icon name="user" size={40} color={COLORS.textLight} />
          </View>
          <Text style={styles.loggedOutTitle}>Inte inloggad</Text>
          <Text style={styles.loggedOutText}>
            Logga in för att hantera ditt konto och inställningar
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Logga in')}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Logga in / Skapa konto</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          <View style={styles.avatarCircle}>
            <Icon name="user" size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.welcomeText}>Välkommen!</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hantera data</Text>
          <View style={styles.sectionCard}>
            <SettingsButton
              icon="home"
              label="Rensa skafferiet"
              onPress={handleDeletePantry}
            />
            <View style={styles.divider} />
            <SettingsButton
              icon="shopping-cart"
              label="Rensa inköpslistan"
              onPress={handleDeleteShopping}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Konto</Text>
          <View style={styles.sectionCard}>
            <SettingsButton
              icon="sign-out"
              label="Logga ut"
              onPress={handleLogout}
            />
            <View style={styles.divider} />
            <SettingsButton
              icon="trash"
              label="Radera konto"
              onPress={handleDeleteAccount}
              destructive
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  username: {
    fontSize: FONT.size.xl,
    ...FONT.bold,
    color: COLORS.text,
  },
  welcomeText: {
    fontSize: FONT.size.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  loggedOutContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
    gap: SPACING.sm,
  },
  loggedOutTitle: {
    fontSize: FONT.size.xl,
    ...FONT.bold,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  loggedOutText: {
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
    ...SHADOW.sm,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: FONT.size.md,
    ...FONT.bold,
  },
  section: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT.size.xs,
    ...FONT.semibold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    ...SHADOW.sm,
    overflow: 'hidden',
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  destructiveButton: {},
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  destructiveIcon: {
    backgroundColor: `${COLORS.danger}15`,
  },
  settingsButtonText: {
    flex: 1,
    fontSize: FONT.size.md,
    color: COLORS.text,
    ...FONT.medium,
  },
  destructiveText: {
    color: COLORS.danger,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: SPACING.md + 36 + SPACING.md,
  },
});
