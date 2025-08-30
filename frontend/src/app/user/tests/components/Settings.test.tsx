/// <reference types="vitest" />
import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import SettingsDrawer from "../../components/Settings";

// Polyfill básico para matchMedia (lo usa useMediaQuery de MUI)
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

// --- Mocks ---
vi.mock("../../context/AuthContext", () => ({
  useAuthContext: vi.fn(),
}));

vi.mock("../../services/notification.service", () => ({
  getUserNotificationPreferencesByUser: vi.fn(),
  updateUserNotificationPreference: vi.fn(),
  getAllNotifications: vi.fn(),
  getNotificationsByUser: vi.fn(),
}));

// Helpers
const { useAuthContext } = await import("../../context/AuthContext");
const {
  getUserNotificationPreferencesByUser,
  updateUserNotificationPreference,
  getAllNotifications,
  getNotificationsByUser,
} = await import("../../services/notification.service");

// --- Helper original (lo dejamos para no romper tus tests existentes) ---
function openDrawer() {
  // Para abrir el drawer (modo desktop) por índice - tu forma original
  fireEvent.click(screen.getAllByLabelText("Abrir notificaciones")[1]);
}

// --- Helpers extra más robustos (desktop vs mobile) ---
function getOpenButtons() {
  const btns = screen.getAllByRole("button", { name: /Abrir notificaciones/i });
  const mobileBtn = btns.find((b) => /Notificaciones/i.test(b.textContent || "")) as HTMLButtonElement;
  const desktopBtn = btns.find((b) => !/Notificaciones/i.test(b.textContent || "")) as HTMLButtonElement;
  return { mobileBtn, desktopBtn };
}
async function openDrawerDesktopSafe() {
  const { desktopBtn } = getOpenButtons();
  fireEvent.click(desktopBtn);
  // Esperamos el heading del Drawer, NO texto suelto
  await screen.findByRole("heading", { name: /Notificaciones/i });
}

describe("SettingsDrawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (updateUserNotificationPreference as any).mockResolvedValue({});
  });

  it("muestra mensaje sin preferencias y sin notificaciones", async () => {
    (useAuthContext as any).mockReturnValue({ info: { id: "u2" }, isAdmin: false });
    (getUserNotificationPreferencesByUser as any).mockResolvedValue({ data: [] });
    (getNotificationsByUser as any).mockResolvedValue({ data: [] });

    render(<SettingsDrawer />);
    openDrawer();

    // El Drawer ya estará abierto; validamos contenido
    await screen.findByText("Sin preferencias configuradas.");
    expect(screen.getByText("Sin notificaciones.")).toBeInTheDocument();
  });

  it("muestra error si falla fetch", async () => {
    (useAuthContext as any).mockReturnValue({ info: { id: "u3" }, isAdmin: false });
    (getUserNotificationPreferencesByUser as any).mockRejectedValue(new Error("fail"));
    (getNotificationsByUser as any).mockRejectedValue(new Error("fail"));

    render(<SettingsDrawer />);
    openDrawer();

    await screen.findByText("No pudimos cargar los datos.");
    expect(screen.getByText("Sin notificaciones.")).toBeInTheDocument();
  });

  it("renderiza admin con resumen de notificaciones", async () => {
    (useAuthContext as any).mockReturnValue({ info: { id: "admin" }, isAdmin: true });
    (getAllNotifications as any).mockResolvedValue({
      data: [
        { id: 1, type: "PROPIEDADNUEVA", date: new Date().toISOString() },
        { id: 2, type: "PROPIEDADNUEVA", date: new Date().toISOString() },
        { id: 3, type: "PROPIEDADINTERES", date: new Date().toISOString() },
      ],
    });

    render(<SettingsDrawer />);
    openDrawer();

    // Usamos el heading para evitar ambigüedad
    await screen.findByRole("heading", { name: /Notificaciones/i });
    expect(screen.getByText("Admin")).toBeInTheDocument();

    // Aparecen los labels resumidos
    expect(screen.getByText("Historial (resumen)")).toBeInTheDocument();
    expect(screen.getByText("Nueva propiedad disponible")).toBeInTheDocument();
    expect(screen.getByText("Actualizaciones de interés")).toBeInTheDocument();
    expect(screen.getByText("Envíos")).toBeInTheDocument();
  });

  it("admin sin notificaciones muestra 'Sin actividad.'", async () => {
    (useAuthContext as any).mockReturnValue({ info: { id: "admin" }, isAdmin: true });
    (getAllNotifications as any).mockResolvedValue({ data: [] });

    render(<SettingsDrawer />);
    openDrawer();

    await screen.findByRole("heading", { name: /Notificaciones/i });
    await screen.findByText("Sin actividad.");
  });

  it("muestra 'Cargando…' mientras las promesas están pendientes", async () => {
    (useAuthContext as any).mockReturnValue({ info: { id: "u-load" }, isAdmin: false });
    (getUserNotificationPreferencesByUser as any).mockReturnValue(new Promise(() => {}));
    (getNotificationsByUser as any).mockReturnValue(new Promise(() => {}));

    render(<SettingsDrawer />);
    await openDrawerDesktopSafe();

    // Puede aparecer en preferencias o historial; con que exista uno alcanza
    expect(screen.getAllByText("Cargando…").length).toBeGreaterThan(0);
  });

  it("NO admin: toggle de preferencia exitoso", async () => {
    (useAuthContext as any).mockReturnValue({ info: { id: "u1" }, isAdmin: false });
    (getUserNotificationPreferencesByUser as any).mockResolvedValue({
      data: [
        { id: 101, type: "PROPIEDADNUEVA", enabled: false },
        { id: 102, type: "PROPIEDADINTERES", enabled: true },
      ],
    });
    (getNotificationsByUser as any).mockResolvedValue({ data: [] });
    (updateUserNotificationPreference as any).mockResolvedValue(undefined);

    render(<SettingsDrawer />);
    await openDrawerDesktopSafe();

    const checks = screen.getAllByRole("checkbox") as HTMLInputElement[];
    expect(checks).toHaveLength(2);
    expect(checks[0].checked).toBe(false);

    fireEvent.click(checks[0]);
    expect(updateUserNotificationPreference).toHaveBeenCalledWith(101, true);
    await waitFor(() => expect(checks[0].checked).toBe(true));
  });

  it("NO admin: toggle con error hace rollback", async () => {
    (useAuthContext as any).mockReturnValue({ info: { id: "u2" }, isAdmin: false });
    (getUserNotificationPreferencesByUser as any).mockResolvedValue({
      data: [{ id: 201, type: "PROPIEDADINTERES", enabled: true }],
    });
    (getNotificationsByUser as any).mockResolvedValue({ data: [] });
    (updateUserNotificationPreference as any).mockRejectedValue(new Error("fail"));

    render(<SettingsDrawer />);
    await openDrawerDesktopSafe();

    const cb = screen.getByRole("checkbox") as HTMLInputElement;
    expect(cb.checked).toBe(true);

    fireEvent.click(cb); // optimista: false → rollback: true
    await waitFor(() => expect(cb.checked).toBe(true));
  });

  it("usuario: historial renderiza items y muestra Divider solo para no-admin", async () => {
    (useAuthContext as any).mockReturnValue({ info: { id: "u3" }, isAdmin: false });
    const now = new Date().toISOString();
    (getUserNotificationPreferencesByUser as any).mockResolvedValue({ data: [] });
    (getNotificationsByUser as any).mockResolvedValue({
      data: [
        { id: 1, type: "PROPIEDADNUEVA", date: now },
        { id: 2, type: "PROPIEDADINTERES", date: now },
      ],
    });

    render(<SettingsDrawer />);
    await openDrawerDesktopSafe();

    // Divider presente
    expect(screen.getByRole("separator")).toBeInTheDocument();

    const list = screen.getByRole("list");
    const items = within(list).getAllByRole("listitem");
    expect(items.length).toBe(2);
    expect(within(items[0]).getByText("Nueva propiedad disponible")).toBeInTheDocument();
    expect(within(items[1]).getByText("Actualizaciones de interés")).toBeInTheDocument();
  });

  it("chip del header muestra la cantidad correcta de notificaciones de HOY", async () => {
    (useAuthContext as any).mockReturnValue({ info: { id: "u4" }, isAdmin: false });
    const today = new Date();
    const yesterday = new Date(Date.now() - 86400000);
    (getUserNotificationPreferencesByUser as any).mockResolvedValue({ data: [] });
    (getNotificationsByUser as any).mockResolvedValue({
      data: [
        { id: 1, type: "PROPIEDADNUEVA", date: today.toISOString() },
        { id: 2, type: "PROPIEDADINTERES", date: yesterday.toISOString() },
      ],
    });

    render(<SettingsDrawer />);
    await openDrawerDesktopSafe();

    expect(screen.getByText(/^1 hoy$/)).toBeInTheDocument();
  });

  it("en mobile: abre con el botón de texto y cierra con la X", async () => {
    (useAuthContext as any).mockReturnValue({ info: { id: "u5" }, isAdmin: false });
    (getUserNotificationPreferencesByUser as any).mockResolvedValue({ data: [] });
    (getNotificationsByUser as any).mockResolvedValue({ data: [] });

    render(<SettingsDrawer />);

    const { mobileBtn } = getOpenButtons();
    fireEvent.click(mobileBtn);
    await screen.findByRole("heading", { name: /Notificaciones/i });

    const header = screen.getByRole("heading", { name: /Notificaciones/i }).parentElement!;
    const closeBtn = within(header).getByRole("button");
    fireEvent.click(closeBtn);

    await waitFor(() => expect(screen.queryByRole("heading", { name: /Notificaciones/i })).toBeNull());
  });

  it("Admin: orden del resumen por fecha desc y, a igualdad, por tipo (alfabético)", async () => {
    (useAuthContext as any).mockReturnValue({ info: { id: "admin" }, isAdmin: true });

    const sameDay = "2025-06-05T10:00:00.000Z";
    (getAllNotifications as any).mockResolvedValue({
      data: [
        { id: 9, type: "PROPIEDADNUEVA", date: sameDay },
        { id: 10, type: "PROPIEDADINTERES", date: sameDay },
      ],
    });

    render(<SettingsDrawer />);
    await openDrawerDesktopSafe();

    // Admin no muestra Divider
    expect(screen.queryByRole("separator")).toBeNull();

    const list = screen.getByRole("list");
    const items = within(list).getAllByRole("listitem");
    // Por orden alfabético del tipo (I antes que N) en fecha igual
    expect(within(items[0]).getByText("Actualizaciones de interés")).toBeInTheDocument();
    expect(within(items[1]).getByText("Nueva propiedad disponible")).toBeInTheDocument();
  });

  it("sin userId (info null) no llama servicios de usuario y muestra vacíos", async () => {
    (useAuthContext as any).mockReturnValue({ info: null, isAdmin: false });

    render(<SettingsDrawer />);
    await openDrawerDesktopSafe();

    expect(getUserNotificationPreferencesByUser).not.toHaveBeenCalled();
    expect(getNotificationsByUser).not.toHaveBeenCalled();
    expect(screen.getByText("Sin preferencias configuradas.")).toBeInTheDocument();
    expect(screen.getByText("Sin notificaciones.")).toBeInTheDocument();
  });
});
