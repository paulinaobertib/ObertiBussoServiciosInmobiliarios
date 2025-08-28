import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { vi, type Mock } from "vitest";
import { Chat } from "../../../chat/components/Chat";
import { useChatContext } from "../../context/ChatContext";
import { useChatSession } from "../../hooks/useChatSession";
import { useAuthContext } from "../../../user/context/AuthContext";
import { usePropertiesContext } from "../../../property/context/PropertiesContext";
import * as propertyService from "../../../property/services/property.service";

vi.mock("../../context/ChatContext");
vi.mock("../../hooks/useChatSession");
vi.mock("../../../user/context/AuthContext");
vi.mock("../../../property/context/PropertiesContext");
vi.mock("../../../property/services/property.service");

describe("Componente Chat", () => {
  const mockSendMessage = vi.fn();
  const mockAddUserMessage = vi.fn();
  const mockAddSystemMessage = vi.fn();
  const mockClearMessages = vi.fn();
  const mockStartSessionGuest = vi.fn();
  const mockStartSessionUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    (useChatContext as Mock).mockReturnValue({
      messages: [],
      sendMessage: mockSendMessage,
      loading: false,
      addSystemMessage: mockAddSystemMessage,
      addUserMessage: mockAddUserMessage,
      clearMessages: mockClearMessages,
    });
    (useChatSession as Mock).mockReturnValue({
      startSessionGuest: mockStartSessionGuest,
      startSessionUser: mockStartSessionUser,
      loading: false,
    });
    (useAuthContext as Mock).mockReturnValue({
      info: { id: 1, name: "Usuario Test" },
      isLogged: true,
    });
    (usePropertiesContext as Mock).mockReturnValue({
      propertiesList: [{ id: 1, title: "Propiedad 1" }],
    });
    (propertyService.getPropertiesByText as Mock).mockResolvedValue([
      { id: 2, title: "Propiedad 2", status: "disponible" },
    ]);
  });

  it("muestra el saludo inicial", () => {
    render(<Chat />);
    expect(
      screen.getByText(/Hola, soy tu asistente virtual/i)
    ).toBeInTheDocument();
  });

  it("inicia sesión para usuario logueado", async () => {
    mockStartSessionUser.mockResolvedValue(100);
    render(<Chat initialPropertyId={1} />);
    const btn = await screen.findByText("Sí");
    await act(async () => fireEvent.click(btn));
    await waitFor(() =>
      expect(mockStartSessionUser).toHaveBeenCalledWith(1, 1)
    );
    expect(localStorage.getItem("chatSessionId")).toBe("100");
  });

  it("minimiza y restaura el chat", async () => {
    render(<Chat />);
    const btnMinimizar = await screen.findByLabelText(/Minimizar chat/i);
    await act(async () => fireEvent.click(btnMinimizar));
    expect(screen.getByLabelText(/Restaurar chat/i)).toBeInTheDocument();
  });

  it("busca propiedades usando la barra de búsqueda", async () => {
    render(<Chat initialPropertyId={1} />);
    const btnNo = await screen.findByText(/No, buscar otra/i);
    await act(async () => fireEvent.click(btnNo));

    const input = await screen.findByLabelText(/Buscar propiedad/i);
    await act(async () =>
      fireEvent.change(input, { target: { value: "Propiedad" } })
    );

    await waitFor(() =>
      expect(propertyService.getPropertiesByText).toHaveBeenCalledWith(
        "Propiedad"
      )
    );
  });

  it("cierra chat correctamente", async () => {
    (useChatContext as Mock).mockReturnValue({
      messages: [{ from: "system", content: "Hola" }],
      sendMessage: mockSendMessage,
      loading: false,
      addSystemMessage: mockAddSystemMessage,
      addUserMessage: mockAddUserMessage,
      clearMessages: mockClearMessages,
    });

    render(<Chat initialPropertyId={1} onClose={vi.fn()} />);
    const btnClose = screen.getByLabelText(/Cerrar chat/i);
    await act(async () => fireEvent.click(btnClose));
    expect(mockClearMessages).toHaveBeenCalled();
  });

  it("valida campos de invitado y habilita botón", () => {
    (useAuthContext as Mock).mockReturnValue({ info: null, isLogged: false });
    render(<Chat />);
    expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
  });

  it("muestra error de email inválido", () => {
    (useAuthContext as Mock).mockReturnValue({ info: null, isLogged: false });
    render(<Chat />);
    const emailInput = screen.getByLabelText(/Email/i);
    act(() => {
      fireEvent.change(emailInput, { target: { value: "invalido@" } });
    });
    expect(
      screen.getByText(/Ingresá un email válido/i)
    ).toBeInTheDocument();
  });

  it("en chat: enviar número fuera de rango agrega mensaje de 'Opción inválida'", async () => {
    mockStartSessionUser.mockResolvedValue(200);
    render(<Chat initialPropertyId={1} />);
    await act(async () => fireEvent.click(await screen.findByText("Sí")));

    const input = await screen.findByPlaceholderText(/Escribí el número/i);
    fireEvent.change(input, { target: { value: "999" } });
    const btnSend = screen.getByRole("button", { name: "" });
    await act(async () => fireEvent.click(btnSend));

    expect(mockAddUserMessage).toHaveBeenCalledWith("999");
    expect(mockAddSystemMessage).toHaveBeenCalledWith(
      "Opción inválida. Por favor seleccioná un número de la lista."
    );
  });

  it("en chat: enviar texto no numérico agrega 'Entrada inválida'", async () => {
    mockStartSessionUser.mockResolvedValue(201);
    render(<Chat initialPropertyId={1} />);
    await act(async () => fireEvent.click(await screen.findByText("Sí")));

    const input = await screen.findByPlaceholderText(/Escribí el número/i);
    fireEvent.change(input, { target: { value: "hola" } });
    const btnSend = screen.getByRole("button", { name: "" });
    await act(async () => fireEvent.click(btnSend));

    expect(mockAddUserMessage).toHaveBeenCalledWith("hola");
    expect(mockAddSystemMessage).toHaveBeenCalledWith(
      "Entrada inválida. Por favor escribí solo el número de una opción."
    );
  });

  it("cambia de propiedad y envía CERRAR", async () => {
    mockStartSessionUser.mockResolvedValue(300);
    render(<Chat initialPropertyId={1} />);
    await act(async () => fireEvent.click(await screen.findByText("Sí")));

    const btnOtra = await screen.findByRole("button", {
      name: /Consultar por otra propiedad/i,
    });
    await act(async () => fireEvent.click(btnOtra));

    expect(mockSendMessage).toHaveBeenCalledWith("CERRAR", 1, 300);
    expect(await screen.findByLabelText(/Buscar propiedad/i)).toBeInTheDocument();
  });

  it("flujo invitado: completa formulario y llama startSessionGuest", async () => {
    (useAuthContext as Mock).mockReturnValue({ info: null, isLogged: false });
    mockStartSessionGuest.mockResolvedValue(400);

    render(<Chat initialPropertyId={1} />);
    fireEvent.change(screen.getByLabelText(/Nombre/i), {
      target: { value: "Ana" },
    });
    fireEvent.change(screen.getByLabelText(/Apellido/i), {
      target: { value: "Perez" },
    });
    fireEvent.change(screen.getByLabelText(/^Email/i), {
      target: { value: "ana@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/Teléfono/i), {
      target: { value: "3511231234" },
    });

    await act(async () => fireEvent.click(await screen.findByText("Sí")));
    await waitFor(() => {
      expect(mockStartSessionGuest).toHaveBeenCalled();
    });
    expect(localStorage.getItem("chatSessionId")).toBe("400");
  });
});
