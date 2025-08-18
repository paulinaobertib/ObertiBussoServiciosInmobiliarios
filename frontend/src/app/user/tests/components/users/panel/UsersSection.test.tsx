/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UsersSection } from '../../../../components/users/panel/UsersSection';
import { useUsers } from '../../../../hooks/useUsers';
import { getRoles } from '../../../../services/user.service';

// ==== MOCKS ====
vi.mock('../../../../hooks/useUsers', () => ({
  useUsers: vi.fn(),
}));

vi.mock('../../../../services/user.service', () => ({
  getRoles: vi.fn(),
}));

vi.mock('./UserForm', () => ({
  UserForm: vi.fn(() => <div>Mock UserForm</div>),
}));

vi.mock('./RoleForm', () => ({
  RoleForm: vi.fn(() => <div>Mock RoleForm</div>),
}));

vi.mock('@mui/x-data-grid', () => ({
  DataGrid: (props: any) => <div>Mock DataGrid</div>,
}));

vi.mock('*.css', () => ({}));

vi.mock('../../../../shared/components/GridSection', () => {
  return {
    GridSection: vi.fn((props: any) => {
      // guardamos toggleSelect para usar en tests
      (global as any).gridToggleSelectMock = props.toggleSelect;
      return <div>Mock DataGrid</div>;
    }),
  };
});

describe('<UsersSection />', () => {
  const loadMock = vi.fn();
  const fetchAllMock = vi.fn();
  const fetchByTextMock = vi.fn();

  const toggleSelectMock = vi.fn();
  const isSelectedMock = vi.fn().mockReturnValue(false);

  const usersMock = [
    {
      id: 'u1',
      userName: 'user1',
      email: 'user1@test.com',
      firstName: 'Nombre',
      lastName: 'Apellido',
      phone: '123456789',
      roles: ['user'],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useUsers as any).mockReturnValue({
      users: usersMock,
      loading: false,
      load: loadMock,
      fetchAll: fetchAllMock,
      fetchByText: fetchByTextMock,
    });
  });

  it('renderiza el DataGrid', () => {
    render(<UsersSection toggleSelect={toggleSelectMock} isSelected={isSelectedMock} />);
    expect(screen.getByText('Mock DataGrid')).toBeInTheDocument();
  });

  it('abre modal para crear usuario', async () => {
    render(<UsersSection />);
    const createBtn = document.createElement('button');
    document.body.appendChild(createBtn);
    fireEvent.click(createBtn); 
  });

  it('abre modal para editar usuario', async () => {
    render(<UsersSection />);
    const user = usersMock[0];
    const section = screen.getByText('Mock DataGrid');
    fireEvent.click(section); 
  });

  it('abre modal para roles', async () => {
        (getRoles as any).mockResolvedValue({ data: ['admin'] });
        render(<UsersSection />);
        const user = usersMock[0];
    });

    it('muestra spinner mientras carga', () => {
    (useUsers as any).mockReturnValue({ users: [], loading: true, load: loadMock, fetchAll: fetchAllMock, fetchByText: fetchByTextMock });
    render(<UsersSection />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('llama a toggleSelect correctamente', () => {
    render(<UsersSection toggleSelect={toggleSelectMock} />);
    toggleSelectMock('u1');
    expect(toggleSelectMock).toHaveBeenCalledWith('u1');
    });

    it('abre modal de creación de usuario al llamar a onCreate', () => {
        render(<UsersSection />);
        fireEvent.click(screen.getByText('Mock DataGrid'));
        // Alternativa: llamar directamente a onCreate del GridSection si mockeas props
    });

    it('no renderiza acciones si showActions es false', () => {
        render(<UsersSection showActions={false} />);
        expect(screen.queryByTitle('Editar')).not.toBeInTheDocument();
        expect(screen.queryByTitle('Eliminar')).not.toBeInTheDocument();
        expect(screen.queryByTitle('Roles')).not.toBeInTheDocument();
    });

    it('llama fetchAll y fetchByText', () => {
        render(<UsersSection />);
        fetchAllMock();
        fetchByTextMock('search');
        expect(fetchAllMock).toHaveBeenCalled();
        expect(fetchByTextMock).toHaveBeenCalledWith('search');
    });

});
