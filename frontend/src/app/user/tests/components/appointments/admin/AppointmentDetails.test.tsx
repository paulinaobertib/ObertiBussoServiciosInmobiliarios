/// <reference types="vitest" />
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

vi.mock("@mui/icons-material", () => {
  const Icon = ({ "data-testid": dt = "icon" }: any) => <svg data-testid={dt} />;
  return {
    __esModule: true,
    AccessTime: (p: any) => <Icon data-testid="AccessTimeIcon" {...p} />,
    Person: (p: any) => <Icon data-testid="PersonIcon" {...p} />,
    EmailOutlined: (p: any) => <Icon data-testid="EmailOutlinedIcon" {...p} />,
    PhoneOutlined: (p: any) => <Icon data-testid="PhoneOutlinedIcon" {...p} />,
    ChatBubbleOutline: (p: any) => <Icon data-testid="ChatBubbleOutlineIcon" {...p} />,
  };
});

vi.mock("../../../../../shared/components/Modal", () => ({
  Modal: ({ children, title }: any) => (
    <div data-testid="modal">
      {title ? <div>{title}</div> : null}
      {children}
    </div>
  ),
}));

vi.mock("../../../../hooks/useAppointments", () => ({
  useAppointments: vi.fn(),
}));

vi.mock("../../../../services/user.service", () => ({
  getUserById: vi.fn(),
}));

vi.mock("../../../../../shared/components/ConfirmDialog", () => ({
  useConfirmDialog: vi.fn(),
}));

import { AppointmentDetailsDialog } from "../../../../components/appointments/admin/AppointmentDetails";
import { useAppointments } from "../../../../hooks/useAppointments";
import { getUserById } from "../../../../services/user.service";
import { useConfirmDialog } from "../../../../../shared/components/ConfirmDialog";

const useAppointmentsMock = useAppointments as unknown as Mock;
const getUserByIdMock = getUserById as unknown as Mock;
const useConfirmDialogMock = useConfirmDialog as unknown as Mock;

function makeSlot(id: number, date: string, availability: boolean) {
  return { id, date, availability };
}
function makeAppt(
  slotId: number,
  status: "ESPERA" | "ACEPTADO" | "RECHAZADO",
  userId?: number,
  comment?: string
) {
  return { id: slotId * 100, slotId, status, userId, comment };
}

describe("<AppointmentDetailsDialog />", () => {
  const reloadAdmin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useConfirmDialogMock.mockReturnValue({
      ask: vi.fn((_msg: string, onConfirm?: () => void) => onConfirm?.()),
      DialogUI: <div data-testid="confirm-ui">confirm</div>,
    });
  });

  it("no renderiza nada si no existe el slot", () => {
    useAppointmentsMock.mockReturnValue({
      slotMap: {},
      apptsBySlot: {},
      reloadAdmin,
    });

    const { container } = render(
      <AppointmentDetailsDialog
        open={true}
        slotId={999}
        onClose={vi.fn()}
        onAccept={vi.fn()}
        onReject={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("llama reloadAdmin al abrir (open=true)", () => {
    useAppointmentsMock.mockReturnValue({
      slotMap: { 1: makeSlot(1, "2025-06-10T15:00:00.000Z", true) },
      apptsBySlot: {},
      reloadAdmin,
    });

    render(
      <AppointmentDetailsDialog
        open={true}
        slotId={1}
        onClose={vi.fn()}
        onAccept={vi.fn()}
        onReject={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(reloadAdmin).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("modal")).toBeInTheDocument();
    expect(screen.getByText(/Detalle del turno/i)).toBeInTheDocument();
  });

  it("muestra el chip: Disponible / Pendiente / Confirmado / Rechazado", () => {
    const baseSlots = {
      1: makeSlot(1, "2025-06-10T15:00:00.000Z", true),
      2: makeSlot(2, "2025-06-10T15:00:00.000Z", false),
      3: makeSlot(3, "2025-06-10T15:00:00.000Z", false),
      4: makeSlot(4, "2025-06-10T15:00:00.000Z", false),
    };
    const baseAppts = {
      2: makeAppt(2, "ESPERA"),
      3: makeAppt(3, "ACEPTADO"),
      4: makeAppt(4, "RECHAZADO"),
    };

    const { rerender } = render(
      <AppointmentDetailsDialog
        open={true}
        slotId={1}
        onClose={vi.fn()}
        onAccept={vi.fn()}
        onReject={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    useAppointmentsMock.mockReturnValue({ slotMap: baseSlots, apptsBySlot: {}, reloadAdmin });
    rerender(
      <AppointmentDetailsDialog
        open={true}
        slotId={1}
        onClose={vi.fn()}
        onAccept={vi.fn()}
        onReject={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText("Disponible")).toBeInTheDocument();

    useAppointmentsMock.mockReturnValue({ slotMap: baseSlots, apptsBySlot: baseAppts, reloadAdmin });
    rerender(
      <AppointmentDetailsDialog
        open={true}
        slotId={2}
        onClose={vi.fn()}
        onAccept={vi.fn()}
        onReject={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText("Pendiente")).toBeInTheDocument();

    rerender(
      <AppointmentDetailsDialog
        open={true}
        slotId={3}
        onClose={vi.fn()}
        onAccept={vi.fn()}
        onReject={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText("Confirmado")).toBeInTheDocument();

    rerender(
      <AppointmentDetailsDialog
        open={true}
        slotId={4}
        onClose={vi.fn()}
        onAccept={vi.fn()}
        onReject={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText("Rechazado")).toBeInTheDocument();
  });

  it("carga y muestra datos del usuario; 'Cargando...' → nombre/email/phone", async () => {
    useAppointmentsMock.mockReturnValue({
      slotMap: { 5: makeSlot(5, "2025-06-10T15:00:00.000Z", false) },
      apptsBySlot: { 5: makeAppt(5, "ESPERA", 99) },
      reloadAdmin,
    });

    getUserByIdMock.mockResolvedValueOnce({
      data: { firstName: "Ana", lastName: "García", email: "ana@dom.com", phone: "12345" },
    });

    render(
      <AppointmentDetailsDialog
        open={true}
        slotId={5}
        onClose={vi.fn()}
        onAccept={vi.fn()}
        onReject={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText("Cargando...")).toBeInTheDocument();

    await screen.findByText("Ana García");
    expect(screen.getByText("ana@dom.com")).toBeInTheDocument();
    expect(screen.getByText("12345")).toBeInTheDocument();
  });

  it("si getUserById falla, muestra 'Cliente'", async () => {
    useAppointmentsMock.mockReturnValue({
      slotMap: { 6: makeSlot(6, "2025-06-10T15:00:00.000Z", false) },
      apptsBySlot: { 6: makeAppt(6, "ESPERA", 7) },
      reloadAdmin,
    });

    getUserByIdMock.mockRejectedValueOnce(new Error("boom"));

    render(
      <AppointmentDetailsDialog
        open={true}
        slotId={6}
        onClose={vi.fn()}
        onAccept={vi.fn()}
        onReject={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Cliente")).toBeInTheDocument();
    });
  });

  it("al cambiar slotId con user → sin user, resetea y muestra 'Cliente'", async () => {
    const slots = {
      7: makeSlot(7, "2025-06-10T15:00:00.000Z", false),
      8: makeSlot(8, "2025-06-10T15:05:00.000Z", false),
    };
    const appts = {
      7: makeAppt(7, "ESPERA", 55),
      8: makeAppt(8, "ESPERA"), // sin userId
    };

    useAppointmentsMock.mockReturnValue({ slotMap: slots, apptsBySlot: appts, reloadAdmin });
    getUserByIdMock.mockResolvedValueOnce({
      data: { firstName: "Luis", lastName: "Pérez" },
    });

    const { rerender } = render(
      <AppointmentDetailsDialog
        open={true}
        slotId={7}
        onClose={vi.fn()}
        onAccept={vi.fn()}
        onReject={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    await screen.findByText("Luis Pérez");

    useAppointmentsMock.mockReturnValue({ slotMap: slots, apptsBySlot: appts, reloadAdmin });
    rerender(
      <AppointmentDetailsDialog
        open={true}
        slotId={8}
        onClose={vi.fn()}
        onAccept={vi.fn()}
        onReject={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText("Cliente")).toBeInTheDocument();
  });

  it("muestra comentario si existe", () => {
    useAppointmentsMock.mockReturnValue({
      slotMap: { 9: makeSlot(9, "2025-06-10T15:00:00.000Z", false) },
      apptsBySlot: { 9: makeAppt(9, "ESPERA", undefined, "Línea 1\nLínea 2") },
      reloadAdmin,
    });

    render(
      <AppointmentDetailsDialog
        open={true}
        slotId={9}
        onClose={vi.fn()}
        onAccept={vi.fn()}
        onReject={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const commentNode = screen.getByText((content) => content.includes("Línea 1"));
    expect(commentNode).toBeInTheDocument();
    expect(commentNode).toHaveTextContent(/Línea 2/);

  });

  it("Eliminar (slot disponible): ask → onDelete(slot.id) → reloadAdmin → onClose", async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    useConfirmDialogMock.mockReturnValue({
      ask: vi.fn((_msg: string, onConfirm?: () => void) => onConfirm?.()),
      DialogUI: <div />,
    });

    useAppointmentsMock.mockReturnValue({
      slotMap: { 10: makeSlot(10, "2025-06-10T15:00:00.000Z", true) },
      apptsBySlot: {},
      reloadAdmin,
    });

    render(
      <AppointmentDetailsDialog
        open={true}
        slotId={10}
        onClose={onClose}
        onAccept={vi.fn()}
        onReject={vi.fn()}
        onDelete={onDelete}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Eliminar/i }));

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith(10);
      expect(reloadAdmin).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("Rechazar (ESPERA): ask → onReject(appt) → reloadAdmin → onClose", async () => {
    const onReject = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    useConfirmDialogMock.mockReturnValue({
      ask: vi.fn((_msg: string, onConfirm?: () => void) => onConfirm?.()),
      DialogUI: <div />,
    });

    const appt = makeAppt(11, "ESPERA");

    useAppointmentsMock.mockReturnValue({
      slotMap: { 11: makeSlot(11, "2025-06-10T15:00:00.000Z", false) },
      apptsBySlot: { 11: appt },
      reloadAdmin,
    });

    render(
      <AppointmentDetailsDialog
        open={true}
        slotId={11}
        onClose={onClose}
        onAccept={vi.fn()}
        onReject={onReject}
        onDelete={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Rechazar/i }));

    await waitFor(() => {
      expect(onReject).toHaveBeenCalledWith(appt);
      expect(reloadAdmin).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("Confirmar (ESPERA): muestra spinner (progressbar) y deshabilita; al resolver, reloadAdmin + onClose", async () => {
    let resolveAccept!: () => void;
    const onAccept = vi.fn(() => new Promise<void>((res) => (resolveAccept = res)));
    const onClose = vi.fn();

    const appt = makeAppt(12, "ESPERA");

    useAppointmentsMock.mockReturnValue({
      slotMap: { 12: makeSlot(12, "2025-06-10T15:00:00.000Z", false) },
      apptsBySlot: { 12: appt },
      reloadAdmin,
    });

    render(
      <AppointmentDetailsDialog
        open={true}
        slotId={12}
        onClose={onClose}
        onAccept={onAccept}
        onReject={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const confirmarBtn = screen.getByRole("button", { name: /Confirmar/i });
    fireEvent.click(confirmarBtn);

    expect(within(confirmarBtn).getByRole("progressbar")).toBeInTheDocument();
    expect(confirmarBtn).toBeDisabled();

    resolveAccept!();
    await waitFor(() => {
      expect(reloadAdmin).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("Cancelar Turno (ACEPTADO): ask → onReject(appt) → reloadAdmin → onClose", async () => {
    const onReject = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    useConfirmDialogMock.mockReturnValue({
      ask: vi.fn((_msg: string, onConfirm?: () => void) => onConfirm?.()),
      DialogUI: <div />,
    });

    const appt = makeAppt(13, "ACEPTADO");

    useAppointmentsMock.mockReturnValue({
      slotMap: { 13: makeSlot(13, "2025-06-10T15:00:00.000Z", false) },
      apptsBySlot: { 13: appt },
      reloadAdmin,
    });

    render(
      <AppointmentDetailsDialog
        open={true}
        slotId={13}
        onClose={onClose}
        onAccept={vi.fn()}
        onReject={onReject}
        onDelete={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Cancelar Turno/i }));

    await waitFor(() => {
      expect(onReject).toHaveBeenCalledWith(appt);
      expect(reloadAdmin).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });
});
