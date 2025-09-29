import { Box, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ReactNode } from "react";
import { alpha, useTheme } from "@mui/material/styles";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  minHeight?: number;
  tone?: "neutral" | "error";
  sx?: SxProps<Theme>;
}

export const EmptyState = ({
  title,
  description,
  icon,
  action,
  minHeight = 200,
  tone = "neutral",
  sx,
}: EmptyStateProps) => {
  const theme = useTheme();
  const resolvedDescription = description
    ? description
    : tone === "error"
    ? "No pudimos cargar la información. Intenta nuevamente más tarde."
    : "Mantente atento a nuevas actualizaciones.";

  return (
    <Box
      sx={[
        {
          // px: { xs: 3, sm: 4 },
          // py: { xs: 3, sm: 5 },
          minHeight,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: 1.5,
          maxWidth: 480,
          mx: "auto",
        },
        ...(tone === "error"
          ? [
              {
                borderColor: theme.palette.error.light,
                boxShadow: `0px 16px 36px ${alpha(theme.palette.error.main, 0.18)}`,
              },
            ]
          : []),
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {icon}
      <Typography variant="subtitle1" fontWeight={600} color="text.primary">
        {title}
      </Typography>
      <Typography variant="body2" color={tone === "error" ? "error.main" : "text.secondary"} sx={{ maxWidth: 360 }}>
        {resolvedDescription}
      </Typography>
      {action}
    </Box>
  );
};
