import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useNoticeForm, type NoticeFormState } from "../../hooks/useNoticeForm";

vi.mock("../../shared/hooks/useImages", () => {
  // Mock como hook real usando React state
  const React = require("react");
  return {
    useImages: (initialMain: any) => {
      const [mainImage, setMain] = React.useState(initialMain ?? null);
      return { mainImage, setMain };
    },
  };
});

type Img = { id: string; url: string };
const imgA: Img = { id: "a", url: "/a.jpg" };
const imgB: Img = { id: "b", url: "/b.jpg" };

describe("useNoticeForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("arranca con valores por defecto cuando no hay initial", () => {
    const { result } = renderHook(() => useNoticeForm());

    expect(result.current.form).toEqual({
      id: undefined,
      title: "",
      description: "",
      mainImage: null,
    });

    // inválido al inicio
    expect(result.current.validate()).toBe(false);
  });

  it("respeta initial (incluida la imagen) y valida acorde", async () => {
    const initial: NoticeFormState = {
      id: 10,
      title: "Hola",
      description: "Descripción",
      mainImage: imgA as any,
    };

    const onValidChange = vi.fn();

    const { result } = renderHook(() => useNoticeForm(initial, onValidChange));

    // El form debe reflejar initial
    expect(result.current.form).toEqual(initial);

    // Es válido de entrada
    expect(result.current.validate()).toBe(true);

    // onValidChange debió ser llamado al menos una vez con true
    expect(onValidChange).toHaveBeenCalledWith(true);
  });

  it("setField actualiza el form y la validación responde", async () => {
    const onValidChange = vi.fn();
    const { result } = renderHook(() => useNoticeForm(undefined, onValidChange));

    // Inicialmente inválido
    expect(result.current.validate()).toBe(false);

    await act(async () => {
      result.current.setField("title", "Titulo");
    });
    expect(result.current.form.title).toBe("Titulo");
    // Sigue inválido (falta description y mainImage)
    expect(result.current.validate()).toBe(false);

    await act(async () => {
      result.current.setField("description", "Algo");
    });
    // Falta mainImage => inválido todavía
    expect(result.current.validate()).toBe(false);

    // Ahora seteamos la mainImage con setMain (viene del hook de imágenes)
    await act(async () => {
      result.current.setMain(imgA as any);
    });

    // El efecto interno debe sincronizar form.mainImage con el mainImage del mock
    await waitFor(() => {
      expect(result.current.form.mainImage).toEqual(imgA);
    });

    // Ahora es válido
    expect(result.current.validate()).toBe(true);

    // onValidChange debió reflejar las transiciones: false -> true (al menos)
    expect(onValidChange).toHaveBeenCalledWith(true);
  });

  it("setMain sincroniza la imagen al form (y puede volver a cambiar)", async () => {
    const initial: NoticeFormState = {
      id: 1,
      title: "T",
      description: "D",
      mainImage: imgA as any,
    };

    const { result } = renderHook(() => useNoticeForm(initial));

    // Parte con imgA
    expect(result.current.form.mainImage).toEqual(imgA);
    expect(result.current.validate()).toBe(true);

    // Cambiamos a imgB
    await act(async () => {
      result.current.setMain(imgB as any);
    });

    await waitFor(() => {
      expect(result.current.form.mainImage).toEqual(imgB);
    });

    // Sigue siendo válido
    expect(result.current.validate()).toBe(true);
  });

  it("getCreateData / getUpdateData devuelven una copia del form actual", async () => {
    const { result } = renderHook(() => useNoticeForm());

    await act(async () => {
      result.current.setField("title", "Nuevo");
      result.current.setField("description", "Desc");
      result.current.setMain(imgA as any);
    });

    await waitFor(() => {
      expect(result.current.form.mainImage).toEqual(imgA);
    });

    const createDto = result.current.getCreateData();
    const updateDto = result.current.getUpdateData();

    expect(createDto).toEqual(result.current.form);
    expect(updateDto).toEqual(result.current.form);

    // y no deberían ser la misma referencia si más adelante clonás, pero el hook devuelve spread
    // así que por ahora solo chequeamos igualdad estructural.
  });

  it("onValidChange se llama con cada transición de validez", async () => {
    const onValidChange = vi.fn();
    const { result } = renderHook(() => useNoticeForm(undefined, onValidChange));

    // Comienza inválido ⇒ se llamará con false al mount
    // (puede llamarse 1 o más veces según el scheduler)
    expect(onValidChange).toHaveBeenCalledWith(false);

    await act(async () => {
      result.current.setField("title", "X");
    });
    expect(onValidChange).toHaveBeenLastCalledWith(false);

    await act(async () => {
      result.current.setField("description", "Y");
    });
    expect(onValidChange).toHaveBeenLastCalledWith(false);

    await act(async () => {
      result.current.setMain(imgA as any);
    });

    await waitFor(() => {
      // Ahora válido
      expect(result.current.validate()).toBe(true);
    });
    expect(onValidChange).toHaveBeenLastCalledWith(true);

    // Si lo hacemos inválido otra vez (ej: vaciando el título), vuelve a notificar false
    await act(async () => {
      result.current.setField("title", "");
    });
    expect(onValidChange).toHaveBeenLastCalledWith(false);
  });
});
