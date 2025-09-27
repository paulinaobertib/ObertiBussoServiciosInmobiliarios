/* src/app/user/tests/components/contracts/ContractForm.test.tsx */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { createRef } from "react";
import userEvent from "@testing-library/user-event";

// ─── Mocks globales ───
vi.mock("@mui/material/styles", () => ({}));
vi.mock("@mui/x-data-grid/esm/index.css", () => ({}));

vi.mock("../../../shared/components/Modal", () => ({
  Modal: (props: any) => (
    <div data-testid="modal" data-open={String(props.open)}>
      <div data-testid="modal-title">{props.title}</div>
      <button data-testid="modal-close" onClick={props.onClose}>
        close
      </button>
      {props.open ? props.children : null}
    </div>
  ),
}));

vi.mock("../../../components/increases/IncreaseIndexForm", () => ({
  __esModule: true,           
  default: (props: any) => ( 
    <div data-testid="increase-form" data-action={props.action}>
      <button
        data-testid="increase-done"
        onClick={() =>
          props.onDone?.({
            action: props.action,
            form: { code: "IDX", name: "IndiceX" },
          })
        }
      >
        done
      </button>
    </div>
  ),
}));

// ─── Mocks hooks ───
const submitMock = vi.fn();
const resetMock = vi.fn();
const getCreateDataMock = vi.fn();
const setGuarantorsIdsMock = vi.fn();
const handleChangeMock = vi.fn((field: string) => (e: any) => {
  values[field] = e.target.value;
});
let values: any = {};
let errors: any = {};
let loadingData = false;

vi.mock("../../../hooks/contracts/useContractForm", () => ({
  useContractForm: () => ({
    values,
    errors,
    property: { title: "Prop A" },
    user: { firstName: "John", lastName: "Doe" },
    loadingData,
    handleChange: (f: string) => handleChangeMock(f),
    reset: resetMock,
    submit: submitMock,
    getCreateData: getCreateDataMock,
    setGuarantorsIds: setGuarantorsIdsMock,
  }),
}));

let indexes = [{ id: 1, code: "IDX", name: "IndiceX" }];
const loadAllMock = vi.fn(async () => indexes);
vi.mock("../../../hooks/useIncreaseIndexes", () => ({
  useIncreaseIndexes: () => ({
    indexes,
    loadAll: loadAllMock,
  }),
}));

import {
  ContractForm,
  ContractFormHandle,
} from "../../../components/contracts/ContractForm";

beforeEach(() => {
  indexes = [{ id: 1, code: "IDX", name: "IndiceX" }];
  values = {
    contractType: "",
    contractStatus: "",
    startDate: "",
    endDate: "",
    initialAmount: "",
    currency: "",
    adjustmentIndexId: "",
    adjustmentFrequencyMonths: "",
    note: "",
    hasDeposit: false,
    depositAmount: "",
    depositNote: "",
  };
  errors = {};
  loadingData = false;
  submitMock.mockReset();
  resetMock.mockReset();
  getCreateDataMock.mockReset();
  setGuarantorsIdsMock.mockReset();
  loadAllMock.mockReset();
  loadAllMock.mockImplementation(async () => indexes);
  handleChangeMock.mockClear();
});
afterEach(() => {
  vi.clearAllMocks();
});

describe("ContractForm", () => {
  it("muestra spinner cuando loadingData=true", () => {
    loadingData = true;
    render(<ContractForm initialPropertyId={1} initialUserId="u1" />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("muestra y oculta campos de depósito según hasDeposit", () => {
    render(<ContractForm initialPropertyId={1} initialUserId="u1" />);
    fireEvent.click(screen.getByLabelText(/Requiere depósito/i));
    expect(handleChangeMock).toHaveBeenCalledWith("hasDeposit");
  });

  it("forwardRef expone métodos imperativos", () => {
    const ref = createRef<ContractFormHandle>();
    render(<ContractForm ref={ref} initialPropertyId={1} initialUserId="u1" />);
    act(() => {
      ref.current?.reset();
      ref.current?.submit();
      ref.current?.getCreateData();
      ref.current?.setGuarantorsIds([1, 2]);
    });
    expect(resetMock).toHaveBeenCalled();
    expect(submitMock).toHaveBeenCalled();
    expect(getCreateDataMock).toHaveBeenCalled();
    expect(setGuarantorsIdsMock).toHaveBeenCalledWith([1, 2]);
  });

  it("renderiza propiedad y usuario desde el hook", () => {
    render(<ContractForm initialPropertyId={1} initialUserId="u1" />);
    expect(screen.getByText("Prop A")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("muestra campos de depósito y renderiza error cuando existe", () => {
    errors = { depositAmount: "Requerido" };
    values.hasDeposit = true;
    render(<ContractForm initialPropertyId={1} initialUserId="u1" />);
    expect(screen.getByLabelText("Monto del depósito")).toBeInTheDocument();
    expect(screen.getByText("Requerido")).toBeInTheDocument();
  });

  it("invoca loadAll al montar el componente", () => {
    render(<ContractForm initialPropertyId={1} initialUserId="u1" />);
    expect(loadAllMock).toHaveBeenCalled();
  });

  it("selecciona el índice agregado al confirmar el modal", async () => {
    const user = userEvent.setup();
    const newIndex = { id: 99, code: "IDX", name: "IndiceX" };
    indexes = [];
    loadAllMock.mockImplementationOnce(async () => [])
      .mockImplementationOnce(async () => [newIndex])
      .mockImplementation(async () => [newIndex]);

    render(<ContractForm initialPropertyId={1} initialUserId="u1" />);

    await user.click(await screen.findByRole("button", { name: "Agregar índice" }));
    const increaseForm = await screen.findByTestId("increase-form");
    expect(increaseForm).toHaveAttribute("data-action", "add");

    await user.click(within(increaseForm).getByTestId("increase-done"));

    expect(loadAllMock).toHaveBeenCalledTimes(2);
    expect(handleChangeMock).toHaveBeenCalledWith("adjustmentIndexId");
  });

  it("limpia el índice seleccionado cuando se elimina desde el modal", async () => {
    const user = userEvent.setup();
    values.adjustmentIndexId = 1;
    loadAllMock
      .mockImplementationOnce(async () => indexes)
      .mockImplementationOnce(async () => indexes)
      .mockImplementation(async () => indexes);

    render(<ContractForm initialPropertyId={1} initialUserId="u1" />);

    const select = await screen.findByLabelText(/Seleccionar Indice/i);
    await user.click(select);

    const options = await screen.findAllByRole("option");
    const option = options[0];
    const [, deleteButton] = within(option).getAllByRole("button");
    await user.click(deleteButton);

    const increaseForm = await screen.findByTestId("increase-form");
    expect(increaseForm).toHaveAttribute("data-action", "delete");
    await user.click(within(increaseForm).getByTestId("increase-done"));

    expect(handleChangeMock).toHaveBeenCalledWith("adjustmentIndexId");
  });

  it("abre modal de edición desde el menú del índice", async () => {
    const user = userEvent.setup();
    loadAllMock.mockImplementation(async () => indexes);

    render(<ContractForm initialPropertyId={1} initialUserId="u1" />);

    const select = await screen.findByLabelText(/Seleccionar Indice/i);
    await user.click(select);

    const options = await screen.findAllByRole("option");
    const option = options[0];
    const [editButton] = within(option).getAllByRole("button");
    await user.click(editButton);

    const increaseForm = await screen.findByTestId("increase-form");
    expect(increaseForm).toHaveAttribute("data-action", "edit");

    await user.click(within(increaseForm).getByTestId("increase-done"));
    expect(loadAllMock).toHaveBeenCalled();
  });

});
