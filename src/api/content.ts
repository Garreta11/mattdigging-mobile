import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { apiFetch } from './client';
import type { Artist, Genre, Mood, Selection, Track } from './types';

// Lookup lists (genres, moods…) rarely change: the backend caches them for 1 hour, so do we.
const LOOKUP_STALE_TIME = 60 * 60 * 1000;

// Each hook wraps one backend route with React Query, which gives the screen
// { data, isPending, error, refetch } and caches the result: switching tabs
// back and forth does not refetch, and every screen asking for the same key shares one request.
// The `queryKey` is the cache name: same key = same cached data.

export const useArtists = () =>
  useQuery({
    queryKey: ['artists'],
    queryFn: () => apiFetch<Artist[]>('/artists'),
  });

// Non-members only get tracks from the first `maxSelections` selections (same as the website).
export const useArtistTracks = (artistId: string, maxSelections?: number) =>
  useQuery({
    queryKey: ['artists', artistId, 'tracks', maxSelections ?? 'all'],
    queryFn: () =>
      apiFetch<Track[]>(`/artists/${artistId}/tracks${maxSelections ? `?max_selections=${maxSelections}` : ''}`),
  });

export const useSelections = () =>
  useQuery({
    queryKey: ['selections'],
    queryFn: () => apiFetch<Selection[]>('/selections'),
  });

export const useSelectionTracks = (selectionId: string) =>
  useQuery({
    queryKey: ['selections', selectionId, 'tracks'],
    queryFn: () => apiFetch<Track[]>(`/tracks/by-selection/${selectionId}`),
  });

export const useHiddenGems = () =>
  useQuery({
    queryKey: ['hidden-gems'],
    queryFn: () => apiFetch<{ selection: Selection; tracks: Track[] }>('/selections/hidden-gems'),
  });

export const useTrack = (trackId: string) =>
  useQuery({
    queryKey: ['tracks', trackId],
    queryFn: () => apiFetch<Track>(`/tracks/${trackId}`),
  });

// ── Playlists ────────────────────────────────────────────────────────────────

export const PLAYLIST_FILTERS = ['mood', 'genre', 'country', 'year', 'season'] as const;
export type PlaylistFilter = (typeof PLAYLIST_FILTERS)[number];

// Seasons are fixed on the website too (no backend route).
export const SEASONS = [
  { slug: 'winter', name: 'Winter' },
  { slug: 'spring', name: 'Spring' },
  { slug: 'summer', name: 'Summer' },
  { slug: 'autumn', name: 'Autumn' },
];

export const useGenres = () =>
  useQuery({
    queryKey: ['genres'],
    queryFn: () => apiFetch<Genre[]>('/genres'),
    staleTime: LOOKUP_STALE_TIME,
  });

export const useMoods = () =>
  useQuery({
    queryKey: ['moods'],
    queryFn: () => apiFetch<Mood[]>('/moods'),
    staleTime: LOOKUP_STALE_TIME,
  });

export const useYears = () =>
  useQuery({
    queryKey: ['years'],
    queryFn: () => apiFetch<{ year: number }[]>('/tracks/years'),
    staleTime: LOOKUP_STALE_TIME,
  });

export const useCountries = () =>
  useQuery({
    queryKey: ['countries'],
    queryFn: () => apiFetch<{ country: string }[]>('/tracks/countries'),
    staleTime: LOOKUP_STALE_TIME,
  });

/** Tracks matching one filter, e.g. ('mood', 'lava-lamp') → GET /tracks?mood=lava-lamp */
export const usePlaylistTracks = (type: PlaylistFilter, value: string, enabled = true) =>
  useQuery({
    queryKey: ['playlist', type, value],
    queryFn: () => apiFetch<Track[]>(`/tracks?${new URLSearchParams({ [type]: value })}`),
    enabled,
  });

export type PlaylistOption = { value: string; label: string };

/** The choices for one filter type as { value, label } (value is what the backend expects). */
export function usePlaylistOptions(type: PlaylistFilter) {
  // All four requests are cached, so calling every hook is cheap; only the active one is used.
  const genres = useGenres();
  const moods = useMoods();
  const years = useYears();
  const countries = useCountries();

  switch (type) {
    case 'genre':
      return { ...genres, options: genres.data?.map((g) => ({ value: g.slug, label: g.name })) };
    case 'mood':
      return { ...moods, options: moods.data?.map((m) => ({ value: m.slug, label: m.name })) };
    case 'year':
      return { ...years, options: years.data?.map((y) => ({ value: String(y.year), label: String(y.year) })) };
    case 'country':
      return { ...countries, options: countries.data?.map((c) => ({ value: c.country, label: c.country })) };
    case 'season':
      return {
        isPending: false,
        error: null,
        refetch: async () => {},
        options: SEASONS.map((s) => ({ value: s.slug, label: s.name })),
      };
  }
}

// ── Search ───────────────────────────────────────────────────────────────────

export type SearchResults = {
  artists: Artist[];
  tracks: Track[];
  genres: Genre[];
  moods: Mood[];
  countries: { country: string }[];
};

/** Same 5 parallel requests as the website's SearchInput. Starts from 2 characters. */
export const useSearch = (query: string) => {
  const q = encodeURIComponent(query.trim());
  return useQuery({
    queryKey: ['search', query.trim().toLowerCase()],
    queryFn: async (): Promise<SearchResults> => {
      const [artists, tracks, countries, genres, moods] = await Promise.all([
        apiFetch<Artist[]>(`/artists/search?q=${q}`),
        apiFetch<Track[]>(`/tracks/search?q=${q}`),
        apiFetch<{ country: string }[]>(`/tracks/countries/search?q=${q}`),
        apiFetch<Genre[]>(`/tracks/genres/search?q=${q}`),
        apiFetch<Mood[]>(`/tracks/moods/search?q=${q}`),
      ]);
      return { artists, tracks, countries, genres, moods };
    },
    enabled: query.trim().length >= 2,
    // Keep showing the previous results while the next search loads (no flicker while typing).
    placeholderData: keepPreviousData,
  });
};

// ── Random play (Home) ───────────────────────────────────────────────────────

/**
 * The list the website's player picks random tracks from:
 * every published track for members, only the free ones otherwise.
 */
export const usePlayerTracks = (isMember: boolean, enabled = true) =>
  useQuery({
    queryKey: ['player-tracks', isMember ? 'member' : 'free'],
    queryFn: async () => {
      const tracks = await apiFetch<Track[]>(isMember ? '/tracks/player' : '/tracks/player/free');
      // These responses have no artist_id; the player uses it for its artist link.
      return tracks.map((t) => ({ ...t, artist_id: t.artist_id ?? t.artist?.id }));
    },
    enabled,
  });
