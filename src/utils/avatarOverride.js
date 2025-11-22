import { useUserStore } from "../store/useUserStore";
import { getAvatarImage } from "./avatarUtils";

export function applyAvatarOverride(player) {
  const { name: currentName, avatar: userAvatar } = useUserStore.getState();
  
  // If this player is the logged-in user by name or id
  if (
    player?.name === currentName ||
    player?.id === "current_user" ||
    player?.id === useUserStore.getState().id
  ) {
    return getAvatarImage(userAvatar);
  }

  // Otherwise use the player's own avatar
  return getAvatarImage(player?.avatar);
}
