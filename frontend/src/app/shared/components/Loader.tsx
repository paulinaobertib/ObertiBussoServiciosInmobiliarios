import { Box, CircularProgress, Typography } from '@mui/material';
import logo from '../../../assets/logoJPG.png';
// import logo from '../../../assets/ic_casa2.png'

type LoadingProps = {
  message?: string;
};

export const Loading = ({
  message = 'Preparando tu experiencia…',
}: LoadingProps) => (
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
    bgcolor={(theme) => theme.palette.background.default || '#fff'}
  >
    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
        <Box
          component="img"
          src={logo}
          alt="Logo"
  sx={{
    height: "8rem",
    objectFit: "contain",
    filter: "invert(1)" // invierte blancos ↔ negros
  }}        />
      <CircularProgress size={"3rem"}/>
      {message && (
        <Typography color="text.secondary" sx={{ mt: 1, textAlign: 'center', px: 2 }}>
          {message}
        </Typography>
      )}
    </Box>
  </Box>
);
