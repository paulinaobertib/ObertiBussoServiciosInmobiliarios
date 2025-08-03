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
                <button
                    onClick={() => showAlert('Test message', 'success', 'Test title')}
                >
                    Show Alert
                </button>
            );
        };

        render(
            <AlertProvider>
                <TestComponent />
            </AlertProvider>
        );

        // Simula el clic para mostrar la alerta
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
            return (
                <button onClick={() => showAlert('Test message', 'error')}>
                    Show Alert
                </button>
            );
        };

        render(
            <AlertProvider>
                <TestComponent />
            </AlertProvider>
        );

        // Simula el clic para mostrar la alerta
        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /show alert/i }));
        });

        const alert = screen.getByRole('alert');
        expect(screen.getByText('Test message')).toBeInTheDocument();
        expect(screen.queryByText('Test title')).not.toBeInTheDocument();
        expect(alert).toHaveClass('MuiAlert-filledError');
    });

});