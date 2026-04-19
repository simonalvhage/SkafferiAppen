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
import { apiSignup } from '../src/api';
import { COLORS, SPACING, FONT, RADIUS, SHADOW } from '../src/theme';

export default function SignupScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!username.trim() || !email.trim() || !pin.trim()) {
      Alert.alert('Fel', 'Fyll i alla fält');
      return;
    }
    if (pin.length !== 4) {
      Alert.alert('Fel', 'Pin måste vara 4 siffror');
      return;
    }
    setLoading(true);
    try {
      const json = await apiSignup(username, email, pin);
      if (json.api_key) {
        Alert.alert('Klart!', 'Konto skapat, vänligen logga in');
        navigation.navigate('Logga in');
      } else {
        Alert.alert('Fel', json.error || 'Kunde inte skapa konto');
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Fel', 'Gick inte att skapa konto');
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
          <Text style={styles.title}>Skapa konto</Text>
          <Text style={styles.subtitle}>Fyll i dina uppgifter nedan</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>E-post</Text>
            <TextInput
              style={styles.input}
              placeholder="din@email.se"
              placeholderTextColor={COLORS.textLight}
              onChangeText={setEmail}
              value={email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Användarnamn</Text>
            <TextInput
              style={styles.input}
              placeholder="Välj ett användarnamn"
              placeholderTextColor={COLORS.textLight}
              onChangeText={setUsername}
              value={username}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Pin (4 siffror)</Text>
            <TextInput
              style={styles.input}
              placeholder="Välj en 4-siffrig pin"
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
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Skapa konto</Text>
            )}
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
});
