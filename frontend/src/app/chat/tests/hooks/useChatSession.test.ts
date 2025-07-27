import { describe, it, vi, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChatSession } from '../../hooks/useChatSession';
import * as ChatSessionService from '../../services/chatSession.service';

// Mock de las funciones del servicio chatSession.service
vi.mock('../../services/chatSession.service', () => ({
  createChatSession: vi.fn(),
  createChatSessionWithUser: vi.fn(),
  getChatSessionById: vi.fn(),
  getAllChatSessions: vi.fn(),
}));

describe('Hook useChatSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('inicializa los estados correctamente', () => {
    const { result } = renderHook(() => useChatSession());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('startSessionUser maneja el flujo exitoso correctamente', async () => {
    const mockResponse = { id: 1, userId: 'user123', propertyId: 123 };
    (ChatSessionService.createChatSessionWithUser as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useChatSession());

    let response: any;
    await act(async () => {
      response = await result.current.startSessionUser('user123', 123);
    });

    expect(response).toEqual(mockResponse);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(ChatSessionService.createChatSessionWithUser).toHaveBeenCalledWith('user123', 123);
  });

  it('startSessionUser maneja errores correctamente', async () => {
    const mockError = new Error('Error al crear sesión de usuario');
    (ChatSessionService.createChatSessionWithUser as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

    const { result } = renderHook(() => useChatSession());

    await act(async () => {
      await expect(result.current.startSessionUser('user123', 123)).rejects.toThrow('Error al crear sesión de usuario');
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(mockError);
    expect(ChatSessionService.createChatSessionWithUser).toHaveBeenCalledWith('user123', 123);
  });

  it('getSession maneja el flujo exitoso correctamente', async () => {
    const mockResponse = { id: 1, propertyId: 123 };
    (ChatSessionService.getChatSessionById as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useChatSession());

    let response: any;
    await act(async () => {
      response = await result.current.getSession(1);
    });

    expect(response).toEqual(mockResponse);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(ChatSessionService.getChatSessionById).toHaveBeenCalledWith(1);
  });

  it('getSession maneja errores correctamente', async () => {
    const mockError = new Error('Error al obtener sesión');
    (ChatSessionService.getChatSessionById as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

    const { result } = renderHook(() => useChatSession());

    await act(async () => {
      await expect(result.current.getSession(1)).rejects.toThrow('Error al obtener sesión');
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(mockError);
    expect(ChatSessionService.getChatSessionById).toHaveBeenCalledWith(1);
  });

  it('getAllSessions maneja el flujo exitoso correctamente', async () => {
    const mockResponse = [{ id: 1, propertyId: 123 }, { id: 2, propertyId: 456 }];
    (ChatSessionService.getAllChatSessions as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useChatSession());

    let response: any;
    await act(async () => {
      response = await result.current.getAllSessions();
    });

    expect(response).toEqual(mockResponse);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(ChatSessionService.getAllChatSessions).toHaveBeenCalled();
  });

  it('getAllSessions maneja errores correctamente', async () => {
    const mockError = new Error('Error al obtener todas las sesiones');
    (ChatSessionService.getAllChatSessions as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

    const { result } = renderHook(() => useChatSession());

    await act(async () => {
      await expect(result.current.getAllSessions()).rejects.toThrow('Error al obtener todas las sesiones');
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(mockError);
    expect(ChatSessionService.getAllChatSessions).toHaveBeenCalled();
  });

  it('getAllSessions actualiza loading correctamente', async () => {
    (ChatSessionService.getAllChatSessions as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
    );

    const { result } = renderHook(() => useChatSession());

    let promise: Promise<any>;
    act(() => {
      promise = result.current.getAllSessions();
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await promise;
    });

    expect(result.current.loading).toBe(false);
  });
});