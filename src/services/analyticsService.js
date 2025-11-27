import { supabase } from "../lib/supabaseClient";
import { getDeviceId } from "./deviceService";

const getPlatform = () => {
  const userAgent = navigator.userAgent || "";
  if (/iPad|iPhone|iPod/.test(userAgent)) return "ios";
  if (/Android/.test(userAgent)) return "android";
  return "web";
};

export const logEvent = async (eventType, eventDetails = {}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || null;
    
    let deviceId = null;
    try {
      deviceId = await getDeviceId();
    } catch (e) {
      console.warn("[Analytics] Could not get device ID:", e);
    }

    const platform = getPlatform();

    if (process.env.NODE_ENV === "development") {
      console.log("[Analytics]", eventType, { userId, deviceId, platform, ...eventDetails });
    }

    await supabase.functions.invoke("log-event", {
      body: {
        event_type: eventType,
        user_id: userId,
        device_id: deviceId,
        platform,
        event_details: eventDetails,
      },
    });

    return true;
  } catch (error) {
    console.error("[Analytics] Failed to log event:", error);
    return false;
  }
};

export const ANALYTICS_EVENTS = {
  PURCHASE_INITIATED: "purchase_initiated",
  PURCHASE_TOKEN_RECEIVED: "purchase_token_received",
  PURCHASE_VERIFIED_SERVER: "purchase_verified_server",
  PURCHASE_REFUNDED: "purchase_refunded",
  PURCHASE_REVOKED: "purchase_revoked",
  RESTORE_PURCHASES_ATTEMPTED: "restore_purchases_attempted",
  RESTORE_PURCHASES_SUCCESS: "restore_purchases_success",
  RESTORE_PURCHASES_FAILED: "restore_purchases_failed",

  FAMILY_INVITE_SENT: "family_invite_sent",
  FAMILY_INVITE_LINK_OPENED: "family_invite_link_opened",
  FAMILY_INVITE_ACCEPTED: "family_invite_accepted",
  FAMILY_INVITE_FAILED: "family_invite_failed",
  FAMILY_LIMIT_REACHED: "family_limit_reached",

  LOGIN_SUCCESS: "login_success",
  LOGIN_FAILED: "login_failed",
  ACTIVE_DEVICE_CHANGED: "active_device_changed",
  DEVICE_LIMIT_TRIGGERED: "device_limit_triggered",
  LOGOUT: "logout",

  RECEIPT_REPLAY_BLOCKED: "receipt_replay_blocked",
  INVALID_RECEIPT: "invalid_receipt",
  REFUNDED_RECEIPT_DETECTED: "refunded_receipt_detected",

  NETWORK_ERROR: "network_error",
  SUPABASE_ERROR: "supabase_error",
  UNKNOWN_ERROR: "unknown_error",

  ACCOUNT_DELETED: "account_deleted",
};
