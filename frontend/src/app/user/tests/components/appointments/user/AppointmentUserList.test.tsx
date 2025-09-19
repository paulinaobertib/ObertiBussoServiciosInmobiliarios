/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppointmentUserList } from '../../../../components/appointments/user/AppointmentUserList';
import type { Appointment, AvailableAppointment } from '../../../../types/appointment';

vi.mock('../../../../components/appointments/user/AppointmentUserItem', () => ({
  AppointmentUserItem: ({ appointment }: any) => (
    <div data-testid={`appt-${appointment.id}`}>{appointment.id}</div>
  ),
}));

describe('AppointmentUserList', () => {
  let appointments: Appointment[];
  let slotMap: Record<number, AvailableAppointment>;
  const onCancel = vi.fn();
  const reload = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    const today = new Date();
    const futureDate = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(); // mañana
    const pastDate = new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString(); // ayer

    const futureSlot: AvailableAppointment = { id: 1, date: futureDate, availability: true } as AvailableAppointment;
    const pastSlot: AvailableAppointment = { id: 2, date: pastDate, availability: true } as AvailableAppointment;

    appointments = [
      { id: 1, userId: '10', status: 'ESPERA', availableAppointment: futureSlot, appointmentDate: futureDate } as Appointment,
      { id: 2, userId: '11', status: 'ACEPTADO', availableAppointment: pastSlot, appointmentDate: pastDate } as Appointment,
    ];

    slotMap = {
      1: futureSlot,
      2: pastSlot,
    };
  });

  it('muestra mensaje si no hay turnos futuros', () => {
    render(
      <AppointmentUserList
        appointments={[]}
        slotMap={{}}
        onCancel={onCancel}
        reload={reload}
      />
    );
    expect(screen.getByText(/No hay turnos disponibles/i)).toBeInTheDocument();
  });

  it('renderiza solo los turnos futuros', () => {
    render(
      <AppointmentUserList
        appointments={appointments}
        slotMap={slotMap}
        onCancel={onCancel}
        reload={reload}
      />
    );

    expect(screen.getByTestId('appt-1')).toBeInTheDocument();
    expect(screen.queryByTestId('appt-2')).toBeNull(); 
  });
});
