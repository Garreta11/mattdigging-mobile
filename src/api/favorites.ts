import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useAuth } from '@/auth/AuthProvider';
import { supabase } from '@/lib/supabase';

import { usePlayerTracks } from './content';
import type { Track } from './types';

type FavoriteRow = { track_id: string; added_at: string };

// Same Supabase table as the website (frontend/src/hooks/useFavorites.ts), so favourites
// saved on the website show up in the app and the other way round.
// Read and written directly with the user's login, like the website.
const favoritesKey = (userId: string | undefined) => ['favorites', userId] as const;

/** Favourite track ids of the logged-in user, plus add/remove. Favourites are a members feature. */
export function useFavoriteIds() {
  const { session, isMember } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: favoritesKey(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('track_id, added_at')
        .eq('user_id', userId!)
        .order('added_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data as FavoriteRow[];
    },
    enabled: !!userId,
  });

  const ids = useMemo(() => new Set(data?.map((f) => f.track_id)), [data]);

  const mutation = useMutation({
    mutationFn: async ({ trackId, add }: { trackId: string; add: boolean }) => {
      const { error } = add
        ? await supabase.from('user_favorites').insert({ user_id: userId, track_id: trackId })
        : await supabase.from('user_favorites').delete().eq('user_id', userId!).eq('track_id', trackId);
      if (error) throw new Error(error.message);
    },
    // Optimistic update: the heart changes instantly, before the database answers.
    onMutate: async ({ trackId, add }) => {
      const key = favoritesKey(userId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<FavoriteRow[]>(key);
      queryClient.setQueryData<FavoriteRow[]>(key, (rows = []) =>
        add
          ? [{ track_id: trackId, added_at: new Date().toISOString() }, ...rows]
          : rows.filter((r) => r.track_id !== trackId),
      );
      return { previous };
    },
    // If saving failed, put the list back as it was.
    onError: (_err, _vars, context) => queryClient.setQueryData(favoritesKey(userId), context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: favoritesKey(userId) }),
  });

  return {
    /** Whether the heart is shown at all: logged-in members, like the website. */
    canFavorite: !!userId && isMember,
    isFavorite: (trackId: string) => ids.has(trackId),
    toggleFavorite: (trackId: string) => mutation.mutate({ trackId, add: !ids.has(trackId) }),
    count: data?.length ?? 0,
    rows: data,
  };
}

/** Favourite tracks with their details, newest first (for the Profile screen). */
export function useFavoriteTracks() {
  const { rows, canFavorite } = useFavoriteIds();
  // Details come from the list of all published tracks (cached, also used by "Play a random track").
  const { data: tracks, isPending } = usePlayerTracks(true, canFavorite);

  const favorites = useMemo(() => {
    const byId = new Map(tracks?.map((t) => [t.id, t]));
    return (rows ?? []).map((r) => byId.get(r.track_id)).filter((t): t is Track => !!t);
  }, [rows, tracks]);

  return { favorites, isLoading: canFavorite && (!rows || isPending) };
}
