import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import { Routes } from './Routes';
import { ComparisonProvider } from './context/comparisonContext';

function App() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const baseUrl = import.meta.env.VITE_BASE_URL;

  console.log('API URL en App:', apiUrl);
  console.log('BASE URL en App:', baseUrl);

  return (
    <ThemeProvider theme={theme}>
      <ComparisonProvider>
        <Routes />
      </ComparisonProvider>
    </ThemeProvider>
  );
}

export default App;
