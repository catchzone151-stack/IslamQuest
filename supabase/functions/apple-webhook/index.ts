import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function decodeJWTPayload(jwt: string): any {
  const parts = jwt.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format");
  }
  
  const payload = parts[1];
  const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
  return JSON.parse(decoded);
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  
  try {
    const body = await req.json();
    const { signedPayload } = body;
    
    if (!signedPayload) {
      console.log("[AppleWebhook] No signedPayload received");
      return new Response(JSON.stringify({ received: true }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    
    const payload = decodeJWTPayload(signedPayload);
    const notificationType = payload.notificationType;
    const data = payload.data;
    
    console.log(`[AppleWebhook] Received notification: ${notificationType}`);
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    switch (notificationType) {
      case "REFUND":
      case "REVOKE": {
        const transactionInfo = data?.signedTransactionInfo 
          ? decodeJWTPayload(data.signedTransactionInfo) 
          : null;
        
        if (transactionInfo?.originalTransactionId) {
          const { data: purchase } = await supabase
            .from("purchases")
            .select("user_id")
            .eq("receipt_token", transactionInfo.originalTransactionId)
            .maybeSingle();
          
          if (purchase?.user_id) {
            await supabase
              .from("purchases")
              .update({ refunded: true })
              .eq("receipt_token", transactionInfo.originalTransactionId);
            
            await supabase
              .from("users")
              .update({ premium: false, plan_type: null })
              .eq("id", purchase.user_id);
            
            console.log(`[AppleWebhook] Revoked premium for user ${purchase.user_id}`);
          }
        }
        break;
      }
      
      case "DID_RENEW":
        console.log("[AppleWebhook] DID_RENEW ignored for lifetime products");
        break;
      
      case "CONSUMPTION_REQUEST":
        console.log("[AppleWebhook] Consumption request received");
        break;
      
      default:
        console.log(`[AppleWebhook] Unhandled notification type: ${notificationType}`);
    }
    
    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" }
    });
    
  } catch (error) {
    console.error("[AppleWebhook] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
