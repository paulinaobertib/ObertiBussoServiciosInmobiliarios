import { renderHook, act } from "@testing-library/react";
import { vi, type Mock } from "vitest";
import { useInquiryForm } from "../../hooks/useInquiryForm";
import { useAuthContext } from "../../../user/context/AuthContext";
import { useApiErrors } from "../../../shared/hooks/useErrors";
import { useGlobalAlert } from "../../../shared/context/AlertContext";
import { postInquiry } from "../../services/inquiry.service";
import { FormEvent } from "react";

// ---- Mocks ----
vi.mock("../../../user/context/AuthContext", () => ({ useAuthContext: vi.fn() }));
vi.mock("../../../shared/hooks/useErrors", () => ({ useApiErrors: vi.fn() }));
vi.mock("../../../shared/context/AlertContext", () => ({ useGlobalAlert: vi.fn() }));
vi.mock("../../services/inquiry.service");

describe("useInquiryForm", () => {
  const mockHandleError = vi.fn();
  const mockSuccess = vi.fn();
  const mockShowAlert = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useApiErrors as unknown as Mock).mockReturnValue({ handleError: mockHandleError });
    (useGlobalAlert as unknown as Mock).mockReturnValue({
      success: mockSuccess,
      showAlert: mockShowAlert,
    });
  });

  it("inicializa el formulario con datos del usuario logueado", () => {
    (useAuthContext as unknown as Mock).mockReturnValue({
      info: { firstName: "John", lastName: "Doe", email: "john@example.com", phone: "123456", id: 1 },
      isLogged: true,
    });

    const { result } = renderHook(() => useInquiryForm());

    expect(result.current.form.firstName).toBe("John");
    expect(result.current.form.lastName).toBe("Doe");
    expect(result.current.form.email).toBe("john@example.com");
    expect(result.current.form.phone).toBe("123456");
    expect(result.current.form.description).toBe("");
    expect(result.current.formLoading).toBe(false);
  });

  it("actualiza los campos con handleChange", () => {
    (useAuthContext as unknown as Mock).mockReturnValue({ info: {}, isLogged: false });
    const { result } = renderHook(() => useInquiryForm());

    act(() => {
      result.current.handleChange({ target: { name: "firstName", value: "Alice" } } as any);
      result.current.handleChange({ target: { name: "description", value: "Test desc" } } as any);
    });

    expect(result.current.form.firstName).toBe("Alice");
    expect(result.current.form.description).toBe("Test desc");
  });

  it("envía el formulario para usuario logueado", async () => {
    (useAuthContext as unknown as Mock).mockReturnValue({
      info: { id: 1 },
      isLogged: true,
    });

    vi.mocked(postInquiry).mockResolvedValue({} as any);

    const { result } = renderHook(() => useInquiryForm({ propertyIds: [5] }));

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: () => {} } as FormEvent<HTMLFormElement>);
    });

    expect(postInquiry).toHaveBeenCalledWith({
      userId: 1,
      title: "Consulta Individual",
      description: "",
      propertyIds: [5],
    });
    expect(mockSuccess).toHaveBeenCalled();
    expect(result.current.formLoading).toBe(false);
  });

  it("envía el formulario para usuario no logueado", async () => {
    (useAuthContext as unknown as Mock).mockReturnValue({ info: {}, isLogged: false });

    vi.mocked(postInquiry).mockResolvedValue({} as any);

    const { result } = renderHook(() => useInquiryForm());

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: () => {} } as FormEvent<HTMLFormElement>);
    });

    expect(postInquiry).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        title: "Consulta General",
        description: "",
      })
    );
    expect(mockSuccess).toHaveBeenCalled();
    expect(result.current.formLoading).toBe(false);
  });

  it("maneja error al enviar el formulario", async () => {
    (useAuthContext as unknown as Mock).mockReturnValue({ info: {}, isLogged: false });

    vi.mocked(postInquiry).mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() => useInquiryForm());

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: () => {} } as FormEvent<HTMLFormElement>);
    });

    expect(mockHandleError).toHaveBeenCalled();
    expect(result.current.formLoading).toBe(false);
  });
});
