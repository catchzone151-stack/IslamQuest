import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GOOGLE_CLIENT_EMAIL = Deno.env.get("GOOGLE_CLIENT_EMAIL")!;
const GOOGLE_PRIVATE_KEY = Deno.env.get("GOOGLE_PRIVATE_KEY")!;
const GOOGLE_PACKAGE_NAME = Deno.env.get("GOOGLE_PACKAGE_NAME")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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
  
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const message = `${encodedHeader}.${encodedPayload}`;
  
  const privateKeyPem = GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(privateKeyPem),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    privateKey,
    new TextEncoder().encode(message)
  );
  
  const encodedSignature = base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
  const jwt = `${message}.${encodedSignature}`;
  
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });
  
  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    throw new Error(`Failed to get Google access token: ${error}`);
  }
  
  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

async function verifyWithGoogle(productId: string, purchaseToken: string): Promise<any> {
  const accessToken = await getGoogleAccessToken();
  
  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${GOOGLE_PACKAGE_NAME}/purchases/products/${productId}/tokens/${purchaseToken}`;
  
  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google API error: ${response.status} - ${error}`);
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
    
    let purchaseInfo;
    try {
      purchaseInfo = await verifyWithGoogle(productId, receipt);
    } catch (error) {
      console.error("Google verification failed:", error);
      return new Response(
        JSON.stringify({ verified: false, reason: "Google verification failed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (purchaseInfo.purchaseState !== 0) {
      return new Response(
        JSON.stringify({ verified: false, reason: "Purchase not completed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const planType = productId === "premium_family_lifetime" ? "family" : "single";
    
    const { data: purchase, error: purchaseError } = await supabase
      .from("purchases")
      .insert({
        user_id: userId,
        platform: "android",
        product_id: productId,
        receipt_token: receipt,
        verified: true,
        refunded: false,
        nonce: nonce,
        device_id: deviceId,
        order_id: purchaseInfo.orderId,
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
