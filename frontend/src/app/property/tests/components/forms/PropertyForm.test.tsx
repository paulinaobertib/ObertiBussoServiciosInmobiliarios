/// <reference types="vitest" />
import React, { createRef } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// --------- Mocks hoisted ----------
const h = vi.hoisted(() => {
  const setField = vi.fn();
  const submit = vi.fn(async () => true);
  const reset = vi.fn();
  const remove = vi.fn();
  const getCreateData = vi.fn(() => ({ create: true }));
  const getUpdateData = vi.fn(() => ({ update: true }));

  // este num imita tu hook real (convierte a número)
  const num = (key: string) => (e: any) => setField(key as any, Number(e.target.value || 0));

  const form = {
    title: "",
    operation: "",
    status: "",
    credit: false,
    financing: false,
    currency: "",
    price: 0,
    expenses: 0,
    showPrice: false,
    outstanding: false,
    description: "",
    neighborhood: { id: 0, name: "" },
    street: "",
    number: "",
    rooms: 0,
    bedrooms: 0,
    bathrooms: 0,
    area: 0,
    coveredArea: 0,
    images: [] as any[],
    mainImage: "",
  };

  return {
    ctrl: {
      form,
      fieldErrors: {} as Record<string, string>,
      num,
      showRooms: true,
      showBedrooms: true,
      showBathrooms: true,
      showCoveredArea: true,
      colSize: 6,
      setField,
      submit,
      reset,
      remove,
      getCreateData,
      getUpdateData,
    },
    imgApi: {
      mainImage: null as File | string | null,
      gallery: [] as (File | string)[],
      setMain: vi.fn(),
      addToGallery: vi.fn(),
      remove: vi.fn(),
    },
  };
});

// ---------- Mocks de módulos (rutas desde este archivo de test) ----------
// Hook
vi.mock("../../../hooks/usePropertyForm", () => ({
  usePropertyForm: () => h.ctrl,
}));

// ImageUploader
vi.mock("../../../../shared/components/images/ImageUploader", () => ({
  ImageUploader: (props: any) => (
    <button
      data-testid={props.imagesOnly ? "upload-main" : "upload-gallery"}
      onClick={() => {
        const f1 = { name: "f.png", size: 123, lastModified: 1 };
        const f2 = { name: "g.png", size: 456, lastModified: 2 };
        props.onSelect?.(props.multiple ? [f1, f2] : [f1]);
      }}
    >
      {props.label || "uploader"}
    </button>
  ),
}));

// AddressSelector
vi.mock("../../../components/propertyDetails/maps/AddressSelector", () => ({
  AddressSelector: (props: any) => (
    <button
      data-testid="address-selector"
      onClick={() =>
        props.onChange?.({
          ...props.value,
          street: "Calle Falsa",
          number: "123",
          latitude: -31.4,
          longitude: -64.2,
          formattedAddress: "Calle Falsa 123, Córdoba",
          placeId: "place-1",
        })
      }
    >
      AddressSelector
    </button>
  ),
}));

// ---------- SUT ----------
import { PropertyForm } from "../../../components/forms/PropertyForm";

// helpers sólidos para inputs y selects MUI
const getInputByLabel = (labelText: string): HTMLInputElement => {
  const matches = screen.getAllByText(labelText);
  const label = matches.find((el) => el.tagName === "LABEL") ?? matches[0];
  const forId = (label as HTMLLabelElement).getAttribute("for");
  if (!forId) {
    // fallback: buscar input dentro del mismo contenedor
    const container = label.closest("label,div,fieldset")!;
    const input = container.querySelector("input,textarea") as HTMLInputElement | null;
    if (!input) throw new Error(`No se encontró input para la etiqueta "${labelText}"`);
    return input;
  }
  const input = document.getElementById(forId) as HTMLInputElement | null;
  if (!input) throw new Error(`No se encontró input con id="${forId}" para "${labelText}"`);
  return input;
};

const renderSUT = (props: Partial<React.ComponentProps<typeof PropertyForm>> = {}) => {
  const img = { ...h.imgApi, ...(props.img || {}) };
  return render(<PropertyForm img={img as any} {...props} />);
};

describe("<PropertyForm />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.imgApi.mainImage = null;
    h.imgApi.gallery = [];
  });

  it("renderiza campos básicos y permite escribir título / descripción", () => {
    renderSUT();

    // Título
    const titleInput = getInputByLabel("Título");
    fireEvent.change(titleInput, { target: { value: "Casa en la sierra" } });
    expect(h.ctrl.setField).toHaveBeenCalledWith("title", "Casa en la sierra");

    // Descripción (textarea)
    const descInput = getInputByLabel("Descripción");
    fireEvent.change(descInput, { target: { value: "Muy luminosa" } });
    expect(h.ctrl.setField).toHaveBeenCalledWith("description", "Muy luminosa");
  });

  it("inputs numéricos usan handler num() para price/expenses/rooms/bedrooms/bathrooms/area/coveredArea", () => {
    renderSUT();

    const setNum = (label: string, key: string, value: string, expected: number) => {
      const input = getInputByLabel(label);
      fireEvent.change(input, { target: { value } });
      expect(h.ctrl.setField).toHaveBeenCalledWith(key, expected);
    };

    setNum("Precio", "price", "12345", 12345);
    setNum("Expensas", "expenses", "321", 321);
    setNum("Ambientes", "rooms", "3", 3);
    setNum("Dormitorios", "bedrooms", "2", 2);
    setNum("Baños", "bathrooms", "1", 1);
    setNum("Superficie Total", "area", "77", 77);
    setNum("Superficie Cubierta", "coveredArea", "55", 55);
  });

  it("botón de limpiar Expensas (CloseIcon) setea expenses = null", () => {
    renderSUT();
    const expInput = getInputByLabel("Expensas");
    // adornment está en el mismo contenedor del input
    const root = expInput.closest("div")!;
    const clearBtn = root.querySelector("button");
    expect(clearBtn).toBeTruthy();
    fireEvent.click(clearBtn!);
    expect(h.ctrl.setField).toHaveBeenCalledWith("expenses", null);
  });

  it("AddressSelector dispara cambios de calle y número", () => {
    renderSUT();
    fireEvent.click(screen.getByTestId("address-selector"));
    expect(h.ctrl.setField).toHaveBeenCalledWith("street", "Calle Falsa");
    expect(h.ctrl.setField).toHaveBeenCalledWith("number", "123");
    expect(h.ctrl.setField).toHaveBeenCalledWith("formattedAddress", "Calle Falsa 123, Córdoba");
    expect(h.ctrl.setField).toHaveBeenCalledWith("placeId", "place-1");
    expect(h.ctrl.setField).toHaveBeenCalledWith("latitude", -31.4);
    expect(h.ctrl.setField).toHaveBeenCalledWith("longitude", -64.2);
  });

  it("ImageUploader: principal → llama img.setMain y setea mainImage; galería → addToGallery y agrega images", () => {
    const img = { ...h.imgApi, setMain: vi.fn(), addToGallery: vi.fn() };
    renderSUT({ img });

    // principal
    fireEvent.click(screen.getByTestId("upload-main"));
    expect(img.setMain).toHaveBeenCalledTimes(1);
    expect(h.ctrl.setField).toHaveBeenCalledWith("mainImage", expect.anything());

    // galería
    fireEvent.click(screen.getByTestId("upload-gallery"));
    expect(img.addToGallery).toHaveBeenCalledTimes(1);
    expect(h.ctrl.setField).toHaveBeenCalledWith(
      "images",
      expect.arrayContaining([expect.objectContaining({ name: "f.png" })])
    );
  });

  it("efecto de sincronización: si img.mainImage/galería cambian, actualiza main e images (sin duplicar main)", () => {
    renderSUT({
      img: {
        ...h.imgApi,
        mainImage: "url://main.jpg",
        gallery: ["url://main.jpg", "url://g1.jpg", "url://g2.jpg"],
      },
    });

    expect(h.ctrl.setField).toHaveBeenCalledWith("mainImage", "url://main.jpg");
    expect(h.ctrl.setField).toHaveBeenCalledWith("images", ["url://g1.jpg", "url://g2.jpg"]);
  });

  it("submit del form dispara ctrl.submit; ref expone la API imperativa completa", async () => {
    const ref = createRef<any>();
    const { container } = render(<PropertyForm ref={ref} img={h.imgApi as any} />);
    const form = container.querySelector("form")!;
    fireEvent.submit(form);
    expect(h.ctrl.submit).toHaveBeenCalledTimes(1);

    await ref.current.submit();
    expect(h.ctrl.submit).toHaveBeenCalledTimes(2);

    ref.current.reset();
    expect(h.ctrl.reset).toHaveBeenCalled();

    ref.current.deleteImage("x.jpg");
    expect(h.ctrl.remove).toHaveBeenCalledWith("x.jpg");

    ref.current.setField("title", "DesdeRef");
    expect(h.ctrl.setField).toHaveBeenCalledWith("title", "DesdeRef");

    expect(ref.current.getCreateData()).toEqual({ create: true });
    expect(ref.current.getUpdateData()).toEqual({ update: true });
  });
});
