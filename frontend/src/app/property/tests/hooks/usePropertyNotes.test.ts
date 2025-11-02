import { renderHook, act, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { usePropertyNotes } from "../../hooks/usePropertyNotes";
import * as propertyService from "../../services/property.service";
import * as commentService from "../../services/comment.service";
import * as maintenanceService from "../../services/maintenance.service";
import * as errorsHook from "../../../shared/hooks/useErrors";
import { useGlobalAlert } from "../../../shared/context/AlertContext";

vi.mock("../../services/property.service");
vi.mock("../../services/comment.service");
vi.mock("../../services/maintenance.service");
vi.mock("../../../shared/hooks/useErrors");
vi.mock("../../../shared/context/AlertContext", () => ({
  useGlobalAlert: vi.fn(),
}));

describe("usePropertyNotes", () => {
  const mockHandleError = vi.fn();
  const mockSuccess = vi.fn();
  const mockShowAlert = vi.fn();
  const mockDoubleConfirm = vi.fn().mockResolvedValue(true);

  beforeEach(() => {
    vi.clearAllMocks();
    (errorsHook.useApiErrors as any).mockReturnValue({
      handleError: mockHandleError,
    });
    (useGlobalAlert as any).mockReturnValue({
      success: mockSuccess,
      showAlert: mockShowAlert,
      doubleConfirm: mockDoubleConfirm,
    });
  });

  it("carga property, comments y maintenances correctamente", async () => {
    const fakeProp = { id: 1, title: "Casa" };
    const fakeComments = [{ id: 1, text: "Comentario" }];
    const fakeMaintenances = [{ id: 1, task: "Mantenimiento" }];

    (propertyService.getPropertyById as any).mockResolvedValue(fakeProp);
    (commentService.getCommentsByPropertyId as any).mockResolvedValue(fakeComments);
    (maintenanceService.getMaintenancesByPropertyId as any).mockResolvedValue(fakeMaintenances);

    const { result } = renderHook(() => usePropertyNotes(1));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.property).toEqual(fakeProp);
      expect(result.current.comments).toEqual(fakeComments);
      expect(result.current.maintenances).toEqual(fakeMaintenances);
      expect(result.current.loading).toBe(false);
    });
  });

  it("maneja errores en la carga inicial", async () => {
    const error = new Error("Fail");
    (propertyService.getPropertyById as any).mockRejectedValue(error);
    (commentService.getCommentsByPropertyId as any).mockRejectedValue(error);
    (maintenanceService.getMaintenancesByPropertyId as any).mockRejectedValue(error);

    const { result } = renderHook(() => usePropertyNotes(1));

    await waitFor(() => {
      expect(mockHandleError).toHaveBeenCalled();
      expect(result.current.loading).toBe(false);
    });
  });

  it("refreshComments actualiza comentarios", async () => {
    const newComments = [{ id: 2, text: "Otro comentario" }];
    (commentService.getCommentsByPropertyId as any).mockResolvedValue(newComments);

    const { result } = renderHook(() => usePropertyNotes(1));

    await act(async () => {
      await result.current.refreshComments();
    });

    expect(result.current.comments).toEqual(newComments);
    expect(result.current.loadingComments).toBe(false);
  });

  it("refreshMaintenances actualiza mantenimientos", async () => {
    const newMaintenances = [{ id: 2, task: "Otro mantenimiento" }];
    (maintenanceService.getMaintenancesByPropertyId as any).mockResolvedValue(newMaintenances);

    const { result } = renderHook(() => usePropertyNotes(1));

    await act(async () => {
      await result.current.refreshMaintenances();
    });

    expect(result.current.maintenances).toEqual(newMaintenances);
    expect(result.current.loadingMaintenances).toBe(false);
  });

  it("removeComment elimina un comentario exitosamente", async () => {
    const comment = {
      id: 1,
      text: "Test comment",
      userId: "user1",
      description: "Test",
      date: "2024-01-01",
      propertyId: 1,
    };
    (commentService.deleteComment as any).mockResolvedValue({});
    (commentService.getCommentsByPropertyId as any).mockResolvedValue([]);

    const { result } = renderHook(() => usePropertyNotes(1));

    await act(async () => {
      await result.current.removeComment(comment);
    });

    expect(mockDoubleConfirm).toHaveBeenCalled();
    expect(commentService.deleteComment).toHaveBeenCalledWith(comment);
    expect(mockSuccess).toHaveBeenCalled();
  });

  it("removeMaintenance elimina un mantenimiento exitosamente", async () => {
    const maintenance = {
      id: 1,
      task: "Test maintenance",
      title: "Test",
      description: "Test description",
      date: "2024-01-01",
      propertyId: 1,
    };
    (maintenanceService.deleteMaintenance as any).mockResolvedValue({});
    (maintenanceService.getMaintenancesByPropertyId as any).mockResolvedValue([]);

    const { result } = renderHook(() => usePropertyNotes(1));

    await act(async () => {
      await result.current.removeMaintenance(maintenance);
    });

    expect(mockDoubleConfirm).toHaveBeenCalled();
    expect(maintenanceService.deleteMaintenance).toHaveBeenCalledWith(maintenance);
    expect(mockSuccess).toHaveBeenCalled();
  });

  it("removeMaintenance no elimina si el usuario cancela", async () => {
    const maintenance = {
      id: 1,
      task: "Test maintenance",
      title: "Test",
      description: "Test description",
      date: "2024-01-01",
      propertyId: 1,
    };
    (useGlobalAlert as any).mockReturnValue({
      success: mockSuccess,
      doubleConfirm: vi.fn().mockResolvedValue(false),
    });

    const { result } = renderHook(() => usePropertyNotes(1));

    await act(async () => {
      await result.current.removeMaintenance(maintenance);
    });

    expect(maintenanceService.deleteMaintenance).not.toHaveBeenCalled();
  });

  it("maneja errores al eliminar comentario", async () => {
    const comment = {
      id: 1,
      text: "Test comment",
      userId: "user1",
      description: "Test",
      date: "2024-01-01",
      propertyId: 1,
    };
    const error = new Error("Delete failed");
    (commentService.deleteComment as any).mockRejectedValue(error);

    const { result } = renderHook(() => usePropertyNotes(1));

    await act(async () => {
      await result.current.removeComment(comment);
    });

    expect(mockHandleError).toHaveBeenCalledWith(error);
  });

  it("maneja errores al eliminar mantenimiento", async () => {
    const maintenance = {
      id: 1,
      task: "Test maintenance",
      title: "Test",
      description: "Test description",
      date: "2024-01-01",
      propertyId: 1,
    };
    const error = new Error("Delete failed");
    (maintenanceService.deleteMaintenance as any).mockRejectedValue(error);

    const { result } = renderHook(() => usePropertyNotes(1));

    await act(async () => {
      await result.current.removeMaintenance(maintenance);
    });

    expect(mockHandleError).toHaveBeenCalledWith(error);
  });
});
