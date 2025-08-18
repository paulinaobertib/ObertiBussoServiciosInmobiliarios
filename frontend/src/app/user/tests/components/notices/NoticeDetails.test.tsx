import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { NoticeDetails } from "../../../components/notices/NoticeDetails";
import { useNotices } from "../../../hooks/useNotices";
import { useAuthContext } from "../../../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { useConfirmDialog } from "../../../../shared/components/ConfirmDialog";

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
vi.mock("../../../../shared/components/ConfirmDialog", () => ({
  Modal: ({ children }: any) => <div>{children}</div>,
}));
vi.mock("../../../../shared/components/ConfirmDialog", () => ({
  useConfirmDialog: vi.fn(),
}));

describe("NoticeDetails ", () => {
  const navigateMock = vi.fn();
  const removeMock = vi.fn();
  const editMock = vi.fn();
  const askMock = vi.fn();
  const DialogUI = <div>DialogUI</div>;

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as any).mockReturnValue(navigateMock);
    (useParams as any).mockReturnValue({ id: "1" });
    (useAuthContext as any).mockReturnValue({ isAdmin: true });
    (useNotices as any).mockReturnValue({
      notices: [
        { id: 1, title: "Notice 1", description: "Desc", date: new Date(), mainImage: "img.png", userId: 99 }
      ],
      edit: editMock,
      remove: removeMock,
    });
    (useConfirmDialog as any).mockReturnValue({ ask: askMock, DialogUI });
  });

  it("Muestra mensaje cuando la noticia no se encuentra", () => {
    (useParams as any).mockReturnValue({ id: "999" });
    render(<NoticeDetails />);
    expect(screen.getByText(/Noticia no encontrada/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Volver/i));
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  it("Muestra correctamente los detalles de la noticia y la imagen", () => {
    render(<NoticeDetails />);
    expect(screen.getByText("Notice 1")).toBeInTheDocument();
    expect(screen.getByAltText("Notice 1")).toBeInTheDocument();
  });

  it("Elimina la noticia al confirmar en el diálogo", async () => {
    askMock.mockImplementation(async (_msg, cb) => cb());
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

});
