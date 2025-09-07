/// <reference types="vitest" />
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, beforeEach, expect } from "vitest";
import { Survey } from "../../../components/survey/SurveyForm";
import * as useSurveyHook from "../../../hooks/useSurvey";
import Swal from "sweetalert2"; // <-- Import default aquí

// Mock de Swal con export default
vi.mock("sweetalert2", async () => {
  const actual = await vi.importActual<any>("sweetalert2");
  return {
    ...actual,
    default: {
      fire: vi.fn().mockResolvedValue({}),
    },
  };
});

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
    // Mock del hook useSurvey incluyendo la propiedad error
    vi.spyOn(useSurveyHook, "useSurvey").mockReturnValue({
      postSurvey: postSurveyMock,
      loading: false,
      error: null,
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

  it("envía la encuesta correctamente y muestra Swal", async () => {
    postSurveyMock.mockResolvedValue({});

    render(<Survey />);

    const button = screen.getByRole("button", { name: /Enviar/i });
    fireEvent.submit(button.closest("form")!);

    await waitFor(() => {
      expect(postSurveyMock).toHaveBeenCalledWith(
        { score: 5, comment: "", inquiryId: 123 },
        "abc"
      );
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: "success" }));
      expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
    });
  });

  it("muestra Swal de error si falla el envío", async () => {
    postSurveyMock.mockRejectedValue({ response: { data: "Error al enviar" } });

    render(<Survey />);

    const button = screen.getByRole("button", { name: /Enviar/i });
    fireEvent.submit(button.closest("form")!);

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
        icon: "error",
        text: "Error al enviar"
      }));
      expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
    });
  });

  it("permite cambiar la puntuación con las estrellas", () => {
    render(<Survey />);
    const stars = screen.getAllByRole("radio"); // Rating genera radios
    fireEvent.click(stars[2]); // seleccionar 3 estrellas
    expect(screen.getByText("Satisfecho")).toBeInTheDocument();
  });
});
