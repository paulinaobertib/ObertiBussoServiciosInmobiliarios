/// <reference types="vitest" />
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SurveyItem } from "../../../components/survey/SurveyItem";

describe("SurveyItem", () => {
  it("renderiza correctamente con comentario", () => {
    render(<SurveyItem score={4.5} comment="Muy bueno" />);

    // Verificar que el texto del comentario se muestre
    expect(screen.getByText("Muy bueno")).toBeInTheDocument();

    // Verificar que haya al menos un elemento svg que represente las estrellas
    const stars = screen.getAllByRole("img"); // cada estrella es un svg accesible
    expect(stars.length).toBeGreaterThan(0);
  });

  it("muestra 'Sin comentario' cuando no hay comentario", () => {
    render(<SurveyItem score={3} comment="" />);

    expect(screen.getByText("Sin comentario")).toBeInTheDocument();

    const stars = screen.getAllByRole("img");
    expect(stars.length).toBeGreaterThan(0);
  });

  it("muestra el color correcto según si hay comentario", () => {
    const { rerender } = render(<SurveyItem score={5} comment="Excelente" />);
    const textWithComment = screen.getByText("Excelente");
    expect(textWithComment).toHaveClass("MuiTypography-root"); 

    rerender(<SurveyItem score={5} comment="" />);
    const textWithoutComment = screen.getByText("Sin comentario");
    expect(textWithoutComment).toHaveClass("MuiTypography-root");
  });
});
