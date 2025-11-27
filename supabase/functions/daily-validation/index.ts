import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GOOGLE_CLIENT_EMAIL = Deno.env.get("GOOGLE_CLIENT_EMAIL");
const GOOGLE_PRIVATE_KEY = Deno.env.get("GOOGLE_PRIVATE_KEY");
const GOOGLE_PACKAGE_NAME = Deno.env.get("GOOGLE_PACKAGE_NAME");

serve(async (req) => {
  console.log("[DailyValidation] Starting daily purchase validation");
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const { data: purchases, error: fetchError } = await supabase
      .from("purchases")
      .select("id, user_id, platform, product_id, receipt_token, refunded")
      .eq("verified", true)
      .eq("refunded", false);
    
    if (fetchError) {
      console.error("[DailyValidation] Failed to fetch purchases:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch purchases" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    
    console.log(`[DailyValidation] Found ${purchases?.length || 0} verified purchases to validate`);
    
    let revokedCount = 0;
    let validCount = 0;
    let errorCount = 0;
    
    for (const purchase of purchases || []) {
      try {
        if (purchase.platform === "android" && GOOGLE_CLIENT_EMAIL && GOOGLE_PRIVATE_KEY && GOOGLE_PACKAGE_NAME) {
          const isValid = await validateGooglePurchase(
            purchase.product_id,
            purchase.receipt_token
          );
          
          if (!isValid) {
            await revokePremium(supabase, purchase.id, purchase.user_id);
            revokedCount++;
            console.log(`[DailyValidation] Revoked Android purchase ${purchase.id}`);
          } else {
            validCount++;
          }
        } else if (purchase.platform === "ios") {
          validCount++;
          console.log(`[DailyValidation] iOS purchase ${purchase.id} - skipped (Apple webhooks handle revocations)`);
        } else {
          validCount++;
        }
      } catch (error) {
        console.error(`[DailyValidation] Error validating purchase ${purchase.id}:`, error);
        errorCount++;
      }
    }
    
    console.log(`[DailyValidation] Complete: ${validCount} valid, ${revokedCount} revoked, ${errorCount} errors`);
    
    return new Response(
      JSON.stringify({
        success: true,
        processed: purchases?.length || 0,
        valid: validCount,
        revoked: revokedCount,
        errors: errorCount
      }),
      { headers: { "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("[DailyValidation] Fatal error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

async function validateGooglePurchase(productId: string, purchaseToken: string): Promise<boolean> {
  try {
    const accessToken = await getGoogleAccessToken();
    
    const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${GOOGLE_PACKAGE_NAME}/purchases/products/${productId}/tokens/${purchaseToken}`;
    
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) {
      console.log(`[DailyValidation] Google API returned ${response.status} for ${productId}`);
      return false;
    }
    
    const data = await response.json();
    
    if (data.purchaseState !== 0) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("[DailyValidation] Google validation error:", error);
    return true;
  }
}

async function getGoogleAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: GOOGLE_CLIENT_EMAIL,
    scope: "https://www.googleapis.com/auth/androidpublisher",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600
  };
  
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const message = `${encodedHeader}.${encodedPayload}`;
  
  const privateKeyPem = GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n");
  const b64 = privateKeyPem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    bytes.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    privateKey,
    new TextEncoder().encode(message)
  );
  
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const jwt = `${message}.${encodedSignature}`;
  
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });
  
  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

async function revokePremium(supabase: any, purchaseId: string, userId: string) {
  await supabase
    .from("purchases")
    .update({ refunded: true })
    .eq("id", purchaseId);
  
  await supabase
    .from("users")
    .update({ premium: false, plan_type: null })
    .eq("id", userId);
}
