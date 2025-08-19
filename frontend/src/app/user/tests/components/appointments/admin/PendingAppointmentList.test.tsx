/// <reference types="vitest" />
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PendingAppointmentsList } from '../../../../components/appointments/admin/PendingAppointmentList';
import type { Appointment, AvailableAppointment, AppointmentStatus } from '../../../../types/appointment';

// Mock AppointmentItem simple
vi.mock('../../../../components/appointments/admin/AppointmentItem', () => ({
  AppointmentItem: ({ slot, onClick }: any) => (
    <div data-testid={`appt-${slot.id}`} onClick={() => onClick(slot.id)}>
      {slot.date}
    </div>
  ),
}));

// Helper para crear Appointment completo, usando AppointmentStatus
const makeAppt = (slot: AvailableAppointment, status: AppointmentStatus): Appointment => ({
  id: slot.id,
  userId: "1",
  status, // tipo seguro
  availableAppointment: slot,
  appointmentDate: slot.date,
  // agrega aquí propiedades extra si tu tipo Appointment las requiere
});

describe('PendingAppointmentsList', () => {
  const baseSlots: Record<string, AvailableAppointment[]> = {
    '2025-08-19': [
      { id: 1, date: '2025-08-19T10:00:00', availability: false },
      { id: 2, date: '2025-08-19T11:00:00', availability: false },
    ],
    '2025-08-20': [{ id: 3, date: '2025-08-20T09:00:00', availability: false }],
  };

  const baseAppts: Record<number, Appointment> = {
    1: makeAppt(baseSlots['2025-08-19'][0], 'ESPERA'),
    2: makeAppt(baseSlots['2025-08-19'][1], 'ACEPTADO'),
    3: makeAppt(baseSlots['2025-08-20'][0], 'ESPERA'),
  };

  it('muestra mensaje de carga si loading=true', () => {
    render(
      <PendingAppointmentsList
        slotsByDate={{}}
        apptsBySlot={{}}
        loading={true}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByText(/Cargando turnos pendientes/i)).toBeInTheDocument();
  });

  it('muestra mensaje "No hay turnos pendientes" si no hay pendientes', () => {
    render(
      <PendingAppointmentsList
        slotsByDate={baseSlots}
        apptsBySlot={{}} // ningún appt en espera
        loading={false}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByText(/No hay turnos pendientes/i)).toBeInTheDocument();
  });

  it('renderiza AppointmentItem solo para turnos pendientes y llama onSelect al hacer click', () => {
    const onSelect = vi.fn();

    render(
      <PendingAppointmentsList
        slotsByDate={baseSlots}
        apptsBySlot={baseAppts}
        loading={false}
        onSelect={onSelect}
      />
    );

    // Solo los IDs 1 y 3 están en ESPERA
    expect(screen.getByTestId('appt-1')).toBeInTheDocument();
    expect(screen.queryByTestId('appt-2')).toBeNull();
    expect(screen.getByTestId('appt-3')).toBeInTheDocument();

    // Click en un slot
    fireEvent.click(screen.getByTestId('appt-1'));
    expect(onSelect).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByTestId('appt-3'));
    expect(onSelect).toHaveBeenCalledWith(3);
  });
});
