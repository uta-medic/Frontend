import { Link, NavLink } from 'react-router-dom';
import './Telemedicine.css';
import VideoCall from './VideoCall';
import ContactWidget from './ContactWidget';
import Login from './auth/Login';
import { useAuth } from './auth/AuthContext';

const navigation = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/asistente', label: 'Asistente' },
  { to: '/gestion', label: 'Gestión' },
  { to: '/medico/copiloto', label: 'Copiloto médico' },
  { to: '/teleconsulta', label: 'Teleconsulta' },
];

function BrandMark() {
  return (
    <span className="telemedicine-brand__mark" aria-hidden="true">
      <span />
      <span />
    </span>
  );
}

function App() {
  const { user, logout } = useAuth();

  return (
    <div className="telemedicine-page">
      <header className="telemedicine-header">
        <div className="telemedicine-header__inner">
          <Link className="telemedicine-brand" to="/" aria-label="Utamedic, volver al inicio">
            <BrandMark />
            <span>Uta<span>medic</span></span>
          </Link>

          <nav className="telemedicine-nav" aria-label="Secciones de Utamedic">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => isActive ? 'is-active' : undefined}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="telemedicine-account">
            {user ? (
              <>
                <span className="telemedicine-account__avatar" aria-hidden="true">
                  {user.name.trim().charAt(0).toUpperCase()}
                </span>
                <span className="telemedicine-account__copy">
                  <strong>{user.name}</strong>
                  <small>{user.role === 'doctor' ? 'Médico' : 'Paciente'}</small>
                </span>
                <button className="telemedicine-logout" type="button" onClick={logout}>
                  Salir
                </button>
              </>
            ) : (
              <Link className="telemedicine-login-link" to="/teleconsulta#consulta">
                Ingresar
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="telemedicine-main">
        <section className="consultation-section" id="consulta">
          <header className="consultation-section__header">
            <div>
              <span className="telemedicine-kicker">Sala virtual</span>
              <h2>{user ? 'Tu espacio de consulta' : 'Ingresa para comenzar'}</h2>
              <p>
                {user
                  ? 'Comprueba tus datos y prepara tu cámara antes de entrar.'
                  : 'Accede con tu cuenta o crea una en pocos pasos.'}
              </p>
            </div>
            <span className="consultation-availability"><i /> Servicio disponible</span>
          </header>

          <div className="consultation-workspace">
            {user ? <VideoCall /> : <Login />}
          </div>
        </section>

        <section className="telemedicine-help-strip">
          <div>
            <span className="telemedicine-help-strip__icon" aria-hidden="true">?</span>
            <div><strong>¿Necesitas ayuda para conectarte?</strong><p>Nuestro equipo puede orientarte antes de iniciar la llamada.</p></div>
          </div>
          <Link to="/asistente">Abrir asistente <span aria-hidden="true">→</span></Link>
        </section>
      </main>

      <ContactWidget />

      <footer className="telemedicine-footer">
        <div className="telemedicine-footer__inner">
          <Link className="telemedicine-brand telemedicine-brand--footer" to="/">
            <BrandMark />
            <span>Uta<span>medic</span></span>
          </Link>
          <p>Salud digital clara, humana y accesible.</p>
          <nav aria-label="Enlaces de teleconsulta">
            <Link to="/">Inicio</Link>
            <Link to="/gestion">Gestión</Link>
            <Link to="/asistente">Asistente</Link>
          </nav>
          <small>© 2026 Utamedic. Una teleconsulta no reemplaza la atención de emergencias.</small>
        </div>
      </footer>
    </div>
  );
}

export default App;
