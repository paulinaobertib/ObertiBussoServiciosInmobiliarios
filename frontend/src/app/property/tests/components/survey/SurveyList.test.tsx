/// <reference types="vitest" />
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SurveysList } from "../../../components/survey/SurveyList";

describe("SurveysList", () => {
it("muestra mensaje cuando no hay encuestas", () => {
  render(<SurveysList surveys={[]} />);
  expect(
    screen.getByText("No hay valoraciones disponibles.")
  ).toBeInTheDocument();
  expect(
    screen.getByText("Mantente atento a nuevas actualizaciones.")
  ).toBeInTheDocument();
});

  it("renderiza la cantidad correcta de encuestas", () => {
    const surveys = [
      { score: 4, comment: "Muy bueno" },
      { score: 3.5, comment: "Podría mejorar" },
    ];
    render(<SurveysList surveys={surveys} />);
    // No debe aparecer el mensaje vacío
    expect(screen.queryByText("No hay encuestas.")).not.toBeInTheDocument();
    // Debe haber 2 comentarios visibles
    expect(screen.getByText("Muy bueno")).toBeInTheDocument();
    expect(screen.getByText("Podría mejorar")).toBeInTheDocument();
  });

  it("muestra 'Sin comentario' cuando un survey no tiene comentario", () => {
    const surveys = [{ score: 5, comment: "" }];
    render(<SurveysList surveys={surveys} />);
    expect(screen.getByText("Sin comentario")).toBeInTheDocument();
  });
});
