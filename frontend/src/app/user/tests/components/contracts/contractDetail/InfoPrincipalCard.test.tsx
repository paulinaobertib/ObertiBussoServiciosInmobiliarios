import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import InfoPrincipalCard from "../../../../components/contracts/contractDetail/InfoPrincipalCard";

describe("InfoPrincipalCard", () => {
  const baseProps = {
    userName: "Juan Pérez",
    propertyName: "Depto Córdoba",
    propertyHref: "/propiedad/1",
    userId: 1,
  };

  const renderWithRouter = (props = {}) =>
    render(
      <MemoryRouter>
        <InfoPrincipalCard {...baseProps} {...props} />
      </MemoryRouter>
    );

  it("renderiza título y datos principales", () => {
    renderWithRouter();
    expect(screen.getByText("Información Principal")).toBeInTheDocument();
    expect(screen.getByText("Usuario:")).toBeInTheDocument();
    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText("Propiedad:")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Depto Córdoba" })).toHaveAttribute("href", "/propiedad/1");
  });

  it("usa userId si no se pasa userName", () => {
    renderWithRouter({ userName: null, userId: 42 });
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("muestra 'Propiedad' si no se pasa propertyName", () => {
    renderWithRouter({ propertyName: null });
    expect(screen.getByRole("link", { name: "Propiedad" })).toBeInTheDocument();
  });

  it("el link apunta al propertyHref", () => {
    renderWithRouter({ propertyHref: "/propiedad/99", propertyName: "Casa" });
    expect(screen.getByRole("link", { name: "Casa" })).toHaveAttribute("href", "/propiedad/99");
  });
});
