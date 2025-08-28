/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import type { Mock } from "vitest";

const createChatSessionMock = vi.fn();
const createChatSessionWithUserMock = vi.fn();
const getChatSessionByIdMock = vi.fn();
const getAllChatSessionsMock = vi.fn();

vi.mock("../../../chat/services/chatSession.service", () => ({
  createChatSession: (...args: any[]) => createChatSessionMock(...args),
  createChatSessionWithUser: (...args: any[]) => createChatSessionWithUserMock(...args),
  getChatSessionById: (...args: any[]) => getChatSessionByIdMock(...args),
  getAllChatSessions: (...args: any[]) => getAllChatSessionsMock(...args),
}));

const handleErrorMock = vi.fn();
vi.mock("../../../shared/hooks/useErrors", () => ({
  useApiErrors: () => ({ handleError: handleErrorMock }),
}));

import { useChatSession } from "../../../chat/hooks/useChatSession";

describe("useChatSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("estado inicial: loading=false", () => {
    const { result } = renderHook(() => useChatSession());
    expect(result.current.loading).toBe(false);
  });

  it("startSessionGuest: éxito (string) y observa loading intermedio", async () => {
    // Promesa diferida para controlar el momento de resolución
    let resolveFn!: (v: any) => void;
    (createChatSessionMock as Mock).mockImplementationOnce(
      () => new Promise((resolve) => { resolveFn = resolve; })
    );

    const { result } = renderHook(() => useChatSession());

    const dto = { firstName: "Ana", lastName: "T", email: "a@b.com", phone: "1", propertyId: 123 };

    // Lanzamos el flujo SIN await, así podemos observar el estado intermedio
    let inFlight!: Promise<any>;
    act(() => {
      inFlight = result.current.startSessionGuest(dto as any);
    });

    // Esperamos a ver loading=true (estado intermedio) antes de resolver el mock
    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });
    expect(createChatSessionMock).toHaveBeenCalledWith(dto);

    // Ahora resolvemos la promesa del servicio y esperamos el fin
    resolveFn("SESSION_OK");
    await act(async () => {
      await inFlight;
    });

    // Estado final
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("startSessionGuest: éxito estilo Axios ({ data })", async () => {
    (createChatSessionMock as Mock).mockResolvedValueOnce({ data: 987 });
    const { result } = renderHook(() => useChatSession());

    let ret: any;
    await act(async () => {
      ret = await result.current.startSessionGuest({} as any);
    });

    expect(ret).toBe(987);
    expect(result.current.loading).toBe(false);
  });

  it("startSessionGuest: error llama handleError y re-lanza", async () => {
    const boom = new Error("fail guest");
    (createChatSessionMock as Mock).mockRejectedValueOnce(boom);

    const { result } = renderHook(() => useChatSession());

    await expect(
      act(async () => {
        await result.current.startSessionGuest({} as any);
      })
    ).rejects.toThrow("fail guest");

    expect(handleErrorMock).toHaveBeenCalledWith(boom);
    expect(result.current.loading).toBe(false);
  });

  it("startSessionUser: éxito (string) y verifica args", async () => {
    (createChatSessionWithUserMock as Mock).mockResolvedValueOnce("USER_OK");
    const { result } = renderHook(() => useChatSession());

    let ret: any;
    await act(async () => {
      ret = await result.current.startSessionUser("user-1", 456);
    });

    expect(createChatSessionWithUserMock).toHaveBeenCalledWith("user-1", 456);
    expect(ret).toBe("USER_OK");
    expect(result.current.loading).toBe(false);
  });

  it("startSessionUser: error llama handleError y re-lanza", async () => {
    const boom = new Error("fail user");
    (createChatSessionWithUserMock as Mock).mockRejectedValueOnce(boom);

    const { result } = renderHook(() => useChatSession());

    await expect(
      act(async () => {
        await result.current.startSessionUser("u", 1);
      })
    ).rejects.toThrow("fail user");

    expect(handleErrorMock).toHaveBeenCalledWith(boom);
    expect(result.current.loading).toBe(false);
  });

  it("getSession: éxito ({data}) y verifica args", async () => {
    (getChatSessionByIdMock as Mock).mockResolvedValueOnce({ data: { id: 11 } });

    const { result } = renderHook(() => useChatSession());

    let ret: any;
    await act(async () => {
      ret = await result.current.getSession(11);
    });

    expect(getChatSessionByIdMock).toHaveBeenCalledWith(11);
    expect(ret).toEqual({ id: 11 });
    expect(result.current.loading).toBe(false);
  });

  it("getSession: error llama handleError y re-lanza", async () => {
    const boom = new Error("fail get");
    (getChatSessionByIdMock as Mock).mockRejectedValueOnce(boom);

    const { result } = renderHook(() => useChatSession());

    await expect(
      act(async () => {
        await result.current.getSession(9);
      })
    ).rejects.toThrow("fail get");

    expect(handleErrorMock).toHaveBeenCalledWith(boom);
    expect(result.current.loading).toBe(false);
  });

  it("getAllSessions: éxito ({data})", async () => {
    (getAllChatSessionsMock as Mock).mockResolvedValueOnce({ data: [{ id: 1 }, { id: 2 }] });

    const { result } = renderHook(() => useChatSession());

    let ret: any;
    await act(async () => {
      ret = await result.current.getAllSessions();
    });

    expect(getAllChatSessionsMock).toHaveBeenCalledTimes(1);
    expect(ret).toEqual([{ id: 1 }, { id: 2 }]);
    expect(result.current.loading).toBe(false);
  });

  it("getAllSessions: error llama handleError y re-lanza", async () => {
    const boom = new Error("fail all");
    (getAllChatSessionsMock as Mock).mockRejectedValueOnce(boom);

    const { result } = renderHook(() => useChatSession());

    await expect(
      act(async () => {
        await result.current.getAllSessions();
      })
    ).rejects.toThrow("fail all");

    expect(handleErrorMock).toHaveBeenCalledWith(boom);
    expect(result.current.loading).toBe(false);
  });
});
