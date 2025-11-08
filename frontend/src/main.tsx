import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { patchNavigationHistory } from './app/shared/utils/navigationPatch';

patchNavigationHistory();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      // .then(registration => {
      //   console.log('Service Worker registrado con éxito:', registration);
      // })
      .catch(error => {
        console.error('Error al registrar el Service Worker:', error);
      });
  });
}
