/// <reference types="vitest" />
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, beforeEach, expect } from "vitest";
import { Survey } from "../../../components/survey/SurveyForm";
import * as useSurveyHook from "../../../hooks/useSurvey";
const successMock = vi.fn();
const errorMock = vi.fn();
const useGlobalAlertMock = vi.fn();

vi.mock("../../../../shared/context/AlertContext", () => ({
  useGlobalAlert: () => useGlobalAlertMock(),
}));

// Mock de useNavigate y useParams
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ inquiryId: "123", token: "abc" }),
  };
});

describe("Survey", () => {
  const postSurveyMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // 👇 usamos `as any` para meter `error` en el mock
    vi.spyOn(useSurveyHook, "useSurvey").mockReturnValue({
      postSurvey: postSurveyMock,
      loading: false,
      error: null,
    } as any);
    successMock.mockResolvedValue(undefined);
    errorMock.mockResolvedValue(undefined);
    useGlobalAlertMock.mockReturnValue({
      success: successMock,
      error: errorMock,
    });
  });

  it("renderiza correctamente los elementos", () => {
    render(<Survey />);
    expect(screen.getByText(/¿Cómo calificarías tu nivel de satisfacción/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Comentario/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Enviar/i })).toBeInTheDocument();
  });

  it("actualiza el comentario al escribir en el textarea", () => {
    render(<Survey />);
    const textarea = screen.getByLabelText(/Comentario/i);
    fireEvent.change(textarea, { target: { value: "Muy bueno" } });
    expect(textarea).toHaveValue("Muy bueno");
  });

  it("envía la encuesta correctamente y muestra alerta de éxito", async () => {
    postSurveyMock.mockResolvedValue({});

    render(<Survey />);

    const button = screen.getByRole("button", { name: /Enviar/i });
    fireEvent.submit(button.closest("form")!);

    await waitFor(() => {
      expect(postSurveyMock).toHaveBeenCalledWith({ score: 5, comment: "", inquiryId: 123 }, "abc");
      expect(successMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "¡Muchas gracias!",
          primaryLabel: "Finalizar",
        })
      );
      expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
    });
  });

  it("muestra alerta de error si falla el envío", async () => {
    postSurveyMock.mockRejectedValue({
      response: { data: "Error al enviar" },
    });

    render(<Survey />);

    const button = screen.getByRole("button", { name: /Enviar/i });
    fireEvent.submit(button.closest("form")!);

    await waitFor(() => {
      expect(errorMock).toHaveBeenCalledWith(
        expect.objectContaining({
          description: "Error al enviar",
          primaryLabel: "Finalizar",
        })
      );
      expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
    });
  });

  it("permite cambiar la puntuación con las estrellas", () => {
    render(<Survey />);
    const stars = screen.getAllByRole("radio");
    fireEvent.click(stars[2]); // seleccionar 3 estrellas
    expect(screen.getByText("Satisfecho")).toBeInTheDocument();
  });
});
