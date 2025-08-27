/// <reference types="vitest" />
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PropertyCarousel } from "../../../components/propertyDetails/PropertyCarousel";

// Mock de getFullImageUrl
vi.mock("../../../utils/getFullImageUrl", () => ({
  getFullImageUrl: (url: string) => url,
}));

describe("PropertyCarousel", () => {
  const images = [
    { id: 1, url: "img1.jpg" },
    { id: 2, url: "img2.jpg" },
  ];
  const mainImage = "main.jpg";
  const title = "Propiedad Test";

  it("renderiza la imagen principal y miniaturas", () => {
    render(<PropertyCarousel images={images} mainImage={mainImage} title={title} />);

    // Imagen principal
    expect(screen.getByAltText("Imagen 1 de Propiedad Test")).toBeInTheDocument();

    // Miniaturas
    expect(screen.getByAltText("Miniatura 1")).toBeInTheDocument();
    expect(screen.getByAltText("Miniatura 2")).toBeInTheDocument();
    expect(screen.getByAltText("Miniatura 3")).toBeInTheDocument();
  });

  it("muestra el chip de índice correctamente", () => {
    render(<PropertyCarousel images={images} mainImage={mainImage} title={title} />);
    expect(screen.getByText("1/3")).toBeInTheDocument();
  });

  it("cambia de imagen al hacer click en siguiente y anterior", () => {
    render(<PropertyCarousel images={images} mainImage={mainImage} title={title} />);
    
    const nextButton = screen.getByLabelText("Siguiente imagen");
    const prevButton = screen.getByLabelText("Imagen anterior");

    // Inicial
    expect(screen.getByText("1/3")).toBeInTheDocument();

    fireEvent.click(nextButton);
    expect(screen.getByText("2/3")).toBeInTheDocument();

    fireEvent.click(prevButton);
    expect(screen.getByText("1/3")).toBeInTheDocument();
  });

  it("cambia la imagen principal al hacer click en miniatura", () => {
    render(<PropertyCarousel images={images} mainImage={mainImage} title={title} />);
    const thumb2 = screen.getByAltText("Miniatura 2");
    fireEvent.click(thumb2);
    expect(screen.getByText("2/3")).toBeInTheDocument();
  });
});
