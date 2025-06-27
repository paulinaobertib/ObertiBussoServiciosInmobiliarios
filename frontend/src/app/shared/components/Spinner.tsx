import { Box, CircularProgress } from '@mui/material';


export function Spinner({ fullHeight = false }: { fullHeight?: boolean }) {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height={fullHeight ? '100%' : 'auto'}
      p={2}
    >
      <CircularProgress />
    </Box>
  );
}
