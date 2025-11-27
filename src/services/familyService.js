import { supabase } from "../lib/supabaseClient";

const SUPABASE_FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_URL?.replace(".supabase.co", ".supabase.co/functions/v1") || "";

export const createFamilyGroup = async (ownerId) => {
  try {
    const { data, error } = await supabase
      .from("family_groups")
      .insert({
        owner_id: ownerId,
        max_members: 5,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error("[FamilyService] Create group error:", error);
      return { success: false, error: error.message };
    }
    
    console.log("[FamilyService] Family group created:", data.id);
    return { success: true, groupId: data.id };
  } catch (error) {
    console.error("[FamilyService] Create group error:", error);
    return { success: false, error: error.message };
  }
};

export const inviteFamilyMember = async (familyGroupId, email, inviterName) => {
  try {
    const { data: existingMembers, error: countError } = await supabase
      .from("family_members")
      .select("id")
      .eq("family_group_id", familyGroupId);
    
    if (countError) {
      console.error("[FamilyService] Count error:", countError);
      return { success: false, error: "Failed to check member count" };
    }
    
    if (existingMembers && existingMembers.length >= 5) {
      return { success: false, error: "Family group is full (max 5 members)" };
    }
    
    const { data: existingInvite } = await supabase
      .from("family_members")
      .select("id, accepted")
      .eq("family_group_id", familyGroupId)
      .eq("invited_email", email.toLowerCase())
      .maybeSingle();
    
    if (existingInvite) {
      if (existingInvite.accepted) {
        return { success: false, error: "This email is already a family member" };
      }
      return { success: false, error: "An invite has already been sent to this email" };
    }
    
    const inviteToken = generateInviteToken();
    
    const { data, error } = await supabase
      .from("family_members")
      .insert({
        family_group_id: familyGroupId,
        invited_email: email.toLowerCase(),
        invite_token: inviteToken,
        accepted: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error("[FamilyService] Invite error:", error);
      return { success: false, error: error.message };
    }
    
    console.log("[FamilyService] Invite created:", data.id);
    
    return { 
      success: true, 
      inviteId: data.id,
      inviteToken: inviteToken,
      deepLink: `islamquest://family-join?token=${inviteToken}`,
      webLink: `https://islamquest.app/family-join?token=${inviteToken}`
    };
  } catch (error) {
    console.error("[FamilyService] Invite error:", error);
    return { success: false, error: error.message };
  }
};

const generateInviteToken = () => {
  const array = new Uint8Array(24);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const acceptFamilyInvite = async (inviteToken, userId) => {
  try {
    const { data: session } = await supabase.auth.getSession();
    const accessToken = session?.session?.access_token;
    
    if (!accessToken) {
      return { success: false, error: "Please sign in to accept the invite" };
    }
    
    const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/accept-family-invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify({ inviteToken, userId })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { success: false, error: errorData.error || "Failed to accept invite" };
    }
    
    const result = await response.json();
    
    console.log("[FamilyService] Invite accepted:", result);
    return {
      success: true,
      familyGroupId: result.familyGroupId,
      premium: result.premium,
      planType: "family"
    };
  } catch (error) {
    console.error("[FamilyService] Accept invite error:", error);
    return { success: false, error: error.message };
  }
};

export const removeFamilyMember = async (familyGroupId, memberId) => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    
    const { data: group } = await supabase
      .from("family_groups")
      .select("owner_id")
      .eq("id", familyGroupId)
      .single();
    
    if (!group || group.owner_id !== userId) {
      return { success: false, error: "Only the family owner can remove members" };
    }
    
    const { error } = await supabase
      .from("family_members")
      .delete()
      .eq("id", memberId)
      .eq("family_group_id", familyGroupId);
    
    if (error) {
      console.error("[FamilyService] Remove member error:", error);
      return { success: false, error: error.message };
    }
    
    console.log("[FamilyService] Member removed:", memberId);
    return { success: true };
  } catch (error) {
    console.error("[FamilyService] Remove member error:", error);
    return { success: false, error: error.message };
  }
};

export const getFamilyGroup = async (userId) => {
  try {
    const { data: ownedGroup } = await supabase
      .from("family_groups")
      .select(`
        id,
        owner_id,
        max_members,
        created_at,
        family_members (
          id,
          user_id,
          invited_email,
          accepted,
          created_at
        )
      `)
      .eq("owner_id", userId)
      .maybeSingle();
    
    if (ownedGroup) {
      return {
        success: true,
        isOwner: true,
        group: ownedGroup,
        members: ownedGroup.family_members || []
      };
    }
    
    const { data: membership } = await supabase
      .from("family_members")
      .select(`
        id,
        family_group_id,
        accepted,
        family_groups (
          id,
          owner_id,
          max_members
        )
      `)
      .eq("user_id", userId)
      .eq("accepted", true)
      .maybeSingle();
    
    if (membership && membership.family_groups) {
      return {
        success: true,
        isOwner: false,
        group: membership.family_groups,
        membershipId: membership.id
      };
    }
    
    return { success: true, group: null };
  } catch (error) {
    console.error("[FamilyService] Get family error:", error);
    return { success: false, error: error.message };
  }
};

export const handleDeepLink = async (url) => {
  try {
    const urlObj = new URL(url);
    const token = urlObj.searchParams.get("token");
    
    if (!token) {
      console.log("[FamilyService] No token in deep link");
      return { success: false, error: "Invalid invite link" };
    }
    
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    
    if (!userId) {
      return { 
        success: false, 
        requiresAuth: true,
        token: token,
        error: "Please sign in or create an account to join the family"
      };
    }
    
    return await acceptFamilyInvite(token, userId);
  } catch (error) {
    console.error("[FamilyService] Deep link error:", error);
    return { success: false, error: error.message };
  }
};

export default {
  createFamilyGroup,
  inviteFamilyMember,
  acceptFamilyInvite,
  removeFamilyMember,
  getFamilyGroup,
  handleDeepLink
};
