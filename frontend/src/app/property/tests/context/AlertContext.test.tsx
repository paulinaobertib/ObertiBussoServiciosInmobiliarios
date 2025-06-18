import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AlertProvider, useGlobalAlert } from '../../context/AlertContext';

// Componente de prueba que dispara la alerta
function TestComponent() {
  const { showAlert } = useGlobalAlert();

  return (
    <button
      onClick={() => showAlert(expect.any(String), 'success')}
    >
      Disparar Alerta
    </button>
  );
}

describe('AlertContext', () => {
  it('muestra una alerta con el mensaje y título correctos', async () => {
    render(
      <AlertProvider>
        <TestComponent />
      </AlertProvider>
    );

    const button = screen.getByText('Disparar Alerta');
    fireEvent.click(button);

    // Esperamos a que el mensaje y título estén visibles
    await waitFor(() => {
      expect(screen.getByText('Mensaje de prueba')).toBeInTheDocument();
      expect(screen.getByText('Título de prueba')).toBeInTheDocument();
    });
  });

  it('lanza error si useGlobalAlert se usa fuera del Provider', () => {
    // Suprime el error para no ensuciar la consola
    const spy = vi.spyOn(console, 'error').mockImplementation(() => { });

    const BrokenComponent = () => {
      useGlobalAlert();
      return <div>Hola</div>;
    };

    expect(() => render(<BrokenComponent />)).toThrow(
      'useGlobalAlert debe usarse dentro de AlertProvider'
    );

    spy.mockRestore();
  });
});
