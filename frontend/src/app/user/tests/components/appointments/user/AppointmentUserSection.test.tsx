/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppointmentUserSection } from "../../../../components/appointments/user/AppointmentUserSection";
import { useAuthContext } from "../../../../../user/context/AuthContext";
import { useAppointments } from "../../../../hooks/useAppointments";

// Mock del AppointmentUserList
vi.mock("../../../../components/appointments/user/AppointmentUserList", () => ({
  AppointmentUserList: ({ appointments }: any) => <div data-testid="user-list">{appointments.length}</div>,
}));

vi.mock("../../../../../user/context/AuthContext");
vi.mock("../../../../hooks/useAppointments");

describe("AppointmentUserSection", () => {
  const reloadUser = vi.fn();
  const cancelAppointment = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthContext as any).mockReturnValue({ info: { id: 1, name: "Test" } });
    (useAppointments as any).mockReturnValue({
      userLoading: false,
      userAppointments: [{ id: 1 }, { id: 2 }],
      slotMap: { 1: { id: 1, date: new Date().toISOString(), availability: true } },
      cancelAppointment,
      reloadUser,
    });
  });

  it("no renderiza si no hay info", () => {
    (useAuthContext as any).mockReturnValue({ info: null });
    const { container } = render(<AppointmentUserSection />);
    expect(container).toBeEmptyDOMElement();
  });

  it("muestra spinner mientras carga", () => {
    (useAppointments as any).mockReturnValue({
      userLoading: true,
      userAppointments: [],
      slotMap: {},
      cancelAppointment,
      reloadUser,
    });
    render(<AppointmentUserSection />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("renderiza la lista de turnos cuando hay info y no está cargando", () => {
    render(<AppointmentUserSection />);
    expect(screen.getByTestId("user-list")).toHaveTextContent("2");
  });

  it("llama reloadUser al montar si hay info", () => {
    render(<AppointmentUserSection />);
    expect(reloadUser).toHaveBeenCalled();
  });
});
