import { renderHook, act, waitFor } from "@testing-library/react";
import { vi, type Mock } from "vitest";
import { useInquiries, STATUS_OPTIONS } from "../../hooks/useInquiries";
import * as inquiryService from "../../services/inquiry.service";
import * as chatService from "../../../chat/services/chatSession.service";
import * as propertyService from "../../services/property.service";
import { useAuthContext } from "../../../user/context/AuthContext";
import { useNavigate } from "react-router-dom";

// ---- Mocks ----
vi.mock("../../services/inquiry.service");
vi.mock("../../../chat/services/chatSession.service");
vi.mock("../../services/property.service");
vi.mock("../../../user/context/AuthContext");
vi.mock("react-router-dom", () => ({ useNavigate: vi.fn() }));
vi.mock("../../../../lib", () => ({
  buildRoute: (route: string, id: number) => `${route.replace(":id", String(id))}`,
  ROUTES: { PROPERTY_DETAILS: "/details/:id" },
}));

describe("useInquiries", () => {
  const mockNavigate = vi.fn();
  const mockInfo = { id: 1, name: "Test User" };

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as Mock).mockReturnValue(mockNavigate);
    (useAuthContext as Mock).mockReturnValue({ info: mockInfo, isAdmin: true });
  });

  it("carga todas las consultas para admin", async () => {
    (inquiryService.getAllInquiries as Mock).mockResolvedValue({ data: [{ id: 1, status: "ABIERTA" }] });
    (propertyService.getAllProperties as Mock).mockResolvedValue([{ id: 10, title: "Prop1" }]);
    (chatService.getAllChatSessions as Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useInquiries());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.inquiries).toEqual([{ id: 1, status: "ABIERTA" }]);
    expect(result.current.properties).toEqual([{ id: 10, title: "Prop1" }]);
  });

  it("aplica filtros de estado correctamente", async () => {
    (inquiryService.getInquiriesByStatus as Mock).mockResolvedValue({ data: [{ id: 2, status: "CERRADA" }] });

    const { result } = renderHook(() => useInquiries());

    await act(async () => {
      result.current.setFilterStatus("CERRADA");
    });

    await waitFor(() => expect(result.current.filterStatus).toBe("CERRADA"));
    expect(inquiryService.getInquiriesByStatus).toHaveBeenCalledWith("CERRADA");
  });

  it("aplica filtro combinado de estado y propiedad para admin", async () => {
    (inquiryService.getInquiriesByProperty as Mock).mockResolvedValue({
      data: [{ id: 1, status: "ABIERTA" }, { id: 2, status: "CERRADA" }],
    });

    const { result } = renderHook(() => useInquiries());

    await act(async () => {
      result.current.setFilterStatus("ABIERTA");
      result.current.setFilterProp("1");
    });

    await waitFor(() => expect(result.current.inquiries.length).toBe(1));
    expect(result.current.inquiries[0].status).toBe("ABIERTA");
  });

  it("marca una consulta como resuelta y refresca lista", async () => {
    (inquiryService.updateInquiry as Mock).mockResolvedValue({});
    (inquiryService.getAllInquiries as Mock).mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useInquiries());

    await act(async () => {
      await result.current.markResolved(1);
    });

    expect(inquiryService.updateInquiry).toHaveBeenCalledWith(1);
    expect(result.current.actionLoadingId).toBeNull();
  });

  it("navega a detalle de propiedad", () => {
    const { result } = renderHook(() => useInquiries());
    act(() => result.current.goToProperty(10));

    expect(mockNavigate).toHaveBeenCalledWith("/details/10");
  });

  it("cierra chat session correctamente", async () => {
    (chatService.getAllChatSessions as Mock).mockResolvedValue([
      { id: 1, userId: 2, phone: "", email: "", firstName: "", lastName: "", date: "", dateClose: null, propertyId: 5 }
    ]);

    const { result } = renderHook(() => useInquiries());

    await act(async () => {
      await result.current.closeChatSession(1);
    });

    expect(result.current.actionLoadingId).toBeNull();
  });

  it("carga consultas para propertyIds específicas", async () => {
    (inquiryService.getInquiriesByProperty as Mock).mockImplementation((id) =>
      Promise.resolve({ data: [{ id, status: "ABIERTA" }] })
    );

    const { result } = renderHook(() => useInquiries({ propertyIds: [10, 20] }));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.inquiries).toEqual([
      { id: 10, status: "ABIERTA" },
      { id: 20, status: "ABIERTA" },
    ]);
  });

  it("maneja error al cargar consultas", async () => {
    (inquiryService.getAllInquiries as Mock).mockRejectedValue(new Error("fail"));
    const { result } = renderHook(() => useInquiries());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.errorList).toBe("Error al cargar consultas");
  });

  it("maneja error al aplicar filtros", async () => {
    (inquiryService.getInquiriesByStatus as Mock).mockRejectedValue(new Error("fail"));
    const { result } = renderHook(() => useInquiries());

    await act(async () => {
      result.current.setFilterStatus("ABIERTA");
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.errorList).toBe("Error al aplicar filtros");
  });

  it("filtra consultas localmente para usuario no admin", async () => {
    (useAuthContext as Mock).mockReturnValue({ info: mockInfo, isAdmin: false });
    const inquiries = [
      { id: 1, status: "ABIERTA", propertyTitles: ["Prop1"] },
      { id: 2, status: "CERRADA", propertyTitles: ["Prop2"] },
    ];
    (inquiryService.getInquiriesByUser as Mock).mockResolvedValue({ data: inquiries });

    const { result } = renderHook(() => useInquiries());

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setFilterStatus("ABIERTA"));
    expect(result.current.inquiries).toEqual([inquiries[0]]);
  });

  it("exposa opciones de estado", () => {
    const { result } = renderHook(() => useInquiries());
    expect(result.current.STATUS_OPTIONS).toEqual(STATUS_OPTIONS);
  });
});
