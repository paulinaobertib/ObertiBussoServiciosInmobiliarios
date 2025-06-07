import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import {
  getImagesByPropertyId,
  postImage,
  deleteImageById,
} from "../../../property/services/image.service";
import { ImageDTO } from "../../../property/services/image.service";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

describe("image.service", () => {
  const mockImages: ImageDTO[] = [
    { id: 1, url: "https://example.com/image1.jpg" },
    { id: 2, url: "https://example.com/image2.jpg" },
  ];

  const apiUrl = import.meta.env.VITE_API_URL;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("obtiene imágenes por ID de propiedad", async () => {
    mockedAxios.get.mockResolvedValue({ data: mockImages });

    const result = await getImagesByPropertyId(10);
    expect(result).toEqual(mockImages);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${apiUrl}/properties/image/getByProperty/10`
    );
  });

  it("lanza error al obtener imágenes por ID", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Error de red"));

    await expect(getImagesByPropertyId(10)).rejects.toThrow("Error de red");
  });

  it("sube una imagen y devuelve la URL", async () => {
    const fakeFile = new File(["dummy content"], "image.jpg", {
      type: "image/jpeg",
    });
    const mockUrl = "https://example.com/uploaded.jpg";

    mockedAxios.post.mockResolvedValue({ data: mockUrl });

    const result = await postImage(fakeFile, 15);
    expect(result).toBe(mockUrl);
    expect(mockedAxios.post).toHaveBeenCalled();
    const [url, formData, config] = mockedAxios.post.mock.calls[0];
    expect(url).toBe(`${apiUrl}/properties/image/upload`);
    expect(config?.headers?.["Content-Type"]).toBe("multipart/form-data");
    expect(formData).toBeInstanceOf(FormData);
  });

  it("lanza error al subir una imagen", async () => {
    const fakeFile = new File(["dummy content"], "image.jpg", {
      type: "image/jpeg",
    });

    mockedAxios.post.mockRejectedValue(new Error("Error de red"));

    await expect(postImage(fakeFile, 15)).rejects.toThrow("Error de red");
  });

  it("elimina una imagen por ID", async () => {
    mockedAxios.delete.mockResolvedValue({});

    await deleteImageById(7);
    expect(mockedAxios.delete).toHaveBeenCalledWith(
      `${apiUrl}/properties/image/delete/7`
    );
  });

  it("lanza error al eliminar imagen por ID", async () => {
    mockedAxios.delete.mockRejectedValue(new Error("Error de red"));

    await expect(deleteImageById(7)).rejects.toThrow("Error de red");
  });
});
