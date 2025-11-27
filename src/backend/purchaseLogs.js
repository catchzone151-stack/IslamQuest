import { supabase } from "../lib/supabaseClient";

export async function logPurchase(userId, productId, amount, currency = "GBP", platform = "web", receipt = null) {
  const insertData = {
    user_id: userId,
    product_id: productId,
    amount: amount,
    currency: currency,
    timestamp: Date.now(),
  };
  
  if (platform) insertData.platform = platform;
  if (receipt) insertData.receipt = receipt;
  
  const { error } = await supabase.from("purchases").insert(insertData);
  if (error) {
    console.error("[PurchaseLogs] logPurchase error:", error);
  } else {
    console.log("[PurchaseLogs] logPurchase success:", productId, amount, platform);
  }
}

export async function checkExistingPurchase(userId) {
  const { data, error } = await supabase
    .from("purchases")
    .select("*")
    .eq("user_id", userId)
    .order("timestamp", { ascending: false })
    .limit(1);
    
  if (error) {
    console.error("[PurchaseLogs] checkExistingPurchase error:", error);
    return null;
  }
  
  return data?.[0] || null;
}
