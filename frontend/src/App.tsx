import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import Routes from './Routes';
import { BrowserRouter } from 'react-router-dom';
import { PropertyCrudProvider } from './app/property/context/PropertiesContext';
import { AlertProvider } from './app/property/context/AlertContext';
import "./index.css"

function App() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const baseUrl = import.meta.env.VITE_BASE_URL;

  console.log('API URL en App:', apiUrl);
  console.log('BASE URL en App:', baseUrl);

  return (
    <ThemeProvider theme={theme}>
      <AlertProvider>
        <PropertyCrudProvider>
          <BrowserRouter>
            <Routes />
          </BrowserRouter>
        </PropertyCrudProvider>
      </AlertProvider>
    </ThemeProvider>
  );
}

export default App;