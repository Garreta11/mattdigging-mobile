import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';

import { useFavoriteIds } from '@/api/favorites';
import { colors } from '@/theme';

type Props = {
  trackId: string;
  size?: number;
};

// Heart that adds / removes a track from the user's favourites.
// Hidden for visitors and non-members, like the website's FavoriteButton.
export function FavoriteButton({ trackId, size = 20 }: Props) {
  const { canFavorite, isFavorite, toggleFavorite } = useFavoriteIds();
  if (!canFavorite) return null;

  const active = isFavorite(trackId);
  return (
    <Pressable
      onPress={() => toggleFavorite(trackId)}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={active ? 'Remove from favourites' : 'Add to favourites'}>
      <Ionicons
        name={active ? 'heart' : 'heart-outline'}
        size={size}
        color={active ? colors.accent : colors.textSubtle}
      />
    </Pressable>
  );
}
