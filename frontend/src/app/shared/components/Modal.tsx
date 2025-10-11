import React from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export interface Props {
    open: boolean;
    title: string;
    onClose: () => void;
    children: React.ReactNode;
    maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
}

export const Modal = ({ open, title, onClose, children, maxWidth = "sm" }: Props) => {
    const theme = useTheme();

    return (
        <Dialog
            open={open}
            fullWidth
            maxWidth={maxWidth}
            onClose={(_, reason) => {
                if (reason !== "backdropClick") onClose();
            }}
            PaperProps={{ sx: { borderRadius: 2, p: 1 } }}
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontWeight: "bold",
                    color: theme.palette.primary.main,
                    mb: 1,
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
            <DialogContent dividers>{children}</DialogContent>
        </Dialog>
    );
}
