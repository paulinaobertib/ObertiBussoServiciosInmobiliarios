import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { useGlobalAlert } from '../../context/AlertContext';
import { AlertProvider } from '../../context/AlertContext';

describe('AlertProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('lanza error si se usa useGlobalAlert fuera del provider', () => {
    const BrokenComponent = () => {
      useGlobalAlert();
      return null;
    };

    expect(() => render(<BrokenComponent />)).toThrow(
      'useGlobalAlert must be used within <AlertProvider>'
    );
  });

  it('proporciona el contexto correctamente dentro del AlertProvider', () => {
    const TestComponent = () => {
      const { showAlert } = useGlobalAlert();
      return (
        <button onClick={() => showAlert('Test message', 'success', { title: 'Test title' })}>
          Show Alert
        </button>
      );
    };

    render(
      <AlertProvider>
        <TestComponent />
      </AlertProvider>
    );

    expect(screen.getByRole('button', { name: /show alert/i })).toBeInTheDocument();
  });

  it('muestra una alerta con mensaje y título correctos', async () => {
    const TestComponent = () => {
      const { showAlert } = useGlobalAlert();
      return (
        <button onClick={() => showAlert('Test message', 'error', { title: 'Test title' })}>
          Show Alert
        </button>
      );
    };

    render(
      <AlertProvider>
        <TestComponent />
      </AlertProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /show alert/i }));
    });

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('Test title')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('muestra alerta sin título cuando no se proporciona', async () => {
    const TestComponent = () => {
      const { showAlert } = useGlobalAlert();
      return <button onClick={() => showAlert('Test message', 'error')}>Show Alert</button>;
    };

    render(
      <AlertProvider>
        <TestComponent />
      </AlertProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /show alert/i }));
    });

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
    expect(screen.queryByText('Test title')).not.toBeInTheDocument();
  });

  it('usa severidad "info" por defecto cuando no se especifica el tipo', async () => {
    const TestComponent = () => {
      const { showAlert } = useGlobalAlert();
      return <button onClick={() => showAlert('Info by default')}>Show Alert</button>;
    };

    render(
      <AlertProvider>
        <TestComponent />
      </AlertProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /show alert/i }));
    });

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('Info by default')).toBeInTheDocument();
  });

  it('reemplaza mensaje/título si se llama showAlert dos veces seguidas', async () => {
    const TestComponent = () => {
      const { showAlert } = useGlobalAlert();
      return (
        <>
          <button onClick={() => showAlert('One', 'warning', { title: 'T1' })}>Open A</button>
          <button onClick={() => showAlert('Two', 'success', { title: 'T2' })}>Open B</button>
        </>
      );
    };

    render(
      <AlertProvider>
        <TestComponent />
      </AlertProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByText('Open A'));
    });
    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('T1')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByText('Open B'));
    });
    expect(screen.getByText('Two')).toBeInTheDocument();
    expect(screen.getByText('T2')).toBeInTheDocument();
  });

  it('renderiza los children aunque no haya alerta abierta', () => {
    render(
      <AlertProvider>
        <div data-testid="content">Contenido App</div>
      </AlertProvider>
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
