/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { ChatSessionItem } from "../../../chat/components/ChatSessionItem";

// ======= Mocks =======
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock de AuthContext (el componente lo llama pero no usa valores)
vi.mock("../../../user/context/AuthContext", () => ({
  useAuthContext: () => ({}),
}));

const buildRouteMock = vi.fn(( id: number) => `/details/${id}`);
vi.mock("../../../../lib", () => ({
  ROUTES: { PROPERTY_DETAILS: "/details/:id" },
  // tipar la firma exacta evita el error del spread
  buildRoute: (id: number) => buildRouteMock(id),
}));

const getPropertyById = vi.fn<(id: number) => Promise<{ id: number; title: string }>>();
vi.mock("../../../property/services/property.service", () => ({
  // idem: firma explícita
  getPropertyById: (id: number) => getPropertyById(id),
}));

// Helper render con Theme
const renderWithTheme = (ui: React.ReactElement) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

// ======= Fixtures =======
const baseSession = {
  id: 10,
  propertyId: 123,
  date: "2025-01-02T15:30:00.000Z",
  dateClose: null,
  firstName: "Ana",
  lastName: "Test",
  email: "ana@test.com",
  phone: "123456",
} as any;

// ======= Tests =======
describe("ChatSessionItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("si getPropertyById falla, el chip muestra 'ID: <propertyId>'", async () => {
    getPropertyById.mockRejectedValueOnce(new Error("boom"));

    const onClose = vi.fn();
    renderWithTheme(
      <ChatSessionItem session={{ ...baseSession, propertyId: 99 }} loading={false} onClose={onClose} />
    );

    // Debe caer al fallback de ID
    const chip = await screen.findByText("ID: 99");
    expect(chip).toBeInTheDocument();
  });

  it("muestra 'Consulta general' cuando no hay propertyId", () => {
    const session = { ...baseSession, propertyId: null };
    const onClose = vi.fn();

    renderWithTheme(<ChatSessionItem session={session} loading={false} onClose={onClose} />);

    expect(screen.getByText(/Consulta general/i)).toBeInTheDocument();
    // No debería haber chip clickeable
    expect(screen.queryByRole("button", { name: /ID:/i })).not.toBeInTheDocument();
  });

  it("cuando la sesión está cerrada, muestra botón 'Resuelta' deshabilitado", () => {
    const session = { ...baseSession, dateClose: "2025-02-01T10:00:00.000Z" };
    const onClose = vi.fn();

    renderWithTheme(<ChatSessionItem session={session} loading={false} onClose={onClose} />);

    const btn = screen.getByRole("button", { name: /Resuelta/i });
    expect(btn).toBeDisabled();
  });

  it("cuando la sesión está abierta, muestra 'Cerrar chat' y dispara onClose(id)", async () => {
    const onClose = vi.fn();

    renderWithTheme(<ChatSessionItem session={baseSession} loading={false} onClose={onClose} />);

    const btn = screen.getByRole("button", { name: /Cerrar chat/i });
    expect(btn).toBeEnabled();

    await userEvent.click(btn);
    expect(onClose).toHaveBeenCalledWith(10);
  });

  it("pasa la prop 'loading' al LoadingButton (se deshabilita mientras carga)", async () => {
    const onClose = vi.fn();

    const { rerender } = renderWithTheme(
      <ChatSessionItem session={baseSession} loading={false} onClose={onClose} />
    );

    let btn = screen.getByRole("button", { name: /Cerrar chat/i });
    expect(btn).toBeEnabled();

    // Re-render con loading=true
    rerender(
      <ThemeProvider theme={createTheme()}>
        <ChatSessionItem session={baseSession} loading={true} onClose={onClose} />
      </ThemeProvider>
    );

    // LoadingButton con loading suele quedar disabled
    btn = screen.getByRole("button", { name: /Cerrar chat/i });
    expect(btn).toBeDisabled();
  });
});
