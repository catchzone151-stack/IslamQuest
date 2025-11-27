import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  
  try {
    const body = await req.json();
    
    const messageData = body.message?.data;
    if (!messageData) {
      console.log("[GoogleWebhook] No message data received");
      return new Response(JSON.stringify({ received: true }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    
    const decodedData = JSON.parse(atob(messageData));
    const { oneTimeProductNotification, voidedPurchaseNotification } = decodedData;
    
    console.log("[GoogleWebhook] Received notification:", JSON.stringify(decodedData));
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    if (oneTimeProductNotification) {
      const { notificationType, purchaseToken, sku } = oneTimeProductNotification;
      
      switch (notificationType) {
        case 2:
          console.log(`[GoogleWebhook] ONE_TIME_PRODUCT_CANCELED for ${sku}`);
          
          const { data: purchase } = await supabase
            .from("purchases")
            .select("user_id")
            .eq("receipt_token", purchaseToken)
            .maybeSingle();
          
          if (purchase?.user_id) {
            await supabase
              .from("purchases")
              .update({ refunded: true })
              .eq("receipt_token", purchaseToken);
            
            await supabase
              .from("users")
              .update({ premium: false, plan_type: null })
              .eq("id", purchase.user_id);
            
            console.log(`[GoogleWebhook] Revoked premium for user ${purchase.user_id}`);
          }
          break;
        
        case 1:
          console.log(`[GoogleWebhook] ONE_TIME_PRODUCT_PURCHASED for ${sku}`);
          break;
        
        default:
          console.log(`[GoogleWebhook] Unknown notificationType: ${notificationType}`);
      }
    }
    
    if (voidedPurchaseNotification) {
      const { purchaseToken, orderId, productType, refundType } = voidedPurchaseNotification;
      
      console.log(`[GoogleWebhook] VOIDED_PURCHASE: orderId=${orderId}, refundType=${refundType}`);
      
      const { data: purchase } = await supabase
        .from("purchases")
        .select("user_id")
        .or(`receipt_token.eq.${purchaseToken},order_id.eq.${orderId}`)
        .maybeSingle();
      
      if (purchase?.user_id) {
        await supabase
          .from("purchases")
          .update({ refunded: true })
          .or(`receipt_token.eq.${purchaseToken},order_id.eq.${orderId}`);
        
        await supabase
          .from("users")
          .update({ premium: false, plan_type: null })
          .eq("id", purchase.user_id);
        
        console.log(`[GoogleWebhook] Revoked premium for user ${purchase.user_id} (voided)`);
      }
    }
    
    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" }
    });
    
  } catch (error) {
    console.error("[GoogleWebhook] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
