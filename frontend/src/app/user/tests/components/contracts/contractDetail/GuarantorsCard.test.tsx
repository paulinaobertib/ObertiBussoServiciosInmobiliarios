import { render, screen } from "@testing-library/react";
import GuarantorsCard from "../../../../components/contracts/contractDetail/GuarantorsCard";

describe("GuarantorsCard", () => {
  it("muestra mensaje cuando no hay garantes", () => {
    render(<GuarantorsCard guarantors={[]} />);
    expect(screen.getByText("Sin garantes.")).toBeInTheDocument();
  });

  it("muestra botón de agregar cuando se pasa onManage", () => {
    const onManage = vi.fn();
    render(<GuarantorsCard guarantors={[]} onManage={onManage} />);
    const btn = screen.getByRole("button", { name: "Agregar garantes" });
    btn.click();
    expect(onManage).toHaveBeenCalled();
  });

  it("muestra botón de desvincular y dispara callback", () => {
    const onUnlink = vi.fn();
    const guarantors = [{ id: 99, name: "Pedro", phone: "555", email: "p@test.com" }];
    render(<GuarantorsCard guarantors={guarantors} onUnlink={onUnlink} />);
    const btn = screen.getByRole("button", { name: "Desvincular" });
    btn.click();
    expect(onUnlink).toHaveBeenCalledWith(99);
  });
});
