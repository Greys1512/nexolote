import type { ReactNode } from 'react';
import type { Usuario } from '../../services/api';
import type { ActividadDashboard } from '../../types/domain';
import Footer from '../../components/layout/Footer';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';

interface HomeProps {
  activePage: string;
  usuario: Usuario | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  actividad: ActividadDashboard[];
  stockBajo: number;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  children: ReactNode;
}

export default function Home({
  activePage,
  usuario,
  onNavigate,
  onLogout,
  actividad,
  stockBajo,
  sidebarCollapsed,
  toggleSidebar,
  children,
}: HomeProps) {
  return (
    <div className="app-container">
      <Sidebar
        activePage={activePage}
        onNavigate={onNavigate}
        rol={usuario?.rol}
        collapsed={sidebarCollapsed}
      />
      <main className="main-content">
        <Navbar
          activePage={activePage}
          usuario={usuario}
          onLogout={onLogout}
          onNavigate={onNavigate}
          actividad={actividad}
          stockBajo={stockBajo}
          toggleSidebar={toggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
        />
        {children}
        <Footer />
      </main>
    </div>
  );
}
