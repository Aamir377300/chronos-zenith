import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { usePasscodeStore } from '@/store/passcodeStore';
import { ownerApi } from '@/lib/api';
import { Colors } from '@/constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PasscodeScreen() {
  const router = useRouter();
  const setPasscode = usePasscodeStore((s) => s.setPasscode);
  const setUser = usePasscodeStore((s) => s.setUser);
  const clearPasscode = usePasscodeStore((s) => s.clearPasscode);

  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!value.trim()) {
      setError('Please enter the passcode');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await setPasscode(value.trim());
      const data = await ownerApi.getMe();
      await setUser(data.user);
      router.replace('/(tabs)/home');
    } catch (err) {
      await clearPasscode();
      setError(err instanceof Error ? err.message : 'Invalid passcode');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.logoContainer}>
            <Image source={require('../../assets/icon.png')} style={styles.logo} />
            <Text style={styles.appName}>Chronos Zenith</Text>
            <Text style={styles.tagline}>Enter passcode</Text>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <Text style={styles.label}>Passcode</Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={setValue}
              placeholder="••••••••"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.submitText}>Unlock</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 22,
    marginBottom: 12,
  },
  appName: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary },
  tagline: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: Colors.danger, fontSize: 13 },
  form: { gap: 4 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  submitBtn: {
    backgroundColor: Colors.blue,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  submitBtnDisabled: { backgroundColor: '#93C5FD' },
  submitText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});
