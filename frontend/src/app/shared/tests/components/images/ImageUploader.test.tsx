/// <reference types="vitest" />
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// Ajustá esta ruta si tu estructura difiere
import { ImageUploader } from "../../../components/images/ImageUploader";

const theme = createTheme();
const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

describe("<ImageUploader />", () => {
  const onSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza el label y el input file oculto", () => {
    renderWithTheme(
      <ImageUploader label="Subir archivos" onSelect={onSelect} />
    );

    expect(
      screen.getByText(/Subir archivos/i)
    ).toBeInTheDocument();

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeTruthy();
    // el atributo hidden está presente
    expect(input.hasAttribute("hidden")).toBe(true);
  });

  it("usa accept 'image/*,video/*' cuando imagesOnly=false (default) y 'image/*' cuando imagesOnly=true", () => {
    const { rerender } = renderWithTheme(
      <ImageUploader label="Label" onSelect={onSelect} />
    );
    let input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input.accept).toBe("image/*,video/*");

    rerender(
      <ThemeProvider theme={theme}>
        <ImageUploader label="Label" onSelect={onSelect} imagesOnly />
      </ThemeProvider>
    );
    input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input.accept).toBe("image/*");
  });

  it("prop multiple se refleja en el input file", () => {
    const { rerender } = renderWithTheme(
      <ImageUploader label="L" onSelect={onSelect} />
    );
    let input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input.multiple).toBe(false);

    rerender(
      <ThemeProvider theme={theme}>
        <ImageUploader label="L" onSelect={onSelect} multiple />
      </ThemeProvider>
    );
    input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input.multiple).toBe(true);
  });

  it("si files=null no llama onSelect", () => {
    renderWithTheme(<ImageUploader label="L" onSelect={onSelect} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: null } });

    expect(onSelect).not.toHaveBeenCalled();
  });

  it("append=false & multiple=false: solo pasa el primer archivo y limpia el value", () => {
    renderWithTheme(
      <ImageUploader label="L" onSelect={onSelect} multiple={false} append={false} />
    );
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const f1 = new File(["a"], "a.jpg", { type: "image/jpeg" });
    const f2 = new File(["b"], "b.jpg", { type: "image/jpeg" });

    fireEvent.change(input, { target: { files: [f1, f2] } });

    expect(onSelect).toHaveBeenCalledTimes(1);
    const passed = onSelect.mock.calls[0][0] as File[];
    expect(passed).toHaveLength(1);
    expect(passed[0].name).toBe("a.jpg");

    // el handler hace e.target.value = ''
    expect(input.value).toBe("");
  });

  it("append=false & multiple=true: pasa todos los archivos y limpia el value", () => {
    renderWithTheme(
      <ImageUploader label="L" onSelect={onSelect} multiple append={false} />
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const f1 = new File(["x"], "x.png", { type: "image/png" });
    const f2 = new File(["y"], "y.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [f1, f2] } });

    expect(onSelect).toHaveBeenCalledTimes(1);
    const passed = onSelect.mock.calls[0][0] as File[];
    expect(passed.map(f => f.name)).toEqual(["x.png", "y.png"]);
    expect(input.value).toBe("");
  });

  it("append=true (ignora slice): pasa todos los archivos aunque multiple=false", () => {
    renderWithTheme(
      <ImageUploader label="L" onSelect={onSelect} multiple={false} append />
    );
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    const f1 = new File(["1"], "1.jpg", { type: "image/jpeg" });
    const f2 = new File(["2"], "2.mp4", { type: "video/mp4" });
    fireEvent.change(input, { target: { files: [f1, f2] } });

    expect(onSelect).toHaveBeenCalledTimes(1);
    const passed = onSelect.mock.calls[0][0] as File[];
    expect(passed.map(f => f.name)).toEqual(["1.jpg", "2.mp4"]);
    expect(input.value).toBe("");
  });

  it("permite seleccionar dos veces el mismo archivo gracias al reseteo de value", () => {
    renderWithTheme(<ImageUploader label="L" onSelect={onSelect} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const f = new File(["a"], "same.jpg", { type: "image/jpeg" });

    fireEvent.change(input, { target: { files: [f] } });
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(input.value).toBe("");

    // mismo archivo nuevamente
    fireEvent.change(input, { target: { files: [f] } });
    expect(onSelect).toHaveBeenCalledTimes(2);
  });
});
