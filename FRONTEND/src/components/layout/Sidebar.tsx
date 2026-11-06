import {
  Boxes,
  Factory,
  LayoutDashboard,
  Package,
  Users,
  Wrench,
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Catálogo', icon: Package },
  { name: 'Producción', icon: Factory },
  { name: 'Inventario', icon: Boxes },
  { name: 'Mantenimiento', icon: Wrench },
  { name: 'Usuarios', icon: Users },
];

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  rol?: string;
}

export default function Sidebar({ activePage, onNavigate, rol }: SidebarProps) {
  const items = menuItems.filter(
    ({ name }) => name !== 'Usuarios' || rol === 'Administrador',
  );

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <Factory size={25} />
        </div>
        <div>
          <h2>NEXOLOTE</h2>
          <span>GESTIÓN INDUSTRIAL</span>
        </div>
      </div>

      <div className="menu-label">MENÚ PRINCIPAL</div>

      <nav className="navigation" aria-label="Navegación principal">
        {items.map(({ name, icon: Icon }) => (
          <button
            type="button"
            key={name}
            className={`nav-item ${activePage === name ? 'active' : ''}`}
            aria-current={activePage === name ? 'page' : undefined}
            onClick={() => onNavigate(name)}
          >
            <Icon size={20} />
            <span>{name}</span>
            {activePage === name && <div className="active-indicator" />}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="system-status">
          <div className="status-dot" />
          <span>Sistema operativo</span>
        </div>
        <div className="version">NEXOLOTE v1.0.0</div>
      </div>
    </aside>
  );
}
