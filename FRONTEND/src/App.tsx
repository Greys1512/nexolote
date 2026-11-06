import { useState, type ReactNode } from 'react';
import './assets/styles/app.css';
import { useAuth } from './hooks/useAuth';
import { useDashboard } from './hooks/useDashboard';
import Dashboard from './pages/Dashboard/Dashboard';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import NotFound from './pages/NotFound/NotFound';
import Catalogo from './pages/Catalogo/Catalogo';
import Produccion from './pages/Produccion/Produccion';
import Inventario from './pages/Inventario/Inventario';
import Mantenimiento from './pages/Mantenimiento/Mantenimiento';
import Usuarios from './pages/Usuarios/Usuarios';
import AppRoutes from './routes/AppRoutes';

function App() {
  const [activePage, setActivePage] = useState('Dashboard');
  const { token, usuario, iniciarSesion, cerrarSesion } = useAuth();
  const dashboard = useDashboard(!!token && activePage === 'Dashboard');

  if (!token) return <Login onLogin={iniciarSesion} />;

  const pages: Record<string, () => ReactNode> = {
    Dashboard: () => (
      <Dashboard stats={dashboard.stats} onNavigate={setActivePage} produccion={dashboard.produccion} inventario={dashboard.inventario} actividad={dashboard.actividad} />
    ),
    'Catálogo': () => <Catalogo />,
    'Producción': () => <Produccion />,
    Inventario: () => <Inventario />,
    Mantenimiento: () => <Mantenimiento />,
    Usuarios: () => <Usuarios />,
  };

  const salir = () => { cerrarSesion(); setActivePage('Dashboard'); };

  return (
    <Home
      activePage={activePage}
      usuario={usuario}
      onNavigate={setActivePage}
      onLogout={salir}
      actividad={dashboard.actividad.registros}
      stockBajo={dashboard.inventario.bajoMinimo}
    >
      <div className="page-content">
        <AppRoutes activePage={activePage} pages={pages} fallback={<NotFound page={activePage} onHome={() => setActivePage('Dashboard')} />} />
      </div>
    </Home>
  );
}

export default App;
