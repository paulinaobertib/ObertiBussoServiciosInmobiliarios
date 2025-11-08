import { renderHook, act, waitFor } from "@testing-library/react";
import { vi, type Mock } from "vitest";
import { useInquiries, STATUS_OPTIONS } from "../../hooks/useInquiries";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../../user/context/AuthContext";
import { useApiErrors } from "../../../shared/hooks/useErrors";
import * as inquiryService from "../../services/inquiry.service";
import * as propertyService from "../../services/property.service";
import * as chatService from "../../../chat/services/chatSession.service";
import { buildRoute, ROUTES } from "../../../../lib";
import { AxiosResponse } from "axios";

// ---- Mocks ----
vi.mock("react-router-dom", () => ({ useNavigate: vi.fn() }));
vi.mock("../../../user/context/AuthContext", () => ({ useAuthContext: vi.fn() }));
vi.mock("../../../shared/hooks/useErrors", () => ({ useApiErrors: vi.fn() }));
vi.mock("../../services/inquiry.service");
vi.mock("../../services/property.service");
vi.mock("../../../chat/services/chatSession.service");

describe("useInquiries", () => {
  const mockNavigate = vi.fn();
  const mockHandleError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as unknown as Mock).mockReturnValue(mockNavigate);
    (useApiErrors as unknown as Mock).mockReturnValue({ handleError: mockHandleError });
    (useAuthContext as unknown as Mock).mockReturnValue({ info: { id: 1 }, isAdmin: true });
  });

  it("carga propiedades al bootstrap", async () => {
    const mockProps = [{ id: 1, title: "Casa Test" }];
    vi.mocked(propertyService.getAllProperties).mockResolvedValue(mockProps);

    const { result } = renderHook(() => useInquiries());

    await waitFor(() => {
      expect(result.current.properties).toEqual(mockProps);
    });
  });

  it("carga sesiones de chat solo para admin", async () => {
    const mockSessions = [{ id: 1, userId: 2, propertyId: 3 }];
    vi.mocked(chatService.getAllChatSessions).mockResolvedValue(mockSessions);

    const { result } = renderHook(() => useInquiries());

    await waitFor(() => {
      expect(result.current.chatSessions).toEqual(mockSessions);
    });
  });

  it("carga todas las consultas si es admin", async () => {
    const mockInquiries: AxiosResponse<any> = {
      data: [{ id: 1, status: "ABIERTA" }],
      status: 200,
      statusText: "OK",
      headers: {},
      config: {} as any,
    };
    vi.mocked(inquiryService.getAllInquiries).mockResolvedValue(mockInquiries);

    const { result } = renderHook(() => useInquiries());

    await waitFor(() => {
      expect(result.current.inquiries).toEqual(mockInquiries.data);
    });
  });

  it("marca consulta como resuelta", async () => {
    const inq = { id: 1, status: "ABIERTA" } as any;
    const { result } = renderHook(() => useInquiries());
    act(() => result.current.setSelected(inq));

    vi.mocked(inquiryService.updateInquiry).mockResolvedValue({} as AxiosResponse<any>);

    await act(async () => result.current.markResolved(1));

    expect(result.current.actionLoadingId).toBeNull();
    expect(result.current.inquiries.find((i) => i.id === 1)?.status).toBe("CERRADA");
  });

  it("navega a propiedad correctamente", () => {
    const { result } = renderHook(() => useInquiries());
    act(() => result.current.goToProperty(99));
    expect(mockNavigate).toHaveBeenCalledWith(buildRoute(ROUTES.PROPERTY_DETAILS, 99));
  });

  it("closeChatSession llama loadChatSessions y maneja errores", async () => {
    const { result } = renderHook(() => useInquiries());
    vi.mocked(chatService.getAllChatSessions).mockRejectedValue(new Error("fail"));

    await act(async () => result.current.closeChatSession(1));
    expect(result.current.actionLoadingId).toBeNull();
    expect(mockHandleError).toHaveBeenCalled();
  });

  it("exponen filtros y STATUS_OPTIONS correctamente", () => {
    const { result } = renderHook(() => useInquiries());
    expect(result.current.filterStatus).toBe("");
    expect(result.current.filterProp).toBe("");
    expect(result.current.STATUS_OPTIONS).toEqual(STATUS_OPTIONS);
  });

  it("carga consultas filtradas por propertyIds", async () => {
    const mockRes: AxiosResponse<any> = {
      data: [{ id: 10 }],
      status: 200,
      statusText: "OK",
      headers: {},
      config: {} as any,
    };
    vi.mocked(inquiryService.getInquiriesByProperty).mockResolvedValue(mockRes);

    const { result } = renderHook(() => useInquiries({ propertyIds: [5] }));

    await waitFor(() => {
      expect(result.current.inquiries).toEqual(mockRes.data);
    });
  });

  it("maneja error al cargar propiedades", async () => {
    vi.mocked(propertyService.getAllProperties).mockRejectedValue(new Error("fail"));
    renderHook(() => useInquiries());

    await waitFor(() => {
      expect(mockHandleError).toHaveBeenCalled();
    });
  });
});
