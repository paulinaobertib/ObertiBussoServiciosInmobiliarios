/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

/* ─────────────────────────── Mock de PropertiesContext ─────────────────────────── */
const H = vi.hoisted(() => ({
  ctx: {
    selected: {
      owner: 0,
      neighborhood: 0,
      type: 0,
      amenities: [] as number[],
      address: { street: "", number: "", latitude: null, longitude: null },
    },
    ownersList: [] as Array<any>,
    neighborhoodsList: [] as Array<any>,
    typesList: [] as Array<any>,
    amenitiesList: [] as Array<any>,
  },
}));

vi.mock("../../context/PropertiesContext", () => ({
  usePropertiesContext: () => H.ctx,
}));

/* ─────────────────────────── Import del SUT ─────────────────────────── */
import { usePropertyForm } from "../../hooks/usePropertyForm";

/* ─────────────────────────── Helpers ─────────────────────────── */
const makeFile = (name = "a.jpg", size = 10, type = "image/jpeg") =>
  new File([new Uint8Array(size)], name, { type, lastModified: 123 });

const makeSelected = (overrides = {}) => ({
  owner: 0,
  neighborhood: 0,
  type: 0,
  amenities: [] as number[],
  address: { street: "", number: "", latitude: null, longitude: null },
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  H.ctx.selected = makeSelected();
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
    expect(result.current.mainImage).toBe("");
    expect(result.current.gallery).toEqual([]);

    await waitFor(() => {
      expect(onImageSelect).toHaveBeenCalledWith("", []);
    });
  });

  it("setField ignora null/undefined para owner/neighborhood/type", () => {
    const { result } = renderHook(() => usePropertyForm());
    act(() => result.current.setField("owner", null as any));
    expect(result.current.form.owner.id).toBe(0);
    act(() => result.current.setField("neighborhood", undefined as any));
    expect(result.current.form.neighborhood.id).toBe(0);
    act(() => result.current.setField("type", null as any));
    expect(result.current.form.type.id).toBe(0);
    act(() => result.current.setField("title", "Ok" as any));
    expect(result.current.form.title).toBe("Ok");
  });

  it("sincroniza owner/neighborhood/type/amenities desde el contexto", async () => {
    const { result } = renderHook(() => usePropertyForm());
    act(() => {
      H.ctx.selected = makeSelected({
        owner: 1,
        neighborhood: 10,
        type: 100,
        amenities: [900, 902],
        address: { street: "x", number: "1", latitude: 0, longitude: 0 },
      });
      result.current.setField("title", "force" as any);
    });

    await waitFor(() => {
      expect(result.current.form.owner.id).toBe(1);
      expect(result.current.form.neighborhood.id).toBe(10);
      expect(result.current.form.type.id).toBe(100);
      expect(result.current.form.amenities.map((a) => a.id)).toEqual([900, 902]);
    });

    act(() => {
      H.ctx.selected = makeSelected({
        owner: 2,
        neighborhood: 11,
        type: 101,
        amenities: [901],
        address: { street: "y", number: "2", latitude: 10, longitude: 20 },
      });
      result.current.setField("description", "rerender" as any);
    });

    await waitFor(() => {
      expect(result.current.form.owner.id).toBe(2);
      expect(result.current.form.neighborhood.id).toBe(11);
      expect(result.current.form.type.id).toBe(101);
      expect(result.current.form.amenities.map((a) => a.id)).toEqual([901]);
    });
  });

  it("banderas dinámicas y limpieza de campos ocultos", async () => {
    const { result } = renderHook(() => usePropertyForm());
    act(() => {
      H.ctx.selected = makeSelected({ type: 103 });
      result.current.setField("rooms", 2 as any);
      result.current.setField("bedrooms", 3 as any);
      result.current.setField("bathrooms", 1 as any);
      result.current.setField("coveredArea", 55 as any);
      result.current.setField("title", "rerender" as any);
    });

    await waitFor(() => {
      expect(result.current.showRooms).toBe(true);
      expect(result.current.showBedrooms).toBe(true);
      expect(result.current.showBathrooms).toBe(true);
      expect(result.current.showCoveredArea).toBe(true);
      expect(result.current.colSize).toBe(4);
    });

    act(() => {
      H.ctx.selected = makeSelected({ type: 102 });
      result.current.setField("title", "rerender2" as any);
    });

    await waitFor(() => {
      expect(result.current.showCoveredArea).toBe(false);
      expect(result.current.form.coveredArea).toBe(0);
    });
  });

  it("resetea credit/financing cuando operation = ALQUILER", async () => {
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

  it("helpers de imágenes funcionan correctamente", async () => {
    const onImageSelect = vi.fn();
    const { result } = renderHook(() => usePropertyForm(undefined, onImageSelect));

    const f1 = makeFile("a.jpg");
    const f2 = makeFile("b.jpg");

    act(() => result.current.addToGallery([f1, f2, f2]));
    expect(result.current.gallery.length).toBe(2);

    act(() => result.current.setMain(f1));
    expect(result.current.mainImage).toBe(f1);
    expect(result.current.gallery.length).toBe(1);

    act(() => result.current.addToGallery(f1));
    expect(result.current.gallery.length).toBe(1);

    act(() => result.current.remove(f2));
    expect(result.current.gallery.length).toBe(0);

    act(() => result.current.remove(f1));
    expect(result.current.mainImage).toBe("");

    expect(onImageSelect).toHaveBeenCalled();
  });

  it("num helper maneja valores correctamente", () => {
    const { result } = renderHook(() => usePropertyForm());
    act(() => result.current.num("price")({ target: { value: "123" } } as any));
    expect(result.current.form.price).toBe(123);
    const prevArea = result.current.form.area;
    act(() => result.current.num("area")({ target: { value: "x" } } as any));
    expect(result.current.form.area).toBe(prevArea);
    act(() => result.current.num("area")({ target: { value: "" } } as any));
    expect(result.current.form.area).toBe("" as any);
  });

  it("check y onValidityChange responden según los campos", async () => {
    const onValidityChange = vi.fn();
    const { result } = renderHook(() => usePropertyForm(undefined, undefined, onValidityChange));

    act(() => {
      H.ctx.selected = makeSelected({
        owner: 1,
        neighborhood: 10,
        type: 100,
        address: { street: "Calle", number: "1", latitude: 1, longitude: 1 },
      });
      result.current.setField("title", "Prop" as any);
      result.current.setField("street", "Calle" as any);
      result.current.setField("area", 50 as any);
      result.current.setField("price", 100 as any);
      result.current.setField("description", "Desc" as any);
      result.current.setField("status", "ACTIVA" as any);
      result.current.setField("operation", "VENTA" as any);
      result.current.setField("currency", "USD" as any);
      result.current.setField("mainImage", "img.jpg" as any);
      result.current.setField("expenses", 0 as any);
    });

    await waitFor(() => expect(result.current.check).toBe(true));
    expect(onValidityChange).toHaveBeenCalledWith(true);

    act(() => result.current.setField("price", 0 as any));
    await waitFor(() => expect(result.current.check).toBe(false));
  });

  it("validate & submit completan fieldErrors", async () => {
    const { result } = renderHook(() => usePropertyForm());
    let ok: boolean;

    await act(async () => {
      ok = await result.current.submit();
    });
    expect(ok!).toBe(false);
    expect(Object.keys(result.current.fieldErrors).length).toBeGreaterThan(0);

    act(() => {
      H.ctx.selected = makeSelected({
        owner: 1,
        neighborhood: 10,
        type: 100,
        address: { street: "x", number: "1", latitude: 1, longitude: 1 },
      });
      result.current.setField("title", "Prop" as any);
      result.current.setField("street", "Calle" as any);
      result.current.setField("area", 80 as any);
      result.current.setField("price", 100000 as any);
      result.current.setField("description", "Desc" as any);
      result.current.setField("status", "ACTIVA" as any);
      result.current.setField("operation", "VENTA" as any);
      result.current.setField("currency", "USD" as any);
      result.current.setField("mainImage", "img.jpg" as any);
      result.current.setField("expenses", 0 as any);
    });

    await act(async () => {
      ok = await result.current.submit();
    });
    expect(ok!).toBe(true);
  });

  it("getCreateData y getUpdateData mapean correctamente", () => {
    const { result } = renderHook(() => usePropertyForm());
    act(() => {
      H.ctx.selected = makeSelected({
        owner: 1,
        neighborhood: 10,
        type: 100,
        amenities: [900, 901],
        address: { street: "Calle", number: "1", latitude: 1, longitude: 1 },
      });
      result.current.setField("title", "Prop" as any);
      result.current.setField("street", "Calle" as any);
      result.current.setField("area", 80 as any);
      result.current.setField("price", 100000 as any);
      result.current.setField("description", "Desc" as any);
      result.current.setField("status", "ACTIVA" as any);
      result.current.setField("operation", "VENTA" as any);
      result.current.setField("currency", "USD" as any);
      result.current.setField("mainImage", "img.jpg" as any);
      result.current.addToGallery(["g1.jpg", "g2.jpg"]);
      result.current.setField("expenses", 0 as any);
    });

    const createDto = result.current.getCreateData();
    expect(createDto.ownerId).toBe(1);
    expect(createDto.neighborhoodId).toBe(10);
    expect(createDto.typeId).toBe(100);
    expect(createDto.amenitiesIds).toEqual([900, 901]);

    act(() => result.current.setField("id", 777 as any));
    const updateDto = result.current.getUpdateData();
    expect(updateDto.id).toBe(777);
  });

  it("reset restablece formulario y borra errores", () => {
    const { result } = renderHook(() => usePropertyForm());
    act(() => {
      result.current.setField("title", "Alguna" as any);
      result.current.setField("price", 10 as any);
    });
    expect(result.current.form.title).toBe("Alguna");
    act(() => result.current.reset());
    expect(result.current.form.title).toBe("");
    expect(result.current.fieldErrors).toEqual({});
  });
});
