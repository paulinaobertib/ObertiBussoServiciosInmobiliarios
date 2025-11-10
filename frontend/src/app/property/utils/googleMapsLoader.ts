const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

let loadPromise: Promise<any> | null = null;

export const loadGoogleMapsSdk = (): Promise<any> => {
  if (!GOOGLE_MAPS_KEY) {
    return Promise.reject(new Error("Falta configurar VITE_GOOGLE_MAPS_API_KEY"));
  }

  // Si ya está cargado, retornar inmediatamente
  if ((window as any).google?.maps?.Map) {
    return Promise.resolve((window as any).google);
  }

  // Si ya hay una promesa de carga, retornarla
  if (loadPromise) {
    return loadPromise;
  }

  // Crear nueva promesa de carga
  loadPromise = new Promise((resolve, reject) => {
    // Verificar nuevamente por si se cargó mientras esperábamos
    if ((window as any).google?.maps?.Map) {
      resolve((window as any).google);
      return;
    }

    // Crear callback global único
    const callbackName = `__googleMapsCallback`;
    
    (window as any)[callbackName] = () => {
      delete (window as any)[callbackName];
      resolve((window as any).google);
    };

    // Crear e insertar el script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&callback=${callbackName}`;
    script.async = true;
    script.defer = true;

    script.onerror = () => {
      delete (window as any)[callbackName];
      loadPromise = null; // Resetear para permitir reintentos
      reject(new Error('Error al cargar Google Maps'));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
};