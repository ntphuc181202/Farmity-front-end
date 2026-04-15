import { useEffect } from "react";

type RefreshCallback = () => void | Promise<void>;

export default function useAutoRefresh(
  refresh: RefreshCallback,
  intervalMs = 12000
) {
  useEffect(() => {
    const runRefresh = () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") {
        return;
      }
      void refresh();
    };

    const timerId = window.setInterval(runRefresh, intervalMs);
    const onFocus = () => {
      void refresh();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearInterval(timerId);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [refresh, intervalMs]);
}