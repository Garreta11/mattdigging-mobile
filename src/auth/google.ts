import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { supabase } from '@/lib/supabase';

// Where Supabase sends the browser back after Google: mattdigging://auth/callback.
// Must be allowed in Supabase → Authentication → URL Configuration (mattdigging://**).
const redirectTo = Linking.createURL('auth/callback');

/**
 * Google login through Supabase, in the phone's secure in-app browser.
 * Returns true when the user is logged in, false when they closed the browser.
 */
export async function signInWithGoogle(): Promise<boolean> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    // We open the browser ourselves instead of letting Supabase redirect the page.
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;

  // On Android the redirect reopens the app through a normal deep link, and the browser session
  // can end as "dismiss" even though it worked. So also listen for that link ourselves.
  let linkedUrl: string | null = null;
  const subscription = Linking.addEventListener('url', ({ url }) => {
    if (url.startsWith(redirectTo)) linkedUrl = url;
  });
  let callbackUrl: string | null;
  try {
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    callbackUrl = result.type === 'success' ? result.url : linkedUrl;
  } finally {
    subscription.remove();
  }
  if (!callbackUrl) return false;

  // Supabase puts the tokens (or an error) after the # of the redirect URL.
  const params = new URLSearchParams(callbackUrl.split('#')[1] ?? '');
  const errorDescription = params.get('error_description');
  if (errorDescription) throw new Error(errorDescription);

  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  if (!access_token || !refresh_token) throw new Error('Google login did not return a session.');

  // Saving the session triggers AuthProvider's onAuthStateChange, like a password login.
  const { error: sessionError } = await supabase.auth.setSession({ access_token, refresh_token });
  if (sessionError) throw sessionError;
  return true;
}
