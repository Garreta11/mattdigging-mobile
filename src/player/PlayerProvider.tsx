import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import {
  requestNotificationPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  type AudioPlayer,
} from 'expo-audio';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

import { ApiError, apiFetch } from '@/api/client';
import type { Track } from '@/api/types';
import { useAuth } from '@/auth/AuthProvider';
import { shuffle } from '@/lib/shuffle';
import { storageUrl } from '@/lib/storage';

type PlayerContextValue = {
  /** The native audio player. Components that show progress read it with useAudioPlayerStatus(player). */
  player: AudioPlayer;
  queue: Track[];
  /** Where the queue came from, e.g. the selection title. */
  queueName: string | null;
  current: Track | null;
  /** True while the signed audio URL is being fetched. */
  isLoading: boolean;
  error: string | null;
  /** HTTP status behind `error`, e.g. 401 (log in needed) or 403 (members only). */
  errorStatus: number | null;
  playQueue: (tracks: Track[], startIndex: number, name: string) => void;
  /** Random order: the current track keeps playing, the rest of the list is shuffled. */
  isShuffled: boolean;
  toggleShuffle: () => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

type StreamResponse = { url: string; expiresInSeconds?: number };

// The backend says how long each signed URL is valid (2 hours today). Reuse it until
// 10 minutes before it expires, then ask for a fresh one.
const STREAM_URL_SAFETY_MARGIN = 10 * 60 * 1000;
const STREAM_URL_DEFAULT_TTL = 60 * 60 * 1000;
const streamUrlStaleTime = (query: { state: { data?: StreamResponse } }) => {
  const seconds = query.state.data?.expiresInSeconds;
  return seconds ? Math.max(0, seconds * 1000 - STREAM_URL_SAFETY_MARGIN) : STREAM_URL_DEFAULT_TTL;
};

// Lock screen / notification controls need the expo-audio config plugin (app.json), which
// only applies to our own builds. Expo Go ("storeClient") can't use it, so skip them there.
const SUPPORTS_LOCK_SCREEN = Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;

// The shuffle switch is remembered between launches.
const SHUFFLE_KEY = 'player.shuffle';

// `track` first, then the rest of the list in random order.
const shuffledFrom = (tracks: Track[], track: Track) => [track, ...shuffle(tracks.filter((t) => t.id !== track.id))];

export function PlayerProvider({ children }: { children: ReactNode }) {
  // One player for the whole app; tracks are swapped with player.replace().
  const player = useAudioPlayer(null, { updateInterval: 500 });
  const queryClient = useQueryClient();

  const [queue, setQueue] = useState<Track[]>([]);
  const [queueName, setQueueName] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [isShuffled, setIsShuffled] = useState(false);
  // The list in its own order, to go back to when shuffle is turned off.
  const [originalQueue, setOriginalQueue] = useState<Track[]>([]);
  const userId = useAuth().session?.user.id;

  useEffect(() => {
    AsyncStorage.getItem(SHUFFLE_KEY)
      .then((value) => setIsShuffled(value === 'true'))
      .catch(() => {});
  }, []);

  // Bumped on every load: if the user taps another track before the URL arrives,
  // the older (slower) request is ignored.
  const loadId = useRef(0);
  const lockScreenActive = useRef(false);

  // Keep playing with the screen locked, in silent mode (iOS) and with the app in the background.
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    });
  }, []);

  const load = useCallback(
    async (tracks: Track[], i: number) => {
      const track = tracks[i];
      if (!track) return;
      const id = ++loadId.current;
      setQueue(tracks);
      setIndex(i);
      setError(null);
      setErrorStatus(null);
      setIsLoading(true);
      player.pause();

      try {
        // Audio is fetched through the backend's /tracks/:id/stream (a signed URL),
        // not a public Storage URL, so it keeps working once the bucket is private.
        // Member tracks need a logged-in member (the token is sent by apiFetch); the user id is
        // part of the key so a URL fetched for one account is never reused after logging out.
        const { url } = await queryClient.fetchQuery({
          queryKey: ['stream', track.id, userId ?? 'guest'],
          queryFn: () => apiFetch<StreamResponse>(`/tracks/${track.id}/stream`),
          staleTime: streamUrlStaleTime,
        });
        if (id !== loadId.current) return;

        player.replace({ uri: url });
        player.play();

        // Title, artist and artwork on the lock screen and in Android's media notification.
        const metadata = {
          title: track.title,
          artist: track.artist?.name,
          albumTitle: track.album_name,
          artworkUrl: storageUrl('covers', track.cover_url, 600) ?? undefined,
        };
        if (SUPPORTS_LOCK_SCREEN) {
          try {
            if (lockScreenActive.current) {
              player.updateLockScreenMetadata(metadata);
            } else {
              player.setActiveForLockScreen(true, metadata, { showSeekBackward: true, showSeekForward: true });
              lockScreenActive.current = true;
            }
          } catch (err) {
            // Lock screen controls are a nice extra: never let them stop the music.
            console.warn('Lock screen controls unavailable', err);
          }
        }
      } catch (err) {
        if (id === loadId.current) {
          // 401 = not logged in, 403 = not a member (the backend's message says which).
          setError(err instanceof Error ? err.message : 'Could not play this track.');
          setErrorStatus(err instanceof ApiError ? err.status : null);
        }
      } finally {
        if (id === loadId.current) setIsLoading(false);
      }
    },
    [player, queryClient, userId],
  );

  // A track failed with 401 ("log in to listen") and the user has just logged in:
  // retry it once for this account, so they don't have to find it again.
  const retriedForUser = useRef<string | null>(null);
  useEffect(() => {
    if (userId && errorStatus === 401 && retriedForUser.current !== userId) {
      retriedForUser.current = userId;
      load(queue, index);
    }
  }, [userId, errorStatus, queue, index, load]);

  const playQueue = useCallback(
    (tracks: Track[], startIndex: number, name: string) => {
      setQueueName(name);
      // Android 13+ only shows the media notification (with play/pause) after this permission.
      if (Platform.OS === 'android') requestNotificationPermissionsAsync().catch(() => {});
      setOriginalQueue(tracks);
      const start = tracks[startIndex];
      // Shuffle on: the tapped track first, then the rest in random order.
      if (isShuffled && start) load(shuffledFrom(tracks, start), 0);
      else load(tracks, startIndex);
    },
    [load, isShuffled],
  );

  // Reorders the list without interrupting the track that is playing.
  const toggleShuffle = useCallback(() => {
    const turnOn = !isShuffled;
    setIsShuffled(turnOn);
    AsyncStorage.setItem(SHUFFLE_KEY, String(turnOn)).catch(() => {});

    const current = queue[index];
    if (!current) return;
    if (turnOn) {
      setQueue(shuffledFrom(originalQueue, current));
      setIndex(0);
    } else {
      // Back to the list's own order, carrying on from the current track.
      setQueue(originalQueue);
      setIndex(Math.max(0, originalQueue.findIndex((t) => t.id === current.id)));
    }
  }, [isShuffled, queue, index, originalQueue]);

  // Same as the website: after the last track, start again from the first.
  const next = useCallback(() => {
    if (queue.length) load(queue, (index + 1) % queue.length);
  }, [queue, index, load]);

  // Like most players: "previous" restarts the track unless it has only just started.
  const previous = useCallback(() => {
    if (player.currentTime > 3 || index === 0) player.seekTo(0);
    else load(queue, index - 1);
  }, [player, queue, index, load]);

  const togglePlay = useCallback(() => {
    if (player.playing) player.pause();
    else player.play();
  }, [player]);

  // When a track finishes, play the next one. A ref always points at the latest
  // `next`, so the listener is added only once and never uses an old queue.
  const nextRef = useRef(next);
  useEffect(() => {
    nextRef.current = next;
  }, [next]);
  useEffect(() => {
    const subscription = player.addListener('playbackStatusUpdate', (status) => {
      if (status.didJustFinish) nextRef.current();
    });
    return () => subscription.remove();
  }, [player]);

  const value: PlayerContextValue = {
    player,
    queue,
    queueName,
    current: queue[index] ?? null,
    isLoading,
    error,
    errorStatus,
    playQueue,
    isShuffled,
    toggleShuffle,
    togglePlay,
    next,
    previous,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const value = useContext(PlayerContext);
  if (!value) throw new Error('usePlayer must be used inside <PlayerProvider>');
  return value;
}
