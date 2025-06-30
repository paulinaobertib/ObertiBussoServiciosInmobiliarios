import { Box } from '@mui/material';

export const Loader = ({ open }: { open: boolean }) =>
  open ? (
    <Box
      position="fixed"
      top={0}
      left={0}
      width="100%"
      height="100%"
      zIndex={(theme) => theme.zIndex.modal + 1000}
      display="flex"
      alignItems="center"
      justifyContent="center"
    />
  ) : null;