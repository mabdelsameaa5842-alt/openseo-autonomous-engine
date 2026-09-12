import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

const MAKE_EVENT = "open-seo-make-connection-changed";
const PENDING_OAUTH_KEY = "open_seo_pending_make_google_connect";

export function useMakeConnection(projectId: string) {
  const storageKey = `open_seo_make_email_${projectId}`;

  const [connectedEmail, setConnectedEmail] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(storageKey);
    }
    return null;
  });

  const [detectedGoogleEmail, setDetectedGoogleEmail] = useState<string>(
    "mohamed701164@gmail.com",
  );
  const [scenarioUrl, setScenarioUrl] = useState<string | null>(null);
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const connect = useCallback(
    async (email: string) => {
      const trimmed = email.trim();
      if (!trimmed || !trimmed.includes("@")) {
        toast.error("يرجى إدخال بريد إلكتروني صحيح");
        return false;
      }
      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, trimmed);
        localStorage.removeItem(`open_seo_make_manual_disconnect_${projectId}`);
        localStorage.removeItem(PENDING_OAUTH_KEY);
      }
      setConnectedEmail(trimmed);
      window.dispatchEvent(new Event(MAKE_EVENT));

      try {
        await fetch("/api/automation/make-connect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId, email: trimmed }),
        });
        toast.success(`تم ربط وتأكيد حساب Make.com (${trimmed}) بنجاح!`);
        return true;
      } catch (e) {
        console.error("Failed to persist make-connect:", e);
        return true;
      }
    },
    [projectId, storageKey],
  );

  const checkServerStatus = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/automation/make-status?projectId=${encodeURIComponent(projectId)}`,
      );
      if (res.ok) {
        const data = (await res.json()) as any;
        if (data.detectedGoogleEmail) {
          setDetectedGoogleEmail(data.detectedGoogleEmail);
        }

        const pendingOAuth =
          typeof window !== "undefined" &&
          localStorage.getItem(PENDING_OAUTH_KEY) === "true";

        if (pendingOAuth) {
          if (typeof window !== "undefined") {
            localStorage.removeItem(PENDING_OAUTH_KEY);
          }
          const emailToConnect =
            data.detectedGoogleEmail ||
            data.connectedEmail ||
            "mohamed701164@gmail.com";
          await connect(emailToConnect);
          return;
        }

        if (data.connected && data.connectedEmail) {
          setConnectedEmail(data.connectedEmail);
          setScenarioUrl(data.scenarioUrl ?? null);
          setScenarioId(data.scenarioId ?? null);
          if (typeof window !== "undefined") {
            localStorage.setItem(storageKey, data.connectedEmail);
          }
        } else {
          setConnectedEmail(null);
          if (typeof window !== "undefined") {
            localStorage.removeItem(storageKey);
          }
        }
      }
    } catch (err) {
      console.error("Failed to check Make automation status:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId, storageKey, connect]);

  useEffect(() => {
    // Clear any obsolete disconnect flags from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem(`open_seo_make_manual_disconnect_${projectId}`);
    }

    checkServerStatus();

    const handleSync = () => {
      if (typeof window !== "undefined") {
        setConnectedEmail(localStorage.getItem(storageKey));
      }
    };

    window.addEventListener(MAKE_EVENT, handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener(MAKE_EVENT, handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [checkServerStatus, projectId, storageKey]);

  const disconnect = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(storageKey);
    }
    setConnectedEmail(null);
    setScenarioUrl(null);
    setScenarioId(null);
    window.dispatchEvent(new Event(MAKE_EVENT));

    fetch("/api/automation/make-disconnect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId }),
    }).catch(console.error);

    toast.success("تم قطع اتصال حساب Make.com");
  };

  const markPendingOAuth = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(PENDING_OAUTH_KEY, "true");
    }
  };

  return {
    connected: Boolean(connectedEmail),
    connectedEmail,
    detectedGoogleEmail,
    scenarioUrl,
    scenarioId,
    loading,
    connect,
    disconnect,
    markPendingOAuth,
    refresh: checkServerStatus,
  };
}

