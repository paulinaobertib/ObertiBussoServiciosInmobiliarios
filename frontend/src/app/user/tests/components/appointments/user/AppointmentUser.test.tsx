/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppointmentUser } from '../../../../components/appointments/user/AppointmentUser';
import { useAppointments } from '../../../../hooks/useAppointments';

vi.mock('../../../../hooks/useAppointments');
vi.mock('../../../../components/appointments/user/AppointmentCard', () => ({
  AppointmentCard: ({ appointment, slot, onCancel }: any) => (
    <div data-testid={`appt-${appointment.id}`}>
      <span>{slot.date}</span>
      <button onClick={() => onCancel?.(appointment.id)}>Cancelar</button>
    </div>
  ),
}));

describe('AppointmentUser', () => {
  const cancelAppointment = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra mensaje de carga si userLoading=true', () => {
    (useAppointments as any).mockReturnValue({
      userLoading: true,
      userAppointments: [],
      slotMap: {},
      cancelAppointment,
    });

    render(<AppointmentUser />);
    expect(screen.getByText(/Cargando…/i)).toBeInTheDocument();
  });

  it('muestra mensaje si no hay turnos', () => {
    (useAppointments as any).mockReturnValue({
      userLoading: false,
      userAppointments: [],
      slotMap: {},
      cancelAppointment,
    });

    render(<AppointmentUser />);
    expect(screen.getByText(/Aún no tienes turnos/i)).toBeInTheDocument();
  });

  it('renderiza AppointmentCard para cada turno pendiente', () => {
    const slots = {
      1: { id: 1, date: '2025-08-19T10:00:00' },
      2: { id: 2, date: '2025-08-19T11:00:00' },
    };
    const appointments = [
      { id: 1, availableAppointment: { id: 1 } },
      { id: 2, availableAppointment: { id: 2 } },
    ];

    (useAppointments as any).mockReturnValue({
      userLoading: false,
      userAppointments: appointments,
      slotMap: slots,
      cancelAppointment,
    });

    render(<AppointmentUser />);

    expect(screen.getByTestId('appt-1')).toBeInTheDocument();
    expect(screen.getByTestId('appt-2')).toBeInTheDocument();
  });

  it('llama cancelAppointment al hacer click en el botón', () => {
    const slots = { 1: { id: 1, date: '2025-08-19T10:00:00' } };
    const appointments = [{ id: 1, availableAppointment: { id: 1 } }];

    (useAppointments as any).mockReturnValue({
      userLoading: false,
      userAppointments: appointments,
      slotMap: slots,
      cancelAppointment,
    });

    render(<AppointmentUser />);
    fireEvent.click(screen.getByText('Cancelar'));
    expect(cancelAppointment).toHaveBeenCalledWith(1);
  });
});
