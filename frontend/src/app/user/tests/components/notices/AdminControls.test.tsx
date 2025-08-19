/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminControls from "../../../components/notices/AdminControls";

// ---- Estado controlado del mock de NoticeForm ----
let mockValidate: () => boolean;
let mockCreateData: any;

// Mock de NoticeForm (DEBE coincidir con el path que usa AdminControls: "./NoticeForm")
vi.mock("../../../components/notices/NoticeForm", () => {
  const React = require("react");
  const { forwardRef, useImperativeHandle } = React;

  const NoticeForm = forwardRef((_props: any, ref: any) => {
    // Exponemos los métodos que usa el componente
    useImperativeHandle(ref, () => ({
      validate: () => (mockValidate ? mockValidate() : false),
      getCreateData: () => (mockCreateData ?? { title: "por defecto" }),
    }));

    // Botones utilitarios para setear validez desde el test a través de canSubmit
    return (
      <div data-testid="notice-form">
        {/* Estos botones no cambian validate(); solo simulan onValidityChange en AdminControls */}
        <button onClick={() => _props.onValidityChange(true)}>setValid</button>
        <button onClick={() => _props.onValidityChange(false)}>setInvalid</button>
      </div>
    );
  });

  return { NoticeForm };
});

describe("<AdminControls />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockValidate = () => false;
    mockCreateData = { title: "Mi noticia", description: "Desc", mainImage: null };
  });

  it("abre el diálogo al clickear 'Nueva noticia'", () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);

    render(<AdminControls onAdd={onAdd} />);

    // Aún no está abierto
    expect(screen.queryByText("Crear noticia")).toBeNull();

    // Abrir
    fireEvent.click(screen.getByRole("button", { name: /nueva noticia/i }));

    // Debe aparecer el título del diálogo y el form mockeado
    expect(screen.getByText("Crear noticia")).toBeInTheDocument();
    expect(screen.getByTestId("notice-form")).toBeInTheDocument();
  });

  it("el botón 'Crear' arranca deshabilitado y se habilita al validar", () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    render(<AdminControls onAdd={onAdd} />);

    fireEvent.click(screen.getByRole("button", { name: /nueva noticia/i }));

    const btnCrear = screen.getByRole("button", { name: /^crear$/i });

    // Al inicio: disabled
    expect(btnCrear).toBeDisabled();

    // Forzamos validez desde el mock (esto solo cambia canSubmit)
    fireEvent.click(screen.getByText("setValid"));
    expect(btnCrear).not.toBeDisabled();

    // Volver a inválido
    fireEvent.click(screen.getByText("setInvalid"));
    expect(btnCrear).toBeDisabled();
  });

  it("si validate() es true, llama onAdd con getCreateData y cierra el diálogo", async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    render(<AdminControls onAdd={onAdd} />);

    fireEvent.click(screen.getByRole("button", { name: /nueva noticia/i }));

    // Habilitamos el botón (solo canSubmit)
    fireEvent.click(screen.getByText("setValid"));

    // Hacemos que validate() pase
    mockValidate = () => true;

    fireEvent.click(screen.getByRole("button", { name: /^crear$/i }));

    // Llama a onAdd con el DTO del mock
    await waitFor(() => expect(onAdd).toHaveBeenCalledTimes(1));
    expect(onAdd).toHaveBeenCalledWith(mockCreateData);

    // El diálogo se cierra
    await waitFor(() => expect(screen.queryByText("Crear noticia")).toBeNull());
  });

  it("si validate() es false, no llama onAdd y el diálogo sigue abierto", async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    render(<AdminControls onAdd={onAdd} />);

    fireEvent.click(screen.getByRole("button", { name: /nueva noticia/i }));

    // Habilitamos el botón (validez 'visual' true)
    fireEvent.click(screen.getByText("setValid"));

    // validate() falla igualmente
    mockValidate = () => false;

    fireEvent.click(screen.getByRole("button", { name: /^crear$/i }));

    await waitFor(() => expect(onAdd).not.toHaveBeenCalled());
    // El diálogo sigue abierto
    expect(screen.getByText("Crear noticia")).toBeInTheDocument();
  });

  it("el botón 'Cancelar' cierra el diálogo sin llamar onAdd", async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    render(<AdminControls onAdd={onAdd} />);

    fireEvent.click(screen.getByRole("button", { name: /nueva noticia/i }));
    fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));

    await waitFor(() => expect(screen.queryByText("Crear noticia")).toBeNull());
    expect(onAdd).not.toHaveBeenCalled();
  });
});
