import { useState, useEffect, useCallback, useMemo } from "react";
import dayjs, { Dayjs } from "dayjs";
import { useAuthContext } from "../../user/context/AuthContext";
import {
  getAllAvailabilities,
  getAvailableAppointments,
  getAppointmentsByStatus,
  getAppointmentsByUser,
  createAvailability,
  createAppointment,
  deleteAvailability,
  deleteAppointment,
  updateAppointmentStatus,
} from "../services/appointment.service";

import type {
  AvailableAppointment,
  Appointment,
  AppointmentStatus,
  AvailableAppointmentCreate,
  AppointmentCreate,
} from "../types/appointment";

/**
 * Hook: useAppointments
 * Centraliza la lógica de turnos y citas para admin y usuario,
 * además de la gestión de reserva y generación de turnos.
 */
export function useAppointments() {
  // --- Auth Context ---
  const { info, isAdmin } = useAuthContext();

  // --- Admin Logic: fetch, filter, grouping, actions ---
  const [adminLoading, setAdminLoading] = useState(false);
  const [slots, setSlots] = useState<AvailableAppointment[]>([]);
  const [apptsBySlot, setApptsBySlot] = useState<Record<number, Appointment>>(
    {}
  );
  const [filter, setFilter] = useState<
    "TODOS" | "DISPONIBLE" | "ESPERA" | "ACEPTADO" | "RECHAZADO"
  >("TODOS");

  const loadAdmin = useCallback(async () => {
    if (!isAdmin) return;
    setAdminLoading(true);
    try {
      switch (filter) {
        case "DISPONIBLE": {
          const res = await getAvailableAppointments();
          setSlots(res.data);
          setApptsBySlot({});
          break;
        }
        case "ESPERA":
        case "ACEPTADO":
        case "RECHAZADO": {
          const status = filter as AppointmentStatus;
          const res = await getAppointmentsByStatus(status);
          const pseudo = res.data.map(
            (a: {
              availableAppointment: { id: any };
              id: any;
              appointmentDate: any;
            }) => ({
              id: a.availableAppointment?.id ?? a.id,
              date: a.appointmentDate,
              availability: false,
            })
          );
          setSlots(pseudo);
          const dict: Record<number, Appointment> = {};
          res.data.forEach((a: Appointment) => {
            const key = a.availableAppointment?.id ?? a.id;
            dict[key] = a;
          });
          setApptsBySlot(dict);
          break;
        }
        case "TODOS":
        default: {
          const [all, pend, acc] = await Promise.all([
            getAllAvailabilities(),
            getAppointmentsByStatus("ESPERA"),
            getAppointmentsByStatus("ACEPTADO"),
          ]);
          setSlots(all.data);
          const dict: Record<number, Appointment> = {};
          [...pend.data, ...acc.data].forEach((a) => {
            if (a.availableAppointment) dict[a.availableAppointment.id] = a;
          });
          setApptsBySlot(dict);
        }
      }
    } finally {
      setAdminLoading(false);
    }
  }, [filter, isAdmin]);

  useEffect(() => {
    loadAdmin();
  }, [loadAdmin]);

  // Filtrado y agrupamiento por fecha
  const visibleSlots = useMemo(
    () =>
      slots
        .filter((s) => !dayjs(s.date).isBefore(dayjs().startOf("day")))
        .filter((s) => {
          if (filter === "DISPONIBLE") return s.availability;
          if (filter === "ESPERA")
            return apptsBySlot[s.id]?.status === "ESPERA";
          if (filter === "ACEPTADO")
            return apptsBySlot[s.id]?.status === "ACEPTADO";
          if (filter === "RECHAZADO")
            return apptsBySlot[s.id]?.status === "RECHAZADO";
          return true;
        }),
    [slots, filter, apptsBySlot]
  );

  const slotsByDate = useMemo(() => {
    const grouped: Record<string, AvailableAppointment[]> = {};
    visibleSlots.forEach((s) => {
      const dateKey = s.date.slice(0, 10);
      (grouped[dateKey] ||= []).push(s);
    });
    return grouped;
  }, [visibleSlots]);

  const acceptAppointment = useCallback(
    async (a: Appointment) => {
      await updateAppointmentStatus(a.id, "ACEPTADO");
      loadAdmin();
    },
    [loadAdmin]
  );

  const rejectAppointment = useCallback(
    async (a: Appointment) => {
      await updateAppointmentStatus(a.id, "RECHAZADO");
      loadAdmin();
    },
    [loadAdmin]
  );

  const removeAvailableSlot = useCallback(
    async (id: number) => {
      await deleteAvailability(id);
      loadAdmin();
    },
    [loadAdmin]
  );

  // --- User Logic: fetch user appointments, cancel ---
  const [userLoading, setUserLoading] = useState(false);
  const [userAppointments, setUserAppointments] = useState<Appointment[]>([]);
  const [slotMap, setSlotMap] = useState<Record<number, AvailableAppointment>>(
    {}
  );

  const loadUser = useCallback(async () => {
    if (!info) return;
    setUserLoading(true);
    try {
      const [uaRes, allRes] = await Promise.all([
        getAppointmentsByUser(info.id),
        getAllAvailabilities(),
      ]);
      setUserAppointments(uaRes.data);
      const map: Record<number, AvailableAppointment> = {};
      allRes.data.forEach((s: AvailableAppointment) => {
        map[s.id] = s;
      });
      setSlotMap(map);
    } finally {
      setUserLoading(false);
    }
  }, [info]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const cancelAppointment = useCallback(
    async (id: number) => {
      await deleteAppointment(id);
      loadUser();
    },
    [loadUser]
  );

  // --- Booking Form Logic: load slots, select, submit ---
  const [bookingDate, setBookingDate] = useState<Dayjs>(dayjs());
  const [bookingSlots, setBookingSlots] = useState<AvailableAppointment[]>([]);
  const [bookingSlotId, setBookingSlotId] = useState<number | null>(null);
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);

  const loadBookingSlots = useCallback(async (d: Dayjs) => {
    setBookingLoading(true);
    setBookingError(null);
    setBookingSlotId(null);
    try {
      const all = (await getAllAvailabilities()).data;
      const prefix = d.format("YYYY-MM-DD");
      setBookingSlots(
        all.filter((s: { date: string }) => s.date.startsWith(prefix))
      );
    } catch (e: any) {
      setBookingError(e.response?.data || e.message);
    } finally {
      setBookingLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookingSlots(bookingDate);
  }, [bookingDate, loadBookingSlots]);

  const submitBooking = useCallback(async () => {
    if (bookingSlotId == null || !info) return;
    setBookingLoading(true);
    setBookingError(null);
    try {
      const body: AppointmentCreate = {
        userId: info.id,
        comment: bookingNotes || "Turno solicitado",
        status: "ESPERA",
        availableAppointment: { id: bookingSlotId },
        appointmentDate: "",
      };
      await createAppointment(body);
      setBookingSubmitted(true);
    } catch (e: any) {
      setBookingError(e.response?.data || e.message);
    } finally {
      setBookingLoading(false);
    }
  }, [bookingSlotId, bookingNotes, info]);

  // --- Slot Generator Logic: load existing, generate new ---
  const [genDate, setGenDate] = useState<Dayjs>(dayjs());
  const [genStartTime, setGenStartTime] = useState("09:00");
  const [genEndTime, setGenEndTime] = useState("17:00");
  const [genSlots, setGenSlots] = useState<AvailableAppointment[]>([]);
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const loadGenSlots = useCallback(async (d: Dayjs) => {
    setGenLoading(true);
    setGenError(null);
    try {
      const all = (await getAllAvailabilities()).data;
      setGenSlots(
        all.filter((s: { date: string }) =>
          s.date.startsWith(d.format("YYYY-MM-DD"))
        )
      );
    } catch (e: any) {
      setGenError(e.response?.data || e.message);
    } finally {
      setGenLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGenSlots(genDate);
  }, [genDate, loadGenSlots]);

  const generateSlots = useCallback(async () => {
    setGenLoading(true);
    setGenError(null);
    try {
      const dto: AvailableAppointmentCreate = {
        date: genDate.format("YYYY-MM-DD"),
        startTime: `${genStartTime}:00`,
        endTime: `${genEndTime}:00`,
      };
      await createAvailability(dto);
      loadGenSlots(genDate);
    } catch (e: any) {
      setGenError(e.response?.data || e.message);
    } finally {
      setGenLoading(false);
    }
  }, [genDate, genStartTime, genEndTime, loadGenSlots]);

  // --- Return all states and actions flatly ---
  return {
    // Admin
    adminLoading,
    filter,
    setFilter,
    slotsByDate,
    apptsBySlot,
    acceptAppointment,
    rejectAppointment,
    removeAvailableSlot,
    reloadAdmin: loadAdmin,
    // User
    userLoading,
    userAppointments,
    slotMap,
    cancelAppointment,
    reloadUser: loadUser,
    // Booking Form
    bookingDate,
    setBookingDate,
    bookingSlots,
    bookingSlotId,
    setBookingSlotId,
    bookingNotes,
    setBookingNotes,
    bookingLoading,
    bookingError,
    bookingSubmitted,
    loadBookingSlots,
    submitBooking,
    // Slot Generator
    genDate,
    setGenDate,
    genStartTime,
    setGenStartTime,
    genEndTime,
    setGenEndTime,
    genSlots,
    genLoading,
    genError,
    loadGenSlots,
    generateSlots,
  };
}
