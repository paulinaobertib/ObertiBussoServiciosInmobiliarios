import { renderHook, act, waitFor } from "@testing-library/react";
import { vi, Mock } from "vitest";
import { usePropertyNotes } from "../../hooks/usePropertyNotes";
import * as propertyService from "../../services/property.service";
import * as commentService from "../../services/comment.service";
import * as maintenanceService from "../../services/maintenance.service";

// ─── mocks ───
vi.mock("../../services/property.service", () => ({
  getPropertyById: vi.fn(),
}));

vi.mock("../../services/comment.service", () => ({
  getCommentsByPropertyId: vi.fn(),
}));

vi.mock("../../services/maintenance.service", () => ({
  getMaintenancesByPropertyId: vi.fn(),
}));

describe("usePropertyNotes", () => {
  const mockGetPropertyById = propertyService.getPropertyById as Mock;
  const mockGetComments = commentService.getCommentsByPropertyId as Mock;
  const mockGetMaintenances = maintenanceService.getMaintenancesByPropertyId as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("carga property, comments y maintenances al iniciar", async () => {
    mockGetPropertyById.mockResolvedValue({ id: 1, title: "Prop 1" });
    mockGetComments.mockResolvedValue([{ id: 10, text: "Com" }]);
    mockGetMaintenances.mockResolvedValue([{ id: 20, description: "Main" }]);

    const { result } = renderHook(() => usePropertyNotes(1));

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.property).toEqual({ id: 1, title: "Prop 1" });
    expect(result.current.comments).toEqual([{ id: 10, text: "Com" }]);
    expect(result.current.maintenances).toEqual([{ id: 20, description: "Main" }]);
  });

  it("refreshComments actualiza los comentarios", async () => {
    mockGetComments.mockResolvedValue([{ id: 11, text: "Nuevo" }]);
    const { result } = renderHook(() => usePropertyNotes(2));

    await act(async () => {
      await result.current.refreshComments();
    });

    expect(result.current.comments).toEqual([{ id: 11, text: "Nuevo" }]);
    expect(result.current.loadingComments).toBe(false);
  });

  it("refreshMaintenances actualiza los mantenimientos", async () => {
    mockGetMaintenances.mockResolvedValue([{ id: 21, description: "Update" }]);
    const { result } = renderHook(() => usePropertyNotes(3));

    await act(async () => {
      await result.current.refreshMaintenances();
    });

    expect(result.current.maintenances).toEqual([{ id: 21, description: "Update" }]);
    expect(result.current.loadingMaintenances).toBe(false);
  });

  it("maneja valores nulos devolviendo arrays vacíos", async () => {
    mockGetPropertyById.mockResolvedValue(null);
    mockGetComments.mockResolvedValue(null);
    mockGetMaintenances.mockResolvedValue(null);

    const { result } = renderHook(() => usePropertyNotes(4));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.property).toBeNull();
    expect(result.current.comments).toEqual([]);
    expect(result.current.maintenances).toEqual([]);
  });
});
