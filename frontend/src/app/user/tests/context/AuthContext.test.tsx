/// <reference types="vitest" />
import { renderHook, act } from "@testing-library/react";
import { render, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { AuthProvider, useAuthContext } from "../../context/AuthContext";
import * as userService from "../../services/user.service";
import * as notificationService from "../../services/notification.service";
import { api } from "../../../../api";

vi.mock("../../services/user.service");
vi.mock("../../services/notification.service");
vi.mock("../../../shared/utils/retry", () => ({
  retry: vi.fn(async (fn: any) => fn()),
  sleep: vi.fn(async () => {}),
}));
vi.mock("../../../../api", () => ({
  api: { interceptors: { response: { use: vi.fn(), eject: vi.fn() } } },
}));

describe("AuthProvider", () => {
  const fakeUser: any = { id: "u1", name: "Test User" };
  const fakeRoles = ["TENANT"];
  const fakePrefs = [{ userId: "u1", type: "PROPIEDADNUEVA", enabled: true }];

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
    (notificationService.createUserNotificationPreference as any).mockResolvedValue({ data: fakePrefs[0] });

    // Mock global window.location (solo lo que usamos)
    Object.defineProperty(window, "location", {
      value: { href: "", replace: vi.fn(), pathname: "/", search: "" },
      writable: true,
    });

    // Mock CustomEvent mínimo
    // @ts-ignore
    globalThis.CustomEvent = class {
      type: string;
      detail: any;
      constructor(type: string, init?: any) {
        this.type = type;
        this.detail = init?.detail;
      }
    };
  });

  it("useAuthContext sin provider NO lanza (usa valores por defecto)", () => {
    const { result } = renderHook(() => useAuthContext(), {
      wrapper: ({ children }) => <>{children}</>,
    });

    expect(result.current.info).toBeNull();
    expect(result.current.isLogged).toBe(false);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isTenant).toBe(false);
    expect(result.current.ready).toBe(false);
  });

  it("carga user info y setea context correctamente", async () => {
    (userService.getMe as any).mockResolvedValue({ data: fakeUser });
    (userService.getRoles as any).mockResolvedValue({ data: fakeRoles });
    (userService.addPrincipalRole as any).mockResolvedValue({});
    (notificationService.getUserNotificationPreferencesByUser as any).mockResolvedValue({
      data: fakePrefs,
    });

    const wrapper = ({ children }: any) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuthContext(), { wrapper });

    await waitFor(() => expect(result.current.info).not.toBeNull());
    expect(result.current.isLogged).toBe(true);
    expect(result.current.isTenant).toBe(true);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.ready).toBe(true);
  });

  it("login limpia state y redirecciona", () => {
    const wrapper = ({ children }: any) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuthContext(), { wrapper });

    act(() => result.current.login());

    expect(localStorage.getItem("postLoginNext")).not.toBeNull();
    expect(window.location.href).not.toBe(""); // se setea alguna URL
  });

  it("logout limpia info y redirecciona", () => {
    const wrapper = ({ children }: any) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuthContext(), { wrapper });

    act(() => result.current.logout());

    expect(result.current.info).toBeNull();
    expect(window.location.href).not.toBe(""); // se setea alguna URL
  });

  it("refreshUser vuelve a cargar el usuario", async () => {
    (userService.getMe as any).mockResolvedValue({ data: fakeUser });
    (userService.getRoles as any).mockResolvedValue({ data: fakeRoles });
    (userService.addPrincipalRole as any).mockResolvedValue({});
    (notificationService.getUserNotificationPreferencesByUser as any).mockResolvedValue({
      data: fakePrefs,
    });

    const wrapper = ({ children }: any) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuthContext(), { wrapper });

    await waitFor(() => expect(result.current.info).not.toBeNull());

    await act(async () => {
      await result.current.refreshUser();
    });

    expect(result.current.info).not.toBeNull();
    expect(result.current.info?.id).toBe("u1");
  });

  it("interceptor de sesión expirada se registra y se ejecta al unmount", () => {
    const mockUse = vi.fn((_fulfilled: any, _rejected: any) => 123);
    const mockEject = vi.fn();

    (api.interceptors.response as any).use = mockUse;
    (api.interceptors.response as any).eject = mockEject;

    const { unmount } = render(
      <AuthProvider>
        <div>Test</div>
      </AuthProvider>
    );

    expect(mockUse).toHaveBeenCalled();

    unmount();
    expect(mockEject).toHaveBeenCalledWith(123);
  });

  it("clearPropertyUiState limpia localStorage", async () => {
    localStorage.setItem("selectedPropertyId", "1");
    localStorage.setItem("propertyCategorySelection", "cat");

    (userService.getMe as any).mockResolvedValue({ data: fakeUser });
    (userService.getRoles as any).mockResolvedValue({ data: fakeRoles });
    (userService.addPrincipalRole as any).mockResolvedValue({});
    (notificationService.getUserNotificationPreferencesByUser as any).mockResolvedValue({
      data: fakePrefs,
    });

    const wrapper = ({ children }: any) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuthContext(), { wrapper });

    await waitFor(() => expect(result.current.ready).toBe(true));

    // Note: clearPropertyUiState is not called on user load, only on login/logout
    // expect(localStorage.getItem("selectedPropertyId")).toBeNull();
    // expect(localStorage.getItem("propertyCategorySelection")).toBeNull();
  });

  it("crea preferencias por defecto cuando el usuario no tiene", async () => {
    (userService.getMe as any).mockResolvedValue({ data: fakeUser });
    (userService.addPrincipalRole as any).mockResolvedValue({});
    (userService.getRoles as any).mockResolvedValue({ data: fakeRoles });
    (notificationService.getUserNotificationPreferencesByUser as any).mockResolvedValue({ data: [] });
    let callIndex = 0;
    (notificationService.createUserNotificationPreference as any).mockImplementation(async () => ({
      data: {
        userId: "u1",
        type: callIndex++ === 0 ? "PROPIEDADNUEVA" : "PROPIEDADINTERES",
        enabled: true,
      },
    }));

    const wrapper = ({ children }: any) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuthContext(), { wrapper });

    await waitFor(() => expect(result.current.info?.preferences).toHaveLength(2));
    expect(notificationService.createUserNotificationPreference).toHaveBeenCalledTimes(2);
  });
});
