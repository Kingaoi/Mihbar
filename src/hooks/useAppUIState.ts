import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

export function useAppUIState() {
  const pathname = usePathname();
  const router = useRouter();

  // Toast State
  const [toast, setToast] = useState("");
  const toastTimerRef = useRef(undefined);
  const showToast = useCallback((msg, ms = 2500) => {
    clearTimeout(toastTimerRef.current);
    setToast(msg);
    toastTimerRef.current = setTimeout(() => setToast(""), ms);
  }, []);

  // Confirm Overlay States
  const [confirmState, setConfirmState] = useState(null);
  const askConfirm = useCallback((message, onConfirm) => {
    setConfirmState({ message, onConfirm });
  }, []);
  const closeConfirm = useCallback(() => setConfirmState(null), []);

  // Danger Confirm States
  const [dangerState, setDangerState] = useState(null);
  const [dangerCountdown, setDangerCountdown] = useState(0);
  const askDangerConfirm = useCallback((message, onConfirm) => {
    setDangerState({ message, onConfirm });
    setDangerCountdown(7);
  }, []);
  const closeDangerConfirm = useCallback(() => {
    setDangerState(null);
    setDangerCountdown(0);
  }, []);

  // Danger countdown effect
  useEffect(() => {
    if (!dangerState || dangerCountdown <= 0) return;
    const t = setTimeout(() => setDangerCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [dangerState, dangerCountdown]);

  // Page layout toggles
  const [settingsOpen, setSettingsOpen] = useState(false);
  // مشتقة مباشرة من pathname أثناء الـ render (بدون state/effect مكرر)
  const settingsPageOpen = pathname === "/settings";
  const profilePageOpen = pathname === "/profile";
  const [profileTab, setProfileTab] = useState("posts");
  const [floatingPostOpen, setFloatingPostOpen] = useState(false);

  // Wrap state setters to update the URL (router.push هو مصدر الحالة الفعلي)
  const updateSettingsPageOpen = useCallback((isOpen) => {
    if (isOpen) {
      router.push("/settings");
    } else if (pathname === "/settings") {
      router.push("/");
    }
  }, [router, pathname]);

  const updateProfilePageOpen = useCallback((isOpen) => {
    if (isOpen) {
      router.push("/profile");
    } else if (pathname === "/profile") {
      router.push("/");
    }
  }, [router, pathname]);

  // Menu click-away logic
  const [openMenuFor, setOpenMenuFor] = useState(null);

  useEffect(() => {
    if (!openMenuFor) return;
    const closeMenu = (e) => {
      if (e.target.closest?.("[data-action-menu]")) return;
      setOpenMenuFor(null);
      e.stopPropagation();
    };
    document.addEventListener("click", closeMenu, true);
    return () => document.removeEventListener("click", closeMenu, true);
  }, [openMenuFor]);

  return {
    toast,
    showToast,
    confirmState,
    askConfirm,
    closeConfirm,
    dangerState,
    dangerCountdown,
    askDangerConfirm,
    closeDangerConfirm,
    settingsOpen,
    setSettingsOpen,
    settingsPageOpen,
    setSettingsPageOpen: updateSettingsPageOpen,
    profilePageOpen,
    setProfilePageOpen: updateProfilePageOpen,
    profileTab,
    setProfileTab,
    floatingPostOpen,
    setFloatingPostOpen,
    openMenuFor,
    setOpenMenuFor,
  };
}

export default useAppUIState;
