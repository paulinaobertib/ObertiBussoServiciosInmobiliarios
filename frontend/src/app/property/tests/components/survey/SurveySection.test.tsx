/// <reference types="vitest" />
import { render, screen, waitFor } from "@testing-library/react";
import { vi, Mock } from "vitest";
import { SurveysSection } from "../../../components/survey/SurveySection"; 
import { getAllSurveys } from "../../../services/survey.service";

// --- mock del servicio ---
vi.mock("../../../services/survey.service", () => ({
  getAllSurveys: vi.fn(),
}));

describe("SurveysSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra el spinner mientras carga", () => {
    (getAllSurveys as Mock).mockReturnValue(new Promise(() => {})); 
    render(<SurveysSection />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("muestra mensaje de error si falla la carga", async () => {
    (getAllSurveys as Mock).mockRejectedValue(new Error("error"));
    render(<SurveysSection />);

    await waitFor(() => {
      expect(
        screen.getByText("No pudimos cargar las valoraciones.")
      ).toBeInTheDocument();
    });
  });

  it("muestra lista vacía si no hay encuestas", async () => {
    (getAllSurveys as Mock).mockResolvedValue([]);
    render(<SurveysSection />);

    await waitFor(() => {
      expect(
        screen.getByText(/No hay valoraciones disponibles\./i)
      ).toBeInTheDocument();
    });
  });

  it("muestra encuestas si existen", async () => {
    (getAllSurveys as Mock).mockResolvedValue([
      { score: 5, comment: "Excelente servicio" },
      { score: 3, comment: "Regular" },
    ]);

    render(<SurveysSection />);

    await waitFor(() => {
      expect(screen.getByText("Excelente servicio")).toBeInTheDocument();
      expect(screen.getByText("Regular")).toBeInTheDocument();
    });
  });


});
