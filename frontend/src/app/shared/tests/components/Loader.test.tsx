import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Loading } from "../../components/Loader"; // ajustá el path si es necesario

describe("Loading", () => {
  it("renderiza correctamente el CircularProgress", () => {
    render(<Loading />);
    const spinner = screen.getByRole("progressbar");
    expect(spinner).toBeInTheDocument();
  });

  it("está contenido dentro de un Box con posición fija", () => {
    const { container } = render(<Loading />);
    const box = container.querySelector("div");
    expect(box).toHaveStyle("position: fixed");
    expect(box).toHaveStyle("width: 100%");
    expect(box).toHaveStyle("height: 100%");
  });
});
