import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, Box, Stack, Button, Typography, useTheme } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";

type Kind = "success" | "info" | "warning" | "error";
type Mode = "notice" | "confirm" | "double";

type Options = {
  title?: string;
  description?: React.ReactNode;
  primaryLabel?: string;
  secondaryLabel?: string;
  step2Title?: string;
  step2Description?: React.ReactNode;
  swapOnSecond?: boolean; // double
  disableBackdropClose?: boolean;
};

type State = {
  open: boolean;
  mode: Mode;
  kind: Kind;
  step: 1 | 2;
  opts: Options;
};

type CtxApi = {
  // API legacy (se mantiene)
  showAlert: (message: string, type?: Kind, opts?: Partial<Options>) => Promise<void>;
  // Azúcar moderna
  success: (o?: Options) => Promise<void>;
  info: (o?: Options) => Promise<void>;
  warning: (o?: Options) => Promise<void>;
  error: (o?: Options) => Promise<void>;
  confirm: (o?: Options) => Promise<boolean>;
  doubleConfirm: (o?: Options) => Promise<boolean>;
};

const Ctx = createContext<CtxApi | null>(null);

export const useGlobalAlert = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useGlobalAlert must be used within <AlertProvider>");
  return ctx;
};

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const [st, setSt] = useState<State | null>(null);
  const resolver = useRef<((v: any) => void) | null>(null);

  const palette = useMemo(
    () => ({
      success: { icon: <CheckCircleOutlineIcon fontSize="inherit" />, color: theme.palette.success.main },
      info: { icon: <InfoOutlinedIcon fontSize="inherit" />, color: theme.palette.info.main },
      warning: { icon: <WarningAmberOutlinedIcon fontSize="inherit" />, color: theme.palette.warning.main },
      error: { icon: <ErrorOutlineOutlinedIcon fontSize="inherit" />, color: theme.palette.error.main },
    }),
    [theme]
  );

  const open = useCallback(
    (mode: Mode, kind: Kind, opts?: Options) =>
      new Promise<boolean | void>((resolve) => {
        resolver.current = resolve;
        setSt({
          open: true,
          mode,
          kind,
          step: 1,
          opts: {
            primaryLabel: mode === "notice" ? "Aceptar" : "Confirmar",
            secondaryLabel: mode === "notice" ? undefined : "Cancelar",
            disableBackdropClose: true,
            swapOnSecond: true,
            ...opts,
          },
        });
      }),
    []
  );

  // ---- API pública ----
  const showAlert = useCallback(
    (message: string, type: Kind = "info", opts?: Partial<Options>) =>
      open("notice", type, {
        title: opts?.title ?? (type === "success" ? "Listo" : type === "error" ? "Ocurrió un error" : "Atención"),
        description: message,
        primaryLabel: opts?.primaryLabel ?? "Aceptar",
        ...opts,
      }) as Promise<void>,
    [open]
  );

  const success = useCallback(
    (o?: Options) => open("notice", "success", { title: "Listo", ...o }) as Promise<void>,
    [open]
  );
  const info = useCallback(
    (o?: Options) => open("notice", "info", { title: "Atención", ...o }) as Promise<void>,
    [open]
  );
  const warning = useCallback(
    (o?: Options) => open("notice", "warning", { title: "Atención", ...o }) as Promise<void>,
    [open]
  );
  const error = useCallback(
    (o?: Options) => open("notice", "error", { title: "Ocurrió un error", ...o }) as Promise<void>,
    [open]
  );

  const confirm = useCallback(
    (o?: Options) => open("confirm", "warning", { title: "¿Confirmás la acción?", ...o }) as Promise<boolean>,
    [open]
  );

  const doubleConfirm = useCallback(
    (o?: Options) =>
      open("double", "error", {
        title: "Esta acción es sensible",
        description: "Vas a realizar un cambio importante.",
        step2Title: "¿Estás seguro?",
        step2Description: "Confirmá nuevamente para continuar.",
        swapOnSecond: true,
        ...o,
      }) as Promise<boolean>,
    [open]
  );

  // ---- cierre/acciones ----
  const close = (value?: any) => {
    setSt(null);
    resolver.current?.(value);
    resolver.current = null;
  };
  const onPrimary = () => {
    if (!st) return;
    if (st.mode === "notice") return close(undefined);
    if (st.mode === "confirm") return close(true);
    if (st.mode === "double") {
      if (st.step === 1) setSt({ ...st, step: 2 });
      else close(true);
    }
  };
  const onSecondary = () => {
    if (!st) return;
    if (st.mode === "notice") return close(undefined);
    close(false);
  };

  // ---- UI ----
  const ui = !st ? null : (
    <Dialog
      open={st.open}
      onClose={st.opts.disableBackdropClose ? undefined : () => close(false)}
      maxWidth="sm"
      fullWidth
      sx={{ "& .MuiPaper-root": { p: { xs: 3, sm: 4 }, borderRadius: 4 } }}
    >
      <DialogContent>
        <Box display="grid" justifyItems="center">
          <Box
            sx={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              bgcolor: theme.palette.grey[100],
              color: palette[st.kind].color,
              display: "grid",
              placeItems: "center",
              fontSize: 38,
              mb: 2,
            }}
          >
            {palette[st.kind].icon}
          </Box>

          <Typography variant="h4" fontWeight={800} textAlign="center" mb={1.5}>
            {st.mode === "double" && st.step === 2 ? st.opts.step2Title ?? st.opts.title ?? "" : st.opts.title ?? ""}
          </Typography>

          {(st.mode !== "notice" || st.opts.description) && (
            <Typography variant="body1" color="text.secondary" textAlign="center" mb={3}>
              {st.mode === "double" && st.step === 2
                ? st.opts.step2Description ?? st.opts.description
                : st.opts.description}
            </Typography>
          )}

          <Stack direction="row" gap={2} width="100%">
            {st.mode === "double" && st.step === 2 && st.opts.swapOnSecond ? (
              <>
                <Button onClick={onPrimary} fullWidth size="large" variant="contained" sx={{ borderRadius: 2 }}>
                  {st.opts.primaryLabel ?? "Sí, continuar"}
                </Button>
                <Button onClick={onSecondary} fullWidth size="large" variant="outlined" sx={{ borderRadius: 2 }}>
                  {st.opts.secondaryLabel ?? "No"}
                </Button>
              </>
            ) : (
              <>
                {st.mode !== "notice" && (
                  <Button onClick={onSecondary} fullWidth size="large" variant="outlined" sx={{ borderRadius: 2 }}>
                    {st.opts.secondaryLabel ?? "Cancelar"}
                  </Button>
                )}
                <Button onClick={onPrimary} fullWidth size="large" variant="contained" sx={{ borderRadius: 2 }}>
                  {st.mode === "double" && st.step === 2
                    ? st.opts.primaryLabel ?? "Sí, continuar"
                    : st.opts.primaryLabel ?? (st.mode === "notice" ? "Aceptar" : "Confirmar")}
                </Button>
              </>
            )}
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );

  const api: CtxApi = { showAlert, success, info, warning, error, confirm, doubleConfirm };

  return (
    <Ctx.Provider value={api}>
      {children}
      {ui}
    </Ctx.Provider>
  );
}
