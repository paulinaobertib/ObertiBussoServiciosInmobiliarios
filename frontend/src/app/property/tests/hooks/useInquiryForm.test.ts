import { renderHook, act } from "@testing-library/react";
import { vi } from "vitest";
import { useInquiryForm } from "../../hooks/useInquiryForm";
import { useAuthContext } from "../../../user/context/AuthContext";
import { postInquiry } from "../../services/inquiry.service";

// ---- Mocks ----
vi.mock("../../../user/context/AuthContext", () => ({
  useAuthContext: vi.fn(),
}));
vi.mock("../../services/inquiry.service", () => ({
  postInquiry: vi.fn(),
}));

describe("useInquiryForm", () => {
  const mockPostInquiry = postInquiry as unknown as ReturnType<typeof vi.fn>;
  const mockUseAuthContext = useAuthContext as unknown as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("inicializa el formulario con datos del usuario si está logueado", () => {
    mockUseAuthContext.mockReturnValue({
      info: { firstName: "John", lastName: "Doe", email: "john@test.com", phone: "123", id: 1 },
      isLogged: true,
    });

    const { result } = renderHook(() => useInquiryForm());

    expect(result.current.form.firstName).toBe("John");
    expect(result.current.form.email).toBe("john@test.com");
  });

  it("handleChange actualiza el estado del formulario", () => {
    mockUseAuthContext.mockReturnValue({ info: null, isLogged: false });

    const { result } = renderHook(() => useInquiryForm());

    act(() => {
      result.current.handleChange({
        target: { name: "firstName", value: "Alice" },
      } as any);
    });

    expect(result.current.form.firstName).toBe("Alice");
  });

  it("handleSubmit envía consulta general cuando no hay propertyIds", async () => {
    mockUseAuthContext.mockReturnValue({ info: null, isLogged: false });
    mockPostInquiry.mockResolvedValue({});

    const { result } = renderHook(() => useInquiryForm());

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });

    expect(mockPostInquiry).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Consulta General" })
    );
    expect(result.current.submitted).toBe(true);
  });

  it("handleSubmit envía consulta individual cuando hay 1 propertyId y usuario logueado", async () => {
    mockUseAuthContext.mockReturnValue({
      info: { id: 5, firstName: "Pablo", email: "pablo@test.com" },
      isLogged: true,
    });
    mockPostInquiry.mockResolvedValue({});

    const { result } = renderHook(() => useInquiryForm({ propertyIds: [101] }));

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });

    expect(mockPostInquiry).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Consulta Individual", propertyIds: [101], userId: 5 })
    );
    expect(result.current.submitted).toBe(true);
  });

  it("handleSubmit envía consulta grupal cuando hay más de 1 propertyId", async () => {
    mockUseAuthContext.mockReturnValue({ info: null, isLogged: false });
    mockPostInquiry.mockResolvedValue({});

    const { result } = renderHook(() => useInquiryForm({ propertyIds: [1, 2, 3] }));

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });

    expect(mockPostInquiry).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Consulta Grupal", propertyIds: [1, 2, 3] })
    );
    expect(result.current.submitted).toBe(true);
  });

  it("maneja error en el envío y setea formError", async () => {
    mockUseAuthContext.mockReturnValue({ info: null, isLogged: false });
    mockPostInquiry.mockRejectedValue({ response: { data: "Error del servidor" } });

    const { result } = renderHook(() => useInquiryForm());

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });

    expect(result.current.formError).toBe("Error del servidor");
    expect(result.current.formLoading).toBe(false);
  });

  it("maneja error desconocido en el envío", async () => {
    mockUseAuthContext.mockReturnValue({ info: null, isLogged: false });
    mockPostInquiry.mockRejectedValue(new Error("Fallo inesperado"));

    const { result } = renderHook(() => useInquiryForm());

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as any);
    });

    expect(result.current.formError).toBe("Fallo inesperado");
    expect(result.current.submitted).toBe(false);
  });
});
