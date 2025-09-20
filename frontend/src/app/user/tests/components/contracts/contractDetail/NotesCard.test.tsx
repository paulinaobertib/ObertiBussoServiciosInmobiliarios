import { render, screen } from "@testing-library/react";
import NotesCard from "../../../../components/contracts/contractDetail/NotesCard";

describe("NotesCard", () => {
  it("renderiza el título siempre", () => {
    render(<NotesCard note="Ejemplo de nota" />);
    expect(screen.getByText("Notas del Contrato")).toBeInTheDocument();
  });

  it("muestra la nota si se pasa note", () => {
    const text = "Contrato válido hasta diciembre";
    render(<NotesCard note={text} />);
    expect(screen.getByText(text)).toBeInTheDocument();
    expect(screen.queryByText("No hay notas registradas.")).not.toBeInTheDocument();
  });

  it("muestra mensaje de fallback si no hay nota", () => {
    render(<NotesCard note={null} />);
    expect(screen.getByText("No hay notas registradas.")).toBeInTheDocument();
  });

  it("muestra mensaje de fallback si la nota está vacía o solo espacios", () => {
    render(<NotesCard note="   " />);
    expect(screen.getByText("No hay notas registradas.")).toBeInTheDocument();
  });

  it("respeta la prop half", () => {
    const { container } = render(<NotesCard note="Algo" half />);
    // validamos que el Grid tenga sm=6 (MUI lo pone como atributo data)
    expect(container.querySelector(".MuiGrid-root")).toHaveClass("MuiGrid-grid-sm-6");
  });
});
