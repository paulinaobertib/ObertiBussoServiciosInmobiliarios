import { Box, CircularProgress } from '@mui/material';

export const Loading = () => (

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
  >
    <CircularProgress />
  </Box >

);
