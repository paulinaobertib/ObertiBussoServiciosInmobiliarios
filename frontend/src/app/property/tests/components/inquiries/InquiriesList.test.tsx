/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// ------- Mocks de hijos -------
vi.mock("../../../../chat/components/ChatSessionItem", () => ({
  ChatSessionItem: (props: any) => (
    <div
      data-testid={`chat-${props.session.id}`}
      data-loading={String(!!props.loading)}
      data-title={props.propertyTitle ?? ""}
    >
      <span>CHAT:{props.session.id}</span>
      <button onClick={() => props.onClose(props.session.id)}>close-chat</button>
    </div>
  ),
}));

vi.mock("../../../components/inquiries/InquiryItem", () => ({
  InquiryItem: (props: any) => (
    <div
      data-testid={`inq-${props.inquiry.id}`}
      data-loading={String(!!props.loading)}
      data-propslen={String(props.properties?.length ?? 0)}
      data-status={props.inquiry.status}
    >
      <span>INQ:{props.inquiry.id}</span>
      <button onClick={() => props.onResolve(props.inquiry.id)}>resolve-inq</button>
    </div>
  ),
}));

// ------- Mock del servicio que busca títulos faltantes -------
const getPropertyByIdMock = vi.fn();
vi.mock("../../../services/property.service", () => ({
  getPropertyById: (...args: any[]) => getPropertyByIdMock(...args),
}));

// ------- SUT -------
import { MixedList } from "../../../components/inquiries/InquiriesList";
import type { Inquiry } from "../../../types/inquiry";
import type { ChatSessionGetDTO } from "../../../../chat/types/chatSession";

const baseProps = () => {
  const inquiries: Inquiry[] = [
    {
      id: 1,
      firstName: "A",
      lastName: "ApellidoA",
      email: "a@a.com",
      phone: "",
      date: "2024-06-01T10:00:00.000Z",
      title: "Consulta A",
      description: "Detalle de la consulta A",
      status: "ABIERTA",
      propertyTitles: ["Casa Sur"],
    },
    {
      id: 2,
      firstName: "B",
      lastName: "ApellidoB",
      email: "b@b.com",
      phone: "",
      date: "2024-06-03T08:00:00.000Z",
      title: "Consulta B",
      description: "Detalle de la consulta B",
      status: "CERRADA",
      propertyTitles: ["Depto Centro"],
    },
  ];

  const chatSessions: ChatSessionGetDTO[] = [
    {
      id: 11,
      date: "2024-06-02T09:00:00.000Z",
      dateClose: null, // ABIERTA
      propertyId: 101, // está en catálogo
      userName: "x",
      messages: [],
    } as any,
    {
      id: 12,
      date: "2024-06-04T09:00:00.000Z",
      dateClose: "2024-06-05T10:00:00.000Z", // CERRADA
      propertyId: 999, // NO está en catálogo -> lo trae el servicio
      userName: "y",
      messages: [],
    } as any,
  ];

  const properties = [
    { id: 101, title: "Casa Sur" },
    { id: 202, title: "Depto Centro" },
  ];

  return {
    inquiries,
    chatSessions,
    properties,
  };
};

describe("MixedList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("pasa loadingId correctamente a hijos", () => {
    const { inquiries, chatSessions, properties } = baseProps();
    render(
      <MixedList
        inquiries={inquiries}
        chatSessions={chatSessions}
        loadingId={2} // coincide con inq #2
        onResolve={vi.fn()}
        onCloseChat={vi.fn()}
        filterStatus=""
        filterProp=""
        properties={properties}
      />
    );

    expect(screen.getByTestId("inq-2").getAttribute("data-loading")).toBe("true");
    expect(screen.getByTestId("inq-1").getAttribute("data-loading")).toBe("false");
    expect(screen.getByTestId("chat-11").getAttribute("data-loading")).toBe("false");
    expect(screen.getByTestId("chat-12").getAttribute("data-loading")).toBe("false");
  });

  it("handlers: resolve en inquiry y close en chat", () => {
    const { inquiries, chatSessions, properties } = baseProps();
    const onResolve = vi.fn();
    const onCloseChat = vi.fn();

    render(
      <MixedList
        inquiries={inquiries}
        chatSessions={chatSessions}
        loadingId={null}
        onResolve={onResolve}
        onCloseChat={onCloseChat}
        filterStatus=""
        filterProp=""
        properties={properties}
      />
    );

    fireEvent.click(screen.getByTestId("inq-1").querySelector("button")!);
    expect(onResolve).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByTestId("chat-12").querySelector("button")!);
    expect(onCloseChat).toHaveBeenCalledWith(12);
  });

  it("filtro por estado: 'CERRADA' incluye inquiries cerradas y chats con dateClose", () => {
    const { inquiries, chatSessions, properties } = baseProps();

    render(
      <MixedList
        inquiries={inquiries}
        chatSessions={chatSessions}
        loadingId={null}
        onResolve={vi.fn()}
        onCloseChat={vi.fn()}
        filterStatus="CERRADA"
        filterProp=""
        properties={properties}
      />
    );

    // Solo INQ#2 (CERRADA) y CHAT#12 (dateClose) deben estar
    expect(screen.queryByTestId("inq-2")).toBeInTheDocument();
    expect(screen.queryByTestId("chat-12")).toBeInTheDocument();

    expect(screen.queryByTestId("inq-1")).toBeNull(); // ABIERTA
    expect(screen.queryByTestId("chat-11")).toBeNull(); // ABIERTA
  });

  it("regla especial: con filterStatus='ABIERTA' se excluyen los chats", () => {
    const { inquiries, chatSessions, properties } = baseProps();

    render(
      <MixedList
        inquiries={inquiries}
        chatSessions={chatSessions}
        loadingId={null}
        onResolve={vi.fn()}
        onCloseChat={vi.fn()}
        filterStatus="ABIERTA"
        filterProp=""
        properties={properties}
      />
    );

    // Solo inquiries abiertas (inq-1). Chats no deberían aparecer aunque estén abiertos.
    expect(screen.getByTestId("inq-1")).toBeInTheDocument();
    expect(screen.queryByTestId("chat-11")).toBeNull();
    expect(screen.queryByTestId("chat-12")).toBeNull();
    expect(screen.queryByTestId("inq-2")).toBeNull();
  });

  it("filtro por propiedad (chat usa propertyId, inquiry mapea por titles->id)", () => {
    const { inquiries, chatSessions, properties } = baseProps();

    // Filtramos por la propiedad id 101 (Casa Sur):
    render(
      <MixedList
        inquiries={inquiries}
        chatSessions={chatSessions}
        loadingId={null}
        onResolve={vi.fn()}
        onCloseChat={vi.fn()}
        filterStatus=""
        filterProp={101}
        properties={properties}
      />
    );

    // INQ#1 tiene "Casa Sur" en propertyTitles (mapea a 101)
    // CHAT#11 propertyId = 101
    expect(screen.getByTestId("inq-1")).toBeInTheDocument();
    expect(screen.getByTestId("chat-11")).toBeInTheDocument();

    // INQ#2 ("Depto Centro"->202) y CHAT#12 (999) no deberían estar
    expect(screen.queryByTestId("inq-2")).toBeNull();
    expect(screen.queryByTestId("chat-12")).toBeNull();
  });

  it("ChatSessionItem recibe propertyTitle desde catálogo (id -> title)", () => {
    const { inquiries, chatSessions, properties } = baseProps();
    render(
      <MixedList
        inquiries={inquiries}
        chatSessions={chatSessions}
        loadingId={null}
        onResolve={vi.fn()}
        onCloseChat={vi.fn()}
        filterStatus=""
        filterProp=""
        properties={properties}
      />
    );

    // chat-11 usa propertyId=101, que está en catálogo
    expect(screen.getByTestId("chat-11").getAttribute("data-title")).toBe("Casa Sur");
  });

  it("cuando falta en catálogo: busca por getPropertyById, cachea y pasa el título; en error usa fallback", async () => {
    const { inquiries, chatSessions, properties } = baseProps();

    // 999 -> se resuelve desde servicio
    getPropertyByIdMock.mockImplementation(async (id: number) => {
      if (id === 999) return { id, title: "Casa Oculta 999" };
      if (id === 555) throw new Error("nope"); // para otro test dentro del mismo caso
      return { id, title: `Prop ${id}` };
    });

    // añadimos otra sesión con id 555 (forzamos error => fallback)
    const extraSessions = [
      ...chatSessions,
      {
        id: 13,
        date: "2024-06-06T10:00:00.000Z",
        dateClose: null,
        propertyId: 555, // no está en catálogo y fallará
        userName: "z",
        messages: [],
      } as any,
    ];

    render(
      <MixedList
        inquiries={inquiries}
        chatSessions={extraSessions}
        loadingId={null}
        onResolve={vi.fn()}
        onCloseChat={vi.fn()}
        filterStatus=""
        filterProp=""
        properties={properties}
      />
    );

    // espera a que el efecto resuelva los títulos faltantes
    await waitFor(() => {
      expect(getPropertyByIdMock).toHaveBeenCalled();
      // dos ids faltantes: 999 y 555 -> dos llamadas (dedupe por id)
      const calledIds = getPropertyByIdMock.mock.calls.map((c) => c[0]).sort();
      expect(calledIds).toEqual([555, 999]);
    });

    // 999 viene del servicio
    expect(screen.getByTestId("chat-12").getAttribute("data-title")).toBe("Casa Oculta 999");
    // 555 falla -> fallback "Propiedad 555"
    expect(screen.getByTestId("chat-13").getAttribute("data-title")).toBe("Propiedad 555");
  });

  it("dedupe: múltiples chats con el mismo propertyId faltante generan UNA llamada al servicio", async () => {
    const { inquiries, properties } = baseProps();

    getPropertyByIdMock.mockResolvedValue({ id: 777, title: "Titulo 777" });

    const chatSessions: ChatSessionGetDTO[] = [
      { id: 31, date: "2024-06-10T10:01:00.000Z", dateClose: null, propertyId: 777 } as any,
      { id: 32, date: "2024-06-10T10:00:00.000Z", dateClose: null, propertyId: 777 } as any,
    ];

    render(
      <MixedList
        inquiries={inquiries}
        chatSessions={chatSessions}
        loadingId={null}
        onResolve={vi.fn()}
        onCloseChat={vi.fn()}
        filterStatus=""
        filterProp=""
        properties={properties /* 777 no está aquí */}
      />
    );

    await waitFor(() => {
      expect(getPropertyByIdMock).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId("chat-31").getAttribute("data-title")).toBe("Titulo 777");
      expect(screen.getByTestId("chat-32").getAttribute("data-title")).toBe("Titulo 777");
    });
  });

  it("InquiryItem recibe el catálogo de propiedades via props", () => {
    const { inquiries, chatSessions, properties } = baseProps();
    render(
      <MixedList
        inquiries={inquiries}
        chatSessions={chatSessions}
        loadingId={null}
        onResolve={vi.fn()}
        onCloseChat={vi.fn()}
        filterStatus=""
        filterProp=""
        properties={properties}
      />
    );

    expect(screen.getByTestId("inq-1").getAttribute("data-propslen")).toBe(String(properties.length));
  });
});
