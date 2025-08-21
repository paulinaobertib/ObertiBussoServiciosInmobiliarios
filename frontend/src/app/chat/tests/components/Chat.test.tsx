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
    (propertyService.getPropertiesByText as Mock).mockResolvedValue([{ id: 2, title: "Propiedad 2" }]);
  });

  it("muestra el saludo inicial", () => {
    render(<Chat />);
    expect(screen.getByText(/Hola, soy tu asistente virtual/i)).toBeInTheDocument();
  });

  it("inicia sesión para usuario logueado", async () => {
    mockStartSessionUser.mockResolvedValue(100);
    render(<Chat initialPropertyId={1} />);
    const btn = await screen.findByText("Sí");
    await act(async () => fireEvent.click(btn));
    await waitFor(() => expect(mockStartSessionUser).toHaveBeenCalledWith(1, 1));
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
    await act(async () => fireEvent.change(input, { target: { value: "Propiedad" } }));

    await waitFor(() => expect(propertyService.getPropertiesByText).toHaveBeenCalledWith("Propiedad"));
  });

  it("cierra chat correctamente", async () => {
    // Mock con al menos un mensaje para evitar undefined
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

});
