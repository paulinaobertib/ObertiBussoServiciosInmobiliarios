import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PanelManager, PanelConfig } from '../../components/PanelManager';
import * as hookModule from '../../hooks/usePanelManager';

// Mock PanelButton (si no querés importar el real, opcional)
// vi.mock('./PanelButton', () => ({
//   PanelButton: ({ label, active, onClick }: any) => (
//     <button onClick={onClick} data-active={active}>
//       {label}
//     </button>
//   ),
// }));

describe('PanelManager', () => {
  const toggleMock = vi.fn();
  const openState = { panel1: false, panel2: true };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock del hook usePanelManager
    vi.spyOn(hookModule, 'usePanelManager').mockReturnValue({
      open: openState,
      toggle: toggleMock,
    });
  });

  const panels: PanelConfig[] = [
    {
      key: 'panel1',
      label: 'Panel 1',
      content: <div>Contenido 1</div>,
    },
    {
      key: 'panel2',
      label: 'Panel 2',
      content: <div>Contenido 2</div>,
    },
  ];

  it('renderiza botones para cada panel', () => {
    render(<PanelManager panels={panels} />);

    expect(screen.getByRole('button', { name: 'Panel 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Panel 2' })).toBeInTheDocument();
  });

  it('muestra solo el contenido del panel abierto', () => {
    render(<PanelManager panels={panels} />);
    expect(screen.queryByText('Contenido 1')).not.toBeInTheDocument(); // está cerrado
    expect(screen.getByText('Contenido 2')).toBeInTheDocument(); // está abierto
  });

  it('llama toggle con la clave correcta al hacer click en un botón', async () => {
    render(<PanelManager panels={panels} />);
    const btn1 = screen.getByRole('button', { name: 'Panel 1' });
    await userEvent.click(btn1);
    expect(toggleMock).toHaveBeenCalledWith('panel1');
  });

});
