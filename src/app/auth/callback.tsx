import { Redirect } from 'expo-router';

// On Android the Google redirect (mattdigging://auth/callback) also opens the app at this path.
// The tokens are already handled by signInWithGoogle (src/auth/google.ts), so just go home.
export default function AuthCallback() {
  return <Redirect href="/" />;
}
