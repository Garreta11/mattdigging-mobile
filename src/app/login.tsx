import { Feather, Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Link, Stack, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { signInWithApple } from '@/auth/apple';
import { signInWithGoogle } from '@/auth/google';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import { env } from '@/lib/env';
import { supabase } from '@/lib/supabase';
import { colors, space } from '@/theme';

type Mode = 'login' | 'signup' | 'forgot';

const EMPTY_FORM = {
  email: '',
  password: '',
  confirmPassword: '',
  displayName: '',
  username: '',
  termsAccepted: false,
};

const TITLES: Record<Mode, string> = {
  login: 'Log in',
  signup: 'Create account',
  forgot: 'Reset password',
};

// Mirrors frontend/src/components/SignIn/SignIn.tsx. Opens as a modal (see src/app/_layout.tsx).
export default function Login() {
  const [mode, setMode] = useState<Mode>('login');
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Sign in with Apple is iOS only (and needs iOS 13+).
  const [appleAvailable, setAppleAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'ios') AppleAuthentication.isAvailableAsync().then(setAppleAvailable);
  }, []);

  // On the web: onChange={e => …e.target.value}. In RN, onChangeText gives the string directly.
  const update = (field: 'email' | 'password' | 'confirmPassword' | 'displayName' | 'username') => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(null);
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setForm(EMPTY_FORM);
    setError(null);
    setSuccess(null);
  };

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password,
    });
    if (error) throw error;
    // AuthProvider picks up the new session by itself; just close the modal.
    router.back();
  };

  const handleSignUp = async () => {
    if (!form.termsAccepted) throw new Error('Please accept the Terms & Conditions to continue.');
    if (form.password !== form.confirmPassword) throw new Error("Passwords don't match.");
    if (form.password.length < 6) throw new Error('Password must be at least 6 characters.');

    const { error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: { data: { name: form.displayName, username: form.username } },
    });
    if (error) throw error;
    setForm(EMPTY_FORM);
    setSuccess('Check your email to confirm your account, then log in.');
  };

  const handleForgot = async () => {
    // The reset link opens the website's reset page; afterwards the user logs in here.
    const { error } = await supabase.auth.resetPasswordForEmail(form.email.trim(), {
      redirectTo: `${env.websiteUrl}/auth/reset-password`,
    });
    if (error) throw error;
    setForm(EMPTY_FORM);
    setSuccess("We've sent a reset link to your email.");
  };

  // Google and Apple share the same flow: open the provider, then close the modal once logged in.
  const handleProvider = (signIn: () => Promise<boolean>) => async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const loggedIn = await signIn();
      // Close the login modal and land on the home tab.
      if (loggedIn) router.dismissTo('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      if (mode === 'login') await handleLogin();
      else if (mode === 'signup') await handleSignUp();
      else await handleForgot();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: TITLES[mode] }} />

      <TextField
        label="Email"
        value={form.email}
        onChangeText={update('email')}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
      />

      {mode === 'signup' && (
        <>
          <TextField label="Display name" value={form.displayName} onChangeText={update('displayName')} placeholder="Your name" />
          <TextField
            label="Username"
            value={form.username}
            onChangeText={update('username')}
            placeholder="@yourhandle"
            autoCapitalize="none"
          />
        </>
      )}

      {mode !== 'forgot' && (
        <TextField
          label="Password"
          value={form.password}
          onChangeText={update('password')}
          placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
          secureTextEntry
          autoCapitalize="none"
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          textContentType={mode === 'signup' ? 'newPassword' : 'password'}
        />
      )}

      {mode === 'signup' && (
        <>
          <TextField
            label="Confirm password"
            value={form.confirmPassword}
            onChangeText={update('confirmPassword')}
            placeholder="Repeat your password"
            secureTextEntry
            autoCapitalize="none"
            textContentType="newPassword"
          />
          <Pressable
            style={styles.checkbox}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: form.termsAccepted }}
            onPress={() => setForm((prev) => ({ ...prev, termsAccepted: !prev.termsAccepted }))}>
            <Feather name={form.termsAccepted ? 'check-square' : 'square'} size={20} color={colors.text} />
            <Text variant="small" style={styles.checkboxText}>
              I accept the{' '}
              <Link href="/terms" style={styles.link}>
                Terms & Conditions
              </Link>
            </Text>
          </Pressable>
        </>
      )}

      {error && <Text style={styles.error}>{error}</Text>}
      {success && <Text style={styles.success}>{success}</Text>}

      <Button
        title={mode === 'login' ? 'Log in' : mode === 'signup' ? 'Create account' : 'Send reset link'}
        onPress={handleSubmit}
        loading={loading}
      />

      {mode !== 'forgot' && (
        <>
          <Text variant="small" style={styles.or}>
            or
          </Text>
          {appleAvailable && (
            <Button
              variant="outline"
              title={mode === 'signup' ? 'Sign up with Apple' : 'Continue with Apple'}
              leftIcon={<Ionicons name="logo-apple" size={20} color={colors.text} />}
              onPress={handleProvider(signInWithApple)}
              disabled={loading}
            />
          )}
          <Button
            variant="outline"
            title="Continue with Google"
            leftIcon={<Ionicons name="logo-google" size={18} color={colors.text} />}
            onPress={handleProvider(signInWithGoogle)}
            disabled={loading}
          />
          {mode === 'signup' && (
            <Text variant="small" style={styles.or}>
              By continuing with {appleAvailable ? 'Apple or Google' : 'Google'} you accept the{' '}
              <Link href="/terms" style={styles.link}>
                Terms & Conditions
              </Link>
            </Text>
          )}
        </>
      )}

      <View style={styles.switches}>
        {mode === 'login' && (
          <>
            <Button variant="outline" title="Create an account" onPress={() => switchMode('signup')} />
            <Button variant="outline" title="Forgot password?" onPress={() => switchMode('forgot')} />
          </>
        )}
        {mode !== 'login' && (
          <Button variant="outline" title="Back to log in" onPress={() => switchMode('login')} />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  checkboxText: {
    flex: 1,
  },
  link: {
    color: colors.text,
    textDecorationLine: 'underline',
  },
  error: {
    color: colors.error,
  },
  success: {
    color: colors.accent,
  },
  or: {
    textAlign: 'center',
    color: colors.textMuted,
  },
  switches: {
    gap: space[3],
    marginTop: space[4],
  },
});
