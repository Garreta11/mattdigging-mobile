// Response shapes of the Hono backend.
// Copied from frontend/src/services/api.ts. Keep both in sync until they move to a shared package.

export interface Genre {
  id: string;
  name: string;
  slug: string;
}

export interface Mood {
  id: string;
  name: string;
  slug: string;
}

export interface Artist {
  id: string;
  name: string;
  slug?: string;
  bio?: string;
  photo_url?: string;
  country?: string;
  tracks?: Track[];
}

export interface Track {
  id: string;
  title: string;
  artist: Artist;
  artist_id: string;
  album_name?: string;
  year?: number;
  decade?: string;
  country?: string;
  season?: string;
  audio_url: string;
  cover_url?: string;
  description?: string;
  is_free?: boolean;
  track_genres?: { genre: Genre }[];
  track_moods?: { mood: Mood }[];
}

export interface SelectionTrack {
  tracks: Omit<Track, 'artist' | 'track_genres' | 'track_moods'> & { created_at?: string };
}

export interface Selection {
  id: string;
  title: string;
  week_number: number;
  year: number;
  description: string;
  cover_url: string;
  is_published: boolean;
  published_at: string;
  selection_tracks?: SelectionTrack[];
}

export interface Auth {
  user: {
    id: string;
    email: string | undefined;
    created_at: string;
  };
  profile: {
    username: string | null;
    is_member: boolean;
    subscription_type: string | null;
    subscription_expires_at: string | null;
    member_since: string | null;
    /** True once the one-month-free welcome offer has been redeemed. */
    trial_used?: boolean;
  };
}
