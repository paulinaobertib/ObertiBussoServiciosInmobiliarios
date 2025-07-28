import { describe, it, vi, beforeEach, expect, Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Chat } from '../../components/Chat';
import { ChatProvider, useChatContext } from '../../context/ChatContext';
import userEvent from '@testing-library/user-event';
import * as PropertiesModule from '../../../property/context/PropertiesContext';
import * as ChatSessionHook from '../../hooks/useChatSession';

vi.mock('../../context/ChatContext', async () => {
  const actual = await vi.importActual('../../context/ChatContext');
  return {
    ...actual,
    useChatContext: vi.fn(),
    ChatProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

vi.mock('../../../property/context/PropertiesContext', async () => {
  const actual = await vi.importActual('../../../property/context/PropertiesContext');
  return {
    ...actual,
    usePropertiesContext: vi.fn(),
  };
});

const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <ChatProvider>
    {children}
  </ChatProvider>
);

describe('Chat component', () => {
  const mockSendMessage = vi.fn();
  const mockStartSessionUser = vi.fn();
  const mockStartSessionGuest = vi.fn();
  const mockOnClose = vi.fn();
  const mockClearMessages = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useChatContext as Mock).mockReturnValue({
      sendMessage: mockSendMessage,
      startSessionUser: mockStartSessionUser,
      onClose: mockOnClose,
      clearMessages: mockClearMessages,
      messages: [],
      currentStep: 'form',
      user: null,
      selectedProperty: null,
      error: null,
      minimized: false,
      addSystemMessage: vi.fn(),
      addUserMessage: vi.fn(),
      loading: false,
      sessionId: null,
    });

    (PropertiesModule.usePropertiesContext as Mock).mockReturnValue({
      propertiesList: [{ id: 123, title: 'Propiedad test' }],
    });

    vi.spyOn(ChatSessionHook, 'useChatSession').mockReturnValue({
      startSessionUser: mockStartSessionUser,
      startSessionGuest: mockStartSessionGuest,
      loading: false
    } as any);
  });

  it('renderiza saludo inicial y formulario si no está logueado', () => {
    render(<Chat />, { wrapper: AllProviders });
    expect(screen.getByText(/Hola, soy tu asistente virtual/i)).toBeInTheDocument();
    expect(screen.getByText(/Por favor, ingresá tus datos de contacto/i)).toBeInTheDocument();
  });

  it('botón buscar propiedad está deshabilitado si datos incompletos', () => {
    render(<Chat />, { wrapper: AllProviders });
    const button = screen.getByRole('button', { name: /buscar propiedad/i });
    expect(button).toBeDisabled();
  });

  it('muestra pregunta si se pasa initialPropertyId y está en propertiesList', () => {
    render(<Chat initialPropertyId={123} />, { wrapper: AllProviders });
    expect(
      screen.getByText(/¿Querés consultar sobre esta propiedad\?/i)
    ).toBeInTheDocument();
  });

  it('permite colapsar y cerrar el chat', async () => {
    render(<Chat onClose={mockOnClose} />, { wrapper: AllProviders });

    const minimizarBtn = screen.getByLabelText(/minimizar chat/i);
    await userEvent.click(minimizarBtn);
    expect(screen.getByLabelText(/restaurar chat/i)).toBeInTheDocument();

    const cerrarBtn = screen.getByLabelText(/cerrar chat/i);
    await userEvent.click(cerrarBtn);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('habilita el botón buscar propiedad cuando los datos del formulario son válidos', async () => {
    render(<Chat />, { wrapper: AllProviders });

    const nombreInput = screen.getByLabelText(/Nombre/i);
    const apellidoInput = screen.getByLabelText(/Apellido/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const telefonoInput = screen.getByLabelText(/Teléfono/i);
    const button = screen.getByRole('button', { name: /buscar propiedad/i });

    await userEvent.type(nombreInput, 'Juan');
    await userEvent.type(apellidoInput, 'Pérez');
    await userEvent.type(emailInput, 'juan@example.com');
    await userEvent.type(telefonoInput, '1234567890');

    expect(button).not.toBeDisabled();
  });

  it('muestra error de email inválido en el formulario', async () => {
    render(<Chat />, { wrapper: AllProviders });

    const emailInput = screen.getByLabelText(/Email/i);
    await userEvent.type(emailInput, 'invalid-email');
    await userEvent.tab(); // Simula perder el foco

    expect(screen.getByText(/Ingresá un email válido/i)).toBeInTheDocument();
  });

  it('cambia a searchProperty al hacer clic en "No, buscar otra"', async () => {
    render(<Chat initialPropertyId={123} />, { wrapper: AllProviders });

    const noButton = screen.getByRole('button', { name: /No, buscar otra/i });
    await userEvent.click(noButton);

    expect(screen.getByLabelText(/Buscar propiedad/i)).toBeInTheDocument();
  });

  it('muestra CircularProgress cuando loading es true', () => {
    (useChatContext as Mock).mockReturnValue({
      ...useChatContext(),
      loading: true,
    });

    render(<Chat />, { wrapper: AllProviders });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('maneja initialPropertyId no encontrado en propertiesList', () => {
    (PropertiesModule.usePropertiesContext as Mock).mockReturnValue({
      propertiesList: [],
    });

    render(<Chat initialPropertyId={999} />, { wrapper: AllProviders });

    expect(screen.getByText(/¿Querés consultar sobre esta propiedad\?/i)).toBeInTheDocument();
    expect(screen.queryByText(/Propiedad test/i)).not.toBeInTheDocument();
  });

  it('no envía mensaje CERRAR si la sesión ya está finalizada', async () => {
    (useChatContext as Mock).mockReturnValue({
      ...useChatContext(),
      messages: [
        { from: 'system', content: 'La conversación ha finalizado. Gracias por contactarnos.' },
      ],
      currentStep: 'chat',
      selectedProperty: { id: 123, title: 'Propiedad test' },
      sessionId: 1,
    });

    render(<Chat initialPropertyId={123} onClose={mockOnClose} />, { wrapper: AllProviders });

    const cerrarBtn = screen.getByLabelText(/cerrar chat/i);
    await userEvent.click(cerrarBtn);

    expect(mockSendMessage).not.toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handleStart funciona para invitado con datos completos', async () => {
    mockStartSessionGuest.mockResolvedValue({ id: 77 });
    render(<Chat initialPropertyId={123} />, { wrapper: AllProviders });
    await userEvent.type(screen.getByLabelText(/Nombre/i), 'Juan');
    await userEvent.type(screen.getByLabelText(/Apellido/i), 'Perez');
    await userEvent.type(screen.getByLabelText(/Email/i), 'juan@test.com');
    await userEvent.type(screen.getByLabelText(/Teléfono/i), '123456');
    await userEvent.click(screen.getByRole('button', { name: /^Sí$/i }));
    expect(mockStartSessionGuest).toHaveBeenCalled();
  });

  it('oculta opciones cuando chat está inactivo', () => {
    (useChatContext as Mock).mockReturnValue({
      ...useChatContext(),
      messages: [{ from: 'system', content: 'Pregunta del sistema' }],
      sessionId: 1,
    });

    render(<Chat initialPropertyId={123} />, { wrapper: AllProviders });
    expect(screen.queryByText(/Por favor, seleccioná una de las siguientes opciones/i)).not.toBeInTheDocument();
  });

});
