import { Stack, Typography } from "@mui/material";
import type { Notice } from "../../types/notice";
import NoticeItem from "./NoticeItem";

interface Props {
  notices: Notice[];
  isAdmin: boolean;
  onEditClick: (n: Notice) => void;
  onDeleteClick: (id: number) => void;
}

export default function NoticesList({
  notices,
  isAdmin,
  onEditClick,
  onDeleteClick,
}: Props) {
  if (!notices.length) {
    return <Typography>No hay novedades.</Typography>;
  }
  return (
    <Stack spacing={3}>
      {notices.map((n) => (
        <NoticeItem
          key={n.id}
          notice={n}
          isAdmin={isAdmin}
          onEditClick={onEditClick}
          onDeleteClick={onDeleteClick}
        />
      ))}
    </Stack>
  );
}
