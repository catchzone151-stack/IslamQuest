import { useUserStore } from "../store/useUserStore";
import { getAvatarImage } from "./avatarUtils";

export function applyAvatarOverride(player) {
  const { id: currentUserId, avatar: userAvatar } = useUserStore();
  
  // If this player IS the logged-in user, ALWAYS override with current avatar
  if (player?.id === currentUserId) {
    return getAvatarImage(userAvatar);
  }
  
  // Otherwise use player's own avatar normally
  return getAvatarImage(player?.avatar);
}
