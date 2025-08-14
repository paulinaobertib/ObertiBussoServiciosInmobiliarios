import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen, within } from "@testing-library/react";
import AdminNotifications from "../../components/NotificationsAdmin";

vi.mock("../../services/notification.service", () => ({
  getAllNotifications: vi.fn(),
}));

import { getAllNotifications as _getAllNotifications } from "../../services/notification.service";
const getAllNotifications = _getAllNotifications as unknown as Mock;

// helper para la forma de respuesta que espera el componente
function resp<T>(data: T) {
  return { data };
}

describe("<AdminNotificationsSummary />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("agrupa por fecha (toLocaleDateString) y tipo, y muestra los conteos correctos", async () => {
    const d1a = "2025-06-01T10:00:00.000Z";
    const d1b = "2025-06-01T12:00:00.000Z";
    const d1c = "2025-06-01T09:30:00.000Z";
    const d2a = "2025-06-02T08:00:00.000Z";

    const day1 = new Date(d1a).toLocaleDateString();
    const day2 = new Date(d2a).toLocaleDateString();

    getAllNotifications.mockResolvedValueOnce(
      resp([
        { id: 1, userId: "u1", type: "PROPIEDADNUEVA", date: d1a },
        { id: 2, userId: "u2", type: "PROPIEDADNUEVA", date: d1b },
        { id: 3, userId: "u3", type: "INTERESPROPIEDAD", date: d1c },
        { id: 4, userId: "u4", type: "INTERESPROPIEDAD", date: d2a },
      ])
    );

    render(<AdminNotifications />);

    await screen.findByText("Resumen de envíos de notificaciones");

    const table = screen.getByRole("table");
    const body = within(table).getAllByRole("rowgroup")[1];
    const rows = within(body).getAllByRole("row");

    const assertRow = (date: string, label: string, count: number) => {
      const row = rows.find(
        (r) =>
          within(r).queryByText(date) &&
          within(r).queryByText(label) &&
          within(r).queryByText(String(count))
      );
      expect(row, `No se encontró fila ${date} - ${label} - ${count}`).toBeTruthy();
    };

    assertRow(day1, "Nueva propiedad", 2);
    assertRow(day1, "Interés en propiedad", 1);
    assertRow(day2, "Interés en propiedad", 1);
  });

  it("muestra tabla vacía (solo header) cuando no hay notificaciones", async () => {
    getAllNotifications.mockResolvedValueOnce(resp([]));

    render(<AdminNotifications />);

    await screen.findByText("Resumen de envíos de notificaciones");

    const table = screen.getByRole("table");
    const body = within(table).getAllByRole("rowgroup")[1];
    expect(within(body).queryAllByRole("row")).toHaveLength(0);
  });
});
