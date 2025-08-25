/// <reference types="vitest" />
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { AppointmentCard } from '../../../../components/appointments/user/AppointmentCard';
import type { Appointment, AvailableAppointment } from '../../../../types/appointment';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

describe('AppointmentCard', () => {
  const slot: AvailableAppointment = {
    id: 1,
    date: '2025-08-19T10:00:00',
    availability: false,
  };

  const baseAppointment: Appointment = {
    id: 42,
    userId: "1",
    status: 'ESPERA',
    availableAppointment: slot,
    appointmentDate: slot.date,
    comment: 'Comentario de prueba',
  };

  const renderCard = (props?: Partial<React.ComponentProps<typeof AppointmentCard>>) =>
    render(
      <ThemeProvider theme={theme}>
        <AppointmentCard
          appointment={baseAppointment}
          slot={slot}
          {...props}
        />
      </ThemeProvider>
    );

  it('muestra la información básica correctamente', () => {
    renderCard();

    expect(screen.getByText(/Turno #42/i)).toBeInTheDocument();
    expect(screen.getByText(/Día: 19\/08\/2025/i)).toBeInTheDocument();
    expect(screen.getByText(/Hora: 10:00/i)).toBeInTheDocument();
    expect(screen.getByText(/Comentario de prueba/i)).toBeInTheDocument();
    expect(screen.getByText(/ESPERA/i)).toBeInTheDocument();
  });

  it('llama a onSelect cuando se hace click en la tarjeta', () => {
    const onSelect = vi.fn();
    renderCard({ onSelect });

    fireEvent.click(screen.getByText(/Turno #42/i));
    expect(onSelect).toHaveBeenCalledWith(baseAppointment);
  });

  it('muestra el botón Cancelar para estado ESPERA y llama a onCancel', async () => {
    const onCancel = vi.fn().mockResolvedValue({});
    renderCard({ onCancel });

    const btn = screen.getByRole('button', { name: /Cancelar turno/i });
    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);

    await waitFor(() => expect(onCancel).toHaveBeenCalledWith(42));
  });

  it('no muestra el botón Cancelar si el estado es distinto de ESPERA o ACEPTADO', () => {
    renderCard({
      appointment: { ...baseAppointment, status: 'RECHAZADO' },
    });

    expect(screen.queryByRole('button', { name: /Cancelar turno/i })).toBeNull();
  });

  it('no falla si no se provee onCancel', async () => {
    renderCard();

    const btn = screen.getByRole('button', { name: /Cancelar turno/i });
    fireEvent.click(btn);

    // simplemente no debe lanzar error
    await waitFor(() => expect(true).toBe(true));
  });
});
