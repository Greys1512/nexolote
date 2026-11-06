import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/styles/global.css'
import { aplicarTema, obtenerTema } from './hooks/useTheme'
import App from './App.tsx'

// Tema antes del primer render: sin parpadeo de claro y con la
// página de Login (que no monta la Navbar) también en modo oscuro.
aplicarTema(obtenerTema())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
