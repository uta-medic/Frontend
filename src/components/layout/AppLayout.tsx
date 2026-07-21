import { NavLink, Outlet } from 'react-router-dom';
import '../../index.css';

const navigationItems = [
  { path: '/gestion', label: 'Inicio', icon: '⌂', end: true },
  { path: '/gestion/citas', label: 'Citas médicas', icon: '▣' },
  { path: '/gestion/sintomas', label: 'Registrar síntomas', icon: '✚' },
  { path: '/gestion/evaluaciones', label: 'Evaluaciones', icon: '✓' },
  { path: '/gestion/fichas', label: 'Fichas médicas', icon: '▤' },
  { path: '/gestion/cola', label: 'Cola de atención', icon: '☷' },
];

export function AppLayout() {
  return (
    <div className="ticket-management">
      <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">+</div>

          <div>
            <strong>UtaMedic</strong>
            <span>Gestión hospitalaria</span>
          </div>
        </div>

        <nav className="navigation">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                isActive
                  ? 'navigation-link navigation-link-active'
                  : 'navigation-link'
              }
            >
              <span className="navigation-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="system-status">
          <span className="status-dot" />
          Backend conectado
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <div>
            <span>Plataforma de atención médica</span>
            <h1>Panel hospitalario</h1>
          </div>

          <div className="user-area">
            <div className="user-avatar">GM</div>

            <div>
              <strong>Personal médico</strong>
              <span>UtaMedic</span>
            </div>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
      </div>
    </div>
  );
}
