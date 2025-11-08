/// <reference types="vitest" />
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { UsersSection } from "../../../../components/users/panel/UsersSection";

vi.mock("../../../../hooks/useUsers", () => ({
  useUsers: vi.fn(),
}));
import { useUsers } from "../../../../hooks/useUsers";

vi.mock("../../../../services/user.service", () => ({
  getRoles: vi.fn(),
}));
import { getRoles } from "../../../../services/user.service";

vi.mock("../../../../../shared/components/Modal", () => ({
  Modal: ({ open, title, children, onClose }: any) =>
    open ? (
      <div data-testid="modal">
        <div data-testid="modal-title">{title}</div>
        <button data-testid="modal-close" onClick={onClose}>
          close
        </button>
        {children}
      </div>
    ) : null,
}));

const GridSectionMock = vi.fn((props: any) => (
  <div data-testid="grid">
    <button onClick={() => props.onCreate?.()}>grid-create</button>
    <button onClick={() => props.onEdit?.(props.data?.[0])}>grid-edit</button>
    <button onClick={() => props.onDelete?.(props.data?.[0])}>grid-delete</button>
    <button onClick={() => props.onRoles?.(props.data?.[0])}>grid-roles</button>

    <button onClick={() => props.toggleSelect?.("abc")}>grid-sel-one</button>
    <button onClick={() => props.toggleSelect?.(["x", "y", "z"])}>grid-sel-multi</button>
  </div>
));
vi.mock("../../../../../shared/components/GridSection", () => ({
  GridSection: (props: any) => GridSectionMock(props),
}));

vi.mock("../../../../components/users/panel/UserForm", () => ({
  UserForm: ({ action, item, onSuccess, onClose }: any) => (
    <div data-testid="userform" data-action={action} data-itemid={item?.id ?? ""}>
      <button onClick={onSuccess}>userform-ok</button>
      <button onClick={onClose}>userform-cancel</button>
    </div>
  ),
}));

vi.mock("../../../../components/users/panel/RoleForm", () => ({
  RoleForm: ({ userId, currentRoles, onSuccess, onClose }: any) => (
    <div data-testid="roleform">
      <div data-testid="role-user">{userId}</div>
      <div data-testid="role-roles">{(currentRoles || []).join(",")}</div>
      <button onClick={onSuccess}>roleform-ok</button>
      <button onClick={onClose}>roleform-cancel</button>
    </div>
  ),
}));

const sampleUsers = [
  {
    id: "u1",
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@ex.com",
    phone: "123",
    roles: ["ADMIN", "USER"],
  },
  {
    id: "u2",
    firstName: "Alan",
    lastName: "Turing",
    email: "alan@ex.com",
    phone: "456",
    roles: ["USER"],
  },
];

describe("UsersSection", () => {
  const loadMock = vi.fn();
  const fetchAllMock = vi.fn();
  const fetchByTextMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useUsers as unknown as Mock).mockReturnValue({
      users: sampleUsers,
      loading: false,
      load: loadMock,
      fetchAll: fetchAllMock,
      fetchByText: fetchByTextMock,
    });
    (getRoles as unknown as Mock).mockResolvedValue({ data: ["ADMIN", "TENANT"] });
  });

  it("muestra spinner cuando loading=true", () => {
    (useUsers as unknown as Mock).mockReturnValueOnce({
      users: [],
      loading: true,
      load: loadMock,
      fetchAll: fetchAllMock,
      fetchByText: fetchByTextMock,
    });

    render(<UsersSection />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(screen.queryByTestId("grid")).not.toBeInTheDocument();
  });

  it("pasa data y callbacks a GridSection", () => {
    render(<UsersSection />);

    expect(GridSectionMock).toHaveBeenCalledTimes(1);
    const props = GridSectionMock.mock.calls[0][0];

    expect(props.data).toEqual(sampleUsers);
    expect(props.loading).toBe(false);
    expect(props.fetchAll).toBe(fetchAllMock);
    expect(props.fetchByText).toBe(fetchByTextMock);
    expect(props.entityName).toBe("Usuario");
    expect(props.showActions).toBe(true);
  });

  it("flujo Crear: abre modal, muestra UserForm(action=add) y al success llama load y cierra", async () => {
    render(<UsersSection />);

    fireEvent.click(screen.getByText("grid-create"));

    expect(await screen.findByTestId("modal")).toBeInTheDocument();
    expect(screen.getByTestId("modal-title")).toHaveTextContent("Crear usuario");

    const uf = screen.getByTestId("userform");
    expect(uf).toHaveAttribute("data-action", "add");

    fireEvent.click(screen.getByText("userform-ok"));

    await waitFor(() => expect(loadMock).toHaveBeenCalled());
    await waitFor(() => expect(screen.queryByTestId("modal")).not.toBeInTheDocument());
  });

  it("flujo Editar: abre modal con UserForm(action=edit) e item del usuario", async () => {
    render(<UsersSection />);

    fireEvent.click(screen.getByText("grid-edit"));

    expect(await screen.findByTestId("modal")).toBeInTheDocument();
    expect(screen.getByTestId("modal-title")).toHaveTextContent("Editar usuario");

    const uf = screen.getByTestId("userform");
    expect(uf).toHaveAttribute("data-action", "edit");
    expect(uf).toHaveAttribute("data-itemid", "u1");

    // cancelar cierra modal
    fireEvent.click(screen.getByText("userform-cancel"));
    await waitFor(() => expect(screen.queryByTestId("modal")).not.toBeInTheDocument());
  });

  it("flujo Eliminar: abre modal con UserForm(action=delete), success llama load y cierra", async () => {
    render(<UsersSection />);

    fireEvent.click(screen.getByText("grid-delete"));

    expect(await screen.findByTestId("modal")).toBeInTheDocument();
    expect(screen.getByTestId("modal-title")).toHaveTextContent("Eliminar usuario");

    const uf = screen.getByTestId("userform");
    expect(uf).toHaveAttribute("data-action", "delete");

    fireEvent.click(screen.getByText("userform-ok"));

    await waitFor(() => expect(loadMock).toHaveBeenCalled());
    await waitFor(() => expect(screen.queryByTestId("modal")).not.toBeInTheDocument());
  });

  it("flujo Roles (error): si getRoles falla, RoleForm aparece con roles vacíos", async () => {
    (getRoles as unknown as Mock).mockRejectedValueOnce(new Error("boom"));

    render(<UsersSection />);

    fireEvent.click(screen.getByText("grid-roles"));

    const roleForm = await screen.findByTestId("roleform");
    expect(roleForm).toBeInTheDocument();
    expect(screen.getByTestId("role-roles").textContent).toBe(""); // vacío

    // cerrar con onClose
    fireEvent.click(screen.getByText("roleform-cancel"));
    await waitFor(() => expect(screen.queryByTestId("modal")).not.toBeInTheDocument());
  });

  it("gridToggleSelect adapta string y array (último valor) antes de llamar a toggleSelect", () => {
    const toggleSelect = vi.fn();
    render(<UsersSection toggleSelect={toggleSelect} />);

    // string
    fireEvent.click(screen.getByText("grid-sel-one"));
    expect(toggleSelect).toHaveBeenCalledWith("abc");

    // array -> último ("z")
    fireEvent.click(screen.getByText("grid-sel-multi"));
    expect(toggleSelect).toHaveBeenCalledWith("z");
  });

  it("cuando showActions=false, la columna de acciones no se incluye", () => {
    render(<UsersSection showActions={false} />);

    // Inspeccionamos las props pasadas al GridSection
    expect(GridSectionMock).toHaveBeenCalledTimes(1);
    const props = GridSectionMock.mock.calls[0][0];

    const hasActions = props.columns.some((c: any) => c.field === "actions");
    expect(hasActions).toBe(false);
  });

  it("columna Roles: traduce correctamente arrays de strings y de objetos; vacío → '—'", () => {
    // 1) strings minúscula
    (useUsers as unknown as Mock).mockReturnValueOnce({
      users: [{ ...sampleUsers[0], roles: ["admin", "tenant"] }],
      loading: false,
      load: loadMock,
      fetchAll: fetchAllMock,
      fetchByText: fetchByTextMock,
    });

    render(<UsersSection />);

    // Tomamos la definición de columnas que se pasó al GridSection
    const props = GridSectionMock.mock.calls[0][0];
    const rolesCol = props.columns.find((c: any) => c.field === "roles");

    // Render de la celda con strings
    const { getByText, rerender } = render(<div>{rolesCol.renderCell({ row: { roles: ["admin", "tenant"] } })}</div>);
    // Debe traducir con ROLE_TRANSLATE
    expect(getByText(/Administrador/)).toBeInTheDocument();
    expect(getByText(/Inquilino/)).toBeInTheDocument();

    // 2) objetos { name }
    rerender(<div>{rolesCol.renderCell({ row: { roles: [{ name: "user" }] } })}</div>);
    expect(getByText(/Usuario/)).toBeInTheDocument();

    // 3) vacío → "—"
    rerender(<div>{rolesCol.renderCell({ row: { roles: [] } })}</div>);
    expect(getByText("—")).toBeInTheDocument();
  });

  it("columna Acciones: los íconos disparan los modales correspondientes", async () => {
    render(<UsersSection />);

    const props = GridSectionMock.mock.calls[0][0];
    const actionsCol = props.columns.find((c: any) => c.field === "actions");

    // Renderizamos el contenido de la celda de acciones para el primer usuario
    const { getByTitle } = render(<div>{actionsCol.renderCell({ row: sampleUsers[0] })}</div>);

    // Editar
    fireEvent.click(getByTitle("Editar"));
    expect(await screen.findByTestId("modal")).toBeInTheDocument();
    expect(screen.getByTestId("modal-title")).toHaveTextContent("Editar usuario");
    // Cerrar para seguir probando
    fireEvent.click(screen.getByTestId("modal-close"));
    await waitFor(() => expect(screen.queryByTestId("modal")).not.toBeInTheDocument());

    // Eliminar
    fireEvent.click(getByTitle("Eliminar"));
    expect(await screen.findByTestId("modal")).toBeInTheDocument();
    expect(screen.getByTestId("modal-title")).toHaveTextContent("Eliminar usuario");
    fireEvent.click(screen.getByTestId("modal-close"));
    await waitFor(() => expect(screen.queryByTestId("modal")).not.toBeInTheDocument());

    // Roles
    (getRoles as unknown as Mock).mockResolvedValueOnce({ data: ["USER"] });
    fireEvent.click(getByTitle("Roles"));
    expect(await screen.findByTestId("modal")).toBeInTheDocument();
    // El loader se reemplaza por el RoleForm; verificamos que llegó
    await screen.findByTestId("roleform");
    expect(screen.getByTestId("role-user")).toHaveTextContent("u1");
  });

  it("Roles: muestra loader mientras getRoles está pendiente (promesa sin resolver)", async () => {
    let resolvePromise: (v?: unknown) => void;
    const pending = new Promise((res) => (resolvePromise = res));

    (getRoles as unknown as Mock).mockReturnValueOnce(pending);

    render(<UsersSection />);

    // Disparamos Roles desde el grid
    fireEvent.click(screen.getByText("grid-roles"));

    // En primera instancia debe verse el CircularProgress dentro del Modal
    const modal = await screen.findByTestId("modal");
    // Nuestro Modal mock no añade rol, pero el CircularProgress sí (progressbar)
    expect(within(modal).getByRole("progressbar")).toBeInTheDocument();

    // Ahora resolvemos la promesa para que aparezca el RoleForm
    resolvePromise!({ data: ["ADMIN"] });
    await screen.findByTestId("roleform");
  });

  it("Modal: el botón de cierre del mock cierra la ventana", async () => {
    render(<UsersSection />);

    fireEvent.click(screen.getByText("grid-create"));
    const modal = await screen.findByTestId("modal");
    expect(modal).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("modal-close"));
    await waitFor(() => expect(screen.queryByTestId("modal")).not.toBeInTheDocument());
  });

  it("gridToggleSelect: cuando recibe null, llama toggleSelect(null)", () => {
    const toggleSelect = vi.fn();
    render(<UsersSection toggleSelect={toggleSelect} />);

    // Obtenemos la función que el componente pasó al Grid
    const props = GridSectionMock.mock.calls[0][0];
    props.toggleSelect(null);

    expect(toggleSelect).toHaveBeenCalledWith(null);
  });

  it("pasa correctamente selectable y multiSelect al GridSection", () => {
    // Caso por defecto (selectable=true, multiSelect=false)
    render(<UsersSection />);
    let props = GridSectionMock.mock.calls[0][0];
    expect(props.selectable).toBe(true);
    expect(props.multiSelect).toBe(false);

    // Caso selectable=false
    render(<UsersSection selectable={false} />);
    props = GridSectionMock.mock.calls[1][0];
    expect(props.selectable).toBe(false);
    expect(props.multiSelect).toBe(false);
  });
});
