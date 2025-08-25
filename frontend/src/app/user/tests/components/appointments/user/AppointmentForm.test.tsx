/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppointmentForm } from '../../../../components/appointments/user/AppointmentForm';
import { useAppointments } from '../../../../hooks/useAppointments';
import { useAuthContext } from '../../../../context/AuthContext';
import { useGlobalAlert } from '../../../../../shared/context/AlertContext';

vi.mock('../../../../components/Calendar', () => ({
  Calendar: ({ onSelectDate }: any) => (
    <div data-testid="calendar">
      <button onClick={() => onSelectDate('2025-08-20')}>Select Date</button>
    </div>
  ),
}));

vi.mock('../../../../hooks/useAppointments');
vi.mock('../../../../context/AuthContext');
vi.mock('../../../../../shared/context/AlertContext');

describe('AppointmentForm', () => {
  const showAlert = vi.fn();
  const submitBooking = vi.fn();
  const setBookingSlotId = vi.fn();
  const setBookingNotes = vi.fn();
  const setBookingDate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useAuthContext as any).mockReturnValue({ info: { id: 1, name: 'Test' } });
    (useGlobalAlert as any).mockReturnValue({ showAlert });
    (useAppointments as any).mockReturnValue({
      bookingDate: '2025-08-19',
      setBookingDate,
      bookingSlots: [{ id: 1, date: '2025-08-19T10:00:00', availability: true }],
      bookingSlotId: 1, // ⚠ ahora el botón está habilitado
      setBookingSlotId,
      bookingNotes: '',
      setBookingNotes,
      bookingLoading: false,
      bookingError: '',
      bookingSubmitted: false,
      submitBooking,
    });
  });

  it('llama submitBooking al enviar con info', () => {
    render(<AppointmentForm />);

    const button = screen.getByRole('button', { name: /Solicitar turno/i });
    fireEvent.click(button);

    expect(submitBooking).toHaveBeenCalled();
  });

  it('llama showAlert si se envía sin info', () => {
    (useAuthContext as any).mockReturnValue({ info: null });

    render(<AppointmentForm />);
    const button = screen.getByRole('button', { name: /Solicitar turno/i });
    fireEvent.click(button);

    expect(showAlert).toHaveBeenCalledWith(
      'Debes iniciar sesión para solicitar un turno',
      'warning'
    );
  });

    it('deshabilita botón si no hay slot seleccionado o está cargando', () => {
    (useAppointments as any).mockReturnValue({
      bookingDate: '2025-08-19',
      setBookingDate: vi.fn(),
      bookingSlots: [],
      bookingSlotId: null,
      setBookingSlotId: vi.fn(),
      bookingNotes: '',
      setBookingNotes: vi.fn(),
      bookingLoading: true,
      bookingError: '',
      bookingSubmitted: false,
      submitBooking,
    });

    render(<AppointmentForm />);
    expect(screen.getByRole('button', { name: /Enviando…/i })).toBeDisabled();
  });

    it('permite seleccionar un slot y actualizar comentarios', () => {
    const setBookingSlotId = vi.fn();
    const setBookingNotes = vi.fn();

    (useAppointments as any).mockReturnValue({
      bookingDate: '2025-08-19',
      setBookingDate: vi.fn(),
      bookingSlots: [{ id: 1, date: '2025-08-19T10:00:00', availability: true }],
      bookingSlotId: null,
      setBookingSlotId,
      bookingNotes: '',
      setBookingNotes,
      bookingLoading: false,
      bookingError: '',
      bookingSubmitted: false,
      submitBooking,
    });

    render(<AppointmentForm />);

    fireEvent.click(screen.getByText('10:00'));
    expect(setBookingSlotId).toHaveBeenCalledWith(1);

    fireEvent.change(screen.getByLabelText(/Comentarios adicionales/i), {
      target: { value: 'Test note' },
    });
    expect(setBookingNotes).toHaveBeenCalledWith('Test note');
  });

  it('muestra mensaje de éxito si bookingSubmitted=true', () => {
    (useAppointments as any).mockReturnValue({
      bookingSubmitted: true,
    });

    render(<AppointmentForm />);

    expect(screen.getByText(/¡Turno solicitado con éxito!/i)).toBeInTheDocument();
    expect(screen.getByText(/Te avisaremos cuando sea aceptado/i)).toBeInTheDocument();
  });
});
