import { describe, it, expect, vi, beforeEach } from "vitest";

const MODULE_PATH = "../../utils/googleMapsLoader";

const importLoader = async () => {
  const mod = await import(MODULE_PATH);
  return mod.loadGoogleMapsSdk;
};

describe("loadGoogleMapsSdk", () => {
  beforeEach(() => {
    vi.resetModules();
    document.head.innerHTML = "";
    delete (window as any).google;
    delete (window as any).__googleMapsCallback;
  });

  it("rechaza cuando falta VITE_GOOGLE_MAPS_API_KEY", async () => {
    vi.stubEnv("VITE_GOOGLE_MAPS_API_KEY", "");
    const loadGoogleMapsSdk = await importLoader();
    await expect(loadGoogleMapsSdk()).rejects.toThrow("Falta configurar VITE_GOOGLE_MAPS_API_KEY");
  });

  it("devuelve google existente sin insertar script", async () => {
    vi.stubEnv("VITE_GOOGLE_MAPS_API_KEY", "key");
    (window as any).google = { maps: { Map: vi.fn() }, already: true };

    const loadGoogleMapsSdk = await importLoader();
    const result = await loadGoogleMapsSdk();

    expect(result).toBe((window as any).google);
    expect(document.head.querySelector("script")).toBeNull();
  });

  it("inserta script y resuelve cuando callback global se ejecuta", async () => {
    vi.stubEnv("VITE_GOOGLE_MAPS_API_KEY", "fake-key");
    const loadGoogleMapsSdk = await importLoader();

    const promise = loadGoogleMapsSdk();

    const script = document.head.querySelector("script") as HTMLScriptElement;
    expect(script).toBeTruthy();
    expect(script.src).toContain("fake-key");
    expect(script.src).toContain("callback=__googleMapsCallback");
    expect(script.async).toBe(true);
    expect(script.defer).toBe(true);

    (window as any).google = { maps: { Map: vi.fn() } };
    (window as any).__googleMapsCallback();

    await expect(promise).resolves.toBe((window as any).google);
    expect((window as any).__googleMapsCallback).toBeUndefined();
  });

  it("reutiliza la promesa en curso y permite reintentar tras error", async () => {
    vi.stubEnv("VITE_GOOGLE_MAPS_API_KEY", "key");
    const loadGoogleMapsSdk = await importLoader();

    const firstCall = loadGoogleMapsSdk();
    const secondCall = loadGoogleMapsSdk();
    expect(secondCall).toBe(firstCall);

    const script = document.head.querySelector("script") as HTMLScriptElement;
    script.onerror?.(new Event("error") as any);

    await expect(firstCall).rejects.toThrow("Error al cargar Google Maps");

    const retry = loadGoogleMapsSdk();
    expect(retry).not.toBe(firstCall);
    expect(document.head.querySelectorAll("script").length).toBe(2);
  });
});
