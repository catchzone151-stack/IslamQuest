import { supabase } from "../lib/supabaseClient";

export async function addFamilyMember(familyId, userId) {
  const { data, error } = await supabase
    .from("family_members")
    .insert({
      family_id: familyId,
      user_id: userId,
      added_at: new Date().toISOString(),
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error("[FamilyMembers] addFamilyMember error:", error);
    return { success: false, error: error.message };
  }
  
  console.log("[FamilyMembers] addFamilyMember success:", familyId, userId);
  return { success: true, data };
}

export async function removeFamilyMember(familyId, userId) {
  const { error } = await supabase
    .from("family_members")
    .delete()
    .eq("family_id", familyId)
    .eq("user_id", userId);

  if (error) {
    console.error("[FamilyMembers] removeFamilyMember error:", error);
    return { success: false, error: error.message };
  }
  
  console.log("[FamilyMembers] removeFamilyMember success:", familyId, userId);
  return { success: true };
}

export async function getFamilyMembers(familyId) {
  const { data, error } = await supabase
    .from("family_members")
    .select("user_id, added_at")
    .eq("family_id", familyId);

  if (error) {
    console.error("[FamilyMembers] getFamilyMembers error:", error);
    return [];
  }
  
  return data || [];
}

export async function getUserFamilyId(userId) {
  const { data, error } = await supabase
    .from("family_members")
    .select("family_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[FamilyMembers] getUserFamilyId error:", error);
    return null;
  }
  
  return data?.family_id || null;
}
