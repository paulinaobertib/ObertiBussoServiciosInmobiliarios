/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";

// SUT
import { CatalogList } from "../../../components/catalog/CatalogList";

// ---- mocks ----
vi.mock("../../../../user/context/AuthContext", () => ({
  useAuthContext: vi.fn(),
}));

vi.mock("../../../../shared/context/AlertContext", () => ({
  useGlobalAlert: vi.fn(),
}));

// ✅ mock correcto de PropertyCard para evitar URL.createObjectURL
vi.mock("../../../components/catalog/PropertyCard", () => ({
  PropertyCard: ({ property, onClick }: any) => (
    <div data-testid={`card-${property.id}`} onClick={onClick}>
      {property.title}
    </div>
  ),
}));

// ✅ mock correcto de EmptyState con data-testid
vi.mock("../../../../shared/components/EmptyState", () => ({
  EmptyState: ({ title }: any) => <div data-testid="empty">{title}</div>,
}));

// Necesario para espiar navigate
vi.mock("react-router-dom", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

const { useAuthContext } = await import("../../../../user/context/AuthContext");
const { useGlobalAlert } = await import("../../../../shared/context/AlertContext");
const mockedNavigate = vi.fn();
(useNavigate as any).mockReturnValue(mockedNavigate);

describe("CatalogList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("muestra EmptyState si no hay propiedades (admin)", async () => {
    (useAuthContext as any).mockReturnValue({ isAdmin: true });
    (useGlobalAlert as any).mockReturnValue({});

    render(
      <MemoryRouter>
        <CatalogList properties={[]} />
      </MemoryRouter>
    );

    const empty = await screen.findByTestId("empty");
    expect(empty).toHaveTextContent("No hay propiedades cargadas.");
  });

  it("muestra EmptyState si no hay propiedades disponibles (no admin)", async () => {
    (useAuthContext as any).mockReturnValue({ isAdmin: false });
    (useGlobalAlert as any).mockReturnValue({});

    render(
      <MemoryRouter>
        <CatalogList properties={[]} />
      </MemoryRouter>
    );

    const empty = await screen.findByTestId("empty");
    expect(empty).toHaveTextContent("No hay propiedades disponibles.");
  });

  it("filtra propiedades no disponibles para no-admin", async () => {
    (useAuthContext as any).mockReturnValue({ isAdmin: false });
    (useGlobalAlert as any).mockReturnValue({});

    const props = [
      { id: 1, title: "Disp", status: "DISPONIBLE", date: "2025-01-01" },
      { id: 2, title: "Vendida", status: "VENDIDA", date: "2025-01-02" },
    ];

    render(
      <MemoryRouter>
        <CatalogList properties={props as any} />
      </MemoryRouter>
    );

    expect(await screen.findByTestId("card-1")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByTestId("card-2")).not.toBeInTheDocument());
  });

  it("ordena primero outstanding y luego por fecha descendente", async () => {
    (useAuthContext as any).mockReturnValue({ isAdmin: true });
    (useGlobalAlert as any).mockReturnValue({});

    const props = [
      { id: 1, title: "Normal viejo", date: "2020-01-01" },
      { id: 2, title: "Outstanding reciente", outstanding: true, date: "2025-01-01" },
      { id: 3, title: "Normal reciente", date: "2025-02-01" },
    ];

    render(
      <MemoryRouter>
        <CatalogList properties={props as any} />
      </MemoryRouter>
    );

    const cards = await screen.findAllByTestId(/card-/);
    expect(cards[0]).toHaveTextContent("Outstanding reciente");
    expect(cards[1]).toHaveTextContent("Normal reciente");
    expect(cards[2]).toHaveTextContent("Normal viejo");
  });

  it("llama onCardClick al hacer click en una tarjeta", async () => {
    (useAuthContext as any).mockReturnValue({ isAdmin: true });
    (useGlobalAlert as any).mockReturnValue({});

    const onCardClick = vi.fn();
    const props = [{ id: 1, title: "Casa", date: "2025-01-01" }];

    render(
      <MemoryRouter>
        <CatalogList properties={props as any} onCardClick={onCardClick} />
      </MemoryRouter>
    );

    const card = await screen.findByTestId("card-1");
    fireEvent.click(card);
    expect(onCardClick).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });

  it("flujo ESPERA con alertApi.confirm -> renovar contrato", async () => {
    (useAuthContext as any).mockReturnValue({ isAdmin: true });
    const confirmMock = vi.fn().mockResolvedValue(true);
    (useGlobalAlert as any).mockReturnValue({ confirm: confirmMock });

    const props = [{ id: 10, title: "Casa Espera", status: "ESPERA", date: "2025-01-01" }];

    render(
      <MemoryRouter>
        <CatalogList properties={props as any} />
      </MemoryRouter>
    );

    await waitFor(() => expect(confirmMock).toHaveBeenCalled());
    expect(mockedNavigate).toHaveBeenCalledWith("/contracts/new");
  });

  it("flujo ESPERA con alertApi.confirm -> ver propiedad", async () => {
    (useAuthContext as any).mockReturnValue({ isAdmin: true });
    const confirmMock = vi.fn().mockResolvedValue(false);
    (useGlobalAlert as any).mockReturnValue({ confirm: confirmMock });

    const props = [{ id: 11, title: "Depto Espera", status: "ESPERA", date: "2025-01-01" }];

    render(
      <MemoryRouter>
        <CatalogList properties={props as any} />
      </MemoryRouter>
    );

    await waitFor(() => expect(confirmMock).toHaveBeenCalled());
    expect(mockedNavigate).toHaveBeenCalledWith("/properties/11");
  });

  it("flujo ESPERA con alertApi.warning", async () => {
    (useAuthContext as any).mockReturnValue({ isAdmin: true });
    const warningMock = vi.fn().mockResolvedValue(undefined);
    (useGlobalAlert as any).mockReturnValue({ warning: warningMock });

    const props = [{ id: 12, title: "Lote Espera", status: "ESPERA", date: "2025-01-01" }];

    render(
      <MemoryRouter>
        <CatalogList properties={props as any} />
      </MemoryRouter>
    );

    await waitFor(() => expect(warningMock).toHaveBeenCalled());
    expect(mockedNavigate).toHaveBeenCalledWith("/properties/12");
  });

  it("flujo ESPERA con alertApi.showAlert", async () => {
    (useAuthContext as any).mockReturnValue({ isAdmin: true });
    const showAlertMock = vi.fn();
    (useGlobalAlert as any).mockReturnValue({ showAlert: showAlertMock });

    const props = [{ id: 13, title: "Terreno Espera", status: "ESPERA", date: "2025-01-01" }];

    render(
      <MemoryRouter>
        <CatalogList properties={props as any} />
      </MemoryRouter>
    );

    await waitFor(() => expect(showAlertMock).toHaveBeenCalled());
    expect(localStorage.getItem("waitingPropsDismissedIds")).toContain("13");
  });

  it("no vuelve a ejecutar si promptingRef ya estaba en true", async () => {
    (useAuthContext as any).mockReturnValue({ isAdmin: true });
    const confirmMock = vi.fn().mockResolvedValue(true);
    (useGlobalAlert as any).mockReturnValue({ confirm: confirmMock });

    const props = [
      { id: 20, title: "Casa1", status: "ESPERA", date: "2025-01-01" },
      { id: 21, title: "Casa2", status: "ESPERA", date: "2025-01-02" },
    ];

    render(
      <MemoryRouter>
        <CatalogList properties={props as any} />
      </MemoryRouter>
    );

    await waitFor(() => expect(confirmMock).toHaveBeenCalledTimes(1));
  });

  it("ignora propiedades en ESPERA ya dismissadas", async () => {
    localStorage.setItem("waitingPropsDismissedIds", JSON.stringify([30]));
    (useAuthContext as any).mockReturnValue({ isAdmin: true });
    const confirmMock = vi.fn();
    (useGlobalAlert as any).mockReturnValue({ confirm: confirmMock });

    const props = [{ id: 30, title: "Casa dismiss", status: "ESPERA", date: "2025-01-01" }];

    render(
      <MemoryRouter>
        <CatalogList properties={props as any} />
      </MemoryRouter>
    );

    await new Promise((r) => setTimeout(r, 100));
    expect(confirmMock).not.toHaveBeenCalled();
  });
});
