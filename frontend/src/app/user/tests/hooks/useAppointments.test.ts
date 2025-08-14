// src/app/appointment/__tests__/useAppointments.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { MockedFunction } from "vitest";
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { AxiosHeaders } from "axios";
import { renderHook, act, waitFor } from "@testing-library/react";
import dayjs from "dayjs";
import { useAppointments } from "../../hooks/useAppointments";
import type { AvailableAppointment, Appointment } from "../../types/appointment";

// ---------- Mocks ----------
vi.mock("../../services/appointment.service", () => ({
  getAllAvailabilities: vi.fn(),
  getAvailableAppointments: vi.fn(),
  getAppointmentsByStatus: vi.fn(),
  getAppointmentsByUser: vi.fn(),
  createAvailability: vi.fn(),
  createAppointment: vi.fn(),
  deleteAvailability: vi.fn(),
  deleteAppointment: vi.fn(),
  updateAppointmentStatus: vi.fn(),
}));

vi.mock("../../../user/context/AuthContext", () => ({
  useAuthContext: vi.fn(),
}));

// ---------- Imports de mocks ----------
import * as service from "../../services/appointment.service";
import { useAuthContext as _useAuthContext } from "../../../user/context/AuthContext"; 

const getAllAvailabilities = service.getAllAvailabilities as MockedFunction<typeof service.getAllAvailabilities>;
const getAvailableAppointments = service.getAvailableAppointments as MockedFunction<typeof service.getAvailableAppointments>;
const getAppointmentsByStatus = service.getAppointmentsByStatus as MockedFunction<typeof service.getAppointmentsByStatus>;
const getAppointmentsByUser = service.getAppointmentsByUser as MockedFunction<typeof service.getAppointmentsByUser>;
//const createAvailability = service.createAvailability as MockedFunction<typeof service.createAvailability>;
const createAppointment = service.createAppointment as MockedFunction<typeof service.createAppointment>;
//const deleteAvailability = service.deleteAvailability as MockedFunction<typeof service.deleteAvailability>;
const deleteAppointment = service.deleteAppointment as MockedFunction<typeof service.deleteAppointment>;
//const updateAppointmentStatus = service.updateAppointmentStatus as MockedFunction<typeof service.updateAppointmentStatus>;

const useAuthContext = _useAuthContext as MockedFunction<typeof _useAuthContext>;

// ---------- Helper AxiosResponse válido ----------
function axiosResponse<T>(data: T, init?: Partial<AxiosResponse<T>>): AxiosResponse<T> {
  const config = {
    url: "/",
    method: "get",
    headers: new AxiosHeaders(),
  } as unknown as InternalAxiosRequestConfig<any>;
  return {
    data,
    status: 200,
    statusText: "OK",
    headers: new AxiosHeaders(),
    config,
    ...init,
  };
}

// ---------- Fechas para los tests ----------
const today = dayjs().startOf("day");
const d0 = today.hour(10).toISOString();
const d1 = today.add(1, "day").hour(11).toISOString();
const d2 = today.add(2, "day").hour(12).toISOString();
//const past = today.subtract(1, "day").hour(9).toISOString();

describe("useAppointments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthContext.mockReturnValue({ info: { id: 1 }, isAdmin: true } as any);
  });

  it("DISPONIBLE: usa getAvailableAppointments y limpia apptsBySlot", async () => {
    getAllAvailabilities.mockResolvedValueOnce(
      axiosResponse<AvailableAppointment[]>([])
    );
    getAppointmentsByStatus.mockResolvedValue(
      axiosResponse<Appointment[]>([])
    );

    const available: AvailableAppointment[] = [
      { id: 10, date: d1, availability: true },
      { id: 11, date: d2, availability: true },
    ];
    getAvailableAppointments.mockResolvedValueOnce(
      axiosResponse(available)
    );

    const { result } = renderHook(() => useAppointments());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      result.current.setFilter("DISPONIBLE");
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(getAvailableAppointments).toHaveBeenCalledTimes(1);
    expect(Object.keys(result.current.apptsBySlot)).toHaveLength(0);
    const keys = Object.keys(result.current.slotsByDate);
    expect(keys).toContain(d1.slice(0, 10));
    expect(keys).toContain(d2.slice(0, 10));
  });

  // ---------------- Admin: ESPERA ----------------
  it("ESPERA: mapea pseudo slots y llena apptsBySlot", async () => {
    const list: Appointment[] = [
      {
        id: 200,
        status: "ESPERA",
        appointmentDate: d1,
        availableAppointment: { id: 77 },
        userId: 1,
      } as any,
    ];
    getAppointmentsByStatus.mockImplementation(async (s) =>
      s === "ESPERA" ? axiosResponse(list) : axiosResponse<Appointment[]>([])
    );
    getAllAvailabilities.mockResolvedValueOnce(
      axiosResponse<AvailableAppointment[]>([])
    );

    const { result } = renderHook(() => useAppointments());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      result.current.setFilter("ESPERA");
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.apptsBySlot[77]?.status).toBe("ESPERA");
    expect(Object.keys(result.current.slotsByDate)).toContain(d1.slice(0, 10));
  });

  // ---------------- User ----------------
  it("loadUser obtiene turnos del usuario y arma slotMap", async () => {
    useAuthContext.mockReturnValue({ info: { id: 42 }, isAdmin: true } as any);

    getAllAvailabilities.mockResolvedValue(
      axiosResponse<AvailableAppointment[]>([
        { id: 2, date: d1, availability: true },
        { id: 3, date: d2, availability: true },
      ])
    );
    getAppointmentsByStatus.mockResolvedValue(
      axiosResponse<Appointment[]>([])
    );
    getAppointmentsByUser.mockResolvedValue(
      axiosResponse<Appointment[]>([
        {
          id: 900,
          status: "ESPERA",
          appointmentDate: d1,
          availableAppointment: { id: 2 },
          userId: 42,
        } as any,
      ])
    );

    const { result } = renderHook(() => useAppointments());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await waitFor(() => expect(result.current.userLoading).toBe(false));

    expect(result.current.userAppointments).toHaveLength(1);
    expect(result.current.slotMap[2].date).toBe(d1);
    expect(result.current.slotMap[3].date).toBe(d2);
  });

  it("cancelAppointment → deleteAppointment y recarga loadUser", async () => {
    useAuthContext.mockReturnValue({ info: { id: 33 }, isAdmin: true } as any);

    getAllAvailabilities.mockResolvedValue(
      axiosResponse<AvailableAppointment[]>([])
    );
    getAppointmentsByStatus.mockResolvedValue(
      axiosResponse<Appointment[]>([])
    );
    getAppointmentsByUser.mockResolvedValue(
      axiosResponse<Appointment[]>([])
    );
    deleteAppointment.mockResolvedValue(axiosResponse({}));

    const { result } = renderHook(() => useAppointments());
    await waitFor(() => expect(result.current.userLoading).toBe(false));

    await act(async () => {
      await result.current.cancelAppointment(777);
    });

    expect(deleteAppointment).toHaveBeenCalledWith(777);
    expect(getAppointmentsByUser).toHaveBeenCalledTimes(2);
  });

  // ---------------- Booking ----------------
  it("loadBookingSlots filtra por bookingDate", async () => {
    getAllAvailabilities.mockResolvedValue(
      axiosResponse<AvailableAppointment[]>([
        { id: 1, date: d0, availability: true },
        { id: 2, date: d1, availability: true },
        { id: 3, date: d2, availability: true },
      ])
    );
    getAppointmentsByStatus.mockResolvedValue(
      axiosResponse<Appointment[]>([])
    );
    getAppointmentsByUser.mockResolvedValue(
      axiosResponse<Appointment[]>([])
    );

    const { result } = renderHook(() => useAppointments());
    await waitFor(() => expect(result.current.bookingLoading).toBe(false));

    const todayIds = result.current.bookingSlots.map((s) => s.id);
    expect(todayIds).toContain(1);
    expect(todayIds).not.toContain(2);

    await act(async () => {
      result.current.setBookingDate(dayjs(d1));
    });
    await waitFor(() => expect(result.current.bookingLoading).toBe(false));

    const tomorrowIds = result.current.bookingSlots.map((s) => s.id);
    expect(tomorrowIds).toContain(2);
    expect(tomorrowIds).not.toContain(1);
  });

  it("submitBooking crea turno y setea submitted", async () => {
    useAuthContext.mockReturnValue({ info: { id: 7 }, isAdmin: true } as any);

    getAllAvailabilities.mockResolvedValue(
      axiosResponse<AvailableAppointment[]>([])
    );
    getAppointmentsByStatus.mockResolvedValue(
      axiosResponse<Appointment[]>([])
    );
    getAppointmentsByUser.mockResolvedValue(
      axiosResponse<Appointment[]>([])
    );
    createAppointment.mockResolvedValue(axiosResponse({}));

    const { result } = renderHook(() => useAppointments());
    await waitFor(() => expect(result.current.bookingLoading).toBe(false));

    await act(async () => {
      result.current.setBookingSlotId(999);
      result.current.setBookingNotes("necesito este horario");
    });
    await act(async () => {
      await result.current.submitBooking();
    });

    expect(createAppointment).toHaveBeenCalled();
    expect(result.current.bookingSubmitted).toBe(true);
    expect(result.current.bookingError).toBeNull();
  });

  it("submitBooking maneja error y setea bookingError", async () => {
    useAuthContext.mockReturnValue({ info: { id: 7 }, isAdmin: true } as any);

    getAllAvailabilities.mockResolvedValue(
      axiosResponse<AvailableAppointment[]>([])
    );
    getAppointmentsByStatus.mockResolvedValue(
      axiosResponse<Appointment[]>([])
    );
    getAppointmentsByUser.mockResolvedValue(
      axiosResponse<Appointment[]>([])
    );
    createAppointment.mockRejectedValue({ response: { data: "No hay cupo" } });

    const { result } = renderHook(() => useAppointments());
    await waitFor(() => expect(result.current.bookingLoading).toBe(false));

    await act(async () => {
      result.current.setBookingSlotId(1000);
    });
    await act(async () => {
      await result.current.submitBooking();
    });

    expect(result.current.bookingSubmitted).toBe(false);
    expect(result.current.bookingError).toBe("No hay cupo");
  });
});
