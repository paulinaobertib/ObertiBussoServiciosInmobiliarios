/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserForm } from '../../../../components/users/panel/UserForm';
import { useAuthContext } from '../../../../context/AuthContext';
import { useGlobalAlert } from '../../../../../shared/context/AlertContext';
import { postUser, putUser, deleteUser } from '../../../../services/user.service';
import type { Role } from '../../../../types/user';

vi.mock('../../../../context/AuthContext', () => ({
  useAuthContext: vi.fn(),
}));

vi.mock('../../../../../shared/context/AlertContext', () => ({
  useGlobalAlert: vi.fn(),
}));

vi.mock('../../../../services/user.service', () => ({
  postUser: vi.fn(),
  putUser: vi.fn(),
  deleteUser: vi.fn(),
}));

describe('<UserForm />', () => {
  const showAlertMock = vi.fn();
  const onSuccessMock = vi.fn();
  const onCloseMock = vi.fn();

  const baseProps = {
    action: 'add' as const,
    onSuccess: onSuccessMock,
    onClose: onCloseMock,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useGlobalAlert as any).mockReturnValue({ showAlert: showAlertMock });
    (useAuthContext as any).mockReturnValue({ info: {} });
  });

  it('renderiza todos los campos del formulario', () => {
    render(<UserForm {...baseProps} />);
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Apellido/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Teléfono/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Crear usuario/i })).toBeInTheDocument();
  });

  it('crea usuario correctamente si los datos son válidos', async () => {
    (postUser as any).mockResolvedValue({
      id: 'u1',
      userName: 'usuario1',
      email: 'test@example.com',
      firstName: 'Nombre',
      lastName: 'Apellido',
      phone: '1234567890',
      roles: [] as Role[],
    });

    render(<UserForm {...baseProps} />);

    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'usuario1' } });
    fireEvent.change(screen.getByLabelText(/Correo electrónico/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Teléfono/i), { target: { value: '1234567890' } });

    fireEvent.click(screen.getByRole('button', { name: /Crear usuario/i }));

    await waitFor(() => {
      expect(postUser).toHaveBeenCalledWith(expect.objectContaining({
        userName: 'usuario1',
        email: 'test@example.com',
        phone: '1234567890',
      }));
      expect(showAlertMock).toHaveBeenCalledWith('Usuario creado con éxito', 'success');
      expect(onSuccessMock).toHaveBeenCalled();
      expect(onCloseMock).toHaveBeenCalled();
    });
  });

  it('edita usuario correctamente', async () => {
    (putUser as any).mockResolvedValue({});
    const itemEdit = {
      id: 'u1',
      userName: 'usuario1',
      email: 'test@example.com',
      firstName: '',
      lastName: '',
      phone: '',
      roles: [] as Role[],
    };

    render(<UserForm action="edit" item={itemEdit} onSuccess={onSuccessMock} onClose={onCloseMock} />);

    fireEvent.change(screen.getByLabelText(/Nombre/i), { target: { value: 'NuevoNombre' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

    await waitFor(() => {
      expect(putUser).toHaveBeenCalledWith(expect.objectContaining({ firstName: 'NuevoNombre' }));
      expect(showAlertMock).toHaveBeenCalledWith('Usuario actualizado con éxito', 'success');
    });
  });

  it('elimina usuario correctamente', async () => {
    (deleteUser as any).mockResolvedValue({});
    const itemDelete = {
      id: 'u1',
      userName: 'usuario1',
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      roles: [] as Role[],
    };

    render(<UserForm action="delete" item={itemDelete} onSuccess={onSuccessMock} onClose={onCloseMock} />);

    fireEvent.click(screen.getByRole('button', { name: /Eliminar usuario/i }));

    await waitFor(() => {
      expect(deleteUser).toHaveBeenCalledWith('u1');
      expect(showAlertMock).toHaveBeenCalledWith('Usuario eliminado con éxito', 'success');
    });
  });

  it('muestra alerta si hay error al crear usuario', async () => {
    (postUser as any).mockRejectedValue({ response: { data: 'Error de prueba' } });

    render(<UserForm {...baseProps} />);
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'usuario1' } });
    fireEvent.change(screen.getByLabelText(/Correo electrónico/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Teléfono/i), { target: { value: '1234567890' } });
    fireEvent.click(screen.getByRole('button', { name: /Crear usuario/i }));

    await waitFor(() => {
      expect(showAlertMock).toHaveBeenCalledWith('Error de prueba', 'error');
    });
  });

  // === NUEVOS TESTS PARA MAYOR COBERTURA ===

  it('deshabilita botón de crear si campos no son válidos', () => {
    render(<UserForm {...baseProps} />);
    const btn = screen.getByRole('button', { name: /Crear usuario/i });
    expect(btn).toBeDisabled();
  });

  it('habilita botón de crear si todos los campos son válidos', () => {
    render(<UserForm {...baseProps} />);
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'usuario1' } });
    fireEvent.change(screen.getByLabelText(/Correo electrónico/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Teléfono/i), { target: { value: '1234567890' } });

    const btn = screen.getByRole('button', { name: /Crear usuario/i });
    expect(btn).not.toBeDisabled();
  });
});
