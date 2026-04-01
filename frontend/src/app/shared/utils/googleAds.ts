declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Dispara un evento de conversión de Google Ads si gtag está disponible.
 * Si el script aún no cargó, simplemente no hace nada.
 */
export const trackGoogleAdsConversion = (eventLabel: string, value = 1): void => {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  window.gtag("event", "conversion", {
    send_to: `AW-18054481528/${eventLabel}`,
    value,
    currency: "ARS",
  });
};

export {};
