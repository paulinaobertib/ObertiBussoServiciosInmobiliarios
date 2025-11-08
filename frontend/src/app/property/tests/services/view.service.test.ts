import { describe, it, expect, vi, beforeEach } from "vitest";
import * as viewService from "../../services/view.service";
import { api } from "../../../../api";
import type {
  ViewsByProperty,
  ViewsByPropertyType,
  ViewsByDay,
  ViewsByMonth,
  ViewsByNeighborhood,
  ViewsByNeighborhoodType,
  ViewsByStatus,
  ViewsByStatusAndType,
  ViewsByOperation,
  ViewsByRooms,
  ViewsByAmenity,
  UserViewDTO,
} from "../../types/view";

vi.mock("../../../../api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("viewService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockUserView: UserViewDTO = {
    userId: "1",
    property: { id: 1 },
  };

  const mockViewsByProperty: ViewsByProperty = { "1": 10 };
  const mockViewsByPropertyType: ViewsByPropertyType = { House: 15 };
  const mockViewsByDay: ViewsByDay = { "2025-08-21": 5 };
  const mockViewsByMonth: ViewsByMonth = { "2025-08": 20 };
  const mockViewsByNeighborhood: ViewsByNeighborhood = { Centro: 8 };
  const mockViewsByNeighborhoodType: ViewsByNeighborhoodType = { ABIERTO: 12 };
  const mockViewsByStatus: ViewsByStatus = { ACTIVE: 18 };
  const mockViewsByStatusAndType: ViewsByStatusAndType = { ACTIVE: { House: 10 } };
  const mockViewsByOperation: ViewsByOperation = { SALE: 22 };
  const mockViewsByRooms: ViewsByRooms = { "2": 5 };
  const mockViewsByAmenity: ViewsByAmenity = { Pool: 7 };

  it("createUserView llama a api.post correctamente", async () => {
    (api.post as any).mockResolvedValue({});

    await viewService.createUserView(mockUserView);
    expect(api.post).toHaveBeenCalledWith("/properties/userViews/create", mockUserView, {
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    });
  });

  it("getViewsByProperty devuelve datos correctamente", async () => {
    (api.get as any).mockResolvedValue({ data: mockViewsByProperty });
    const result = await viewService.getViewsByProperty();
    expect(result).toEqual(mockViewsByProperty);
    expect(api.get).toHaveBeenCalledWith("/properties/view/property", { withCredentials: true });
  });

  it("getViewsByPropertyType devuelve datos correctamente", async () => {
    (api.get as any).mockResolvedValue({ data: mockViewsByPropertyType });
    const result = await viewService.getViewsByPropertyType();
    expect(result).toEqual(mockViewsByPropertyType);
  });

  it("getViewsByDay devuelve datos correctamente", async () => {
    (api.get as any).mockResolvedValue({ data: mockViewsByDay });
    const result = await viewService.getViewsByDay();
    expect(result).toEqual(mockViewsByDay);
  });

  it("getViewsByMonth devuelve datos correctamente", async () => {
    (api.get as any).mockResolvedValue({ data: mockViewsByMonth });
    const result = await viewService.getViewsByMonth();
    expect(result).toEqual(mockViewsByMonth);
  });

  it("getViewsByNeighborhood devuelve datos correctamente", async () => {
    (api.get as any).mockResolvedValue({ data: mockViewsByNeighborhood });
    const result = await viewService.getViewsByNeighborhood();
    expect(result).toEqual(mockViewsByNeighborhood);
  });

  it("getViewsByNeighborhoodType devuelve datos correctamente", async () => {
    (api.get as any).mockResolvedValue({ data: mockViewsByNeighborhoodType });
    const result = await viewService.getViewsByNeighborhoodType();
    expect(result).toEqual(mockViewsByNeighborhoodType);
  });

  it("getViewsByStatus devuelve datos correctamente", async () => {
    (api.get as any).mockResolvedValue({ data: mockViewsByStatus });
    const result = await viewService.getViewsByStatus();
    expect(result).toEqual(mockViewsByStatus);
  });

  it("getViewsByStatusAndType devuelve datos correctamente", async () => {
    (api.get as any).mockResolvedValue({ data: mockViewsByStatusAndType });
    const result = await viewService.getViewsByStatusAndType();
    expect(result).toEqual(mockViewsByStatusAndType);
  });

  it("getViewsByOperation devuelve datos correctamente", async () => {
    (api.get as any).mockResolvedValue({ data: mockViewsByOperation });
    const result = await viewService.getViewsByOperation();
    expect(result).toEqual(mockViewsByOperation);
  });

  it("getViewsByRooms devuelve datos correctamente", async () => {
    (api.get as any).mockResolvedValue({ data: mockViewsByRooms });
    const result = await viewService.getViewsByRooms();
    expect(result).toEqual(mockViewsByRooms);
  });

  it("getViewsByAmenity devuelve datos correctamente", async () => {
    (api.get as any).mockResolvedValue({ data: mockViewsByAmenity });
    const result = await viewService.getViewsByAmenity();
    expect(result).toEqual(mockViewsByAmenity);
  });

  // --- Tests de errores genéricos ---
  it.each([
    ["getViewsByProperty", viewService.getViewsByProperty, "/properties/view/property"],
    ["getViewsByPropertyType", viewService.getViewsByPropertyType, "/properties/view/propertyType"],
    ["getViewsByDay", viewService.getViewsByDay, "/properties/view/day"],
    ["getViewsByMonth", viewService.getViewsByMonth, "/properties/view/month"],
    ["getViewsByNeighborhood", viewService.getViewsByNeighborhood, "/properties/view/neighborhood"],
    ["getViewsByNeighborhoodType", viewService.getViewsByNeighborhoodType, "/properties/view/neighborhoodType"],
    ["getViewsByStatus", viewService.getViewsByStatus, "/properties/view/status"],
    ["getViewsByStatusAndType", viewService.getViewsByStatusAndType, "/properties/view/statusAndType"],
    ["getViewsByOperation", viewService.getViewsByOperation, "/properties/view/operation"],
    ["getViewsByRooms", viewService.getViewsByRooms, "/properties/view/rooms"],
    ["getViewsByAmenity", viewService.getViewsByAmenity, "/properties/view/amenity"],
  ])("lanza error si api.get falla en %s", async (_name, func, url) => {
    (api.get as any).mockRejectedValue(new Error("API failed"));
    await expect(func()).rejects.toThrow("API failed");
    expect(api.get).toHaveBeenCalledWith(url, { withCredentials: true });
  });

  it("lanza error si api.post falla en createUserView", async () => {
    (api.post as any).mockRejectedValue(new Error("API post failed"));
    await expect(viewService.createUserView(mockUserView)).rejects.toThrow("API post failed");
  });
});
