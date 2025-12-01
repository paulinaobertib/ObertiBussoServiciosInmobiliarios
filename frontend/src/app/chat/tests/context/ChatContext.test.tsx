import { describe, it, vi, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatProvider, useChatContext } from "../../context/ChatContext";
import * as ChatHook from "../../hooks/useChat";

// Mock del hook useChat
vi.mock("../../hooks/useChat", () => ({
  useChat: vi.fn(),
}));

// Definir el tipo de ChatMessage según lo usado en tu proyecto
interface ChatMessage {
  from: "user" | "system";
  content: string;
}

describe("ChatContext", () => {
  const mockUseChat = {
    messages: [] as ChatMessage[],
    sendMessage: vi.fn(),
    addSystemMessage: vi.fn(),
    addUserMessage: vi.fn(),
    clearMessages: vi.fn(),
    loading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (ChatHook.useChat as ReturnType<typeof vi.fn>).mockReturnValue(mockUseChat);
  });

  it("ChatProvider renderiza hijos y provee el contexto correctamente", () => {
    const TestComponent = () => <div>Contenido de prueba</div>;

    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );

    expect(screen.getByText("Contenido de prueba")).toBeInTheDocument();
    expect(ChatHook.useChat).toHaveBeenCalled();
  });

  it("useChatContext devuelve el valor del contexto dentro de ChatProvider", () => {
    const TestComponent = () => {
      const context = useChatContext();
      return <div>{context.loading ? "Cargando" : "No cargando"}</div>;
    };

    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );

    expect(screen.getByText("No cargando")).toBeInTheDocument();
  });

  it("useChatContext lanza error cuando se usa fuera de ChatProvider", () => {
    const TestComponent = () => {
      useChatContext();
      return <div>Prueba</div>;
    };

    // Suprimir el error en consola
    const consoleError = console.error;
    console.error = vi.fn();

    expect(() => render(<TestComponent />)).toThrow("useChatContext debe usarse dentro de un ChatProvider");

    console.error = consoleError;
  });

  it("useChatContext permite acceder a messages y funciones del contexto", async () => {
    const mockMessages: ChatMessage[] = [
      { from: "user", content: "Hola" },
      { from: "system", content: "¡Bienvenido!" },
    ];

    (ChatHook.useChat as ReturnType<typeof vi.fn>).mockReturnValue({
      ...mockUseChat,
      messages: mockMessages,
    });

    const TestComponent = () => {
      const context = useChatContext();
      return (
        <div>
          <span>{context.messages.length}</span>
          <button onClick={() => context.addSystemMessage("Test mensaje")}>Agregar mensaje</button>
          <button onClick={() => context.addUserMessage("Mensaje usuario")}>Agregar mensaje usuario</button>
          <button onClick={context.clearMessages}>Limpiar mensajes</button>
        </div>
      );
    };

    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );

    expect(screen.getByText("2")).toBeInTheDocument();

    const addSystemButton = screen.getByRole("button", { name: /^Agregar mensaje$/i });
    await userEvent.click(addSystemButton);
    expect(mockUseChat.addSystemMessage).toHaveBeenCalledWith("Test mensaje");

    const addUserButton = screen.getByRole("button", { name: /^Agregar mensaje usuario$/i });
    await userEvent.click(addUserButton);
    expect(mockUseChat.addUserMessage).toHaveBeenCalledWith("Mensaje usuario");

    const clearButton = screen.getByRole("button", { name: /^Limpiar mensajes$/i });
    await userEvent.click(clearButton);
    expect(mockUseChat.clearMessages).toHaveBeenCalled();
  });

  it("maneja el estado de error en el contexto (simulado en el mock)", () => {
    (ChatHook.useChat as ReturnType<typeof vi.fn>).mockReturnValue({
      ...mockUseChat,
      error: new Error("Error de prueba"),
    } as any);

    type ChatContextValue = ReturnType<(typeof import("../../hooks/useChat"))["useChat"]>;
    const TestComponent = () => {
      const context = useChatContext() as ChatContextValue & { error?: Error | null };
      return <div>{context.error ? context.error.message : "Sin error"}</div>;
    };

    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );

    expect(screen.getByText("Error de prueba")).toBeInTheDocument();
  });

  it("maneja el estado de loading en el contexto", () => {
    (ChatHook.useChat as ReturnType<typeof vi.fn>).mockReturnValue({
      ...mockUseChat,
      loading: true,
    });

    const TestComponent = () => {
      const context = useChatContext();
      return <div>{context.loading ? "Cargando" : "No cargando"}</div>;
    };

    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );

    expect(screen.getByText("Cargando")).toBeInTheDocument();
  });

  it("maneja la función sendMessage correctamente", async () => {
    mockUseChat.sendMessage.mockResolvedValue({ id: 1 });

    const TestComponent = () => {
      const context = useChatContext();
      return <button onClick={() => context.sendMessage("TEST", 123, 1)}>Enviar mensaje</button>;
    };

    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );

    const button = screen.getByRole("button", { name: /Enviar mensaje/i });
    await userEvent.click(button);

    expect(mockUseChat.sendMessage).toHaveBeenCalledWith("TEST", 123, 1);
  });

  it("maneja el rechazo de sendMessage correctamente", async () => {
    mockUseChat.sendMessage.mockRejectedValue(new Error("Error al enviar"));

    const TestComponent = () => {
      const context = useChatContext();
      return <button onClick={() => context.sendMessage("TEST", 123, 1).catch(() => {})}>Enviar mensaje</button>;
    };

    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );

    const button = screen.getByRole("button", { name: /Enviar mensaje/i });
    await userEvent.click(button);

    expect(mockUseChat.sendMessage).toHaveBeenCalledWith("TEST", 123, 1);
  });
});
