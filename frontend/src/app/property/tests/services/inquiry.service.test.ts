import { vi, describe, it, expect, beforeEach } from "vitest";
import * as inquiryService from "../../services/inquiry.service";
import { api } from "../../../../api";
import { InquiryCreateAuth, InquiryCreateAnon, InquiryStatus } from "../../types/inquiry";

vi.mock("../../../../api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe("inquiryService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const authInquiry: InquiryCreateAuth = {
    title: "Consulta",
    description: "Me interesa esta propiedad",
    propertyIds: [1],
    userId: "user1",
  };

  const anonInquiry: InquiryCreateAnon = {
    title: "Consulta anónima",
    description: "Información",
    propertyIds: [2],
    email: "test@test.com",
    phone: "123456789",
    firstName: "John",
    lastName: "Doe",
  };

  const mockResponse = { data: { id: 1 } };

  it("postInquiry con auth y anon funciona correctamente", async () => {
    (api.post as any).mockResolvedValue(mockResponse);

    const resultAuth = await inquiryService.postInquiry(authInquiry);
    expect(resultAuth).toEqual(mockResponse);
    expect(api.post).toHaveBeenCalledWith(
      "/properties/inquiries/create",
      authInquiry,
      { withCredentials: true }
    );

    const resultAnon = await inquiryService.postInquiry(anonInquiry);
    expect(resultAnon).toEqual(mockResponse);
    expect(api.post).toHaveBeenCalledWith(
      "/properties/inquiries/create",
      anonInquiry,
      { withCredentials: true }
    );
  });

  it("lanza error si postInquiry falla", async () => {
    (api.post as any).mockRejectedValue(new Error("Post failed"));
    await expect(inquiryService.postInquiry(authInquiry)).rejects.toThrow("Post failed");
  });

  it("updateInquiry llama a api.put con id", async () => {
    (api.put as any).mockResolvedValue(mockResponse);
    const result = await inquiryService.updateInquiry(5);
    expect(result).toEqual(mockResponse);
    expect(api.put).toHaveBeenCalledWith(
      "/properties/inquiries/status/5",
      null,
      { withCredentials: true }
    );
  });

  it("lanza error si updateInquiry falla", async () => {
    (api.put as any).mockRejectedValue(new Error("Update failed"));
    await expect(inquiryService.updateInquiry(5)).rejects.toThrow("Update failed");
  });

  it("getInquiryById llama a api.get correctamente", async () => {
    (api.get as any).mockResolvedValue(mockResponse);
    const result = await inquiryService.getInquiryById(1);
    expect(result).toEqual(mockResponse);
    expect(api.get).toHaveBeenCalledWith(
      "/properties/inquiries/getById/1",
      { withCredentials: true }
    );
  });

  it("getAllInquiries llama a api.get correctamente", async () => {
    (api.get as any).mockResolvedValue(mockResponse);
    const result = await inquiryService.getAllInquiries();
    expect(result).toEqual(mockResponse);
    expect(api.get).toHaveBeenCalledWith(
      "/properties/inquiries/getAll",
      { withCredentials: true }
    );
  });

  it("getInquiriesByUser llama a api.get correctamente", async () => {
    (api.get as any).mockResolvedValue(mockResponse);
    const result = await inquiryService.getInquiriesByUser("user1");
    expect(result).toEqual(mockResponse);
    expect(api.get).toHaveBeenCalledWith(
      "/properties/inquiries/user/user1",
      { withCredentials: true }
    );
  });

  it("getInquiriesByProperty llama a api.get correctamente", async () => {
    (api.get as any).mockResolvedValue(mockResponse);
    const result = await inquiryService.getInquiriesByProperty(10);
    expect(result).toEqual(mockResponse);
    expect(api.get).toHaveBeenCalledWith(
      "/properties/inquiries/property/10",
      { withCredentials: true }
    );
  });

  it("getInquiriesByStatus llama a api.get correctamente", async () => {
    (api.get as any).mockResolvedValue(mockResponse);
    const result = await inquiryService.getInquiriesByStatus("ABIERTA" as InquiryStatus);
    expect(result).toEqual(mockResponse);
    expect(api.get).toHaveBeenCalledWith(
      "/properties/inquiries/getByStatus",
      { params: { status: "ABIERTA" }, withCredentials: true }
    );
  });

  it("estadísticas llaman a api.get correctamente", async () => {
    (api.get as any).mockResolvedValue(mockResponse);

    await inquiryService.getAverageInquiryResponseTime();
    await inquiryService.getInquiryStatusDistribution();
    await inquiryService.getInquiriesGroupedByDayOfWeek();
    await inquiryService.getInquiriesGroupedByTimeRange();
    await inquiryService.getInquiriesPerMonth();
    await inquiryService.getMostConsultedProperties();

    expect(api.get).toHaveBeenCalledTimes(6);
  });

  it("lanza error si api.get falla", async () => {
    (api.get as any).mockRejectedValue(new Error("Network error"));
    await expect(inquiryService.getAllInquiries()).rejects.toThrow("Network error");
    await expect(inquiryService.getInquiryById(1)).rejects.toThrow("Network error");
    await expect(inquiryService.getInquiriesByUser("user1")).rejects.toThrow("Network error");
  });
});
