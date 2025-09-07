import { describe, it, expect, vi, beforeEach } from "vitest";
import type { MockedFunction } from "vitest";
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { AxiosHeaders } from "axios";
import { renderHook, act, waitFor } from "@testing-library/react";
import dayjs from "dayjs";
import { useAppointments } from "../../hooks/useAppointments";
import type { AvailableAppointment, Appointment } from "../../types/appointment";

/* =================== Mocks =================== */
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

const handleErrorMock = vi.fn(() => "boom");
vi.mock("../../../shared/hooks/useErrors", () => ({
  useApiErrors: () => ({ handleError: handleErrorMock }),
}));

import * as service from "../../services/appointment.service";
import { useAuthContext as _useAuthContext } from "../../../user/context/AuthContext";

const getAllAvailabilities = service.getAllAvailabilities as MockedFunction<
  typeof service.getAllAvailabilities
>;
const getAvailableAppointments = service.getAvailableAppointments as MockedFunction<
  typeof service.getAvailableAppointments
>;
const getAppointmentsByStatus = service.getAppointmentsByStatus as MockedFunction<
  typeof service.getAppointmentsByStatus
>;
const getAppointmentsByUser = service.getAppointmentsByUser as MockedFunction<
  typeof service.getAppointmentsByUser
>;
const createAvailability = service.createAvailability as MockedFunction<
  typeof service.createAvailability
>;
const createAppointment = service.createAppointment as MockedFunction<
  typeof service.createAppointment
>;
const deleteAvailability = service.deleteAvailability as MockedFunction<
  typeof service.deleteAvailability
>;
const deleteAppointment = service.deleteAppointment as MockedFunction<
  typeof service.deleteAppointment
>;
const updateAppointmentStatus = service.updateAppointmentStatus as MockedFunction<
  typeof service.updateAppointmentStatus
>;

const useAuthContext = _useAuthContext as MockedFunction<typeof _useAuthContext>;

function axiosResponse<T>(
  data: T,
  init?: Partial<AxiosResponse<T>>
): AxiosResponse<T> {
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

/* Fechas sin zona horaria para evitar falsos negativos */
const today = dayjs().startOf("day");
const d0 = today.hour(10).format("YYYY-MM-DDTHH:mm:ss");
const d1 = today.add(1, "day").hour(11).format("YYYY-MM-DDTHH:mm:ss");
const d2 = today.add(2, "day").hour(12).format("YYYY-MM-DDTHH:mm:ss");

describe("useAppointments (nuevo hook)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    handleErrorMock.mockClear();

    // Auth por defecto
    useAuthContext.mockReturnValue({ info: { id: 1 }, isAdmin: true } as any);

    // Defaults (no "once" para poder sobreescribir por test)
    getAllAvailabilities.mockResolvedValue(
      axiosResponse<AvailableAppointment[]>([])
    );
    getAppointmentsByStatus.mockResolvedValue(
      axiosResponse<Appointment[]>([])
    );
    getAppointmentsByUser.mockResolvedValue(
      axiosResponse<Appointment[]>([])
    );
    getAvailableAppointments.mockResolvedValue(
      axiosResponse<AvailableAppointment[]>([])
    );
    createAppointment.mockResolvedValue(axiosResponse({}));
    deleteAppointment.mockResolvedValue(axiosResponse({}));
    deleteAvailability.mockResolvedValue(axiosResponse({}));
    updateAppointmentStatus.mockResolvedValue(axiosResponse({}));
    createAvailability.mockResolvedValue(axiosResponse({}));
  });

  it("TODOS (por defecto): arma slotsByDate y apptsBySlot a partir de all + (ESPERA|ACEPTADO)", async () => {
    // Configuramos los retornos usados en el montaje
    const all = [
      { id: 1, date: d0, availability: true },
      { id: 2, date: d1, availability: true },
    ] as AvailableAppointment[];
    const espera = [
      { id: 100, status: "ESPERA", appointmentDate: d1, availableAppointment: { id: 2 } },
    ] as any[];
    const aceptado = [
      { id: 101, status: "ACEPTADO", appointmentDate: d0, availableAppointment: { id: 1 } },
    ] as any[];

    getAllAvailabilities.mockResolvedValueOnce(axiosResponse(all));
    getAppointmentsByStatus.mockReset();
    getAppointmentsByStatus
      .mockResolvedValueOnce(axiosResponse(espera))   // primera llamada (ESPERA)
      .mockResolvedValueOnce(axiosResponse(aceptado)); // segunda llamada (ACEPTADO)

    const { result } = renderHook(() => useAppointments());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const keys = Object.keys(result.current.slotsByDate);
    expect(keys).toEqual(expect.arrayContaining([d0.slice(0, 10), d1.slice(0, 10)]));
    expect(Object.keys(result.current.apptsBySlot).map(Number).sort((a,b)=>a-b)).toEqual([1, 2]);
  });

  it("DISPONIBLE: usa getAvailableAppointments, actualiza slots y limpia apptsBySlot", async () => {
    getAllAvailabilities.mockResolvedValueOnce(axiosResponse<AvailableAppointment[]>([]));
    getAppointmentsByStatus.mockReset();
    getAppointmentsByStatus
      .mockResolvedValueOnce(axiosResponse<Appointment[]>([]))
      .mockResolvedValueOnce(axiosResponse<Appointment[]>([]));

    const available: AvailableAppointment[] = [
      { id: 10, date: d1, availability: true },
      { id: 11, date: d2, availability: true },
    ];
    getAvailableAppointments.mockResolvedValueOnce(axiosResponse(available));

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

  it("ESPERA: crea pseudo-slots y llena apptsBySlot (clave availableAppointment.id)", async () => {
    const list: Appointment[] = [
      {
        id: 200,
        status: "ESPERA",
        appointmentDate: d1,
        availableAppointment: { id: 77 },
        userId: 1,
      } as any,
      {
        id: 201,
        status: "ESPERA",
        appointmentDate: d2,
        availableAppointment: null as any,
        userId: 1,
      } as any,
    ];

    getAllAvailabilities.mockResolvedValueOnce(axiosResponse<AvailableAppointment[]>([]));
    getAppointmentsByStatus.mockReset();
    getAppointmentsByStatus
      .mockResolvedValueOnce(axiosResponse<Appointment[]>([])) // ESPERA (fase TODOS)
      .mockResolvedValueOnce(axiosResponse<Appointment[]>([])) // ACEPTADO (fase TODOS)
      .mockResolvedValueOnce(axiosResponse(list));             // ESPERA (al cambiar filtro)

    const { result } = renderHook(() => useAppointments());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      result.current.setFilter("ESPERA");
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    const keys = Object.keys(result.current.apptsBySlot).map(Number).sort((a,b)=>a-b);
    expect(keys).toEqual([77, 201]);
    expect(result.current.slotsByDate[d1.slice(0, 10)]?.some(s => s.id === 77)).toBe(true);
    expect(result.current.slotsByDate[d2.slice(0, 10)]?.some(s => s.id === 201)).toBe(true);
  });

  it("acceptAppointment / rejectAppointment invocan updateAppointmentStatus y recargan admin", async () => {
    // Montaje baseline
    getAllAvailabilities.mockResolvedValueOnce(axiosResponse<AvailableAppointment[]>([]));
    getAppointmentsByStatus.mockReset();
    getAppointmentsByStatus
      .mockResolvedValueOnce(axiosResponse<Appointment[]>([]))
      .mockResolvedValueOnce(axiosResponse<Appointment[]>([]));

    const { result } = renderHook(() => useAppointments());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const ap: Appointment = { id: 333, status: "ESPERA", appointmentDate: d0 } as any;
    const beforeCalls = getAllAvailabilities.mock.calls.length;

    await act(async () => {
      await result.current.acceptAppointment(ap);
    });
    expect(updateAppointmentStatus).toHaveBeenCalledWith(333, "ACEPTADO");
    await waitFor(() =>
      expect(getAllAvailabilities.mock.calls.length).toBeGreaterThan(beforeCalls)
    );

    updateAppointmentStatus.mockRejectedValueOnce(new Error("oops"));
    await act(async () => {
      await result.current.rejectAppointment(ap);
    });
    expect(updateAppointmentStatus).toHaveBeenCalledWith(333, "RECHAZADO");
    expect(handleErrorMock).toHaveBeenCalled();
  });

  it("removeAvailableSlot elimina y recarga admin", async () => {
    getAllAvailabilities.mockResolvedValueOnce(axiosResponse<AvailableAppointment[]>([]));
    getAppointmentsByStatus.mockReset();
    getAppointmentsByStatus
      .mockResolvedValueOnce(axiosResponse<Appointment[]>([]))
      .mockResolvedValueOnce(axiosResponse<Appointment[]>([]));

    const { result } = renderHook(() => useAppointments());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const before = getAllAvailabilities.mock.calls.length;
    await act(async () => {
      await result.current.removeAvailableSlot(55);
    });

    expect(deleteAvailability).toHaveBeenCalledWith(55);
    await waitFor(() =>
      expect(getAllAvailabilities.mock.calls.length).toBeGreaterThan(before)
    );
  });

  /* ---------------- User ---------------- */
  it("loadUser obtiene turnos del usuario y arma slotMap", async () => {
    useAuthContext.mockReturnValue({ info: { id: 42 }, isAdmin: true } as any);

    getAllAvailabilities.mockResolvedValue(
      axiosResponse<AvailableAppointment[]>([
        { id: 2, date: d1, availability: true },
        { id: 3, date: d2, availability: true },
      ])
    );
    getAppointmentsByStatus.mockReset();
    getAppointmentsByStatus
      .mockResolvedValueOnce(axiosResponse<Appointment[]>([]))
      .mockResolvedValueOnce(axiosResponse<Appointment[]>([]));
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

    getAllAvailabilities.mockResolvedValue(axiosResponse<AvailableAppointment[]>([]));
    getAppointmentsByStatus.mockReset();
    getAppointmentsByStatus
      .mockResolvedValueOnce(axiosResponse<Appointment[]>([]))
      .mockResolvedValueOnce(axiosResponse<Appointment[]>([]));
    getAppointmentsByUser
      .mockResolvedValueOnce(axiosResponse<Appointment[]>([]))
      .mockResolvedValueOnce(axiosResponse<Appointment[]>([])); // tras recarga

    const { result } = renderHook(() => useAppointments());
    await waitFor(() => expect(result.current.userLoading).toBe(false));

    await act(async () => {
      await result.current.cancelAppointment(777);
    });

    expect(deleteAppointment).toHaveBeenCalledWith(777);
    expect(getAppointmentsByUser).toHaveBeenCalledTimes(2);
  });

  /* ---------------- Booking ---------------- */
  it("loadBookingSlots filtra por bookingDate", async () => {
    getAllAvailabilities.mockResolvedValue(
      axiosResponse<AvailableAppointment[]>([
        { id: 1, date: d0, availability: true },
        { id: 2, date: d1, availability: true },
        { id: 3, date: d2, availability: true },
      ])
    );
    getAppointmentsByStatus.mockReset();
    getAppointmentsByStatus
      .mockResolvedValueOnce(axiosResponse<Appointment[]>([]))
      .mockResolvedValueOnce(axiosResponse<Appointment[]>([]));
    getAppointmentsByUser.mockResolvedValue(axiosResponse<Appointment[]>([]));

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

  it("submitBooking crea turno y setea bookingSubmitted", async () => {
    useAuthContext.mockReturnValue({ info: { id: 7 }, isAdmin: true } as any);

    getAllAvailabilities.mockResolvedValue(axiosResponse<AvailableAppointment[]>([]));
    getAppointmentsByStatus.mockReset();
    getAppointmentsByStatus
      .mockResolvedValueOnce(axiosResponse<Appointment[]>([]))
      .mockResolvedValueOnce(axiosResponse<Appointment[]>([]));
    getAppointmentsByUser.mockResolvedValue(axiosResponse<Appointment[]>([]));
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

    expect(createAppointment).toHaveBeenCalledWith({
      userId: 7,
      comment: "necesito este horario",
      status: "ESPERA",
      availableAppointment: { id: 999 },
      appointmentDate: "",
    });
    expect(result.current.bookingSubmitted).toBe(true);
  });

  it("submitBooking con error: NO marca submitted y llama handleError", async () => {
    useAuthContext.mockReturnValue({ info: { id: 7 }, isAdmin: true } as any);

    getAllAvailabilities.mockResolvedValue(axiosResponse<AvailableAppointment[]>([]));
    getAppointmentsByStatus.mockReset();
    getAppointmentsByStatus
      .mockResolvedValueOnce(axiosResponse<Appointment[]>([]))
      .mockResolvedValueOnce(axiosResponse<Appointment[]>([]));
    getAppointmentsByUser.mockResolvedValue(axiosResponse<Appointment[]>([]));
    createAppointment.mockRejectedValue(new Error("No hay cupo"));

    const { result } = renderHook(() => useAppointments());
    await waitFor(() => expect(result.current.bookingLoading).toBe(false));

    await act(async () => {
      result.current.setBookingSlotId(1000);
    });
    await act(async () => {
      await result.current.submitBooking();
    });

    expect(result.current.bookingSubmitted).toBe(false);
    expect(handleErrorMock).toHaveBeenCalled();
  });

  /* -------------- Generador de slots -------------- */
  it("loadGenSlots filtra por fecha y, si falla, setea genError con el retorno de handleError", async () => {
    // default (admin y gen) con datos del día actual
    getAllAvailabilities.mockResolvedValue(
      axiosResponse<AvailableAppointment[]>([
        { id: 70, date: today.hour(9).format("YYYY-MM-DDTHH:mm:ss"), availability: true },
        { id: 71, date: today.add(1, "day").hour(9).format("YYYY-MM-DDTHH:mm:ss"), availability: true },
      ])
    );

    const { result } = renderHook(() => useAppointments());
    await waitFor(() => expect(result.current.genLoading).toBe(false));
    expect(result.current.genSlots.map(s => s.id)).toContain(70);
    expect(result.current.genSlots.map(s => s.id)).not.toContain(71);

    // próxima llamada de loadGenSlots falla
    getAllAvailabilities.mockRejectedValueOnce(new Error("falló gen"));
    const d3 = today.add(3, "day");

    await act(async () => {
      result.current.setGenDate(d3);
    });
    await waitFor(() => expect(result.current.genLoading).toBe(false));
    expect(result.current.genError).toBe("boom"); // valor devuelto por handleErrorMock
  });

  it("generateSlots crea disponibilidad y recarga admin (vía loadAdmin)", async () => {
    // Montaje inicial
    getAllAvailabilities.mockResolvedValueOnce(axiosResponse<AvailableAppointment[]>([]));
    getAppointmentsByStatus.mockReset();
    getAppointmentsByStatus
      .mockResolvedValueOnce(axiosResponse<Appointment[]>([]))
      .mockResolvedValueOnce(axiosResponse<Appointment[]>([]));

    const { result } = renderHook(() => useAppointments());
    await waitFor(() => expect(result.current.genLoading).toBe(false));

    // 1) Seteamos fecha y horarios, esperamos que React aplique
    await act(async () => {
      result.current.setGenDate(today);
      result.current.setGenStartTime("10:00");
      result.current.setGenEndTime("12:00");
    });
    await waitFor(() => {
      expect(result.current.genStartTime).toBe("10:00");
      expect(result.current.genEndTime).toBe("12:00");
    });

    const before = getAllAvailabilities.mock.calls.length;

    // 2) Ahora sí generamos
    await act(async () => {
      await result.current.generateSlots();
    });

    expect(createAvailability).toHaveBeenCalledWith(
      expect.objectContaining({
        date: today.format("YYYY-MM-DD"),
        startTime: "10:00:00",
        endTime: "12:00:00",
      })
    );

    // recarga admin ⇒ aumenta el contador de getAllAvailabilities
    await waitFor(() =>
      expect(getAllAvailabilities.mock.calls.length).toBeGreaterThan(before)
    );
  });
});
