import type { Track } from '@/api/types';
import { TrackRow } from '@/components/TrackRow';
import { usePlayer } from '@/player/PlayerProvider';

export const FAVORITES_QUEUE_NAME = 'Favourite tracks';

// Numbered favourite tracks. Tapping one plays all favourites from that track.
// `limit` shows only the first N (the Profile preview); the queue is always the full list.
export function FavoriteTrackList({ favorites, limit }: { favorites: Track[]; limit?: number }) {
  const { current, playQueue } = usePlayer();
  const shown = limit ? favorites.slice(0, limit) : favorites;

  return (
    <>
      {shown.map((track, index) => (
        <TrackRow
          key={track.id}
          track={track}
          index={index}
          isActive={current?.id === track.id}
          onPress={() => playQueue(favorites, index, FAVORITES_QUEUE_NAME)}
        />
      ))}
    </>
  );
}
