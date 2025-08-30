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
    return (
      <div data-testid="slider-mock">
        {props.children}
      </div>
    );
  };
  return { __esModule: true, default: MockSlider };
});

import { ImageCarousel } from "../../../components/images/ImageCarousel"; 

const theme = createTheme();
const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe("<ImageCarousel />", () => {
  beforeEach(() => {
    lastSliderProps = null;
  });

  it("renderiza 3 slides con sus imágenes y el logo centrado encima", () => {
    renderWithTheme(<ImageCarousel />);

    const slide1 = screen.getByRole("img", { name: /Slide 1/i });
    const slide2 = screen.getByRole("img", { name: /Slide 2/i });
    const slide3 = screen.getByRole("img", { name: /Slide 3/i });
    const logo = screen.getByRole("img", { name: /Logo/i });

    expect(slide1).toBeInTheDocument();
    expect(slide2).toBeInTheDocument();
    expect(slide3).toBeInTheDocument();
    expect(logo).toBeInTheDocument();
    expect(slide1).toHaveAttribute("style", expect.stringContaining("object-fit: cover"));
    expect(logo).toHaveAttribute(
      "style",
      expect.stringContaining("drop-shadow(2px 2px 4px rgba(0,0,0,0.6))")
    );
  });

  it("pasa los settings correctos al <Slider />", () => {
    renderWithTheme(<ImageCarousel />);
    expect(lastSliderProps).toBeTruthy();
    expect(lastSliderProps.dots).toBe(false);
    expect(lastSliderProps.infinite).toBe(true);
    expect(lastSliderProps.speed).toBe(600);
    expect(lastSliderProps.slidesToShow).toBe(1);
    expect(lastSliderProps.slidesToScroll).toBe(1);
    expect(lastSliderProps.autoplay).toBe(true);
    expect(lastSliderProps.autoplaySpeed).toBe(3000);
    expect(lastSliderProps.arrows).toBe(false);

    const count = (lastSliderProps && lastSliderProps.children)
      ? (Array.isArray(lastSliderProps.children)
          ? lastSliderProps.children.length
          : 1)
      : 0;
    expect(count).toBe(3);
  });

  it("estructura DOM: Slider mock seguido por 2 overlays (gris y contenedor del logo)", () => {
    const { container } = renderWithTheme(<ImageCarousel />);

    const slider = screen.getByTestId("slider-mock");
    expect(slider).toBeInTheDocument();

    const afterSlider = slider.parentElement?.children;
    expect(afterSlider?.length).toBe(3);

    const overlayGris = afterSlider?.[1] as HTMLElement;
    const overlayLogo = afterSlider?.[2] as HTMLElement;

    expect(overlayGris.querySelector("img")).toBeNull();

    const logo = overlayLogo.querySelector('img[alt="Logo"]') as HTMLImageElement;
    expect(logo).toBeTruthy();

    const allImgs = container.querySelectorAll("img");
    expect(allImgs.length).toBe(4);
  });
});
