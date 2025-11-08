/// <reference types="vitest" />
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useImages } from "../../../shared/hooks/useImages";

const f = (name: string, size = 123, lastModified = Date.now()) =>
  new File(["x".repeat(size)], name, { lastModified, type: "image/png" });

describe("useImages", () => {
  it("inicializa deduplicando la main fuera de la gallery", () => {
    const main = "https://cdn/test/main.jpg";
    const gallery = [
      "https://cdn/test/main.jpg", // duplicada de main → debe excluirse
      "https://cdn/test/other1.jpg",
      "https://cdn/test/other1.jpg", // duplicado → debe excluirse
      "https://cdn/test/other2.jpg",
    ];

    const { result } = renderHook(() => useImages(main, gallery));

    expect(result.current.mainImage).toBe(main);
    expect(result.current.gallery).toEqual(["https://cdn/test/other1.jpg", "https://cdn/test/other2.jpg"]);
  });

  it("setMain: mueve imagen desde la gallery a main y la quita de la gallery", () => {
    const main = "https://cdn/test/main.jpg";
    const other = "https://cdn/test/other.jpg";

    const { result } = renderHook(() => useImages(main, [other]));
    expect(result.current.mainImage).toBe(main);
    expect(result.current.gallery).toEqual([other]);

    act(() => {
      result.current.setMain(other);
    });

    expect(result.current.mainImage).toBe(other);
    expect(result.current.gallery).toEqual([]); // se quitó de gallery
  });

  it("setMain(null): limpia la imagen principal", () => {
    const main = "https://cdn/test/main.jpg";
    const { result } = renderHook(() => useImages(main, []));

    act(() => {
      result.current.setMain(null);
    });

    expect(result.current.mainImage).toBeNull();
    expect(result.current.gallery).toEqual([]); // sin cambios inesperados
  });

  it("addToGallery: agrega sin duplicar y nunca agrega la main", () => {
    const main = "https://cdn/test/main.jpg";
    const a = "https://cdn/test/a.jpg";
    const b = "https://cdn/test/b.jpg";

    const { result } = renderHook(() => useImages(main, [a]));

    // agrega existentes + main + nuevos
    act(() => {
      result.current.addToGallery([a, main, b]);
    });

    expect(result.current.gallery).toEqual([a, b]); // no repite a, no agrega main
  });

  it("addToGallery: acepta item único (no array) y deduplica por clave estable", () => {
    const mfile = f("main.png", 10, 111);
    const g1 = f("g1.png", 5, 222);
    const dupG1 = f("g1.png", 5, 222); // misma clave: name + size + lastModified

    const { result } = renderHook(() => useImages(mfile, [g1]));

    act(() => {
      result.current.addToGallery(dupG1); // no debería duplicarse
    });

    expect(result.current.gallery.length).toBe(1);
    expect((result.current.gallery[0] as File).name).toBe("g1.png");
  });

  it("remove: si quita la main, la deja en null; si quita un gallery, lo saca", () => {
    const mfile = f("m.png", 10, 1);
    const g1 = f("g1.png", 5, 2);
    const g2 = "https://cdn/x.jpg";

    const { result } = renderHook(() => useImages(mfile, [g1, g2]));

    // quitar gallery file
    act(() => {
      result.current.remove(g1);
    });
    expect(result.current.gallery).toEqual([g2]);
    expect(result.current.mainImage).toBe(mfile);

    // quitar main
    act(() => {
      result.current.remove(mfile);
    });
    expect(result.current.mainImage).toBeNull();
    expect(result.current.gallery).toEqual([g2]);

    // quitar url restante
    act(() => {
      result.current.remove(g2 as any);
    });
    expect(result.current.gallery).toEqual([]);
  });

  it("getFilesForUpload: devuelve sólo Files (main y gallery) para persistir", () => {
    const main = f("main.png", 10, 1);
    const gFile1 = f("g1.png", 7, 2);
    const gUrl = "https://cdn/only-preview.jpg";

    const { result } = renderHook(() => useImages(main, [gFile1, gUrl]));

    const out1 = result.current.getFilesForUpload();
    expect(out1.main).toBe(main);
    expect(out1.gallery).toEqual([gFile1]);

    // si seteo main a una URL, deja de devolver main File
    act(() => {
      result.current.setMain("https://cdn/new-main.jpg");
    });

    const out2 = result.current.getFilesForUpload();
    expect(out2.main).toBeNull();
    expect(out2.gallery).toEqual([gFile1]); // la galería mantiene sólo los files
  });
});
