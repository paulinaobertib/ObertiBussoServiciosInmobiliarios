// src/app/user/tests/services/notification.service.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createPropertyNotification,
  createInterestNotification,
  getNotificationById,
  getAllNotifications,
  getNotificationsByUser,
  createUserNotificationPreference,
  updateUserNotificationPreference,
  getUserNotificationPreferenceById,
  getUserNotificationPreferencesByUser,
  getActiveUsersByPreferenceType,
} from "../../services/notification.service";

vi.mock("../../../../api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));
import { api } from "../../../../api";

const resp = (data: any) => ({ data });

describe("notification.service (extra coverage)", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    vi.clearAllMocks();
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    errorSpy.mockRestore();
  });

  // --- createPropertyNotification: éxito + error (ya tenías, queda de referencia) ---
  it("createPropertyNotification OK (params + withCredentials)", async () => {
    (api.post as any).mockResolvedValueOnce(resp({ id: 1 }));
    const body = { title: "t", message: "m" };
    const r = await createPropertyNotification(body as any, 77);
    expect(api.post).toHaveBeenCalledWith("/users/notifications/create/property", body, {
      params: { propertyId: 77 },
      withCredentials: true,
    });
    expect(r).toEqual(resp({ id: 1 }));
  });

  it("createPropertyNotification ERROR re-lanza y loguea", async () => {
    const err = new Error("create prop notif fail");
    (api.post as any).mockRejectedValueOnce(err);
    await expect(createPropertyNotification({} as any, 1)).rejects.toThrow("create prop notif fail");
    expect(errorSpy).toHaveBeenCalledWith("Error creating property notification:", err);
  });

  // --- createInterestNotification: otra variante de type + error (completo) ---
  it("createInterestNotification OK con otro type (PROPIEDADNUEVA)", async () => {
    (api.post as any).mockResolvedValueOnce(resp({ ok: true }));
    const r = await createInterestNotification("u1", "PROPIEDADNUEVA" as any, 10);
    expect(api.post).toHaveBeenCalledWith("/users/notifications/create/interestProperty", null, {
      params: { userId: "u1", type: "PROPIEDADNUEVA", propertyId: 10 },
      withCredentials: true,
    });
    expect(r).toEqual(resp({ ok: true }));
  });

  it("createInterestNotification ERROR re-lanza y loguea", async () => {
    const err = new Error("create interest fail");
    (api.post as any).mockRejectedValueOnce(err);
    await expect(createInterestNotification("u1", "X" as any, 1)).rejects.toThrow("create interest fail");
    expect(errorSpy).toHaveBeenCalledWith("Error creating interest notification:", err);
  });

  // --- getNotificationById: éxito + error ---
  it("getNotificationById OK", async () => {
    (api.get as any).mockResolvedValueOnce(resp({ id: 9 }));
    const r = await getNotificationById(9);
    expect(api.get).toHaveBeenCalledWith("/users/notifications/getById/9", { withCredentials: true });
    expect(r).toEqual(resp({ id: 9 }));
  });

  it("getNotificationById ERROR re-lanza y loguea", async () => {
    const err = new Error("not found");
    (api.get as any).mockRejectedValueOnce(err);
    await expect(getNotificationById(404)).rejects.toThrow("not found");
    expect(errorSpy).toHaveBeenCalledWith("Error fetching notification by id:", err);
  });

  // --- getAllNotifications: éxito + error (FALTABA EL ERROR) ---
  it("getAllNotifications OK", async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: 1 }]));
    const r = await getAllNotifications();
    expect(api.get).toHaveBeenCalledWith("/users/notifications/getAll", { withCredentials: true });
    expect(r).toEqual(resp([{ id: 1 }]));
  });

  it("getAllNotifications ERROR re-lanza y loguea", async () => {
    const err = new Error("all fail");
    (api.get as any).mockRejectedValueOnce(err);
    await expect(getAllNotifications()).rejects.toThrow("all fail");
    expect(errorSpy).toHaveBeenCalledWith("Error fetching all notifications:", err);
  });

  // --- getNotificationsByUser: éxito + error ---
  it("getNotificationsByUser OK", async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: "n" }]));
    const r = await getNotificationsByUser("u1");
    expect(api.get).toHaveBeenCalledWith("/users/notifications/user/u1", { withCredentials: true });
    expect(r).toEqual(resp([{ id: "n" }]));
  });

  it("getNotificationsByUser ERROR re-lanza y loguea", async () => {
    const err = new Error("user fail");
    (api.get as any).mockRejectedValueOnce(err);
    await expect(getNotificationsByUser("bad")).rejects.toThrow("user fail");
    expect(errorSpy).toHaveBeenCalledWith("Error fetching notifications by user:", err);
  });

  // --- createUserNotificationPreference: éxito + error ---
  it("createUserNotificationPreference OK", async () => {
    (api.post as any).mockResolvedValueOnce(resp({ id: 3 }));
    const body = { userId: "u1", type: "PROPIEDADNUEVA", enabled: true };
    const r = await createUserNotificationPreference(body as any);
    expect(api.post).toHaveBeenCalledWith("/users/preference/create", body, { withCredentials: true });
    expect(r).toEqual(resp({ id: 3 }));
  });

  it("createUserNotificationPreference ERROR re-lanza y loguea", async () => {
    const err = new Error("pref create fail");
    (api.post as any).mockRejectedValueOnce(err);
    await expect(createUserNotificationPreference({} as any)).rejects.toThrow("pref create fail");
    expect(errorSpy).toHaveBeenCalledWith("Error creating user notification preference:", err);
  });

  // --- updateUserNotificationPreference: probamos enabled=true y enabled=false + error ---
  it("updateUserNotificationPreference OK (enabled=true)", async () => {
    (api.put as any).mockResolvedValueOnce(resp({ ok: true }));
    const r = await updateUserNotificationPreference(5, true);
    expect(api.put).toHaveBeenCalledWith("/users/preference/update/5", null, {
      params: { enabled: true },
      withCredentials: true,
    });
    expect(r).toEqual(resp({ ok: true }));
  });

  it("updateUserNotificationPreference OK (enabled=false)", async () => {
    (api.put as any).mockResolvedValueOnce(resp({ ok: true }));
    const r = await updateUserNotificationPreference(6, false);
    expect(api.put).toHaveBeenCalledWith("/users/preference/update/6", null, {
      params: { enabled: false },
      withCredentials: true,
    });
    expect(r).toEqual(resp({ ok: true }));
  });

  it("updateUserNotificationPreference ERROR re-lanza y loguea", async () => {
    const err = new Error("pref update fail");
    (api.put as any).mockRejectedValueOnce(err);
    await expect(updateUserNotificationPreference(1, true)).rejects.toThrow("pref update fail");
    expect(errorSpy).toHaveBeenCalledWith("Error updating user notification preference:", err);
  });

  // --- getUserNotificationPreferenceById: éxito + error (FALTABA EL ERROR) ---
  it("getUserNotificationPreferenceById OK", async () => {
    (api.get as any).mockResolvedValueOnce(resp({ id: 2 }));
    const r = await getUserNotificationPreferenceById(2);
    expect(api.get).toHaveBeenCalledWith("/users/preference/getById/2", { withCredentials: true });
    expect(r).toEqual(resp({ id: 2 }));
  });

  it("getUserNotificationPreferenceById ERROR re-lanza y loguea", async () => {
    const err = new Error("pref by id fail");
    (api.get as any).mockRejectedValueOnce(err);
    await expect(getUserNotificationPreferenceById(999)).rejects.toThrow("pref by id fail");
    expect(errorSpy).toHaveBeenCalledWith("Error fetching user notification preference by id:", err);
  });

  // --- getUserNotificationPreferencesByUser: éxito + error (FALTABA EL ERROR) ---
  it("getUserNotificationPreferencesByUser OK", async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ id: "p" }]));
    const r = await getUserNotificationPreferencesByUser("u1");
    expect(api.get).toHaveBeenCalledWith("/users/preference/user/u1", { withCredentials: true });
    expect(r).toEqual(resp([{ id: "p" }]));
  });

  it("getUserNotificationPreferencesByUser ERROR re-lanza y loguea", async () => {
    const err = new Error("pref by user fail");
    (api.get as any).mockRejectedValueOnce(err);
    await expect(getUserNotificationPreferencesByUser("bad")).rejects.toThrow("pref by user fail");
    expect(errorSpy).toHaveBeenCalledWith("Error fetching user notification preferences by user:", err);
  });

  // --- getActiveUsersByPreferenceType: otra variante de type + error (ya cubierto) ---
  it("getActiveUsersByPreferenceType OK con PROPIEDADINTERES", async () => {
    (api.get as any).mockResolvedValueOnce(resp([{ userId: "u2" }]));
    const r = await getActiveUsersByPreferenceType("PROPIEDADINTERES" as any);
    expect(api.get).toHaveBeenCalledWith("/users/preference/active", {
      params: { type: "PROPIEDADINTERES" },
      withCredentials: true,
    });
    expect(r).toEqual(resp([{ userId: "u2" }]));
  });

  it("getActiveUsersByPreferenceType ERROR re-lanza y loguea", async () => {
    const err = new Error("active fail");
    (api.get as any).mockRejectedValueOnce(err);
    await expect(getActiveUsersByPreferenceType("X" as any)).rejects.toThrow("active fail");
    expect(errorSpy).toHaveBeenCalledWith("Error fetching active users by preference type:", err);
  });
});
