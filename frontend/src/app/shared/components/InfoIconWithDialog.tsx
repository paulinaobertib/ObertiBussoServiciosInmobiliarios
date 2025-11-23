import React, { useState } from "react";
import { IconButton, useTheme, Box } from "@mui/material";
import InfoIcon from "../../../assets/ic_info.svg";
import { Modal } from "./Modal";

interface InfoIconWithDialogProps {
  title: string;
  description: string;
  size?: number;
}

export const InfoIconWithDialog: React.FC<InfoIconWithDialogProps> = ({
  title,
  description,
  size = 20,
}) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <IconButton
        onClick={handleOpen}
        size="small"
        sx={{
          p: 0.5,
          color: theme.palette.primary.main,
          "&:hover": {
            backgroundColor: "transparent",
            opacity: 0.7,
          },
        }}
        aria-label="Información"
      >
          <img
              src={InfoIcon}
              alt="info"
              width={size}
              height={size}
              style={{
                  filter: theme.palette.primary.main === "#EE671E" ? "invert(55%) sepia(82%) saturate(1123%) hue-rotate(352deg) brightness(95%) contrast(105%)" : "none",
              }}
          />
      </IconButton>

      <Modal open={open} title={title} onClose={handleClose} maxWidth="sm">
        <Box
          component="div"
          sx={{
            whiteSpace: "pre-line",
            lineHeight: 1.6,
            fontFamily: theme.typography.fontFamily,
          }}
        >
          {description}
        </Box>
      </Modal>
    </>
  );
};

