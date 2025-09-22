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
import { useApiErrors } from "../../shared/hooks/useErrors";
import { useGlobalAlert } from "../../shared/context/AlertContext";

export function useAppointments() {
  const { info, isAdmin } = useAuthContext();
  const { handleError } = useApiErrors();
  const alertApi: any = useGlobalAlert();

  /** ---------- Helpers de alertas ---------- */
  const notifySuccess = useCallback(
    async (title: string, description?: string) => {
      if (typeof alertApi?.success === "function") {
        await alertApi.success({ title, description, primaryLabel: "Ok" });
      } else if (typeof alertApi?.showAlert === "function") {
        alertApi.showAlert(description ?? title, "success");
      }
    },
    [alertApi]
  );

  /**
   * Confirmación peligrosa con doble paso si está disponible.
   * Fallback: confirm simple o window.confirm.
   */
  const confirmDanger = useCallback(
    async (opts: {
      title: string;
      description?: string;
      step2Title?: string;
      step2Description?: string;
      primaryLabel?: string;
      secondaryLabel?: string;
    }) => {
      const { title, description = "¿Vas a eliminar este elemento?" } = opts;

      if (typeof alertApi?.doubleConfirm === "function") {
        return await alertApi.doubleConfirm({
          kind: "error",
          title,
          description,
        });
      }
    },
    [alertApi]
  );

  /** ---------- Admin Logic ---------- */
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState<AvailableAppointment[]>([]);
  const [apptsBySlot, setApptsBySlot] = useState<Record<number, Appointment>>({});
  const [filter, setFilter] = useState<"TODOS" | "DISPONIBLE" | "ESPERA" | "ACEPTADO" | "RECHAZADO">("TODOS");
  const [slotMap, setSlotMap] = useState<Record<number, AvailableAppointment>>({});

  const loadAdmin = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      switch (filter) {
        case "DISPONIBLE": {
          const res = await getAvailableAppointments();
          setSlots(res.data);
          const newSlotMap: Record<number, AvailableAppointment> = {};
          res.data.forEach((slot: AvailableAppointment) => (newSlotMap[slot.id] = slot));
          setSlotMap(newSlotMap);
          setApptsBySlot({});
          break;
        }
        case "ESPERA":
        case "ACEPTADO":
        case "RECHAZADO": {
          const res = await getAppointmentsByStatus(filter as AppointmentStatus);
          const pseudo = res.data.map((a: any) => ({
            id: a.availableAppointment?.id ?? a.id,
            date: a.appointmentDate,
            availability: false,
          }));
          setSlots(pseudo);

          const dict: Record<number, Appointment> = {};
          const newSlotMap: Record<number, AvailableAppointment> = {};
          res.data.forEach((a: Appointment) => {
            const key = a.availableAppointment?.id ?? a.id;
            dict[key] = a;
            newSlotMap[key] = { id: key, date: a.appointmentDate, availability: false };
          });

          setSlotMap(newSlotMap);
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
          const newSlotMap: Record<number, AvailableAppointment> = {};
          all.data.forEach((slot: AvailableAppointment) => (newSlotMap[slot.id] = slot));
          [...pend.data, ...acc.data].forEach((a) => {
            if (a.availableAppointment) dict[a.availableAppointment.id] = a;
          });
          setSlotMap(newSlotMap);
          setApptsBySlot(dict);
        }
      }
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  }, [filter, isAdmin, handleError]);

  useEffect(() => {
    loadAdmin();
  }, [loadAdmin]);

  const acceptAppointment = useCallback(
    async (a: Appointment) => {
      try {
        await updateAppointmentStatus(a.id, "ACEPTADO");
        await notifySuccess("Turno aceptado");
        await loadAdmin();
      } catch (e) {
        handleError(e);
      }
    },
    [loadAdmin, handleError, notifySuccess]
  );

  const rejectAppointment = useCallback(
    async (a: Appointment) => {
      const label = a?.appointmentDate ? dayjs(a.appointmentDate).format("DD/MM/YYYY HH:mm") : `#${a?.id ?? ""}`;
      const ok = await confirmDanger({
        title: `Vas a rechazar el turno (${label})`,
        step2Title: "¿Rechazar definitivamente?",
      });
      if (!ok) return;

      try {
        await updateAppointmentStatus(a.id, "RECHAZADO");
        await notifySuccess("Turno rechazado");
        await loadAdmin();
      } catch (e) {
        handleError(e);
      }
    },
    [loadAdmin, handleError, notifySuccess, confirmDanger]
  );

  const removeAvailableSlot = useCallback(
    async (id: number) => {
      const s = slotMap[id];
      const label = s?.date ? dayjs(s.date).format("DD/MM/YYYY HH:mm") : `#${id}`;
      const ok = await confirmDanger({
        title: `Vas a eliminar el turno disponible (${label})`,
        step2Title: "¿Eliminar definitivamente?",
      });
      if (!ok) return;

      try {
        await deleteAvailability(id);
        await notifySuccess("Turno eliminado", `Se eliminó el turno ${label}.`);
        await loadAdmin();
      } catch (e) {
        handleError(e);
      }
    },
    [slotMap, loadAdmin, handleError, confirmDanger, notifySuccess]
  );

  /** ---------- User Logic ---------- */
  const [userLoading, setUserLoading] = useState(false);
  const [userAppointments, setUserAppointments] = useState<Appointment[]>([]);

  const loadUser = useCallback(async () => {
    if (!info) return;
    setUserLoading(true);
    try {
      const [uaRes, allRes] = await Promise.all([getAppointmentsByUser(info.id), getAllAvailabilities()]);
      setUserAppointments(uaRes.data);
      const map: Record<number, AvailableAppointment> = {};
      allRes.data.forEach((s: AvailableAppointment) => (map[s.id] = s));
      setSlotMap(map);
    } catch (e) {
      handleError(e);
    } finally {
      setUserLoading(false);
    }
  }, [info, handleError]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const cancelAppointment = useCallback(
    async (id: number) => {
      const a = userAppointments.find((x) => x.id === id);
      const label = a?.appointmentDate ? dayjs(a.appointmentDate).format("DD/MM/YYYY HH:mm") : `#${id}`;

      const ok = await confirmDanger({
        title: `Vas a cancelar tu turno (${label})`,
        step2Title: "¿Cancelar definitivamente?",
      });
      if (!ok) return;

      try {
        await deleteAppointment(id);
        await notifySuccess("Turno cancelado", `Cancelaste el turno ${label}.`);
        await loadUser();
      } catch (e) {
        handleError(e);
      }
    },
    [userAppointments, loadUser, handleError, confirmDanger, notifySuccess]
  );

  /** ---------- Booking Form Logic ---------- */
  const [bookingDate, setBookingDate] = useState<Dayjs>(dayjs());
  const [bookingSlots, setBookingSlots] = useState<AvailableAppointment[]>([]);
  const [bookingSlotId, setBookingSlotId] = useState<number | null>(null);
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSubmitted, setBookingSubmitted] = useState(false);

  const loadBookingSlots = useCallback(
    async (d: Dayjs) => {
      setBookingLoading(true);
      setBookingSlotId(null);
      try {
        const all = (await getAllAvailabilities()).data;
        const prefix = d.format("YYYY-MM-DD");
        setBookingSlots(all.filter((s: { date: string }) => s.date.startsWith(prefix)));
      } catch (e) {
        handleError(e);
      } finally {
        setBookingLoading(false);
      }
    },
    [handleError]
  );

  useEffect(() => {
    loadBookingSlots(bookingDate);
  }, [bookingDate, loadBookingSlots]);

  const submitBooking = useCallback(async () => {
    if (bookingSlotId == null || !info) return;
    setBookingLoading(true);
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
      await notifySuccess("Solicitud enviada", "Tu turno quedó en espera de confirmación.");
    } catch (e) {
      handleError(e);
    } finally {
      setBookingLoading(false);
    }
  }, [bookingSlotId, bookingNotes, info, handleError, notifySuccess]);

  /** ---------- Slot Generator Logic ---------- */
  const [genDate, setGenDate] = useState<Dayjs>(dayjs());
  const [genStartTime, setGenStartTime] = useState("09:00");
  const [genEndTime, setGenEndTime] = useState("17:00");
  const [genSlots, setGenSlots] = useState<AvailableAppointment[]>([]);
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const loadGenSlots = useCallback(
    async (d: Dayjs) => {
      setGenLoading(true);
      setGenError(null);
      try {
        const all = (await getAllAvailabilities()).data;
        setGenSlots(all.filter((s: { date: string }) => s.date.startsWith(d.format("YYYY-MM-DD"))));
      } catch (e) {
        setGenError(handleError(e));
      } finally {
        setGenLoading(false);
      }
    },
    [handleError]
  );

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
      await notifySuccess("Turnos generados", `Se crearon turnos para el ${genDate.format("DD/MM/YYYY")}.`);
      await loadAdmin();
    } catch (e) {
      setGenError(handleError(e));
    } finally {
      setGenLoading(false);
    }
  }, [genDate, genStartTime, genEndTime, loadAdmin, handleError, notifySuccess]);

  return {
    // Admin
    loading,
    filter,
    setFilter,
    slotsByDate: useMemo(() => {
      const grouped: Record<string, AvailableAppointment[]> = {};
      slots
        .filter((s) => !dayjs(s.date).isBefore(dayjs().startOf("day")))
        .forEach((s) => {
          const dateKey = s.date.slice(0, 10);
          (grouped[dateKey] ||= []).push(s);
        });
      return grouped;
    }, [slots]),
    apptsBySlot,
    acceptAppointment,
    rejectAppointment, // ← ahora con doble confirmación
    removeAvailableSlot, // ← ahora con doble confirmación
    reloadAdmin: loadAdmin,
    // User
    userLoading,
    userAppointments,
    slotMap,
    cancelAppointment, // ← también usa doble confirmación
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
