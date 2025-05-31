import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBarOwner from '../../components/SearchBarOwners';
import { describe, it, vi, beforeEach, expect } from 'vitest';
import { getOwnersByText, getAllOwners } from '../../services/owner.service';
import { Owner } from '../../types/owner';

const mockOwner = (overrides: Partial<Owner> = {}): Owner => ({
  id: 1,
  firstName: 'Nombre',
  lastName: 'Apellido',
  mail: 'correo@ejemplo.com',
  phone: '123456789',
  ...overrides,
});

vi.mock('../../services/owner.service', async () => {
  const actual = await vi.importActual<typeof import('../../services/owner.service')>('../../services/owner.service');
  return {
    ...actual,
    getOwnersByText: vi.fn(),
    getAllOwners: vi.fn(),
  };
});

describe('SearchBarOwner', () => {
  const mockOnSearch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar el componente correctamente', () => {
    render(<SearchBarOwner onSearch={mockOnSearch} />);
    expect(screen.getByPlaceholderText('Buscar propietario…')).toBeInTheDocument();
  });

  it('debe llamar a getAllOwners si el input está vacío', async () => {
    vi.mocked(getAllOwners).mockResolvedValue([mockOwner({ id: 1, firstName: 'Juan' })]);

    render(<SearchBarOwner onSearch={mockOnSearch} debounceMs={1} />);

    await waitFor(() => expect(getAllOwners).toHaveBeenCalled());
    expect(mockOnSearch).toHaveBeenCalledWith([mockOwner({ id: 1, firstName: 'Juan' })]);
  });

  it('debe llamar a getOwnersByText si el input tiene texto', async () => {
    const owner = mockOwner({ id: 2, firstName: 'Ana' });
    vi.mocked(getOwnersByText).mockResolvedValue([owner]);

    render(<SearchBarOwner onSearch={mockOnSearch} debounceMs={1} />);

    const input = screen.getByPlaceholderText('Buscar propietario…');
    await userEvent.type(input, 'Ana');

    await waitFor(() => expect(getOwnersByText).toHaveBeenCalledWith('Ana'));
    expect(mockOnSearch).toHaveBeenCalledWith([owner]);
  });

  it('debe mostrar el spinner mientras carga', async () => {
    let resolve: (owners: Owner[]) => void;
    const ownersPromise = new Promise<Owner[]>(r => (resolve = r));
    vi.mocked(getOwnersByText).mockReturnValue(ownersPromise);

    render(<SearchBarOwner onSearch={mockOnSearch} debounceMs={1} />);

    const input = screen.getByPlaceholderText('Buscar propietario…');
    await userEvent.type(input, 'Pedro');

    expect(await screen.findByRole('progressbar')).toBeInTheDocument();

    const owner = mockOwner({ id: 3, firstName: 'Pedro' });
    resolve!([owner]);

    await waitFor(() => expect(mockOnSearch).toHaveBeenCalledWith([owner]));
  });
});
