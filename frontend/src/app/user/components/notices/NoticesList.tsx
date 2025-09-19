import { Box } from "@mui/material";

import { NoticeItem } from "./NoticeItem";
import type { Notice } from "../../types/notice";

interface Props {
  notices: Notice[];
  isAdmin: boolean;
  visibleCount: number;
  onUpdate: (n: Notice) => Promise<void>;
  onDeleteClick: (id: number) => void;
}

export const NoticesList = ({ notices, isAdmin, visibleCount, onUpdate, onDeleteClick }: Props) => {
  const items = notices.slice(0, visibleCount);

  return (
    <Box
      sx={{
        width: "100%",
        boxSizing: "border-box",
        display: "grid",
        // 1 col en móvil, 2 en sm, 3 en md+
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
          md: "repeat(3, minmax(0, 1fr))",
        },
        gap: { xs: 2, sm: 2.5, md: 3 }, // usa theme.spacing
        alignItems: "stretch",
      }}
    >
      {items.map((n) => (
        <Box
          key={n.id}
          sx={{
            boxSizing: "border-box",
            minWidth: 0, // evita overflow por textos largos
            height: "100%", // estira la tarjeta
          }}
        >
          <NoticeItem notice={n} isAdmin={isAdmin} onUpdate={onUpdate} onDeleteClick={onDeleteClick} />
        </Box>
      ))}
    </Box>
  );
};
