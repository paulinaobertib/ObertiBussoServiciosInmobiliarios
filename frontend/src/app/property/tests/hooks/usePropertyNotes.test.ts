import { renderHook, act, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { usePropertyNotes } from "../../hooks/usePropertyNotes";
import * as propertyService from "../../services/property.service";
import * as commentService from "../../services/comment.service";
import * as maintenanceService from "../../services/maintenance.service";
import * as errorsHook from "../../../shared/hooks/useErrors";

vi.mock("../../services/property.service");
vi.mock("../../services/comment.service");
vi.mock("../../services/maintenance.service");
vi.mock("../../../shared/hooks/useErrors");

describe("usePropertyNotes", () => {
  const mockHandleError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (errorsHook.useApiErrors as any).mockReturnValue({
      handleError: mockHandleError,
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

    // Esperamos que loading sea true al inicio
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

  it("refreshComments actualiza comentarios y maneja errores", async () => {
    const newComments = [{ id: 2, text: "Otro comentario" }];
    (commentService.getCommentsByPropertyId as any).mockResolvedValue(newComments);

    const { result } = renderHook(() => usePropertyNotes(1));

    await act(async () => {
      await result.current.refreshComments();
    });

    expect(result.current.comments).toEqual(newComments);
    expect(result.current.loadingComments).toBe(false);
  });

  it("refreshMaintenances actualiza mantenimientos y maneja errores", async () => {
    const newMaintenances = [{ id: 2, task: "Otro mantenimiento" }];
    (maintenanceService.getMaintenancesByPropertyId as any).mockResolvedValue(newMaintenances);

    const { result } = renderHook(() => usePropertyNotes(1));

    await act(async () => {
      await result.current.refreshMaintenances();
    });

    expect(result.current.maintenances).toEqual(newMaintenances);
    expect(result.current.loadingMaintenances).toBe(false);
  });
});
