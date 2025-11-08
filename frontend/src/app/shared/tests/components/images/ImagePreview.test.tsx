import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitForElementToBeRemoved } from "@testing-library/react";
import { ImagePreview } from "../../../components/images/ImagePreview";
import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// Utilidad para renderizar con tema de MUI
const renderWithTheme = (ui: React.ReactElement) => {
  const theme = createTheme();
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe("ImagePreview", () => {
  const mockImage = "https://via.placeholder.com/150";

  it("no renderiza si no hay imágenes ni imagen principal", () => {
    const { container } = renderWithTheme(<ImagePreview main={null} images={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renderiza una imagen principal y otras imágenes", () => {
    renderWithTheme(<ImagePreview main={mockImage} images={[mockImage]} />);
    const imgs = screen.getAllByRole("img");
    expect(imgs.length).toBeGreaterThan(0);
  });

  it("renderiza icono de estrella en la imagen principal", () => {
    renderWithTheme(<ImagePreview main={mockImage} images={[mockImage]} />);
    const starIcon = screen.getByTestId("StarIcon");
    expect(starIcon).toBeInTheDocument();
  });

  it("ejecuta onDelete al hacer clic en el botón de eliminar", () => {
    const onDelete = vi.fn();
    renderWithTheme(<ImagePreview main={mockImage} images={[mockImage]} onDelete={onDelete} />);
    const deleteButton = screen.getByRole("button", { name: /eliminar/i });
    fireEvent.click(deleteButton);
    expect(onDelete).toHaveBeenCalledWith(mockImage);
  });

  it("abre y cierra el lightbox al hacer clic en una imagen", async () => {
    renderWithTheme(<ImagePreview main={mockImage} images={[]} />);
    const image = screen.getByRole("img");
    fireEvent.click(image);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();

    const closeButton = screen.getAllByRole("button")[0];
    fireEvent.click(closeButton);

    await waitForElementToBeRemoved(() => screen.queryByRole("dialog"));
  });

  it("renderiza un video si el archivo tiene extensión de video", () => {
    const { container } = renderWithTheme(<ImagePreview main="video.mp4" images={[]} />);
    const video = container.querySelector("video");
    expect(video).toBeInTheDocument();
  });
});
