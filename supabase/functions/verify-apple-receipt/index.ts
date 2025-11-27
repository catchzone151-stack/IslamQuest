import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const APPLE_KEY_ID = Deno.env.get("APPLE_KEY_ID")!;
const APPLE_ISSUER_ID = Deno.env.get("APPLE_ISSUER_ID")!;
const APPLE_BUNDLE_ID = Deno.env.get("APPLE_BUNDLE_ID")!;
const APPLE_PRIVATE_KEY = Deno.env.get("APPLE_PRIVATE_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const IS_SANDBOX = Deno.env.get("APPLE_SANDBOX") === "true";
const APPLE_API_BASE = IS_SANDBOX 
  ? "https://api.storekit-sandbox.itunes.apple.com"
  : "https://api.storekit.itunes.apple.com";

function base64UrlEncode(data: string): string {
  return btoa(data).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function createAppleJWT(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  
  const header = { alg: "ES256", kid: APPLE_KEY_ID, typ: "JWT" };
  const payload = {
    iss: APPLE_ISSUER_ID,
    iat: now,
    exp: now + 3600,
    aud: "appstoreconnect-v1",
    bid: APPLE_BUNDLE_ID
  };
  
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const message = `${encodedHeader}.${encodedPayload}`;
  
  const privateKeyPem = atob(APPLE_PRIVATE_KEY);
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(privateKeyPem),
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    privateKey,
    new TextEncoder().encode(message)
  );
  
  const encodedSignature = base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
  
  return `${message}.${encodedSignature}`;
}

async function verifyWithApple(transactionId: string): Promise<any> {
  const jwt = await createAppleJWT();
  
  const response = await fetch(
    `${APPLE_API_BASE}/inApps/v1/transactions/${transactionId}`,
    {
      headers: {
        "Authorization": `Bearer ${jwt}`,
        "Content-Type": "application/json"
      }
    }
  );
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Apple API error: ${response.status} - ${error}`);
  }
  
  return await response.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const { receipt, productId, userId, deviceId, nonce, isRestore } = await req.json();
    
    if (!receipt || !productId || !userId || !deviceId || !nonce) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { data: existingPurchase } = await supabase
      .from("purchases")
      .select("id, user_id")
      .eq("receipt_token", receipt)
      .eq("verified", true)
      .maybeSingle();
    
    if (existingPurchase) {
      if (existingPurchase.user_id !== userId) {
        return new Response(
          JSON.stringify({ verified: false, reason: "This purchase belongs to a different account" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (!isRestore) {
        return new Response(
          JSON.stringify({ verified: false, reason: "Receipt already used" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    
    let transactionInfo;
    try {
      transactionInfo = await verifyWithApple(receipt);
    } catch (error) {
      console.error("Apple verification failed:", error);
      return new Response(
        JSON.stringify({ verified: false, reason: "Apple verification failed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const expectedProducts = ["premium_lifetime", "premium_family_lifetime"];
    if (!expectedProducts.includes(transactionInfo.productId)) {
      return new Response(
        JSON.stringify({ verified: false, reason: "Invalid product" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (transactionInfo.revocationDate) {
      return new Response(
        JSON.stringify({ verified: false, reason: "Purchase was refunded" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const planType = transactionInfo.productId === "premium_family_lifetime" ? "family" : "single";
    
    const { data: purchase, error: purchaseError } = await supabase
      .from("purchases")
      .insert({
        user_id: userId,
        platform: "ios",
        product_id: productId,
        receipt_token: receipt,
        verified: true,
        refunded: false,
        nonce: nonce,
        device_id: deviceId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (purchaseError) {
      console.error("Purchase insert error:", purchaseError);
    }
    
    const { error: userError } = await supabase
      .from("users")
      .upsert({
        id: userId,
        premium: true,
        plan_type: planType,
        active_device_id: deviceId,
        updated_at: new Date().toISOString()
      }, { onConflict: "id" });
    
    if (userError) {
      console.error("User update error:", userError);
    }
    
    if (planType === "family") {
      const { data: existingGroup } = await supabase
        .from("family_groups")
        .select("id")
        .eq("owner_id", userId)
        .maybeSingle();
      
      if (!existingGroup) {
        await supabase
          .from("family_groups")
          .insert({
            owner_id: userId,
            max_members: 5,
            created_at: new Date().toISOString()
          });
      }
    }
    
    return new Response(
      JSON.stringify({
        verified: true,
        planType: planType,
        purchaseId: purchase?.id
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Verification error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
