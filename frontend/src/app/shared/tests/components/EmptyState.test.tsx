// src/app/shared/tests/components/EmptyState.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { EmptyState } from "../../../shared/components/EmptyState";
import { Box, Button } from "@mui/material";

describe("EmptyState", () => {
  it("renderiza con título y fallback neutral", () => {
    render(<EmptyState title="Sin datos" />);
    expect(screen.getByText("Sin datos")).toBeInTheDocument();
    // fallback neutral
    expect(
      screen.getByText("Mantente atento a nuevas actualizaciones.")
    ).toBeInTheDocument();
  });

  it("renderiza con descripción personalizada", () => {
    render(<EmptyState title="Custom" description="Descripción personalizada" />);
    expect(screen.getByText("Descripción personalizada")).toBeInTheDocument();
  });

  it("usa fallback de error cuando tone=error", () => {
    render(<EmptyState title="Error" tone="error" />);
    expect(
      screen.getByText(
        "No pudimos cargar la información. Intenta nuevamente más tarde."
      )
    ).toBeInTheDocument();
    const desc = screen.getByText(
      /No pudimos cargar la información/i
    );
    expect(desc).toHaveStyle("color: rgb(211, 47, 47)"); // error.main
  });

  it("renderiza icono y acción", () => {
    render(
      <EmptyState
        title="Con extras"
        icon={<Box data-testid="icon">icon</Box>}
        action={<Button>Reintentar</Button>}
      />
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
  });

    it("aplica sx extra y minHeight personalizado", () => {
    const { container } = render(
        <EmptyState
        title="Con estilo"
        minHeight={123}
        sx={{ backgroundColor: "red" }}
        />
    );

    const box = container.querySelector(".MuiBox-root");
    expect(box).toHaveStyle("min-height: 123px");
    // MUI convierte "red" en rgb(255, 0, 0)
    expect(box).toHaveStyle("background-color: rgb(255, 0, 0)");
    });

});
