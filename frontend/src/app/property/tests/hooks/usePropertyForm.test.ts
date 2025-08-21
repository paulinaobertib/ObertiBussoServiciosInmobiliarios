import { renderHook, act } from "@testing-library/react";
import { vi, Mock } from "vitest";
import { usePropertyForm } from "../../hooks/usePropertyForm";
import { useImages } from "../../../shared/hooks/useImages";
import { usePropertiesContext } from "../../context/PropertiesContext";

// ─── mocks ───
vi.mock("../../../shared/hooks/useImages", () => ({
  useImages: vi.fn(),
}));

vi.mock("../../context/PropertiesContext", () => ({
  usePropertiesContext: vi.fn(),
}));

describe("usePropertyForm", () => {
  const mockUseImages = useImages as Mock;
  const mockUsePropertiesContext = usePropertiesContext as Mock;

  const mainMock = null;
  const galleryMock: any[] = [];

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseImages.mockReturnValue({
      mainImage: mainMock,
      gallery: galleryMock,
      setMain: vi.fn(),
      addToGallery: vi.fn(),
      remove: vi.fn(),
    });

    mockUsePropertiesContext.mockReturnValue({
      selected: { owner: 0, type: 0, neighborhood: 0, amenities: [] },
      ownersList: [],
      neighborhoodsList: [],
      typesList: [],
      amenitiesList: [],
    });
  });

  it("inicializa con datos vacíos si no hay initialData", () => {
    const { result } = renderHook(() => usePropertyForm());
    expect(result.current.form.id).toBe(0);
    expect(result.current.form.title).toBe("");
    expect(result.current.fieldErrors).toEqual({});
  });

  it("setField actualiza campos correctamente", () => {
    const { result } = renderHook(() => usePropertyForm());
    act(() => {
      result.current.setField("title", "Casa de prueba");
    });
    expect(result.current.form.title).toBe("Casa de prueba");
  });

  it("reset limpia el formulario y errores", () => {
    const { result } = renderHook(() => usePropertyForm());
    act(() => {
      result.current.setField("title", "Algo");
      result.current.reset();
    });
    expect(result.current.form.title).toBe("");
    expect(result.current.fieldErrors).toEqual({});
  });

  it("getCreateData devuelve DTO correcto", () => {
    const { result } = renderHook(() => usePropertyForm());
    act(() => {
      result.current.setField("title", "Mi propiedad");
    });
    const dto = result.current.getCreateData();
    expect(dto.title).toBe("Mi propiedad");
    expect(dto.ownerId).toBe(0);
    expect(dto.amenitiesIds).toEqual([]);
  });

  it("getUpdateData devuelve DTO correcto", () => {
    const { result } = renderHook(() => usePropertyForm());
    act(() => {
      result.current.setField("id", 5);
      result.current.setField("title", "Propiedad 5");
    });
    const dto = result.current.getUpdateData();
    expect(dto.id).toBe(5);
    expect(dto.title).toBe("Propiedad 5");
    expect(dto.ownerId).toBe(0);
  });

  it("submit ejecuta validación y devuelve boolean", async () => {
    const { result } = renderHook(() => usePropertyForm());
    let valid: boolean = false;
    await act(async () => {
      valid = await result.current.submit();
    });
    expect(typeof valid).toBe("boolean");
  });
});
