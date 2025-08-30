/// <reference types="vitest" />
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";

vi.mock("../../../../shared/components/Modal", () => ({
  Modal: ({ open, title, onClose, children }: any) => (
    <div data-testid="modal" data-open={String(open)}>
      <div data-testid="modal-title">{title}</div>
      <button onClick={onClose}>close</button>
      <div data-testid="modal-body">{children}</div>
    </div>
  ),
}));

import { ModalItem, type Info } from "../../../components/categories/CategoryModal";

describe("<ModalItem />", () => {
  it("devuelve null si info es null", () => {
    const close = vi.fn();
    const { container } = render(<ModalItem info={null} close={close} />);
    expect(container.firstChild).toBeNull();
  });

  it("renderiza Modal con título y el Component con props + onDone que llama close", () => {
    const close = vi.fn();

    const Child = vi.fn((props: any) => (
      <button data-testid="child" onClick={props.onDone}>
        child-{props.extra}
      </button>
    ));

    const info: Info = {
      title: "Título de prueba",
      Component: Child as any,
      componentProps: { extra: "valorX" },
    };

    render(<ModalItem info={info} close={close} />);

    // Modal presente con título correcto
    expect(screen.getByTestId("modal")).toBeInTheDocument();
    expect(screen.getByTestId("modal-title")).toHaveTextContent("Título de prueba");

    // Hijo presente y recibió props
    const childBtn = screen.getByTestId("child");
    expect(childBtn).toHaveTextContent("child-valorX");

    // El Child fue llamado con onDone y extra
    expect(Child).toHaveBeenCalled();
    const callArgs = (Child as any).mock.calls[0][0];
    expect(callArgs.extra).toBe("valorX");
    expect(typeof callArgs.onDone).toBe("function");

    // onDone -> close()
    fireEvent.click(childBtn);
    expect(close).toHaveBeenCalledTimes(1);
  });

  it("pasar onClose al Modal funciona (click en close llama close)", () => {
    const close = vi.fn();

    const Dummy = () => <div>contenido</div>;
    const info: Info = {
      title: "Otro título",
      Component: Dummy,
    };

    render(<ModalItem info={info} close={close} />);

    // click al botón close del Modal mock
    fireEvent.click(screen.getByText("close"));
    expect(close).toHaveBeenCalledTimes(1);
  });
});
