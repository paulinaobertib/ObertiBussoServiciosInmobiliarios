import { useEffect, useRef, useCallback } from "react";

/**
 * Permite cerrar overlays (modales/drawers) al usar el botón "atrás"
 * del dispositivo sin navegar fuera de la aplicación.
 */
export const useBackButtonClose = (active: boolean, onClose: () => void) => {
  const skipPopRef = useRef(false);
  const pushedRef = useRef(false);
  const scrollPositionRef = useRef({ x: 0, y: 0 });
  const restoreScrollRef = useRef<number | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const restoreScroll = useCallback(() => {
    if (typeof window === "undefined") return;
    const { x, y } = scrollPositionRef.current;
    if (restoreScrollRef.current !== null) {
      cancelAnimationFrame(restoreScrollRef.current);
    }
    restoreScrollRef.current = window.requestAnimationFrame(() => {
      window.scrollTo(x, y);
    });
  }, []);

  const close = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!active) {
      onCloseRef.current?.();
      return;
    }
    if (pushedRef.current) {
      skipPopRef.current = true;
      pushedRef.current = false;
      window.history.back();
      restoreScroll();
    }
    onCloseRef.current?.();
  }, [active, restoreScroll]);

  useEffect(() => {
    if (!active || typeof window === "undefined") return;

    scrollPositionRef.current = {
      x: window.scrollX,
      y: window.scrollY,
    };

    pushedRef.current = true;
    skipPopRef.current = false;
    window.history.pushState({ __overlay: true }, "");
    restoreScroll();

    const handlePopState = () => {
      if (skipPopRef.current) {
        skipPopRef.current = false;
        return;
      }
      pushedRef.current = false;
      restoreScroll();
      onCloseRef.current?.();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (pushedRef.current) {
        skipPopRef.current = true;
        pushedRef.current = false;
        window.history.back();
        restoreScroll();
      }
      if (restoreScrollRef.current !== null) {
        cancelAnimationFrame(restoreScrollRef.current);
        restoreScrollRef.current = null;
      }
    };
  }, [active, onClose, restoreScroll]);

  return close;
};
