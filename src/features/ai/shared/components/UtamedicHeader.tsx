import { NavLink } from 'react-router-dom';

export function UtamedicHeader() {
  return (
    <header className="app-header">
      <div className="brand" aria-label="Utamedic">
        <span className="brand-mark" aria-hidden="true">
          <span />
          <span />
        </span>
        <span>Utamedic</span>
      </div>

      <nav className="agent-navigation" aria-label="Agentes de IA">
        <NavLink to="/asistente">Asistente</NavLink>
        <NavLink to="/medico/copiloto">Copiloto médico</NavLink>
      </nav>
    </header>
  );
}
