import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { InquiriesSection } from "../../../components/inquiries/InquiriesSection";
import type { Inquiry } from '../../../types/inquiry';
import { MemoryRouter } from "react-router-dom";

// Mock del hook useInquiries
vi.mock("../../../hooks/useInquiries", () => ({
  useInquiries: vi.fn(),
  STATUS_OPTIONS: ["ABIERTA", "CERRADA"]
}));

// Mock de MixedList
vi.mock("../../../components/inquiries/InquiriesList", () => ({
  MixedList: ({ inquiries, chatSessions, onResolve, onCloseChat }: any) => (
    <div data-testid="mixed-list">
      {inquiries.map((i: any) => (
        <div key={i.id} data-testid={`inquiry-${i.id}`}>
          {i.title}
          <button onClick={() => onResolve(i.id)}>Resolver</button>
        </div>
      ))}
      {chatSessions.map((c: any) => (
        <div key={c.id} data-testid={`chat-${c.id}`}>
          {c.title || "Chat"}
          <button onClick={() => onCloseChat(c.id)}>Cerrar</button>
        </div>
      ))}
    </div>
  )
}));

// Mock de InquiriesFilter
vi.mock("../../../components/inquiries/InquiriesFilter", () => ({
  InquiriesFilter: ({ onStatusChange, onPropertyChange }: any) => (
    <div>
      <button onClick={() => onStatusChange("ABIERTA")}>Cambiar Status</button>
      <button onClick={() => onPropertyChange(1)}>Cambiar Propiedad</button>
    </div>
  )
}));

import { useInquiries } from "../../../hooks/useInquiries";

describe("InquiriesSection", () => {
  const baseInquiry: Inquiry = {
    id: 1,
    phone: "123456789",
    email: "test@test.com",
    firstName: "Juan",
    lastName: "Pérez",
    date: "2025-08-01",
    title: "Consulta 1",
    description: "Descripción de la consulta 1",
    status: "ABIERTA",
    propertyTitles: ["Propiedad 1"],
  };

  const anotherInquiry: Inquiry = {
    id: 2,
    phone: "987654321",
    email: "otro@test.com",
    firstName: "Ana",
    lastName: "García",
    date: "2025-08-20",
    title: "Consulta 2",
    description: "Descripción de la consulta 2",
    status: "ABIERTA",
    propertyTitles: ["Propiedad 2"],
  };

  it("muestra loader cuando loading=true", () => {
    (useInquiries as any).mockReturnValue({
      loading: true
    });

    render(
      <MemoryRouter>
        <InquiriesSection />
      </MemoryRouter>
    );

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("renderiza lista de inquiries y permite resolverlos", () => {
    const markResolved = vi.fn();
    const closeChatSession = vi.fn();

    (useInquiries as any).mockReturnValue({
      inquiries: [baseInquiry, anotherInquiry],
      chatSessions: [],
      properties: [],
      loading: false,
      errorList: null,
      filterStatus: "",
      setFilterStatus: vi.fn(),
      filterProp: "",
      setFilterProp: vi.fn(),
      markResolved,
      actionLoadingId: null,
      closeChatSession
    });

    render(
      <MemoryRouter>
        <InquiriesSection />
      </MemoryRouter>
    );

    expect(screen.getByTestId("mixed-list")).toBeInTheDocument();
    expect(screen.getByTestId("inquiry-1")).toBeInTheDocument();
    expect(screen.getByTestId("inquiry-2")).toBeInTheDocument();

    // Click en botón de cada inquiry usando querySelector
    fireEvent.click(screen.getByTestId("inquiry-1").querySelector("button")!);
    expect(markResolved).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByTestId("inquiry-2").querySelector("button")!);
    expect(markResolved).toHaveBeenCalledWith(2);
  });

  it("muestra mensaje de error si errorList existe", () => {
    (useInquiries as any).mockReturnValue({
      loading: false,
      errorList: "Error al cargar",
      inquiries: [],
      chatSessions: [],
      properties: [],
      filterStatus: "",
      setFilterStatus: vi.fn(),
      filterProp: "",
      setFilterProp: vi.fn(),
      markResolved: vi.fn(),
      actionLoadingId: null,
      closeChatSession: vi.fn()
    });

    render(
      <MemoryRouter>
        <InquiriesSection />
      </MemoryRouter>
    );

    expect(screen.getByText("Error al cargar")).toBeInTheDocument();
  });
});
