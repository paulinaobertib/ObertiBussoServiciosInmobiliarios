import { renderHook, act } from "@testing-library/react";
import { vi, type Mock } from "vitest";
import { useCatalog } from "../../hooks/useCatalog";
import { useNavigate } from "react-router-dom";
import { usePropertiesContext } from "../../context/PropertiesContext";
import { useGlobalAlert } from "../../../shared/context/AlertContext";
import { useConfirmDialog } from "../../../shared/components/ConfirmDialog";
import { useAuthContext } from "../../../user/context/AuthContext";
import { useApiErrors } from "../../../shared/hooks/useErrors";
import { deleteProperty } from "../../services/property.service";
import { ROUTES, buildRoute } from "../../../../lib";

// ---- Mocks ----
vi.mock("react-router-dom", () => ({ useNavigate: vi.fn() }));
vi.mock("../../context/PropertiesContext", () => ({ usePropertiesContext: vi.fn() }));
vi.mock("../../../shared/context/AlertContext", () => ({ useGlobalAlert: vi.fn() }));
vi.mock("../../../shared/components/ConfirmDialog", () => ({ useConfirmDialog: vi.fn() }));
vi.mock("../../../user/context/AuthContext", () => ({ useAuthContext: vi.fn() }));
vi.mock("../../../shared/hooks/useErrors", () => ({ useApiErrors: vi.fn() }));
vi.mock("../../services/property.service", () => ({ deleteProperty: vi.fn() }));
vi.mock("../../../../lib", () => ({
  ROUTES: { EDIT_PROPERTY: "/edit/:id", PROPERTY_DETAILS: "/details/:id" },
  buildRoute: (route: string, id: number) => route.replace(":id", String(id)),
}));

describe("useCatalog", () => {
  const mockNavigate = vi.fn();
  const mockShowAlert = vi.fn();
  const mockRefresh = vi.fn();
  const mockToggleCompare = vi.fn();
  const mockAsk = vi.fn();
  const mockOnFinish = vi.fn();
  const mockHandleError = vi.fn();

  const property = { id: 1, title: "Casa Test" } as any;

  beforeEach(() => {
    vi.clearAllMocks();

    (useNavigate as unknown as Mock).mockReturnValue(mockNavigate);
    (useGlobalAlert as unknown as Mock).mockReturnValue({ showAlert: mockShowAlert });
    (useConfirmDialog as unknown as Mock).mockReturnValue({ ask: mockAsk, DialogUI: () => null });
    (usePropertiesContext as unknown as Mock).mockReturnValue({
      propertiesList: [property],
      refreshProperties: mockRefresh,
      selectedPropertyIds: ["1"],
      toggleCompare: mockToggleCompare,
    });
    (useAuthContext as unknown as Mock).mockReturnValue({ isAdmin: true });
    (useApiErrors as unknown as Mock).mockReturnValue({ handleError: mockHandleError });
  });

  it("usa externalProperties si está presente", () => {
    const external = [{ id: 99, title: "Depto Externo" } as any];
    const { result } = renderHook(() => useCatalog({ onFinish: mockOnFinish, externalProperties: external }));
    expect(result.current.propertiesList).toEqual(external);
  });

  it("usa propertiesList del contexto si no hay externalProperties", () => {
    const { result } = renderHook(() => useCatalog({ onFinish: mockOnFinish }));
    expect(result.current.propertiesList).toEqual([property]);
  });

  it("handleClick navega a detalles (modo normal)", () => {
    const { result } = renderHook(() => useCatalog({ onFinish: mockOnFinish }));
    act(() => result.current.handleClick("normal", property));
    expect(mockNavigate).toHaveBeenCalledWith(buildRoute(ROUTES.PROPERTY_DETAILS, property.id));
    expect(mockOnFinish).toHaveBeenCalled();
  });

  it("handleClick navega a editar (modo edit)", () => {
    const { result } = renderHook(() => useCatalog({ onFinish: mockOnFinish }));
    act(() => result.current.handleClick("edit", property));
    expect(mockNavigate).toHaveBeenCalledWith(buildRoute(ROUTES.EDIT_PROPERTY, property.id));
    expect(mockOnFinish).toHaveBeenCalled();
  });

  it("handleClick elimina propiedad (modo delete) exitoso", async () => {
    (deleteProperty as Mock).mockResolvedValue(undefined);
    (mockAsk as Mock).mockImplementation((_msg, cb) => cb());
    const { result } = renderHook(() => useCatalog({ onFinish: mockOnFinish }));

    await act(async () => result.current.handleClick("delete", property));

    expect(deleteProperty).toHaveBeenCalledWith(property);
    expect(mockShowAlert).toHaveBeenCalledWith("Propiedad eliminada con éxito!", "success");
    expect(mockRefresh).toHaveBeenCalledWith('all');
    expect(mockOnFinish).toHaveBeenCalled();
  });

  it("handleClick deleteProperty falla y llama handleError", async () => {
    const error = new Error("fail");
    (deleteProperty as Mock).mockRejectedValue(error);
    (mockAsk as Mock).mockImplementation((_msg, cb) => cb());
    const { result } = renderHook(() => useCatalog({ onFinish: mockOnFinish }));

    await act(async () => result.current.handleClick("delete", property));

    expect(deleteProperty).toHaveBeenCalledWith(property);
    expect(mockHandleError).toHaveBeenCalledWith(error);
    expect(mockOnFinish).toHaveBeenCalled();
  });

  it("handleClick deleteProperty ok pero refreshProperties falla y llama handleError", async () => {
    const refreshError = new Error("refresh fail");
    (deleteProperty as Mock).mockResolvedValue(undefined);
    (usePropertiesContext as unknown as Mock).mockReturnValue({
      propertiesList: [property],
      refreshProperties: vi.fn(() => Promise.reject(refreshError)),
      selectedPropertyIds: ["1"],
      toggleCompare: mockToggleCompare,
    });
    (mockAsk as Mock).mockImplementation((_msg, cb) => cb());
    const { result } = renderHook(() => useCatalog({ onFinish: mockOnFinish }));

    await act(async () => result.current.handleClick("delete", property));

    expect(deleteProperty).toHaveBeenCalledWith(property);
    expect(mockHandleError).toHaveBeenCalledWith(refreshError);
    expect(mockOnFinish).toHaveBeenCalled();
  });

  it("expone DialogUI e isAdmin", () => {
    const { result } = renderHook(() => useCatalog({ onFinish: mockOnFinish }));
    expect(result.current.DialogUI).toBeDefined();
    expect(result.current.isAdmin).toBe(true);
  });

  it("expone toggleCompare y selectedPropertyIds correctamente", () => {
    const { result } = renderHook(() => useCatalog({ onFinish: mockOnFinish }));
    expect(result.current.toggleCompare).toBe(mockToggleCompare);
    expect(result.current.selectedPropertyIds).toEqual(["1"]);
  });

  it("isAdmin false se expone correctamente", () => {
    (useAuthContext as unknown as Mock).mockReturnValue({ isAdmin: false });
    const { result } = renderHook(() => useCatalog({ onFinish: mockOnFinish }));
    expect(result.current.isAdmin).toBe(false);
  });

  it("llama a refreshProperties con 'available' cuando no es admin", async () => {
    (useAuthContext as unknown as Mock).mockReturnValue({ isAdmin: false });
    (mockAsk as Mock).mockImplementation((_msg, cb) => cb());
    const { result } = renderHook(() => useCatalog({ onFinish: mockOnFinish }));

    await act(async () => result.current.handleClick('delete', property));

    expect(mockRefresh).toHaveBeenCalledWith('available');
  });
});
