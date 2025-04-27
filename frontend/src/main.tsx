import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { CRUDProvider } from './context/CRUDContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <CRUDProvider >
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </CRUDProvider >
);
