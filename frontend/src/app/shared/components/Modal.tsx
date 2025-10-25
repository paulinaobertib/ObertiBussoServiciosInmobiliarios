import React from "react";
import { Dialog, DialogContent, DialogTitle, IconButton, useTheme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { SxProps, Theme } from "@mui/material/styles";

export interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  contentSx?: SxProps<Theme>;
}

export const Modal = ({ open, title, onClose, children, maxWidth = "sm", contentSx }: Props) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth={maxWidth}
      onClose={(_, reason) => {
        if (reason !== "backdropClick") onClose();
      }}
      PaperProps={{
        sx: {
          borderRadius: 3,
          width: "100%",
          p: { xs: 1.5, sm: 2 },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: "bold",
          color: theme.palette.primary.main,
          mb: 1,
          pr: 1,
        }}
      >
        {title}
        <IconButton
          data-testid="inquiry-form-close"
          onClick={onClose}
          sx={{ color: theme.palette.primary.main }}
          aria-label="cerrar modal"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        dividers
        sx={[
          {
            maxHeight: { xs: "calc(100vh - 140px)", sm: "calc(100vh - 180px)" },
            overflowY: "auto",
            p: { xs: 1.5, sm: 2.5 },
          },
          ...(Array.isArray(contentSx) ? contentSx : contentSx ? [contentSx] : []),
        ]}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
};
