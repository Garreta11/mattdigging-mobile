import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

import { env } from './env';

// Same client as frontend/src/lib/supabase.ts, with two mobile differences:
// - the session is saved in AsyncStorage (the app's localStorage);
// - there is no URL bar, so sessions are never read from the URL.
export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

// Timers pause while the app is in the background, so only refresh the
// login token while the app is on screen (recommended by Supabase for React Native).
AppState.addEventListener('change', (state) => {
  if (state === 'active') supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});
