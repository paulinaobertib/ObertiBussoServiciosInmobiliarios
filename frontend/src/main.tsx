import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 *  main.tsx es el punto de entrada de Vite/React.  
 *  Se limita a montar <App/> en #root.
 *  Todo el ruteo, provider de catálogos y tema MUI ya
 *  se inyectan dentro de App.tsx, así evitamos wrappers duplicados.
 */
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);