/// <reference types="vitest" />
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, type Mock } from "vitest";
import { NoticeForm, type NoticeFormHandle } from "../../../components/notices/NoticeForm";

// ────── Mocks ──────
vi.mock("../../../hooks/useNoticeForm", () => ({
  useNoticeForm: vi.fn(),
}));

vi.mock("../../../../shared/components/images/ImageUploader", () => ({
  ImageUploader: ({ label, onSelect }: any) => (
    <button data-testid="uploader" onClick={() => onSelect([{ name: "mock.jpg" }])}>
      {label || "MockUploader"}
    </button>
  ),
}));

vi.mock("../../../../shared/components/images/ImagePreview", () => ({
  ImagePreview: ({ onDelete }: any) => (
    <button data-testid="preview-delete" onClick={onDelete}>
      DeleteImage
    </button>
  ),
}));

import { useNoticeForm } from "../../../hooks/useNoticeForm";

describe("NoticeForm", () => {
  const mockValidar = vi.fn(() => true);
  const mockObtenerCrear = vi.fn(() => ({ foo: "bar" }));
  const mockObtenerActualizar = vi.fn(() => ({ baz: "qux" }));
  const mockSetCampo = vi.fn();
  const mockSetPrincipal = vi.fn();

  const mockFormulario = {
    title: "",
    description: "",
    mainImage: null,
  };

  const setupHookReturn = (overrides?: Partial<ReturnType<typeof useNoticeForm>>) => {
    (useNoticeForm as Mock).mockReturnValue({
      form: { ...mockFormulario },
      validate: mockValidar,
      getCreateData: mockObtenerCrear,
      getUpdateData: mockObtenerActualizar,
      setField: mockSetCampo,
      setMain: mockSetPrincipal,
      ...overrides,
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setupHookReturn();
  });

  it("llama a setField al cambiar el título", () => {
    render(<NoticeForm />);
    fireEvent.change(screen.getByLabelText("Título"), { target: { value: "Nuevo título" } });
    expect(mockSetCampo).toHaveBeenCalledWith("title", "Nuevo título");
  });

  it("llama a setField al cambiar la descripción", () => {
    render(<NoticeForm />);
    fireEvent.change(screen.getByLabelText("Descripción"), { target: { value: "Descripción larga" } });
    expect(mockSetCampo).toHaveBeenCalledWith("description", "Descripción larga");
  });

  it("maneja el método validate del ref devolviendo true", () => {
    const ref = { current: null } as React.MutableRefObject<NoticeFormHandle | null>;
    render(<NoticeForm ref={ref} />);
    expect(ref.current?.validate()).toBe(true);
    expect(ref.current?.getCreateData()).toEqual({ foo: "bar" });
    expect(ref.current?.getUpdateData()).toEqual({ baz: "qux" });
    expect(mockValidar).toHaveBeenCalled();
    expect(mockObtenerCrear).toHaveBeenCalled();
    expect(mockObtenerActualizar).toHaveBeenCalled();
  });

  it("maneja el método validate del ref devolviendo false", () => {
    setupHookReturn({
      validate: vi.fn(() => false),
    });
    const ref = { current: null } as React.MutableRefObject<NoticeFormHandle | null>;
    render(<NoticeForm ref={ref} />);
    expect(ref.current?.validate()).toBe(false);
  });

  it("inicializa los inputs con los valores del formulario", () => {
    setupHookReturn({
      form: {
        title: "Título inicial",
        description: "Descripción inicial",
        mainImage: null,
      },
    });
    render(<NoticeForm />);
    expect(screen.getByLabelText("Título")).toHaveValue("Título inicial");
    expect(screen.getByLabelText("Descripción")).toHaveValue("Descripción inicial");
  });

  it("llama useNoticeForm con (initialData, onValidityChange)", () => {
    const initial = {
      id: 10,
      title: "Init",
      description: "Init desc",
      mainImage: null,
      date: "2025-06-10T10:00:00Z",
      userId: "u1",
    };
    const onValidityChange = vi.fn();

    render(<NoticeForm initialData={initial} onValidityChange={onValidityChange} />);

    expect(useNoticeForm).toHaveBeenCalledWith(initial, onValidityChange);
  });

  it("setea la imagen principal al seleccionar en ImageUploader (toma el primer archivo)", () => {
    render(<NoticeForm />);
    // nuestro mock de ImageUploader llama onSelect([{ name: "mock.jpg" }]) al click
    fireEvent.click(screen.getByTestId("uploader"));
    expect(mockSetPrincipal).toHaveBeenCalledWith(expect.objectContaining({ name: "mock.jpg" }));
  });

  it("elimina la imagen principal al clickear el delete del ImagePreview", () => {
    render(<NoticeForm />);
    fireEvent.click(screen.getByTestId("preview-delete"));
    expect(mockSetPrincipal).toHaveBeenCalledWith(null);
  });

  it("el form hace preventDefault en el submit", () => {
    const { container } = render(<NoticeForm />);
    const form = container.querySelector("form")!;
    const evt = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(evt);
    expect(evt.defaultPrevented).toBe(true);
  });

});
