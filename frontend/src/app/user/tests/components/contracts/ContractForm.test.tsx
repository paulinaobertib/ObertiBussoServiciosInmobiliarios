/* src/app/user/tests/components/contracts/ContractForm.test.tsx */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { createRef } from "react";

// ─── Mocks globales ───
vi.mock("@mui/material/styles", () => ({}));
vi.mock("@mui/x-data-grid/esm/index.css", () => ({}));

vi.mock("../../../shared/components/Modal", () => ({
  Modal: (props: any) => (
    <div data-testid="modal" data-open={String(props.open)}>
      <div data-testid="modal-title">{props.title}</div>
      <button data-testid="modal-close" onClick={props.onClose}>close</button>
      {props.children}
    </div>
  ),
}));

vi.mock("../increases/IncreaseIndexForm", () => ({
  IncreaseIndexForm: (props: any) => (
    <div data-testid="increase-form" data-action={props.action}>
      <button
        data-testid="increase-done"
        onClick={() =>
          props.onDone({
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

import { ContractForm, ContractFormHandle } from "../../../components/contracts/ContractForm";

beforeEach(() => {
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
});
