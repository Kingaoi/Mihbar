import { useState, useEffect, useCallback } from "react";

export function usePWAInstall({ s, showToast }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPwaBanner, setShowPwaBanner] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show banner if not dismissed in session
      const dismissed = window.sessionStorage.getItem("pwa-banner-dismissed");
      if (!dismissed) {
        setShowPwaBanner(true);
      }
    };

    const handleAppInstalled = () => {
      console.log("[PWA] App installed successfully!");
      setDeferredPrompt(null);
      setShowPwaBanner(false);
      showToast(s.pwaInstalledToast || "تم تثبيت التطبيق بنجاح! 🎉", 4000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [s.pwaInstalledToast, showToast]);

  const handleInstallPWA = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] User response to the install prompt: ${outcome}`);
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setShowPwaBanner(false);
    }
  }, [deferredPrompt]);

  const handleDismissPWABanner = useCallback(() => {
    setShowPwaBanner(false);
    window.sessionStorage.setItem("pwa-banner-dismissed", "true");
  }, []);

  return {
    showPwaBanner,
    setShowPwaBanner,
    deferredPrompt,
    setDeferredPrompt,
    handleInstallPWA,
    handleDismissPWABanner,
  };
}

export default usePWAInstall;
