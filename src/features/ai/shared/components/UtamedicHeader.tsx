import { Link, NavLink } from 'react-router-dom';

export function UtamedicHeader() {
  return (
    <header className="app-header">
      <Link className="brand" to="/" aria-label="Utamedic, volver al inicio">
        <span className="brand-mark" aria-hidden="true">
          <span />
          <span />
        </span>
        <span>Utamedic</span>
      </Link>

      <nav className="agent-navigation" aria-label="Agentes de IA">
        <NavLink to="/asistente">Asistente</NavLink>
        <NavLink to="/medico/copiloto">Copiloto médico</NavLink>
      </nav>
    </header>
  );
}
