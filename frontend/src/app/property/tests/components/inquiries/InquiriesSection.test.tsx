/// <reference types="vitest" />
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const h = vi.hoisted(() => {
  return {
    setFilterStatus: vi.fn(),
    setFilterProp: vi.fn(),
    markResolved: vi.fn(),
    closeChatSession: vi.fn(),
    lastMixedProps: null as any,
    capturedFilterProps: null as any,
  };
});

vi.mock("../../../components/inquiries/InquiriesList", () => ({
  MixedList: (props: any) => {
    h.lastMixedProps = props;
    return (
      <div data-testid="mixed">
        <div data-testid="cnt-inq">{(props.inquiries || []).length}</div>
        <div data-testid="cnt-chat">{(props.chatSessions || []).length}</div>
        <div data-testid="ml-status">{String(props.filterStatus)}</div>
        <div data-testid="ml-prop">{String(props.filterProp)}</div>
        <button onClick={() => props.onResolve?.(101)}>resolve-one</button>
        <button onClick={() => props.onCloseChat?.(202)}>close-chat-one</button>
      </div>
    );
  },
}));

vi.mock("../../../components/inquiries/InquiriesFilter", () => ({
  InquiriesFilter: (props: any) => {
    h.capturedFilterProps = props;
    return (
      <div data-testid="filter">
        <div data-testid="f-status">{String(props.selectedStatus)}</div>
        <div data-testid="f-prop">{String(props.selectedProperty)}</div>
        <div data-testid="f-type">{String(props.selectedType)}</div>

        <button onClick={() => props.onStatusChange?.("CERRADA")}>set-status-cerrada</button>
        <button onClick={() => props.onPropertyChange?.(202)}>set-prop-202</button>
        <button onClick={() => props.onPropertyChange?.(undefined)}>clear-prop</button>

        <button onClick={() => props.onTypeChange?.("CHAT")}>set-type-chat</button>
        <button onClick={() => props.onTypeChange?.("CONSULTAS")}>set-type-consultas</button>
        <button onClick={() => props.onTypeChange?.("")}>set-type-all</button>
      </div>
    );
  },
}));

vi.mock("../../../../../theme", () => ({
  default: { palette: { divider: "#ddd" } },
}));

const useInquiriesMock = vi.fn();
vi.mock("../../../hooks/useInquiries", () => {
  return {
    useInquiries: (...args: any[]) => useInquiriesMock(...args),
    STATUS_OPTIONS: [
      { label: "Todas", value: "" },
      { label: "Abiertas", value: "ABIERTA" },
      { label: "Cerradas", value: "CERRADA" },
    ],
  };
});

import { InquiriesSection } from "../../../components/inquiries/InquiriesSection";

const renderSut = (props?: Partial<React.ComponentProps<typeof InquiriesSection>>) =>
  render(<InquiriesSection {...props} />);

describe("<InquiriesSection />", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useInquiriesMock.mockReturnValue({
      inquiries: [
        { id: 1, date: "2024-06-01T10:00:00.000Z", status: "ABIERTA", propertyTitles: ["P-A"] },
        { id: 2, date: "2024-06-02T10:00:00.000Z", status: "CERRADA", propertyTitles: ["P-B"] },
      ],
      chatSessions: [
        { id: 11, date: "2024-06-03T10:00:00.000Z", dateClose: null, propertyId: 101 } as any,
        { id: 12, date: "2024-06-04T10:00:00.000Z", dateClose: "2024-06-05", propertyId: 202 } as any,
      ],
      properties: [
        { id: 101, title: "P-A" },
        { id: 202, title: "P-B" },
      ],
      loading: false,
      filterStatus: "",
      setFilterStatus: h.setFilterStatus,
      filterProp: "101",
      setFilterProp: h.setFilterProp,
      markResolved: h.markResolved,
      actionLoadingId: 2,
      closeChatSession: h.closeChatSession,
    });
  });

  it("mientras loading=true muestra spinner y NO renderiza filtro ni lista", () => {
    useInquiriesMock.mockReturnValueOnce({
      ...useInquiriesMock(),
      loading: true,
    });

    renderSut();

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(screen.queryByTestId("filter")).toBeNull();
    expect(screen.queryByTestId("mixed")).toBeNull();
  });

  it("pasa statusOptions, properties, valores seleccionados y callbacks al filtro", () => {
    renderSut({ propertyIds: [10, 20] });

    expect(useInquiriesMock).toHaveBeenCalledWith({ propertyIds: [10, 20] });
    expect(screen.getByTestId("filter")).toBeInTheDocument();
    expect(screen.getByTestId("f-status").textContent).toBe("");
    expect(screen.getByTestId("f-prop").textContent).toBe("101");
    expect(screen.getByTestId("f-type").textContent).toBe("");

    fireEvent.click(screen.getByText("set-status-cerrada"));
    expect(h.setFilterStatus).toHaveBeenCalledWith("CERRADA");

    fireEvent.click(screen.getByText("set-prop-202"));
    expect(h.setFilterProp).toHaveBeenCalledWith("202");

    fireEvent.click(screen.getByText("clear-prop"));
    expect(h.setFilterProp).toHaveBeenCalledWith("");
  });

  it("por defecto (sin filtro de tipo) MixedList recibe arrays completos y filtros del hook", () => {
    renderSut();

    expect(screen.getByTestId("mixed")).toBeInTheDocument();
    expect(screen.getByTestId("cnt-inq").textContent).toBe("2");
    expect(screen.getByTestId("cnt-chat").textContent).toBe("2");
    expect(screen.getByTestId("ml-status").textContent).toBe("");
    expect(screen.getByTestId("ml-prop").textContent).toBe("101");
  });

  it("filtro de tipo: 'CHAT' vacía inquiries y mantiene chats", () => {
    renderSut();
    fireEvent.click(screen.getByText("set-type-chat"));

    expect(screen.getByTestId("cnt-inq").textContent).toBe("0");
    expect(screen.getByTestId("cnt-chat").textContent).toBe("2");
  });

  it("filtro de tipo: 'CONSULTAS' vacía chats y mantiene inquiries", () => {
    renderSut();
    fireEvent.click(screen.getByText("set-type-consultas"));

    expect(screen.getByTestId("cnt-inq").textContent).toBe("2");
    expect(screen.getByTestId("cnt-chat").textContent).toBe("0");
  });

  it("filtro de tipo: '' muestra ambos", () => {
    renderSut();
    fireEvent.click(screen.getByText("set-type-chat"));
    fireEvent.click(screen.getByText("set-type-all"));

    expect(screen.getByTestId("cnt-inq").textContent).toBe("2");
    expect(screen.getByTestId("cnt-chat").textContent).toBe("2");
  });

  it("MixedList recibe handlers y los propaga (resolve / close chat)", () => {
    renderSut();

    fireEvent.click(screen.getByText("resolve-one"));
    expect(h.markResolved).toHaveBeenCalledWith(101);

    fireEvent.click(screen.getByText("close-chat-one"));
    expect(h.closeChatSession).toHaveBeenCalledWith(202);
  });

  it("MixedList recibe filterProp como número o '' según el hook", () => {
    useInquiriesMock.mockReturnValueOnce({
      ...useInquiriesMock(),
      filterProp: "",
    });

    renderSut();

    expect(screen.getByTestId("ml-prop").textContent).toBe("");
  });
});
