import { Backdrop, CircularProgress } from '@mui/material';

interface Props {
  open: boolean;
}

export default function LoadingBackdrop({ open }: Props) {
  return (
    <Backdrop open={open} sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
      <CircularProgress />
    </Backdrop>
  );
}