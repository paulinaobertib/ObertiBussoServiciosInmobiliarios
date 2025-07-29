import { describe, it, vi, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChat } from '../../hooks/useChat';
import * as ChatService from '../../services/chat.service';

// Mock del servicio createChat
vi.mock('../../services/chat.service', () => ({
  createChat: vi.fn(),
}));

// Definir el tipo de ChatMessage según el hook
interface ChatMessage {
  from: 'user' | 'system';
  content: string;
  options?: string[];
}

describe('Hook useChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('inicializa los estados correctamente', () => {
    const { result } = renderHook(() => useChat());

    expect(result.current.messages).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('addSystemMessage agrega un mensaje del sistema', () => {
    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.addSystemMessage('Mensaje del sistema');
    });

    expect(result.current.messages).toEqual([
      { from: 'system', content: 'Mensaje del sistema' },
    ]);
  });

  it('addUserMessage agrega un mensaje del usuario', () => {
    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.addUserMessage('Mensaje del usuario');
    });

    expect(result.current.messages).toEqual([
      { from: 'user', content: 'Mensaje del usuario' },
    ]);
  });

  it('clearMessages limpia los mensajes', () => {
    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.addSystemMessage('Mensaje del sistema');
      result.current.addUserMessage('Mensaje del usuario');
    });

    expect(result.current.messages).toHaveLength(2);

    act(() => {
      result.current.clearMessages();
    });

    expect(result.current.messages).toEqual([]);
  });

  it('sendMessage maneja el flujo exitoso correctamente', async () => {
    const mockResponse = 'Respuesta del sistema';
    (ChatService.createChat as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('TEST', 123, 1);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.messages).toEqual([
      { from: 'user', content: 'TEST' },
      { from: 'system', content: mockResponse },
    ]);
    expect(ChatService.createChat).toHaveBeenCalledWith('TEST', 123, 1);
  });

  it('sendMessage maneja errores correctamente', async () => {
    const mockError = new Error('Error al enviar mensaje');
    (ChatService.createChat as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await expect(result.current.sendMessage('TEST', 123, 1)).rejects.toThrow('Error al enviar mensaje');
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(mockError);
    expect(result.current.messages).toEqual([{ from: 'user', content: 'TEST' }]);
    expect(ChatService.createChat).toHaveBeenCalledWith('TEST', 123, 1);
  });

  it('sendMessage actualiza el estado loading correctamente', async () => {
    (ChatService.createChat as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve('Respuesta'), 100))
    );

    const { result } = renderHook(() => useChat());

    let promise: Promise<any>;
    act(() => {
      promise = result.current.sendMessage('TEST', 123, 1);
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await promise;
    });

    expect(result.current.loading).toBe(false);
  });
});