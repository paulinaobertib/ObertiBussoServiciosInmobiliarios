/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { Mock } from "vitest";

const createChatMock = vi.fn();
vi.mock("../../../chat/services/chat.service", () => ({
  createChat: (...args: any[]) => createChatMock(...args),
}));

const handleErrorMock = vi.fn();
vi.mock("../../../shared/hooks/useErrors", () => ({
  useApiErrors: () => ({ handleError: handleErrorMock }),
}));

import { useChat } from "../../../chat/hooks/useChat";

describe("useChat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("estado inicial: messages=[], loading=false", () => {
    const { result } = renderHook(() => useChat());
    expect(result.current.messages).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it("sendMessage: en error llama handleError, mantiene el mensaje del usuario y apaga loading", async () => {
    const boom = new Error("boom");
    (createChatMock as Mock).mockRejectedValueOnce(boom);
    const { result } = renderHook(() => useChat());

    await act(async () => {
      // No hace falta capturar loading intermedio aquí; solo esperamos final
      await result.current.sendMessage("CUALQUIERA", 99, 3).catch(() => {});
    });

    expect(createChatMock).toHaveBeenCalledWith("CUALQUIERA", 99, 3);
    expect(handleErrorMock).toHaveBeenCalledWith(boom);
    expect(result.current.messages).toEqual([
      { from: "user", content: "CUALQUIERA" },
    ]);
    expect(result.current.loading).toBe(false);
  });

  it("sendMessage: maneja respuesta tipo Axios (objeto con data)", async () => {
    (createChatMock as Mock).mockResolvedValueOnce({ data: "OK_AXIOS" });
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage("VER_AREA", 20, 2);
    });

    expect(createChatMock).toHaveBeenCalledWith("VER_AREA", 20, 2);
    expect(result.current.messages).toEqual([
      { from: "user", content: "VER_AREA" },
      { from: "system", content: "OK_AXIOS" },
    ]);
  });

  it("sendMessage: en error llama handleError, mantiene el mensaje del usuario y apaga loading", async () => {
    const boom = new Error("boom");
    (createChatMock as Mock).mockRejectedValueOnce(boom);
    const { result } = renderHook(() => useChat());

    await act(async () => {
      const p = result.current.sendMessage("CUALQUIERA", 99, 3);
      await Promise.resolve(); 
      await p.catch(() => {});
    });

    expect(createChatMock).toHaveBeenCalledWith("CUALQUIERA", 99, 3);
    expect(handleErrorMock).toHaveBeenCalledWith(boom);
    expect(result.current.messages).toEqual([
      { from: "user", content: "CUALQUIERA" },
    ]);
    expect(result.current.loading).toBe(false);
  });

  it("addSystemMessage y addUserMessage agregan en orden correcto", () => {
    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.addUserMessage("hola");
      result.current.addSystemMessage("bienvenido");
      result.current.addUserMessage("precio");
    });

    expect(result.current.messages).toEqual([
      { from: "user", content: "hola" },
      { from: "system", content: "bienvenido" },
      { from: "user", content: "precio" },
    ]);
  });

  it("clearMessages: limpia el historial", () => {
    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.addUserMessage("uno");
      result.current.addSystemMessage("dos");
    });
    expect(result.current.messages.length).toBe(2);

    act(() => {
      result.current.clearMessages();
    });
    expect(result.current.messages).toEqual([]);
  });

  it("loading vuelve a false tanto en éxito como en error", async () => {
    const { result, rerender } = renderHook(() => useChat());

    (createChatMock as Mock).mockResolvedValueOnce("ok");
    await act(async () => {
      await result.current.sendMessage("X", 1, 1);
    });
    expect(result.current.loading).toBe(false);

    (createChatMock as Mock).mockRejectedValueOnce(new Error("x"));
    await act(async () => {
      await result.current.sendMessage("Y", 2, 2).catch(() => {});
    });
    expect(result.current.loading).toBe(false);

    rerender();
    expect(result.current.loading).toBe(false);
  });
});
