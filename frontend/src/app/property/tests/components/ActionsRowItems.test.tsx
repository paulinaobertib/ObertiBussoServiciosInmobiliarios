import { describe, it, vi, Mock, expect, beforeEach } from "vitest";
import { getRowActions } from "../../components/ActionsRowItems";
import * as reactRouter from "react-router-dom";
import { usePropertiesContext } from "../../context/PropertiesContext";
import { ROUTES, buildRoute } from "../../../../lib";
import { translate } from "../../utils/translate";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: vi.fn() };
});

vi.mock("../../context/PropertiesContext");

describe("getRowActions", () => {
  const mockNavigate = vi.fn();
  const mockPickItem = vi.fn();
  const mockSetModal = vi.fn();
  const mockAsk = vi.fn();
  const mockDeleteFn = vi.fn();
  const mockShowAlert = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (reactRouter.useNavigate as unknown as Mock).mockReturnValue(mockNavigate);
    (usePropertiesContext as unknown as Mock).mockReturnValue({
      pickItem: mockPickItem,
    });
  });

  it("crea acciones de propiedad correctamente", async () => {
    const item = { id: 1, title: "Propiedad 1" };
    const actions = getRowActions("property", item, mockSetModal, mockAsk, mockDeleteFn, mockShowAlert);

    expect(actions.map(a => a.label)).toEqual(["Notas", "Ver propiedad", "Editar", "Eliminar"]);

    actions[0].onClick();
    expect(mockPickItem).toHaveBeenCalledWith("property", item);
    expect(mockNavigate).toHaveBeenCalledWith(buildRoute(ROUTES.PROPERTY_NOTES, item.id));

    actions[1].onClick();
    expect(mockPickItem).toHaveBeenCalledWith("property", item);
    expect(mockNavigate).toHaveBeenCalledWith(buildRoute(ROUTES.PROPERTY_DETAILS, item.id));

    actions[2].onClick();
    expect(mockNavigate).toHaveBeenCalledWith(buildRoute(ROUTES.EDIT_PROPERTY, item.id));

    actions[3].onClick();
    const askFn = mockAsk.mock.calls[0][1];
    await askFn();
    expect(mockDeleteFn).toHaveBeenCalledWith(item);
    expect(mockShowAlert).toHaveBeenCalledWith("Propiedad eliminada", "success");
  });

  it.each<["amenity" | "owner" | "type" | "neighborhood"]>([
    ["amenity"],
    ["owner"],
    ["type"],
    ["neighborhood"]
  ])("crea acciones de categoría %s correctamente", (entity) => {
    const item = { id: 1, name: `${entity} 1` };
    const actions = getRowActions(entity, item, mockSetModal, mockAsk, mockDeleteFn, mockShowAlert);

    const expectedLabels = [
      `Editar ${translate(entity)}`,
      `Eliminar ${translate(entity)}`
    ];

    expect(actions.map(a => a.label)).toEqual(expectedLabels);

    // Editar
    actions[0].onClick();
    expect(mockSetModal).toHaveBeenCalled();
    const editModal = mockSetModal.mock.calls[0][0];
    expect(editModal.title).toContain("Editar");
    expect(editModal.componentProps.action).toBe("edit");

    // Eliminar
    actions[1].onClick();
    const deleteModal = mockSetModal.mock.calls[1][0];
    expect(deleteModal.title).toContain("Eliminar");
    expect(deleteModal.componentProps.action).toBe("delete");
  });

  it("muestra alerta de error si deleteFn falla", async () => {
    const item = { id: 1, title: "Propiedad 1" };
    const actions = getRowActions("property", item, mockSetModal, mockAsk, mockDeleteFn, mockShowAlert);

    mockDeleteFn.mockRejectedValueOnce(new Error("Falló"));

    actions[3].onClick(); // dispara ask
    const askFn = mockAsk.mock.calls[0][1];
    await askFn();
    expect(mockShowAlert).toHaveBeenCalledWith("Error al eliminar", "error");
  });
});
