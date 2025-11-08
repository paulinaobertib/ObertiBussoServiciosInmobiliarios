/// <reference types="vitest" />
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ThemeProvider, createTheme } from "@mui/material/styles";

vi.mock("slick-carousel/slick/slick.css", () => ({}));
vi.mock("slick-carousel/slick/slick-theme.css", () => ({}));

let lastSliderProps: any = null;
vi.mock("react-slick", async () => {
  const MockSlider = (props: any) => {
    lastSliderProps = props;
    return <div data-testid="slider-mock">{props.children}</div>;
  };
  return { __esModule: true, default: MockSlider };
});

import { ImageCarousel } from "../../../components/images/ImageCarousel";

const theme = createTheme();
const renderWithTheme = (ui: React.ReactElement) => render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe("<ImageCarousel />", () => {
  beforeEach(() => {
    lastSliderProps = null;
  });

  it("renderiza los slides con sus imágenes y el logo centrado encima", () => {
    renderWithTheme(<ImageCarousel />);

    // Busca todas las imágenes de los slides
    const slides = screen.getAllByRole("img", { name: /Slide/i });
    const logo = screen.getByRole("img", { name: /Logo/i });

    // Verifica que haya al menos 3 slides (actualmente 8)
    expect(slides.length).toBeGreaterThanOrEqual(3);
    expect(slides.length).toBe(8); // valor actual según tu componente

    // Comprueba que el logo se renderiza
    expect(logo).toBeInTheDocument();

    // Validaciones de estilo (solo verificamos el primero para evitar redundancia)
    expect(slides[0]).toHaveAttribute("style", expect.stringContaining("object-fit: cover"));
    expect(logo).toHaveAttribute("style", expect.stringContaining("drop-shadow(2px 2px 4px rgba(0,0,0,0.6))"));
  });

  it("pasa los settings correctos al <Slider />", () => {
    renderWithTheme(<ImageCarousel />);
    expect(lastSliderProps).toBeTruthy();
    expect(lastSliderProps.autoplay).toBe(true);
    expect(lastSliderProps.slidesToShow).toBe(1);
    expect(lastSliderProps.slidesToScroll).toBe(1);

    const slides = Array.isArray(lastSliderProps.children) ? lastSliderProps.children : [lastSliderProps.children];

    // Verificamos que haya al menos 1 slide (sin importar su tipo)
    expect(slides.length).toBeGreaterThan(0);
  });

  it("estructura DOM: Slider mock seguido por overlays", () => {
    const { container } = renderWithTheme(<ImageCarousel />);
    const slider = screen.getByTestId("slider-mock");
    expect(slider).toBeInTheDocument();

    const imgs = Array.from(container.querySelectorAll("img")).filter((img) => /(Slide|Logo)/i.test(img.alt));
    expect(imgs.length).toBeGreaterThanOrEqual(4);
  });
});
