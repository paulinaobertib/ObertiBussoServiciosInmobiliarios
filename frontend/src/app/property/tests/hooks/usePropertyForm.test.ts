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

  it("ignora setField con owner/neighborhood/type null", () => {
    const { result } = renderHook(() => usePropertyForm());
    act(() => {
      result.current.setField("owner", null as any);
      result.current.setField("neighborhood", undefined as any);
      result.current.setField("type", null as any);
    });
    expect(result.current.form.owner.id).toBe(0);
    expect(result.current.form.neighborhood.id).toBe(0);
    expect(result.current.form.type.id).toBe(0);
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

  it("num actualiza un campo numérico", () => {
    const { result } = renderHook(() => usePropertyForm());
    act(() => {
      result.current.num("price")({ target: { value: "123" } } as any);
    });
    expect(result.current.form.price).toBe(123);
  });

  it("num asigna string vacío si input vacío", () => {
    const { result } = renderHook(() => usePropertyForm());
    act(() => {
      result.current.num("price")({ target: { value: "" } } as any);
    });
    expect(result.current.form.price).toBe("");
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

  it("valida errores obligatorios al hacer submit", async () => {
    const { result } = renderHook(() => usePropertyForm());
    await act(async () => {
      await result.current.submit();
    });
    expect(result.current.fieldErrors).toHaveProperty("title");
    expect(result.current.fieldErrors).toHaveProperty("street");
  });

  it("onValidityChange es llamado cuando cambia validez", () => {
    const onValidityChange = vi.fn();
    renderHook(() => usePropertyForm(undefined, undefined, onValidityChange));
    expect(onValidityChange).toHaveBeenCalledWith(false);
  });

  it("onImageSelect es llamado cuando cambian imágenes", () => {
    const onImageSelect = vi.fn();
    mockUseImages.mockReturnValue({
      mainImage: "main.jpg",
      gallery: ["a.jpg"],
      setMain: vi.fn(),
      addToGallery: vi.fn(),
      remove: vi.fn(),
    });
    renderHook(() => usePropertyForm(undefined, onImageSelect));
    expect(onImageSelect).toHaveBeenCalledWith("main.jpg", ["a.jpg"]);
  });

  it("resetea credit y financing si operation = ALQUILER", () => {
    const { result } = renderHook(() => usePropertyForm());
    act(() => {
      result.current.setField("operation", "ALQUILER");
      result.current.setField("credit", true);
      result.current.setField("financing", true);
    });
    // efecto corre después de cambio
    act(() => {
      result.current.setField("operation", "ALQUILER");
    });
    expect(result.current.form.credit).toBe(false);
    expect(result.current.form.financing).toBe(false);
  });

it("reset limpia amenities y otros campos compuestos", () => {
  const { result } = renderHook(() => usePropertyForm());
  act(() => {
    result.current.setField("amenities", 1 as any);
    result.current.reset();
  });
  expect(result.current.form.amenities).toEqual([]);
});

  it("limpia a 0 los campos ocultos cuando no son visibles", () => {
    const { result } = renderHook(() => usePropertyForm());
    // flags por defecto en false -> al setear >0, el efecto debe resetearlos a 0
    act(() => {
      result.current.setField("rooms", 2 as any);
      result.current.setField("bedrooms", 3 as any);
      result.current.setField("bathrooms", 1 as any);
      result.current.setField("coveredArea", 50 as any);
    });
    // Disparar re-render interno
    act(() => {});
    expect(result.current.form.rooms).toBe(0);
    expect(result.current.form.bedrooms).toBe(0);
    expect(result.current.form.bathrooms).toBe(0);
    expect(result.current.form.coveredArea).toBe(0);
  });

  it("check es true cuando todos los campos (incluyendo dinámicos) son válidos", async () => {
    // Preparamos un type que exige todos los campos dinámicos
    (usePropertiesContext as Mock).mockReturnValueOnce({
      selected: { owner: 9, type: 21, neighborhood: 8, amenities: [] },
      ownersList: [{ id: 9, firstName: "A", lastName: "B", phone: "", email: "" }],
      neighborhoodsList: [{ id: 8, name: "N", city: "C", type: "T" }],
      typesList: [{ id: 21, name: "Full", hasRooms: true, hasBedrooms: true, hasBathrooms: true, hasCoveredArea: true }],
      amenitiesList: [],
    });

    const { result } = renderHook(() => usePropertyForm());

    act(() => {
      result.current.setField("title", "X");
      result.current.setField("street", "S");
      result.current.setField("number", "123");
      result.current.setField("area", 10 as any);
      result.current.setField("price", 100 as any);
      result.current.setField("description", "desc");
      result.current.setField("status", "ACTIVA");
      result.current.setField("operation", "VENTA");
      result.current.setField("currency", "ARS");
      result.current.setField("mainImage", "main.jpg" as any);
      result.current.setField("expenses", 0 as any);

      // dinámicos (todos visibles por el type)
      result.current.setField("rooms", 1 as any);
      result.current.setField("bedrooms", 1 as any);
      result.current.setField("bathrooms", 1 as any);
      result.current.setField("coveredArea", 1 as any);
    });

    expect(result.current.check).toBe(true);
  });

  it("valida que expenses sea >= 0 (si es <0 dispara error)", async () => {
    const { result } = renderHook(() => usePropertyForm());
    act(() => {
      result.current.setField("expenses", -5 as any);
    });
    await act(async () => {
      await result.current.submit();
    });
    expect(result.current.fieldErrors).toHaveProperty("expenses");
  });

  it("num ignora valores no numéricos (no cambia el campo)", () => {
    const { result } = renderHook(() => usePropertyForm());
    const prev = result.current.form.price;
    act(() => {
      result.current.num("price")({ target: { value: "abc" } } as any);
    });
    expect(result.current.form.price).toBe(prev);
  });

  it("onImageSelect vuelve a dispararse si cambian mainImage/gallery (re-render con nuevos mocks)", () => {
    const onImageSelect = vi.fn();
    // primera render: valores iniciales
    (useImages as Mock).mockReturnValueOnce({
      mainImage: "m1.jpg",
      gallery: ["g1.jpg"],
      setMain: vi.fn(),
      addToGallery: vi.fn(),
      remove: vi.fn(),
    });
    const { rerender } = renderHook(
      ({ cb }) => usePropertyForm(undefined, cb),
      { initialProps: { cb: onImageSelect } }
    );
    // segunda render: cambian imágenes
    (useImages as Mock).mockReturnValueOnce({
      mainImage: "m2.jpg",
      gallery: ["g1.jpg", "g2.jpg"],
      setMain: vi.fn(),
      addToGallery: vi.fn(),
      remove: vi.fn(),
    });
    rerender({ cb: onImageSelect });

    // Debe haberse llamado al menos con los dos estados
    expect(onImageSelect).toHaveBeenCalledWith("m1.jpg", ["g1.jpg"]);
    expect(onImageSelect).toHaveBeenCalledWith("m2.jpg", ["g1.jpg", "g2.jpg"]);
  });

});
