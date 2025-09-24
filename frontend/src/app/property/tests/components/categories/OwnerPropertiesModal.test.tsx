// src/app/property/tests/components/categories/OwnerPropertiesModal.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { OwnerPropertiesModal } from "../../../components/categories/OwnerPropertiesModal";
import type { Owner } from "../../../types/owner";

// ─── Mocks ───
const getPropertiesByOwnerMock = vi.fn();
vi.mock("../../../services/owner.service", () => ({
  getPropertiesByOwner: (...args: any[]) => getPropertiesByOwnerMock(...args),
}));

const handleErrorMock = vi.fn();
vi.mock("../../../../shared/hooks/useErrors", () => ({
  useApiErrors: () => ({ handleError: handleErrorMock }),
}));

// ⚠️ Corregimos las rutas de los mocks
vi.mock("../../../../shared/components/Modal", () => ({
  Modal: (props: any) => (
    <div data-testid="modal">
      <h2>{props.title}</h2>
      <button onClick={props.onClose}>cerrar</button>
      {props.children}
    </div>
  ),
}));

vi.mock("../../../../shared/components/EmptyState", () => ({
  EmptyState: (props: any) => <div data-testid="empty">{props.title}</div>,
}));

// Owner válido según interfaz
const owner: Owner = {
  id: 1,
  firstName: "Juan",
  lastName: "Pérez",
  email: "juan@test.com",
  phone: "123456789",
};

describe("OwnerPropertiesModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("no hace fetch si open=false", () => {
    render(<OwnerPropertiesModal open={false} onClose={vi.fn()} owner={owner} />);
    expect(screen.getByTestId("modal")).toBeInTheDocument();
    expect(getPropertiesByOwnerMock).not.toHaveBeenCalled();
  });

  it("muestra loading y luego propiedades vacías", async () => {
    getPropertiesByOwnerMock.mockResolvedValueOnce([]);
    render(<OwnerPropertiesModal open={true} onClose={vi.fn()} owner={owner} />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("empty")).toHaveTextContent("No hay propiedades asociadas");
    });
  });

  it("muestra error cuando falla el fetch", async () => {
    getPropertiesByOwnerMock.mockRejectedValueOnce(new Error("falló"));
    render(<OwnerPropertiesModal open={true} onClose={vi.fn()} owner={owner} />);
    await waitFor(() => expect(handleErrorMock).toHaveBeenCalled());
  });

  it("renderiza propiedades con datos válidos", async () => {
    getPropertiesByOwnerMock.mockResolvedValueOnce([
      {
        id: 10,
        title: "Depto Centro",
        price: 100000,
        currency: "ARS",
        neighborhood: { name: "Centro", city: "Córdoba" },
      },
    ]);

    render(<OwnerPropertiesModal open={true} onClose={vi.fn()} owner={owner} />);

    await waitFor(() => {
      expect(screen.getByText("Depto Centro")).toBeInTheDocument();
      expect(screen.getByText("Centro · Córdoba")).toBeInTheDocument();
      // usamos regex más flexible porque MUI puede poner un espacio extra
      expect(screen.getByText(/\$ ?100\.000/)).toBeInTheDocument();
    });
  });

  it("formatea precios inválidos mostrando fallback", async () => {
    getPropertiesByOwnerMock.mockResolvedValueOnce([
      { id: 11, title: "", price: "xx", currency: "??", neighborhood: {} },
    ]);

    render(<OwnerPropertiesModal open={true} onClose={vi.fn()} owner={owner} />);

    await waitFor(() => {
      expect(screen.getByText("Propiedad #11")).toBeInTheDocument();
      expect(screen.getByText(/\?\? xx/)).toBeInTheDocument();
    });
  });

  it("usa título genérico si no hay owner", () => {
    render(<OwnerPropertiesModal open={true} onClose={vi.fn()} owner={null} />);
    expect(screen.getByText("Propiedades del propietario")).toBeInTheDocument();
  });

  it("ejecuta onClose al presionar cerrar", async () => {
    const onClose = vi.fn();
    getPropertiesByOwnerMock.mockResolvedValueOnce([]);
    render(<OwnerPropertiesModal open={true} onClose={onClose} owner={owner} />);

    await waitFor(() => screen.getByText("cerrar"));
    await userEvent.click(screen.getByText("cerrar"));
    expect(onClose).toHaveBeenCalled();
  });
});
