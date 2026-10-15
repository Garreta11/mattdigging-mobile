// Values come from .env.local (see .env.example). Expo inlines EXPO_PUBLIC_* at build time,
// so they must be read with the full `process.env.EXPO_PUBLIC_…` expression, not destructured.
function required(name: string, value: string | undefined): string {
  if (!value) throw new Error(`Missing ${name}. Copy .env.example to .env.local and fill it in.`);
  return value;
}

export const env = {
  supabaseUrl: required('EXPO_PUBLIC_SUPABASE_URL', process.env.EXPO_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: required('EXPO_PUBLIC_SUPABASE_ANON_KEY', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY),
  apiUrl: required('EXPO_PUBLIC_API_URL', process.env.EXPO_PUBLIC_API_URL).replace(/\/+$/, ''),
  // The public website: email links (password reset, confirmation) open there.
  websiteUrl: required('EXPO_PUBLIC_WEBSITE_URL', process.env.EXPO_PUBLIC_WEBSITE_URL).replace(/\/+$/, ''),
};
