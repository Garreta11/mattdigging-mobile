import { supabase } from './supabase';

// Same buckets the website resizes on the fly (frontend/src/hooks/useStorageUrl.ts).
const IMAGE_BUCKETS = new Set(['covers', 'artists', 'artist_photos', 'images', 'photos']);

// Turns a Supabase Storage path (e.g. artist.photo_url) into a public URL.
// `width` is in pixels: pass the on-screen size × 2 or 3 for sharp images on phone screens.
export function storageUrl(bucket: string, path: string | null | undefined, width = 200): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;

  const { publicUrl } = supabase.storage.from(bucket).getPublicUrl(path).data;
  if (!IMAGE_BUCKETS.has(bucket)) return publicUrl;
  return `${publicUrl}?width=${width}&quality=75&resize=cover`;
}
