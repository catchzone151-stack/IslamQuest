import { supabase } from "../lib/supabaseClient";

export async function logPurchase(userId, productId, amount, currency = "GBP") {
  const { error } = await supabase.from("purchases").insert({
    user_id: userId,
    product_id: productId,
    amount: amount,
    currency: currency,
    timestamp: Date.now(),
  });
  if (error) {
    console.error("[PurchaseLogs] logPurchase error:", error);
  } else {
    console.log("[PurchaseLogs] logPurchase success:", productId, amount);
  }
}
