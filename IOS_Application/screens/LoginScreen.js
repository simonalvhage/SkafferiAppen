import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../src/AuthContext';
import { apiLogin } from '../src/api';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../src/theme';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username.trim() || !pin.trim()) {
      Alert.alert('Fel', 'Fyll i både användarnamn och pin');
      return;
    }
    setLoading(true);
    try {
      const json = await apiLogin(username, pin);
      if (json.api_key) {
        await login(username, json.api_key);
        navigation.navigate('Hem');
      } else {
        Alert.alert('Fel', 'Fel användarnamn eller pin');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Fel', 'Gick inte att logga in. Försök igen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Välkommen!</Text>
          <Text style={styles.subtitle}>Logga in för att fortsätta</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Användarnamn</Text>
            <TextInput
              style={styles.input}
              placeholder="Ange ditt användarnamn"
              placeholderTextColor={COLORS.textLight}
              onChangeText={setUsername}
              value={username}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Pin</Text>
            <TextInput
              style={styles.input}
              placeholder="Ange din pin"
              placeholderTextColor={COLORS.textLight}
              keyboardType="number-pad"
              secureTextEntry
              onChangeText={setPin}
              value={pin}
              maxLength={4}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Logga in</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.forgotButton}
            onPress={() => navigation.navigate('Glömt lösenord')}
          >
            <Text style={styles.forgotText}>Glömt lösenord?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Ny till SkafferiAppen?</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('Skapa konto')}
            activeOpacity={0.8}
          >
            <Text style={styles.createButtonText}>Skapa nytt konto</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  header: {
    marginTop: SPACING.xxl,
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT.size.title,
    ...FONT.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT.size.md,
    color: COLORS.textSecondary,
  },
  form: {
    gap: SPACING.md,
  },
  inputContainer: {
    gap: SPACING.xs,
  },
  label: {
    fontSize: FONT.size.sm,
    ...FONT.semibold,
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    fontSize: FONT.size.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
    ...SHADOW.sm,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONT.size.lg,
    ...FONT.bold,
  },
  forgotButton: {
    alignSelf: 'center',
    paddingVertical: SPACING.sm,
  },
  forgotText: {
    fontSize: FONT.size.sm,
    color: COLORS.primary,
    ...FONT.medium,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
  },
  footerText: {
    fontSize: FONT.size.md,
    color: COLORS.textSecondary,
  },
  createButton: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    width: '100%',
    alignItems: 'center',
  },
  createButtonText: {
    color: COLORS.primary,
    fontSize: FONT.size.md,
    ...FONT.bold,
  },
});
