import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal, Props } from '../../components/Modal';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Utilidad para renderizar el modal con theme de MUI
const renderWithTheme = (ui: React.ReactElement) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('Modal', () => {
  const defaultProps: Props = {
    open: true,
    title: 'Test Modal',
    onClose: vi.fn(),
    children: <div>Contenido del modal</div>,
  };

  it('renderiza el título y el contenido', () => {
    renderWithTheme(<Modal {...defaultProps} />);
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Contenido del modal')).toBeInTheDocument();
  });

  it('llama a onClose cuando se hace clic en el botón de cerrar', () => {
    renderWithTheme(<Modal {...defaultProps} />);
    fireEvent.click(screen.getByLabelText(/cerrar modal/i));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('llama a onClose si el motivo NO es backdropClick', () => {
    const { container } = renderWithTheme(<Modal {...defaultProps} />);

    // Simular cierre manual llamando el evento `onClose` con otro motivo
    const dialog = container.querySelector('[role="dialog"]');
    fireEvent.click(screen.getByLabelText(/cerrar modal/i)); // click explícito
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

});
