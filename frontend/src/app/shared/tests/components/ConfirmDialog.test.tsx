import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useConfirmDialog } from '../../components/ConfirmDialog';

function Wrapper() {
  const { ask, DialogUI } = useConfirmDialog();

  const handleClick = () => {
    ask('¿Estás seguro?', async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
  };

  return (
    <ThemeProvider theme={createTheme()}>
      <button onClick={handleClick}>Abrir diálogo</button>
      {DialogUI}
    </ThemeProvider>
  );
}

describe('useConfirmDialog', () => {
  it('muestra el diálogo cuando se llama a ask', () => {
    render(<Wrapper />);
    fireEvent.click(screen.getByText('Abrir diálogo'));

    expect(screen.getByText('¿Estás seguro?')).toBeInTheDocument();
    expect(screen.getByText('Ten en cuenta que no podrás volver atrás.')).toBeInTheDocument();
  });

  it('cierra el diálogo al hacer clic en "Cancelar"', () => {
    render(<Wrapper />);
    fireEvent.click(screen.getByText('Abrir diálogo'));

    fireEvent.click(screen.getByText('Cancelar'));
    expect(screen.queryByText('¿Estás seguro?')).not.toBeVisible(); // Puede seguir en el DOM por MUI Portal
  });

  it('ejecuta la función confirmación al hacer clic en "Confirmar"', async () => {
    const confirmFn = vi.fn().mockResolvedValue(undefined);

    function CustomWrapper() {
      const { ask, DialogUI } = useConfirmDialog();
      return (
        <ThemeProvider theme={createTheme()}>
          <button onClick={() => ask('¿Confirmar acción?', confirmFn)}>Abrir</button>
          {DialogUI}
        </ThemeProvider>
      );
    }

    render(<CustomWrapper />);
    fireEvent.click(screen.getByText('Abrir'));

    fireEvent.click(screen.getByText('Confirmar'));

    await waitFor(() => {
      expect(confirmFn).toHaveBeenCalled();
    });
  });
});
