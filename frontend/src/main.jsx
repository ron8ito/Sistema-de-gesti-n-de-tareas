// =========================================================
// MAIN.JSX / INDEX.JSX (PUNTO DE ENTRADA DE REACT)
// =========================================================
// Este archivo es el punto inicial de la aplicación.
// Se encarga de:
// - Renderizar la app en el DOM
// - Activar modo estricto de React
// - Configurar autenticación con Google (OAuth)
// =========================================================

// =========================
// IMPORTACIONES
// =========================

// Proveedor de autenticación con Google
import { GoogleOAuthProvider } from '@react-oauth/google';

// Modo estricto de React (detecta errores en desarrollo)
import { StrictMode } from 'react'

// Función para renderizar la app en el DOM
import { createRoot } from 'react-dom/client'

// Estilos globales
import './index.css'

// Componente principal
import App from './App.jsx'

// =========================
// RENDER DE LA APLICACIÓN
// =========================

// Selecciona el elemento HTML con id="root"
// (definido en index.html)
createRoot(document.getElementById('root')).render(

  // StrictMode ayuda a detectar problemas en desarrollo
  <StrictMode>

    {/* =========================
        GOOGLE OAUTH PROVIDER
       =========================
       Este proveedor:
       - Permite usar login con Google
       - Proporciona contexto global para autenticación
       - Usa el clientId de Google Cloud Console
    */}
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>

      {/* Debug en consola para confirmar que carga */}
      {console.log("GOOGLE PROVIDER actiVO")}

      {/* Aplicación principal */}
      <App />

    </GoogleOAuthProvider>

  </StrictMode>,
);