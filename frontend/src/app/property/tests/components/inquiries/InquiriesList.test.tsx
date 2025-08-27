import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { MixedList } from "../../../components/inquiries/InquiriesList";
import type { Inquiry, InquiryStatus } from '../../../types/inquiry';
import { MemoryRouter } from 'react-router-dom';

// Mock de InquiryItem
vi.mock("../../../components/inquiries/InquiryItem", () => ({
  InquiryItem: ({ inquiry, loading, onResolve }: any) => (
    <div data-testid={`inquiry-${inquiry.id}`}>
      <span>{inquiry.title}</span>
      <button
        onClick={() => onResolve(inquiry.id)}
        disabled={loading}
      >
        Resolver
      </button>
    </div>
  ),
}));

describe("MixedList", () => {
  const baseInquiry: Inquiry = {
    id: 1,
    phone: "123456789",
    email: "test@test.com",
    firstName: "Juan",
    lastName: "Pérez",
    date: "2025-08-01",
    title: "Consulta 1",
    description: "Descripción de la consulta 1",
    status: "ABIERTA" as InquiryStatus,
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
    status: "ABIERTA" as InquiryStatus,
    propertyTitles: ["Propiedad 2"],
  };

  it("renderiza sin inquiries ni chats", () => {
    render(
      <MemoryRouter>
        <MixedList
          inquiries={[]}
          chatSessions={[]}
          loadingId={null}
          onResolve={vi.fn()}
          onCloseChat={vi.fn()}
        />
      </MemoryRouter>
    );
    expect(screen.queryByTestId(/inquiry-/)).toBeNull();
  });

  it("renderiza inquiries y llama onResolve", () => {
    const handleResolve = vi.fn();
    render(
      <MemoryRouter>
        <MixedList
          inquiries={[baseInquiry]}
          chatSessions={[]}
          loadingId={null}
          onResolve={handleResolve}
          onCloseChat={vi.fn()}
        />
      </MemoryRouter>
    );

    const inquiry = screen.getByTestId("inquiry-1");
    expect(inquiry).toHaveTextContent("Consulta 1");

    fireEvent.click(screen.getByText("Resolver"));
    expect(handleResolve).toHaveBeenCalledWith(1);
  });

  it("muestra botón deshabilitado si está cargando", () => {
    render(
      <MemoryRouter>
        <MixedList
          inquiries={[baseInquiry]}
          chatSessions={[]}
          loadingId={1}
          onResolve={vi.fn()}
          onCloseChat={vi.fn()}
        />
      </MemoryRouter>
    );

    const button = screen.getByText("Resolver");
    expect(button).toBeDisabled();
  });

  it("ordena los elementos por fecha descendente", () => {
    render(
      <MemoryRouter>
        <MixedList
          inquiries={[baseInquiry, anotherInquiry]}
          chatSessions={[]}
          loadingId={null}
          onResolve={vi.fn()}
          onCloseChat={vi.fn()}
        />
      </MemoryRouter>
    );

    const items = screen.getAllByTestId(/inquiry-/);
    expect(items[0]).toHaveAttribute("data-testid", "inquiry-2");
    expect(items[1]).toHaveAttribute("data-testid", "inquiry-1");
  });
});
