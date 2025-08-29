import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { useGlobalAlert } from '../../context/AlertContext';
import { AlertProvider } from '../../context/AlertContext';
import { waitForElementToBeRemoved } from '@testing-library/react';

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
      'useGlobalAlert debe usarse dentro de AlertProvider'
    );
  });

  it('proporciona el contexto correctamente dentro del AlertProvider', () => {
    const TestComponent = () => {
      const { showAlert } = useGlobalAlert();
      return (
        <button onClick={() => showAlert('Test message', 'success', 'Test title')}>
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

  it('muestra una alerta con mensaje, tipo y título correctos', async () => {
    const TestComponent = () => {
      const { showAlert } = useGlobalAlert();
      return (
        <button onClick={() => showAlert('Test message', 'success', 'Test title')}>
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

    const alert = screen.getByRole('alert');
    expect(screen.getByText('Test message')).toBeInTheDocument();
    expect(screen.getByText('Test title')).toBeInTheDocument();
    expect(alert).toHaveClass('MuiAlert-filledSuccess');
  });

  it('muestra una alerta sin título cuando no se proporciona', async () => {
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

    const alert = screen.getByRole('alert');
    expect(screen.getByText('Test message')).toBeInTheDocument();
    expect(screen.queryByText('Test title')).not.toBeInTheDocument();
    expect(alert).toHaveClass('MuiAlert-filledError');
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

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-filledInfo');
    expect(screen.getByText('Info by default')).toBeInTheDocument();
    expect(screen.queryByText(/Test title/i)).not.toBeInTheDocument();
  });

  it('reemplaza mensaje/título/severidad si se llama showAlert dos veces seguidas', async () => {
    const TestComponent = () => {
      const { showAlert } = useGlobalAlert();
      return (
        <>
          <button onClick={() => showAlert('One', 'warning', 'T1')}>Open A</button>
          <button onClick={() => showAlert('Two', 'success', 'T2')}>Open B</button>
        </>
      );
    };

    render(
      <AlertProvider>
        <TestComponent />
      </AlertProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /open a/i }));
    });
    let alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-filledWarning');
    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('T1')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /open b/i }));
    });
    alert = screen.getByRole('alert');
    expect(alert).toHaveClass('MuiAlert-filledSuccess');
    expect(screen.queryByText('One')).toBeNull();
    expect(screen.queryByText('T1')).toBeNull();
    expect(screen.getByText('Two')).toBeInTheDocument();
    expect(screen.getByText('T2')).toBeInTheDocument();
  });

it(
  'cierra automáticamente luego de autoHideDuration (Snackbar onClose)',
  async () => {
    vi.useRealTimers();

    const TestComponent = () => {
      const { showAlert } = useGlobalAlert();
      return <button onClick={() => showAlert('Auto close', 'info')}>Show Alert</button>;
    };

    render(
      <AlertProvider>
        <TestComponent />
      </AlertProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /show alert/i }));
    });
    expect(screen.getByRole('alert')).toBeInTheDocument();

    await act(async () => {
      await new Promise((r) => setTimeout(r, 5600));
    });

    await waitForElementToBeRemoved(() => screen.queryByRole('alert'));
  },
  { timeout: 12000 }
);

it(
  'cierra al hacer click en el botón de cierre del Alert (Alert onClose)',
  async () => {
    vi.useRealTimers();

    const TestComponent = () => {
      const { showAlert } = useGlobalAlert();
      return (
        <button onClick={() => showAlert('Closable', 'warning', 'Close me')}>
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
    expect(screen.getByRole('alert')).toBeInTheDocument();

    await act(async () => {
      const closeBtn = screen.getByLabelText(/close/i);
      fireEvent.click(closeBtn);
    });

    await waitForElementToBeRemoved(() => screen.queryByRole('alert'));
  },
  { timeout: 12000 }
);

  it('renderiza los children aunque no haya alerta abierta', () => {
    render(
      <AlertProvider>
        <div data-testid="content">Contenido App</div>
      </AlertProvider>
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
