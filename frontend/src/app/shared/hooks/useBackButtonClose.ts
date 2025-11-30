import { useEffect, useRef, useCallback } from "react";

type OverlayEntry = {
  id: number;
  skipPopRef: React.MutableRefObject<boolean>;
  handleClose: () => void;
  removed: boolean;
};

const overlayStack: OverlayEntry[] = [];
let overlaySequence = 0;
let globalPopListener: ((event: PopStateEvent) => void) | null = null;

let pendingPopPromise: Promise<void> | null = null;
let resolvePendingPop: (() => void) | null = null;

const waitForPendingPop = async () => {
  if (pendingPopPromise) {
    await pendingPopPromise;
  }
};

const startPendingPop = () => {
  if (pendingPopPromise) return;
  pendingPopPromise = new Promise<void>((resolve) => {
    resolvePendingPop = () => {
      resolve();
      pendingPopPromise = null;
      resolvePendingPop = null;
    };
  });
};

const finishPendingPop = () => {
  resolvePendingPop?.();
};

const ensureGlobalPopListener = () => {
  if (globalPopListener || typeof window === "undefined") return;

  globalPopListener = () => {
    if (!overlayStack.length) {
      finishPendingPop();
      return;
    }

    const entry = overlayStack.pop();
    if (!entry) {
      finishPendingPop();
      return;
    }
    entry.removed = true;
    if (entry.skipPopRef.current) {
      entry.skipPopRef.current = false;
    } else {
      entry.handleClose();
    }

    if (!overlayStack.length && globalPopListener) {
      window.removeEventListener("popstate", globalPopListener);
      globalPopListener = null;
    }
    finishPendingPop();
  };

  window.addEventListener("popstate", globalPopListener);
};

const detachListenerIfIdle = () => {
  if (overlayStack.length || typeof window === "undefined" || !globalPopListener) return;
  window.removeEventListener("popstate", globalPopListener);
  globalPopListener = null;
};

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
  const entryRef = useRef<OverlayEntry | null>(null);

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
      startPendingPop();
      window.history.back();
      restoreScroll();
    }
    onCloseRef.current?.();
  }, [active, restoreScroll]);

  useEffect(() => {
    if (!active || typeof window === "undefined") return;

    let disposed = false;
    let teardown: (() => void) | null = null;

    const setup = () => {
      scrollPositionRef.current = {
        x: window.scrollX,
        y: window.scrollY,
      };

      pushedRef.current = true;
      skipPopRef.current = false;

      const entryId = ++overlaySequence;
      const entry: OverlayEntry = {
        id: entryId,
        skipPopRef,
        handleClose: () => {
          pushedRef.current = false;
          restoreScroll();
          onCloseRef.current?.();
        },
        removed: false,
      };

      entryRef.current = entry;
      overlayStack.push(entry);
      ensureGlobalPopListener();

      window.history.pushState({ __overlay: true }, "");
      restoreScroll();

      return () => {
        const entryInstance = entryRef.current;
        if (pushedRef.current) {
          skipPopRef.current = true;
          pushedRef.current = false;
          startPendingPop();
          window.history.back();
          restoreScroll();
        } else if (entryInstance && !entryInstance.removed) {
          const idx = overlayStack.findIndex((stackEntry) => stackEntry.id === entryInstance.id);
          if (idx >= 0) {
            overlayStack.splice(idx, 1);
          }
          entryInstance.removed = true;
          detachListenerIfIdle();
        }
        entryRef.current = null;

        if (restoreScrollRef.current !== null) {
          cancelAnimationFrame(restoreScrollRef.current);
          restoreScrollRef.current = null;
        }
      };
    };

    (async () => {
      await waitForPendingPop();
      if (disposed) return;
      teardown = setup();
    })();

    return () => {
      disposed = true;
      if (teardown) {
        teardown();
      }
    };
  }, [active, onClose, restoreScroll]);

  return close;
};
