import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useConfirmDialog } from "../../components/ConfirmDialog";
import { AlertProvider } from "../../context/AlertContext";

function Wrapper() {
  const { ask } = useConfirmDialog();

  const handleClick = () => {
    ask("¿Estás seguro?", async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
  };

  return (
    <ThemeProvider theme={createTheme()}>
      <button onClick={handleClick}>Abrir diálogo</button>
    </ThemeProvider>
  );
}

describe("useConfirmDialog", () => {
  it("cierra el diálogo al hacer clic en 'Cancelar'", async () => {
    render(
      <AlertProvider>
        <Wrapper />
      </AlertProvider>
    );

    fireEvent.click(screen.getByText("Abrir diálogo"));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancelar"));

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
  });

it("ejecuta la función confirmación al hacer clic en 'Confirmar'", async () => {
  const confirmFn = vi.fn().mockResolvedValue(undefined);

  function CustomWrapper() {
    const { ask } = useConfirmDialog();
    return (
      <ThemeProvider theme={createTheme()}>
        <button
          onClick={() =>
            ask("¿Confirmar acción?", confirmFn, { double: false })
          }
        >
          Abrir
        </button>
      </ThemeProvider>
    );
  }

  render(
    <AlertProvider>
      <CustomWrapper />
    </AlertProvider>
  );

  fireEvent.click(screen.getByText("Abrir"));

  // ahora sí va a existir el botón "Confirmar"
  fireEvent.click(await screen.findByText("Confirmar"));

  await waitFor(() => {
    expect(confirmFn).toHaveBeenCalled();
  });
});

});
