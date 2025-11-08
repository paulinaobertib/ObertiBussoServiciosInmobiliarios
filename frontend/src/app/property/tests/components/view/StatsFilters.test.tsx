/// <reference types="vitest" />
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { describe, it, expect, vi } from "vitest";
import StatsFilters from "../../../components/view/StatsFilters";

const renderWithTheme = (ui: React.ReactElement) => render(<ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>);

describe("<StatsFilters />", () => {
  it("renderiza título y los 3 chips", () => {
    const onChange = vi.fn();
    renderWithTheme(<StatsFilters selected={[]} onChange={onChange} />);

    expect(screen.getByText(/Filtrar por categoría/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Vistas/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Consultas/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Encuestas/i })).toBeInTheDocument();
  });

  it("agrega categorías al hacer click cuando no están seleccionadas", () => {
    const onChange = vi.fn();
    const { rerender } = renderWithTheme(<StatsFilters selected={[]} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: /Vistas/i }));
    expect(onChange).toHaveBeenLastCalledWith(["views"]);

    onChange.mockClear();
    rerender(
      <ThemeProvider theme={createTheme()}>
        <StatsFilters selected={["views"]} onChange={onChange} />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: /Consultas/i }));
    expect(onChange).toHaveBeenLastCalledWith(["views", "inquiry"]);
  });

  it("quita categorías al hacer click cuando ya están seleccionadas", () => {
    const onChange = vi.fn();
    const { rerender } = renderWithTheme(<StatsFilters selected={["views", "inquiry"] as any} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: /Consultas/i }));
    expect(onChange).toHaveBeenLastCalledWith(["views"]);

    onChange.mockClear();
    rerender(
      <ThemeProvider theme={createTheme()}>
        <StatsFilters selected={["views"]} onChange={onChange} />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: /Vistas/i }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });

  it("permite seleccionar las tres categorías y respeta el orden de selección", () => {
    const onChange = vi.fn();
    const { rerender } = renderWithTheme(<StatsFilters selected={[]} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: /Vistas/i }));
    expect(onChange).toHaveBeenLastCalledWith(["views"]);

    onChange.mockClear();
    rerender(
      <ThemeProvider theme={createTheme()}>
        <StatsFilters selected={["views"]} onChange={onChange} />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: /Encuestas/i }));
    expect(onChange).toHaveBeenLastCalledWith(["views", "survey"]);

    onChange.mockClear();
    rerender(
      <ThemeProvider theme={createTheme()}>
        <StatsFilters selected={["views", "survey"]} onChange={onChange} />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: /Consultas/i }));
    expect(onChange).toHaveBeenLastCalledWith(["views", "survey", "inquiry"]);
  });
});
