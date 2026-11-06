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
  collapsed?: boolean;
}

export default function Sidebar({ activePage, onNavigate, rol, collapsed = false }: SidebarProps) {
  const items = menuItems.filter(
    ({ name }) => name !== 'Usuarios' || rol === 'Administrador',
  );

  return (
    <aside
      className={`sidebar ${collapsed ? 'collapsed' : ''}`}
      id="main-sidebar"
      aria-label="Menú lateral"
    >
      <div className="brand">
        <div className="brand-icon">
          <Factory size={collapsed ? 20 : 25} />
        </div>
        {!collapsed && (
          <div>
            <h2>NEXOLOTE</h2>
            <span>GESTIÓN INDUSTRIAL</span>
          </div>
        )}
      </div>

      {!collapsed && <div className="menu-label">MENÚ PRINCIPAL</div>}

      <nav className="navigation" aria-label="Navegación principal">
        {items.map(({ name, icon: Icon }) => (
          <button
            type="button"
            key={name}
            className={`nav-item ${activePage === name ? 'active' : ''}`}
            aria-label={name}
            aria-current={activePage === name ? 'page' : undefined}
            title={collapsed ? name : undefined}
            onClick={() => onNavigate(name)}
          >
            <Icon size={collapsed ? 18 : 20} />
            {!collapsed && <span>{name}</span>}
            {activePage === name && <div className="active-indicator" />}
          </button>
        ))}
      </nav>

      {!collapsed && (
        <div className="sidebar-bottom">
          <div className="system-status">
            <div className="status-dot" />
            <span>Sistema operativo</span>
          </div>
          <div className="version">NEXOLOTE v1.0.0</div>
        </div>
      )}
    </aside>
  );
}
