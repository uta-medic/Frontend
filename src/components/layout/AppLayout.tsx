import { Link, NavLink, Outlet } from 'react-router-dom';
import '../../index.css';
import './Management.css';

type ManagementIconName =
  | 'calendar'
  | 'check'
  | 'dashboard'
  | 'file'
  | 'heart'
  | 'home'
  | 'queue'
  | 'video';

function ManagementIcon({ name }: { name: ManagementIconName }) {
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M16 3v4M8 3v4M3 10h18" /><path d="M8 14h3M8 17h6" /></>,
    heart: <><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l7.8-7.5a5.5 5.5 0 0 0 1-7.9Z" /><path d="M8 12h2l1-2 2 5 1-3h2" /></>,
    check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
    file: <><path d="M6 2h8l4 4v16H6Z" /><path d="M14 2v5h5M9 12h6M9 16h6" /></>,
    queue: <><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0M16 7h5M18.5 4.5v5M16 15h5M16 19h5" /></>,
    home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v11h14V10M9 21v-7h6v7" /></>,
    video: <><rect x="3" y="5" width="13" height="14" rx="3" /><path d="m16 10 5-3v10l-5-3Z" /></>,
  } satisfies Record<ManagementIconName, React.ReactNode>;

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

const navigationItems = [
  { path: '/gestion', label: 'Resumen general', icon: 'dashboard' as const, end: true },
  { path: '/gestion/citas', label: 'Citas médicas', icon: 'calendar' as const },
  { path: '/gestion/sintomas', label: 'Registrar síntomas', icon: 'heart' as const },
  { path: '/gestion/evaluaciones', label: 'Evaluaciones', icon: 'check' as const },
  { path: '/gestion/fichas', label: 'Fichas médicas', icon: 'file' as const },
  { path: '/gestion/cola', label: 'Cola de atención', icon: 'queue' as const },
];

export function AppLayout() {
  return (
    <div className="ticket-management">
      <div className="app-layout">
        <aside className="sidebar">
          <Link className="management-brand" to="/gestion" aria-label="Utamedic Gestión, panel principal">
            <span className="management-brand__mark" aria-hidden="true"><span /><span /></span>
            <span><strong>Uta<span>medic</span></strong><small>Gestión clínica</small></span>
          </Link>

          <div className="sidebar-section-label">Espacio de trabajo</div>

          <nav className="navigation" aria-label="Navegación de gestión clínica">
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
                <span className="navigation-icon"><ManagementIcon name={item.icon} /></span>
                <span>{item.label}</span>
                <i aria-hidden="true">›</i>
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-shortcuts">
            <Link to="/teleconsulta"><ManagementIcon name="video" /><span><strong>Teleconsulta</strong><small>Abrir sala virtual</small></span></Link>
            <Link to="/"><ManagementIcon name="home" /><span><strong>Volver al inicio</strong><small>Ir a la landing</small></span></Link>
          </div>

          <div className="system-status">
            <span className="status-dot" />
            <span><strong>Sistema operativo</strong><small>Backend conectado</small></span>
          </div>
        </aside>

        <div className="main-content">
          <header className="topbar">
            <div className="topbar-copy">
              <span><i /> Plataforma de atención médica</span>
              <h1>Panel hospitalario</h1>
            </div>

            <div className="topbar-actions">
              <Link className="management-home-link" to="/">
                <ManagementIcon name="home" />
                <span>Ir al inicio</span>
              </Link>

              <div className="user-area">
                <div className="user-avatar">GM</div>
                <div><strong>Personal médico</strong><span>UtaMedic</span></div>
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
