const normalizePath = (url: URL) => {
  const normalizedPath = url.pathname.replace(/\/+$/, "") || "/";
  return `${normalizedPath}${url.search}${url.hash}`;
};

const scrollToTop = (behavior: ScrollBehavior = "auto") => {
  if (typeof window === "undefined") return;
  window.requestAnimationFrame(() => {
    window.scrollTo({ top: 0, behavior });
  });
};

export const patchNavigationHistory = () => {
  if (typeof window === "undefined") return;

  const historyObj: History & { __smartPatched?: boolean } = window.history as any;
  if (historyObj.__smartPatched) return;

  const originalPushState = historyObj.pushState;
  const originalReplaceState = historyObj.replaceState;

  historyObj.pushState = function pushState(state: any, title: string, url?: string | URL | null) {
    if (url != null) {
      try {
        const target = new URL(String(url), window.location.href);
        const current = new URL(window.location.href);
        if (normalizePath(target) === normalizePath(current)) {
          const result = originalReplaceState.call(historyObj, state, title, url);
          scrollToTop("smooth");
          return result;
        }
      } catch {
        // ignore parse errors, fallthrough to default behaviour
      }
    }

    const result = originalPushState.call(historyObj, state, title, url);
    scrollToTop();
    return result;
  };

  historyObj.replaceState = function replaceState(state: any, title: string, url?: string | URL | null) {
    const result = originalReplaceState.call(historyObj, state, title, url);
    scrollToTop();
    return result;
  };

  historyObj.__smartPatched = true;
};

export default patchNavigationHistory;
