/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import dayjs from "dayjs";
import "dayjs/locale/es";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../../../user/context/AuthContext", () => ({
  useAuthContext: () => ({}),
}));

const useMediaQueryMock = vi.fn().mockReturnValue(false);
vi.mock("@mui/material", async () => {
  const actual = await vi.importActual<any>("@mui/material");
  return { ...actual, useMediaQuery: (...args: any[]) => useMediaQueryMock(...args) };
});

// Solo usamos el id, ignoramos el primer arg
const buildRouteMock = vi.fn((_: string, id: number) => `/details/${id}`);
vi.mock("../../../../lib", () => ({
  ROUTES: { PROPERTY_DETAILS: "/details/:id" },
  buildRoute: (_: string, id: number) => buildRouteMock(_, id),
}));

import { ChatSessionItem } from "../../../chat/components/ChatSessionItem";

const renderWithTheme = (ui: React.ReactElement) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

const baseSession = {
  id: 10,
  propertyId: 123,
  date: "2025-01-02T15:30:00",
  dateClose: null,
  firstName: "Ana",
  lastName: "Test",
  email: "ana@test.com",
  phone: "123456",
} as any;

describe("ChatSessionItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMediaQueryMock.mockReturnValue(false);
  });

  afterEach(() => {
    cleanup();
  });

  it("muestra 'Consulta general' cuando no hay propertyId", () => {
    const session = { ...baseSession, propertyId: null };
    renderWithTheme(<ChatSessionItem session={session} loading={false} onClose={vi.fn()} />);

    expect(screen.getByText(/Consulta general/i)).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("muestra chip con el propertyTitle provisto y navega al detalle al clickear", () => {
    renderWithTheme(
      <ChatSessionItem
        session={{ ...baseSession, propertyId: 77 }}
        loading={false}
        onClose={vi.fn()}
        propertyTitle="Depto céntrico"
      />
    );

    const chip = screen.getByRole("button", { name: /depto céntrico/i });
    fireEvent.click(chip);
    expect(buildRouteMock).toHaveBeenCalledWith("/details/:id", 77);
    expect(mockNavigate).toHaveBeenCalledWith("/details/77");
  });

  it("si no se pasa propertyTitle, el chip muestra 'ID: <propertyId>'", () => {
    renderWithTheme(
      <ChatSessionItem session={{ ...baseSession, propertyId: 99 }} loading={false} onClose={vi.fn()} />
    );

    const chip = screen.getByRole("button", { name: /ID: 99/i });
    fireEvent.click(chip);
    expect(buildRouteMock).toHaveBeenCalledWith("/details/:id", 99);
    expect(mockNavigate).toHaveBeenCalledWith("/details/99");
  });

  it("muestra datos de contacto (con teléfono)", () => {
    renderWithTheme(<ChatSessionItem session={baseSession} loading={false} onClose={vi.fn()} />);

    const userLine = screen.getByText(/Usuario:/i).parentElement!;
    expect(userLine).toHaveTextContent("Usuario:");
    expect(userLine).toHaveTextContent("Ana Test");

    const emailLine = screen.getByText(/Email:/i).parentElement!;
    expect(emailLine).toHaveTextContent("Email:");
    expect(emailLine).toHaveTextContent("ana@test.com");

    const telLine = screen.getByText(/Teléfono:/i).parentElement!;
    expect(telLine).toHaveTextContent("Teléfono:");
    expect(telLine).toHaveTextContent("123456");
  });

  it("oculta teléfono cuando no existe", () => {
    renderWithTheme(
      <ChatSessionItem session={{ ...baseSession, phone: "" }} loading={false} onClose={vi.fn()} />
    );
    expect(screen.queryByText(/Teléfono:/i)).not.toBeInTheDocument();
  });

  it("renderiza en mobile (useMediaQuery=true) sin romper el layout", () => {
    useMediaQueryMock.mockReturnValue(true);
    renderWithTheme(<ChatSessionItem session={baseSession} loading={false} onClose={vi.fn()} />);

    expect(screen.getByText(/Título:/i)).toBeInTheDocument();
    expect(screen.getByText(/Consulta via ChatBot/i)).toBeInTheDocument();
  });

  it("muestra la fecha de consulta con formato en español (usando dayjs como el SUT)", () => {
    renderWithTheme(<ChatSessionItem session={baseSession} loading={false} onClose={vi.fn()} />);

    const expectedDatePart = dayjs(baseSession.date)
      .locale("es")
      .format("D [de] MMM YYYY");

    // Tomamos la última coincidencia dentro de este render para evitar colisiones
    const labels = screen.getAllByText(/Fecha de consulta:/i);
    const strongFecha = labels[labels.length - 1];
    const linea = strongFecha.parentElement!;
    expect(linea.textContent).toContain(expectedDatePart);
  });
});
