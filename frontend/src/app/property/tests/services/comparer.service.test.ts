import { vi } from "vitest";
import { comparerProperty } from "../../services/comparer.service";
import { api } from "../../../../api";
import { PropertyDTOAI } from "../../types/property";

vi.mock("../../../../api", () => ({
  api: {
    post: vi.fn(),
  },
}));

describe("comparerProperty", () => {
  const mockProperties: PropertyDTOAI[] = [
    {
      name: "Casa 1",
      address: "Calle 1 123",
      latitude: 0,
      longitude: 0,
      rooms: 3,
      bathrooms: 2,
      bedrooms: 2,
      area: 120,
      coveredArea: 100,
      price: 100000,
      operation: "sale",
      type: "Casa",
      amenities: new Set(["pileta", "cochera"]),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("envía el payload correcto a la API y devuelve los datos", async () => {
    const mockResponse = { data: { result: "ok" } };
    (api.post as any).mockResolvedValue(mockResponse);

    const result = await comparerProperty(mockProperties);

    expect(api.post).toHaveBeenCalledWith(
      "/properties/compare",
      [
        {
          ...mockProperties[0],
          amenities: ["pileta", "cochera"], // convertido a array
        },
      ],
      { withCredentials: true }
    );
    expect(result).toEqual(mockResponse.data);
  });

  it("lanza un error si la API falla", async () => {
    (api.post as any).mockRejectedValue(new Error("Network error"));

    await expect(comparerProperty(mockProperties)).rejects.toThrow("Network error");
  });
});
