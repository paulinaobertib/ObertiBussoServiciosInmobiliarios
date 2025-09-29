import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { NoticeDetails } from "../../../components/notices/NoticeDetails";
import { useNotices } from "../../../hooks/useNotices";
import { useAuthContext } from "../../../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";

// ----- Mocks -----
vi.mock("../../../hooks/useNotices");
vi.mock("../../../context/AuthContext");
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: vi.fn(),
  };
});
vi.mock("../../../components/notices/NoticeForm", () => {
  const React = require("react");
  const NoticeForm = React.forwardRef((props: any, ref: any) => {
    const { onValidityChange } = props;
    React.useImperativeHandle(ref, () => ({
      getUpdateData: () =>
        (globalThis as any).__UPDATED_DATA__ ?? {
          title: "Updated title",
          description: "Updated desc",
          mainImage: null,
        },
    }));
    return (
      <div data-testid="notice-form-mock">
        <button onClick={() => onValidityChange(true)}>set-valid</button>
        <button onClick={() => onValidityChange(false)}>set-invalid</button>
      </div>
    );
  });
  return { NoticeForm };
});

describe("NoticeDetails", () => {
  const navigateMock = vi.fn();
  const removeMock = vi.fn();
  const editMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as any).mockReturnValue(navigateMock);
    (useParams as any).mockReturnValue({ id: "1" });
    (useAuthContext as any).mockReturnValue({ isAdmin: true });
    (useNotices as any).mockReturnValue({
      notices: [
        {
          id: 1,
          title: "Notice 1",
          description: "Desc",
          date: new Date(),
          mainImage: "img.png",
          userId: 99,
        },
      ],
      edit: editMock,
      remove: removeMock,
    });
  });

  it("Muestra mensaje cuando la noticia no se encuentra", () => {
    (useParams as any).mockReturnValue({ id: "999" });
    (useNotices as any).mockReturnValue({ notices: [], edit: editMock, remove: removeMock });

    render(<NoticeDetails />);

    expect(
      screen.getByText(/No encontramos esta noticia/i)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Volver/i));
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  it("Muestra correctamente los detalles de la noticia y la imagen", () => {
    render(<NoticeDetails />);
    expect(screen.getByText("Notice 1")).toBeInTheDocument();
    expect(screen.getByAltText("Notice 1")).toBeInTheDocument();
  });

  it("Elimina la noticia y navega atrás si remove devuelve true", async () => {
    removeMock.mockResolvedValueOnce(true);

    render(<NoticeDetails />);
    const deleteButton = screen.getByLabelText("Eliminar noticia");
    fireEvent.click(deleteButton);

    await waitFor(() => expect(removeMock).toHaveBeenCalledWith(1));
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  it("El botón Volver navega correctamente hacia atrás", () => {
    render(<NoticeDetails />);
    fireEvent.click(screen.getAllByText(/Volver/i)[0]);
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  it("abre el modal de edición, habilita Guardar y llama edit con el payload; luego cierra el modal", async () => {
    editMock.mockResolvedValueOnce(true);

    render(<NoticeDetails />);

    // Abrir modal
    fireEvent.click(screen.getByLabelText("Editar noticia"));
    expect(screen.getByText("Editar noticia")).toBeInTheDocument();

    const guardarBtn = screen.getByRole("button", { name: /guardar/i });
    expect(guardarBtn).toBeDisabled();

    // Simular validez
    fireEvent.click(screen.getByText("set-valid"));
    expect(guardarBtn).not.toBeDisabled();

    (globalThis as any).__UPDATED_DATA__ = {
      title: "Edited by test",
      description: "Edited description",
      mainImage: "new.png",
    };

    fireEvent.click(guardarBtn);

    await waitFor(() => {
      expect(editMock).toHaveBeenCalledWith({
        id: 1,
        userId: 99,
        title: "Edited by test",
        description: "Edited description",
        mainImage: "new.png",
      });
    });

    // Modal se cierra
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    (globalThis as any).__UPDATED_DATA__ = undefined;
  });

  it("cierra el modal al pulsar la X", async () => {
    render(<NoticeDetails />);
    fireEvent.click(screen.getByLabelText("Editar noticia"));
    expect(screen.getByText("Editar noticia")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/cerrar modal/i));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("no muestra acciones de editar/eliminar si el usuario no es admin", () => {
    (useAuthContext as any).mockReturnValue({ isAdmin: false });
    render(<NoticeDetails />);

    expect(screen.queryByLabelText("Editar noticia")).toBeNull();
    expect(screen.queryByLabelText("Eliminar noticia")).toBeNull();
  });

  it("si remove devuelve false, NO navega hacia atrás", async () => {
    removeMock.mockResolvedValueOnce(false);

    render(<NoticeDetails />);
    fireEvent.click(screen.getByLabelText("Eliminar noticia"));

    await waitFor(() => {
      expect(removeMock).toHaveBeenCalledWith(1);
    });
    expect(navigateMock).not.toHaveBeenCalledWith(-1);
  });
});
