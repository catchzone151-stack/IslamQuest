import { useUserStore } from "../store/useUserStore";
import { getAvatarImage } from "./avatarUtils";

// This function is used EVERYWHERE avatars are rendered (friends, leaderboard, events, etc.)
// It ensures that whenever the "current user" is shown, we ALWAYS use the profile avatar.
export function applyAvatarOverride(player) {
  const { id: currentUserId, name: currentUserName, avatar: currentAvatar } = useUserStore.getState();

  // If nothing passed, just return current user's avatar
  if (!player) {
    return getAvatarImage(currentAvatar, { userId: currentUserId, nickname: currentUserName });
  }

  // Detect if this row/card is the logged-in user
  const isCurrentUser =
    player.id === currentUserId ||
    player.id === "current_user" ||
    player.name === currentUserName ||
    player.name === "You";

  const finalAvatarId = isCurrentUser ? currentAvatar : player.avatar;

  return getAvatarImage(finalAvatarId, { userId: player.id, nickname: player.name });
}
