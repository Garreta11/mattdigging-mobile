import * as AppleAuthentication from 'expo-apple-authentication';

import { supabase } from '@/lib/supabase';

/**
 * Native Sign in with Apple (iOS only), passed to Supabase as an ID token.
 * Returns true when the user is logged in, false when they cancelled the Apple sheet.
 */
export async function signInWithApple(): Promise<boolean> {
  let credential: AppleAuthentication.AppleAuthenticationCredential;
  try {
    credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
  } catch (err) {
    if ((err as { code?: string }).code === 'ERR_REQUEST_CANCELED') return false;
    throw err;
  }
  if (!credential.identityToken) throw new Error('Apple login did not return a token.');

  const { error } = await supabase.auth.signInWithIdToken({ provider: 'apple', token: credential.identityToken });
  if (error) throw error;

  // Apple only sends the name the first time the user signs in, so save it now.
  // `name` is the field the website and the app read (same as email sign-up).
  const { givenName, familyName } = credential.fullName ?? {};
  if (givenName || familyName) {
    const fullName = [givenName, familyName].filter(Boolean).join(' ');
    await supabase.auth.updateUser({
      data: { name: fullName, full_name: fullName, given_name: givenName, family_name: familyName },
    });
  }
  return true;
}
