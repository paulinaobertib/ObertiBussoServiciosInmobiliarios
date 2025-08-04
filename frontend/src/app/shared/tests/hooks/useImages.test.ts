import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useImages } from "../../hooks/useImages";

// Definir el tipo Image para las pruebas

describe("useImages", () => {
  it("inicializa correctamente con valores predeterminados", () => {
    const { result } = renderHook(() => useImages());

    expect(result.current.mainImage).toBeNull();
    expect(result.current.gallery).toEqual([]);
  });

  it("inicializa correctamente con valores iniciales", () => {
    const mainImage = new File([""], "main.jpg");
    const gallery = [
      new File([""], "gallery1.jpg"),
      "https://example.com/image.jpg",
    ];
    const { result } = renderHook(() => useImages(mainImage, gallery));

    expect(result.current.mainImage).toEqual(mainImage);
    expect(result.current.gallery).toEqual(gallery);
  });

  it("setMain establece la imagen principal correctamente (File)", async () => {
    const { result } = renderHook(() => useImages());
    const file = new File([""], "main.jpg");

    await act(() => {
      result.current.setMain(file);
    });

    expect(result.current.mainImage).toEqual(file);
  });

  it("setMain establece la imagen principal como null", async () => {
    const mainImage = new File([""], "main.jpg");
    const { result } = renderHook(() => useImages(mainImage));

    await act(() => {
      result.current.setMain(null);
    });

    expect(result.current.mainImage).toBeNull();
  });

  it("addToGallery agrega imágenes nuevas correctamente", async () => {
    const { result } = renderHook(() => useImages());
    const newImages = [
      new File([""], "image1.jpg"),
      "https://example.com/new.jpg",
    ];

    await act(() => {
      result.current.addToGallery(newImages);
    });

    expect(result.current.gallery).toEqual(newImages);
  });

  it("remove elimina la imagen principal", async () => {
    const mainImage = new File([""], "main.jpg");
    const { result } = renderHook(() => useImages(mainImage));

    await act(() => {
      result.current.remove(mainImage);
    });

    expect(result.current.mainImage).toBeNull();
    expect(result.current.gallery).toEqual([]);
  });

  it("remove elimina una imagen de la galería", async () => {
    const gallery = [
      new File([""], "image1.jpg"),
      "https://example.com/image.jpg",
    ];
    const { result } = renderHook(() => useImages(null, gallery));
    const imageToRemove = gallery[0];

    await act(() => {
      result.current.remove(imageToRemove);
    });

    expect(result.current.gallery).toEqual(["https://example.com/image.jpg"]);
  });

  it("setMain lanza error si la imagen ya es la principal (File con mismo nombre)", async () => {
    const file = new File([""], "duplicada.jpg");
    const { result } = renderHook(() => useImages(file));

    await act(() => {
      result.current.setMain(new File([""], "duplicada.jpg"));
    });

  });

  it("addToGallery lanza error si todas las imágenes ya están cargadas", async () => {
    const file = new File([""], "image1.jpg");
    const { result } = renderHook(() => useImages(file, [file]));

    await act(() => {
      result.current.addToGallery([new File([""], "image1.jpg")]);
    });

    expect(result.current.gallery).toEqual([file]);
  });

  // it("addToGallery agrega solo imágenes no duplicadas y lanza error parcial", async () => {
  //   const img1 = new File([""], "img1.jpg");
  //   const img2 = new File([""], "img2.jpg");
  //   const img3 = new File([""], "img3.jpg");

  //   const { result } = renderHook(() => useImages(null, [img1]));

  //   await act(() => {
  //     result.current.addToGallery([img1, img2, img3]);
  //   });

  //   expect(result.current.gallery).toEqual([img1, img2, img3]);
  //   expect(result.current.error).toBe(
  //     "Algunas imágenes fueron ignoradas por duplicadas"
  //   );
  // });

//   it("clearError limpia el mensaje de error", async () => {
//     const file = new File([""], "main.jpg");
//     const { result } = renderHook(() => useImages(file));

//     await act(() => {
//       result.current.setMain(new File([""], "main.jpg"));
//     });

//     expect(result.current.error).toBe("Esta imagen ya es la principal");

//     await act(() => {
//       result.current.clearError();
//     });

//     expect(result.current.error).toBeNull();
//   });
});
