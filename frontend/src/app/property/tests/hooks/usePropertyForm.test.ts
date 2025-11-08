/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

/* ─────────────────────────── Mock de PropertiesContext ─────────────────────────── */
const H = vi.hoisted(() => ({
  ctx: {
    selected: { owner: 0, neighborhood: 0, type: 0, amenities: [] as number[] },
    ownersList: [] as Array<any>,
    neighborhoodsList: [] as Array<any>,
    typesList: [] as Array<any>,
    amenitiesList: [] as Array<any>,
  },
}));

// El SUT importa "../context/PropertiesContext" (desde src/app/user/hooks)
vi.mock("../../context/PropertiesContext", () => ({
  usePropertiesContext: () => H.ctx,
}));

/* ─────────────────────────── Import del SUT ─────────────────────────── */
import { usePropertyForm } from "../../hooks/usePropertyForm";

/* ─────────────────────────── Helpers ─────────────────────────── */
const makeFile = (name = "a.jpg", size = 10, type = "image/jpeg") =>
  new File([new Uint8Array(size)], name, { type, lastModified: 123 });

beforeEach(() => {
  vi.clearAllMocks();
  // Reset contexto simulado
  H.ctx.selected = { owner: 0, neighborhood: 0, type: 0, amenities: [] };
  H.ctx.ownersList = [
    { id: 1, firstName: "Ana", lastName: "O", phone: "", email: "" },
    { id: 2, firstName: "Bob", lastName: "O", phone: "", email: "" },
  ];
  H.ctx.neighborhoodsList = [
    { id: 10, name: "Centro", city: "X", type: "Z" },
    { id: 11, name: "Norte", city: "X", type: "Z" },
  ];
  H.ctx.typesList = [
    { id: 100, name: "Casa", hasRooms: false, hasBedrooms: false, hasBathrooms: false, hasCoveredArea: false },
    { id: 101, name: "Depto", hasRooms: true, hasBedrooms: false, hasBathrooms: false, hasCoveredArea: false },
    { id: 102, name: "PH", hasRooms: true, hasBedrooms: true, hasBathrooms: false, hasCoveredArea: false },
    { id: 103, name: "Loft", hasRooms: true, hasBedrooms: true, hasBathrooms: true, hasCoveredArea: true },
  ];
  H.ctx.amenitiesList = [
    { id: 900, name: "Pileta" },
    { id: 901, name: "Parrilla" },
    { id: 902, name: "Cochera" },
  ];
});

/* ─────────────────────────── TESTS ─────────────────────────── */
describe("usePropertyForm", () => {
  it("inicializa con defaults seguros y emite onImageSelect al montar", async () => {
    const onImageSelect = vi.fn();
    const { result } = renderHook(() => usePropertyForm(undefined, onImageSelect));

    const f = result.current.form;
    expect(f.id).toBe(0);
    expect(f.owner.id).toBe(0);
    expect(Array.isArray(f.amenities)).toBe(true);
    expect(result.current.mainImage).toBe(""); // default interno = ""
    expect(result.current.gallery).toEqual([]);

    // onImageSelect es llamado en efecto
    await waitFor(() => {
      expect(onImageSelect).toHaveBeenCalledWith("", []);
    });
  });

  it("setField ignora null/undefined para owner/neighborhood/type", () => {
    const { result } = renderHook(() => usePropertyForm());
    // owner por default id=0; si se intenta setear null, no cambia
    act(() => {
      result.current.setField("owner", null as any);
    });
    expect(result.current.form.owner.id).toBe(0);

    // neighborhood
    act(() => {
      result.current.setField("neighborhood", undefined as any);
    });
    expect(result.current.form.neighborhood.id).toBe(0);

    // type
    act(() => {
      result.current.setField("type", null as any);
    });
    expect(result.current.form.type.id).toBe(0);

    // Para otro campo sí setea
    act(() => {
      result.current.setField("title", "Ok" as any);
    });
    expect(result.current.form.title).toBe("Ok");
  });

  it("sincroniza owner/neighborhood/type/amenities desde el contexto (selected & lists)", async () => {
    const { result } = renderHook(() => usePropertyForm());

    // Seleccionamos owner, neighborhood, type y amenities
    act(() => {
      H.ctx.selected.owner = 1;
      H.ctx.selected.neighborhood = 10;
      H.ctx.selected.type = 100;
      H.ctx.selected.amenities = [900, 902];
      // Forzamos rerender tocando algún campo del form
      result.current.setField("title", "x" as any);
    });

    await waitFor(() => {
      expect(result.current.form.owner.id).toBe(1);
      expect(result.current.form.neighborhood.id).toBe(10);
      expect(result.current.form.type.id).toBe(100);
      expect(result.current.form.amenities.map((a) => a.id)).toEqual([900, 902]);
    });

    // Cambiamos a otros ids
    act(() => {
      H.ctx.selected.owner = 2;
      H.ctx.selected.neighborhood = 11;
      H.ctx.selected.type = 101;
      H.ctx.selected.amenities = [901];
      result.current.setField("description", "y" as any);
    });

    await waitFor(() => {
      expect(result.current.form.owner.id).toBe(2);
      expect(result.current.form.neighborhood.id).toBe(11);
      expect(result.current.form.type.id).toBe(101);
      expect(result.current.form.amenities.map((a) => a.id)).toEqual([901]);
    });
  });

  it("banderas dinámicas por tipo y limpieza de campos ocultos", async () => {
    const { result } = renderHook(() => usePropertyForm());

    // Empezamos con type=103 (todos visibles)
    act(() => {
      H.ctx.selected.type = 103;
      result.current.setField("rooms", 2 as any);
      result.current.setField("bedrooms", 3 as any);
      result.current.setField("bathrooms", 1 as any);
      result.current.setField("coveredArea", 55 as any);
      result.current.setField("title", "force rerender" as any);
    });

    await waitFor(() => {
      expect(result.current.showRooms).toBe(true);
      expect(result.current.showBedrooms).toBe(true);
      expect(result.current.showBathrooms).toBe(true);
      expect(result.current.showCoveredArea).toBe(true);
      expect(result.current.colSize).toBe(4); // 3+ visibles => 4
    });

    // Cambiamos a type=102 (rooms y bedrooms = true, bathrooms/covered=false)
    act(() => {
      H.ctx.selected.type = 102;
      result.current.setField("title", "force rerender 2" as any);
    });

    await waitFor(() => {
      expect(result.current.showRooms).toBe(true);
      expect(result.current.showBedrooms).toBe(true);
      expect(result.current.showBathrooms).toBe(false);
      expect(result.current.showCoveredArea).toBe(false);
      expect(result.current.colSize).toBe(6); // 2 visibles
      // Campos ocultos se limpian a 0
      expect(result.current.form.bathrooms).toBe(0);
      expect(result.current.form.coveredArea).toBe(0);
    });

    // Cambiamos a type=101 (solo rooms)
    act(() => {
      H.ctx.selected.type = 101;
      result.current.setField("title", "force rerender 3" as any);
    });

    await waitFor(() => {
      expect(result.current.showRooms).toBe(true);
      expect(result.current.showBedrooms).toBe(false);
      expect(result.current.showBathrooms).toBe(false);
      expect(result.current.showCoveredArea).toBe(false);
      expect(result.current.colSize).toBe(12); // 1 visible
    });
  });

  it("reset de credit/financing cuando operation = ALQUILER", async () => {
    const { result } = renderHook(() => usePropertyForm());
    act(() => {
      result.current.setField("credit", true as any);
      result.current.setField("financing", true as any);
      result.current.setField("operation", "ALQUILER" as any);
    });
    await waitFor(() => {
      expect(result.current.form.credit).toBe(false);
      expect(result.current.form.financing).toBe(false);
    });
  });

  it("helpers de imágenes: setMain, addToGallery (dedupe/no main), remove; onImageSelect se dispara", async () => {
    const onImageSelect = vi.fn();
    const { result } = renderHook(() => usePropertyForm(undefined, onImageSelect));

    const f1 = makeFile("a.jpg");
    const f2 = makeFile("b.jpg");

    // addToGallery: agrega ambos sin duplicar
    act(() => {
      result.current.addToGallery([f1, f2, f2]);
    });
    expect(result.current.gallery.length).toBe(2);

    // setMain: si main venía en galería, lo saca de allí
    act(() => {
      result.current.setMain(f1);
    });
    expect(result.current.mainImage).toBe(f1);
    expect(result.current.gallery.length).toBe(1); // quedó solo f2

    // No duplica main al intentar re-agregarlo
    act(() => {
      result.current.addToGallery(f1);
    });
    expect(result.current.gallery.length).toBe(1);

    // remove: quitar f2 de galería
    act(() => {
      result.current.remove(f2);
    });
    expect(result.current.gallery.length).toBe(0);

    // remove main => main queda vacío ("")
    act(() => {
      result.current.remove(f1);
    });
    expect(result.current.mainImage).toBe(""); // main limpiado

    // onImageSelect se llamó varias veces (al menos en cada cambio)
    expect(onImageSelect).toHaveBeenCalled();
  });

  it("num helper: setea números válidos, ignora NaN y permite vacío", () => {
    const { result } = renderHook(() => usePropertyForm());

    act(() => {
      result.current.num("price")({ target: { value: "123" } } as any);
    });
    expect(result.current.form.price).toBe(123);

    const prevArea = result.current.form.area;
    act(() => {
      result.current.num("area")({ target: { value: "x10" } } as any);
    });
    expect(result.current.form.area).toBe(prevArea); // no cambia

    act(() => {
      result.current.num("area")({ target: { value: "" } } as any);
    });
    // Entra "" como any, el check después lo invalidará; aquí solo verificamos que no crashea
    expect(result.current.form.area).toBe("" as any);
  });

  it("check y onValidityChange reflejan validez según campos obligatorios y dinámicos", async () => {
    const onValidityChange = vi.fn();
    const { result } = renderHook(() => usePropertyForm(undefined, undefined, onValidityChange));

    // Configuramos un type sin campos dinámicos requeridos
    act(() => {
      H.ctx.selected.type = 100; // no requiere rooms/bedrooms/bathrooms/covered
      H.ctx.selected.owner = 1;
      H.ctx.selected.neighborhood = 10;
      result.current.setField("title", "Prop" as any);
      result.current.setField("street", "Calle" as any);
      result.current.setField("number", "123" as any);
      result.current.setField("area", 80 as any);
      result.current.setField("price", 100000 as any);
      result.current.setField("description", "Desc" as any);
      result.current.setField("status", "ACTIVA" as any);
      result.current.setField("operation", "VENTA" as any);
      result.current.setField("currency", "USD" as any);
      result.current.setField("mainImage", "img.jpg" as any);
      result.current.setField("expenses", 0 as any);
      result.current.setField("title", "force" as any); // rerender para sync selected/owner/type/neighborhood
    });

    await waitFor(() => expect(result.current.check).toBe(true));
    expect(onValidityChange).toHaveBeenCalledWith(true);

    // Rompemos un campo requerido
    act(() => {
      result.current.setField("price", 0 as any);
    });
    await waitFor(() => expect(result.current.check).toBe(false));
    expect(onValidityChange).toHaveBeenCalledWith(false);
  });

  it("validate & submit rellenan fieldErrors cuando inválido y retornan true cuando válido", async () => {
    const { result } = renderHook(() => usePropertyForm());

    // Estado inicial inválido
    let ok: boolean;
    await act(async () => {
      ok = await result.current.submit();
    });
    expect(ok!).toBe(false);
    expect(Object.keys(result.current.fieldErrors).length).toBeGreaterThan(0);

    // Dejamos todo válido (tipo sin dinámicos)
    act(() => {
      H.ctx.selected.type = 100;
      H.ctx.selected.owner = 1;
      H.ctx.selected.neighborhood = 10;
      result.current.setField("title", "Prop" as any);
      result.current.setField("street", "Calle" as any);
      result.current.setField("number", "123" as any);
      result.current.setField("area", 80 as any);
      result.current.setField("price", 100000 as any);
      result.current.setField("description", "Desc" as any);
      result.current.setField("status", "ACTIVA" as any);
      result.current.setField("operation", "VENTA" as any);
      result.current.setField("currency", "USD" as any);
      result.current.setField("mainImage", "img.jpg" as any);
      result.current.setField("expenses", 0 as any);
      result.current.setField("title", "force" as any);
    });

    await act(async () => {
      ok = await result.current.submit();
    });
    expect(ok!).toBe(true);
    expect(Object.keys(result.current.fieldErrors)).toHaveLength(0);
  });

  it("getCreateData y getUpdateData mapean correctamente a DTO", () => {
    const { result } = renderHook(() => usePropertyForm());

    act(() => {
      H.ctx.selected.type = 100;
      H.ctx.selected.owner = 1;
      H.ctx.selected.neighborhood = 10;
      H.ctx.selected.amenities = [900, 901];
      result.current.setField("title", "Prop" as any);
      result.current.setField("street", "Calle" as any);
      result.current.setField("number", "123" as any);
      result.current.setField("area", 80 as any);
      result.current.setField("price", 100000 as any);
      result.current.setField("description", "Desc" as any);
      result.current.setField("status", "ACTIVA" as any);
      result.current.setField("operation", "VENTA" as any);
      result.current.setField("currency", "USD" as any);
      result.current.setField("mainImage", "img.jpg" as any);
      result.current.addToGallery(["g1.jpg", "g2.jpg"]);
      result.current.setField("expenses", 0 as any);
      result.current.setField("title", "force" as any);
    });

    const createDto = result.current.getCreateData();
    expect(createDto.ownerId).toBe(1);
    expect(createDto.neighborhoodId).toBe(10);
    expect(createDto.typeId).toBe(100);
    expect(createDto.amenitiesIds).toEqual([900, 901]);
    expect(createDto.mainImage).toBe("img.jpg");
    expect(createDto.images).toEqual(["g1.jpg", "g2.jpg"]);

    act(() => {
      result.current.setField("id", 777 as any);
      result.current.setField("title", "force 2" as any);
    });
    const updateDto = result.current.getUpdateData();
    expect(updateDto.id).toBe(777);
    expect(updateDto.ownerId).toBe(1);
    expect(updateDto.neighborhoodId).toBe(10);
    expect(updateDto.typeId).toBe(100);
    expect(updateDto.amenitiesIds).toEqual([900, 901]);
    expect(updateDto.mainImage).toBe("img.jpg");
  });

  it("reset restablece el formulario y borra errores", () => {
    const { result } = renderHook(() => usePropertyForm());

    act(() => {
      result.current.setField("title", "Alguna" as any);
      result.current.setField("price", 10 as any);
    });
    expect(result.current.form.title).toBe("Alguna");
    expect(result.current.form.price).toBe(10);

    act(() => {
      result.current.reset();
    });
    expect(result.current.form.title).toBe("");
    expect(result.current.form.price).toBe(0);
    expect(result.current.fieldErrors).toEqual({});
  });
});
