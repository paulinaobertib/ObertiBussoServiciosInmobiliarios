import { describe, it, expect, vi, beforeEach } from "vitest";
import { createChatSession, createChatSessionWithUser, getChatSessionById, getAllChatSessions } from "../../services/chatSession.service";
import { api } from "../../../../api";
import { ChatSessionDTO } from "../../types/chatSession";

vi.mock("../../../../api", () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe("chatSessionService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

    it("createChatSession - debería enviar una solicitud POST y devolver data", async () => {
    const mockBody: ChatSessionDTO = {
        propertyId: 1,
        phone: "1234567890",
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
    };

    const mockData = { id: 123 };
    (api.post as any).mockResolvedValue({ data: mockData });

    const result = await createChatSession(mockBody);

    expect(api.post).toHaveBeenCalledWith("/properties/chatSession/create", mockBody);
    expect(result).toEqual(mockData);
    });

  it("createChatSessionWithUser - debería enviar POST con params y devolver data", async () => {
    const mockData = { id: 456 };
    (api.post as any).mockResolvedValue({ data: mockData });

    const result = await createChatSessionWithUser("user123", 99);

    expect(api.post).toHaveBeenCalledWith("/properties/chatSession/createUser", null, {
      params: { userId: "user123", propertyId: 99 },
      withCredentials: true,
    });
    expect(result).toEqual(mockData);
  });

  it("getChatSessionById - debería hacer GET con el id y devolver data", async () => {
    const mockData = { id: 789 };
    (api.get as any).mockResolvedValue({ data: mockData });

    const result = await getChatSessionById(789);

    expect(api.get).toHaveBeenCalledWith("/properties/chatSession/getById/789", {
      withCredentials: true,
    });
    expect(result).toEqual(mockData);
  });

  it("getAllChatSessions - debería hacer GET y devolver data", async () => {
    const mockData = [{ id: 1 }, { id: 2 }];
    (api.get as any).mockResolvedValue({ data: mockData });

    const result = await getAllChatSessions();

    expect(api.get).toHaveBeenCalledWith("/properties/chatSession/getAll", {
      withCredentials: true,
    });
    expect(result).toEqual(mockData);
  });

    it("createChatSession - debería lanzar error si falla la solicitud POST", async () => {
    const mockBody: ChatSessionDTO = {
      propertyId: 1,
      phone: "1234567890",
      email: "test@example.com",
      firstName: "John",
      lastName: "Doe",
    };

    const error = new Error("POST failed");
    (api.post as any).mockRejectedValue(error);

    await expect(createChatSession(mockBody)).rejects.toThrow("POST failed");
    expect(api.post).toHaveBeenCalled();
  });

  it("createChatSessionWithUser - debería lanzar error si falla la solicitud POST", async () => {
    const error = new Error("POST with user failed");
    (api.post as any).mockRejectedValue(error);

    await expect(createChatSessionWithUser("user123", 99)).rejects.toThrow("POST with user failed");
    expect(api.post).toHaveBeenCalled();
  });

  it("getChatSessionById - debería lanzar error si falla la solicitud GET", async () => {
    const error = new Error("GET by ID failed");
    (api.get as any).mockRejectedValue(error);

    await expect(getChatSessionById(789)).rejects.toThrow("GET by ID failed");
    expect(api.get).toHaveBeenCalled();
  });

  it("getAllChatSessions - debería lanzar error si falla la solicitud GET", async () => {
    const error = new Error("GET all failed");
    (api.get as any).mockRejectedValue(error);

    await expect(getAllChatSessions()).rejects.toThrow("GET all failed");
    expect(api.get).toHaveBeenCalled();
  });

});
