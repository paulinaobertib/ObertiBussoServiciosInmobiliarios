import { describe, it, expect, vi, beforeEach, beforeAll, type Mock } from "vitest";
import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";
import SettingsDrawer from "../../components/Settings";

// Polyfill básico para matchMedia (MUI usa useMediaQuery)
beforeAll(() => {
  window.matchMedia ||= () => ({
    matches: false,
    media: "",
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
});

// ─────────────────── Mocks (usar EXACTAMENTE los paths que resuelve el componente) ───────────────────
vi.mock("../../context/AuthContext", () => ({
  useAuthContext: vi.fn(),
}));

vi.mock("../../services/notification.service", () => ({
  getUserNotificationPreferencesByUser: vi.fn(),
  updateUserNotificationPreference: vi.fn(),
  getAllNotifications: vi.fn(),
  getNotificationsByUser: vi.fn(),
}));

// Importamos los mocks tipados
import { useAuthContext as _useAuthContext } from "../../context/AuthContext";
import * as svc from "../../services/notification.service";

const useAuthContext = _useAuthContext as unknown as Mock;
const getUserNotificationPreferencesByUser =
  svc.getUserNotificationPreferencesByUser as unknown as Mock;
const updateUserNotificationPreference =
  svc.updateUserNotificationPreference as unknown as Mock;
const getAllNotifications =
  svc.getAllNotifications as unknown as Mock;
const getNotificationsByUser =
  svc.getNotificationsByUser as unknown as Mock;

// Helper de respuesta con forma { data: ... }
const resp = <T,>(data: T) => ({ data });

describe("<SettingsDrawer />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Por defecto: usuario NO admin
    useAuthContext.mockReturnValue({ info: { id: "u1" }, isAdmin: false });
  });

  it("abre el drawer al clickear el botón", async () => {
    getUserNotificationPreferencesByUser.mockResolvedValueOnce(resp([]));
    getNotificationsByUser.mockResolvedValueOnce(resp([]));

    render(<SettingsDrawer />);

    fireEvent.click(screen.getByRole("button"));
    await screen.findByText("Notificaciones");
  });

  it("NO admin: carga preferencias y notificaciones del usuario, permite togglear una preferencia", async () => {
    getUserNotificationPreferencesByUser.mockResolvedValueOnce(
      resp([
        { id: 10, type: "PROPIEDADNUEVA", enabled: true },
        { id: 11, type: "PROPIEDADINTERES", enabled: false },
      ])
    );
    getNotificationsByUser.mockResolvedValueOnce(resp([]));

    render(<SettingsDrawer />);

    fireEvent.click(screen.getByRole("button"));
    await screen.findByText("Notificaciones");

    expect(await screen.findByText("Nueva propiedad disponible")).toBeInTheDocument();
    expect(await screen.findByText("Actualizaciones de interés")).toBeInTheDocument();

    const checks = screen.getAllByRole("checkbox");
    expect(checks).toHaveLength(2);
    expect((checks[0] as HTMLInputElement).checked).toBe(true);
    expect((checks[1] as HTMLInputElement).checked).toBe(false);

    updateUserNotificationPreference.mockResolvedValueOnce(undefined);
    fireEvent.click(checks[1]);
    expect(updateUserNotificationPreference).toHaveBeenCalledWith(11, true);

    await waitFor(() =>
      expect((checks[1] as HTMLInputElement).checked).toBe(true)
    );

    expect(screen.getByText("Sin notificaciones.")).toBeInTheDocument();
  });

  it("Admin: carga TODAS las notificaciones y renderiza resumen agrupado, sin switches", async () => {
    useAuthContext.mockReturnValue({ info: { id: "admin" }, isAdmin: true });

    const d1a = "2025-06-01T10:00:00.000Z";
    const d1b = "2025-06-01T12:00:00.000Z";
    const d2a = "2025-06-02T08:00:00.000Z";
    const day1 = new Date(d1a).toLocaleDateString();
    const day2 = new Date(d2a).toLocaleDateString();

    getAllNotifications.mockResolvedValueOnce(
      resp([
        { id: 1, type: "PROPIEDADNUEVA", date: d1a },
        { id: 2, type: "PROPIEDADNUEVA", date: d1b },
        { id: 3, type: "PROPIEDADINTERES", date: d2a },
      ])
    );

    render(<SettingsDrawer />);
    fireEvent.click(screen.getByRole("button"));
    await screen.findByText("Notificaciones");

    expect(screen.queryByRole("checkbox")).toBeNull();
    expect(screen.getByText("Historial resumido de notificaciones")).toBeInTheDocument();

    const list = screen.getByRole("list");
    const items = within(list).getAllByRole("listitem");
    expect(items.length).toBeGreaterThanOrEqual(2);

    const findRow = (date: string, label: string, count: number) =>
      items.find(
        (li) =>
          within(li).queryByText(new RegExp(`${date}\\s+–\\s+${label}`)) &&
          within(li).queryByText(new RegExp(`^${count}\\s+envíos$`))
      );

    expect(findRow(day1, "Nueva propiedad disponible", 2)).toBeTruthy();
    expect(findRow(day2, "Actualizaciones de interés", 1)).toBeTruthy();
  });

  it("maneja errores cargando datos (listas vacías) sin romper", async () => {
    getUserNotificationPreferencesByUser.mockRejectedValueOnce(new Error("fail prefs"));
    getNotificationsByUser.mockRejectedValueOnce(new Error("fail notifs"));

    render(<SettingsDrawer />);
    fireEvent.click(screen.getByRole("button"));
    await screen.findByText("Notificaciones");

    expect(screen.queryByRole("checkbox")).toBeNull();
    expect(screen.getByText("Sin notificaciones.")).toBeInTheDocument();
  });
});
