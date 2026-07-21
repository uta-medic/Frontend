import { useState } from 'react';
import { useAuth } from './AuthContext';

const API_URL = import.meta.env.VITE_SIGNALING_URL || 'http://localhost:3000';

type Mode = 'login' | 'register';

export default function Login() {
  const { login } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [ci, setCi] = useState('');
  const [role, setRole] = useState<'doctor' | 'paciente'>('paciente');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
    const body =
      mode === 'login'
        ? { email, password }
        : { email, password, name, ci, role };

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        const message = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        throw new Error(message || 'Error al procesar la solicitud');
      }

      login(data.access_token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="telemedicine-auth">
      <aside className="telemedicine-auth__intro">
        <span className="telemedicine-auth__icon" aria-hidden="true">+</span>
        <span className="telemedicine-kicker">Acceso seguro</span>
        <h3>Todo listo para cuidar de ti.</h3>
        <p>Ingresa para acceder a la sala virtual y comunicarte con el profesional asignado.</p>
        <ul>
          <li><span>✓</span> Verificación de identidad</li>
          <li><span>✓</span> Audio y video privados</li>
          <li><span>✓</span> Chat durante la consulta</li>
        </ul>
      </aside>

      <div className="precall-form telemedicine-auth__form">
        <div className="telemedicine-auth__heading">
          <span>{mode === 'login' ? 'Bienvenido de nuevo' : 'Únete a Utamedic'}</span>
          <h2>{mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</h2>
          <p>{mode === 'login' ? 'Usa tus credenciales para continuar.' : 'Completa tus datos para acceder a la plataforma.'}</p>
        </div>

        <form onSubmit={handleSubmit}>
        {mode === 'register' && (
          <>
            <div className="form-group">
              <label htmlFor="telemedicine-role">Tipo de cuenta</label>
              <select id="telemedicine-role" value={role} onChange={(e) => setRole(e.target.value as 'doctor' | 'paciente')}>
                <option value="paciente">Paciente</option>
                <option value="doctor">Médico</option>
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="telemedicine-name">Nombre completo</label>
                <input id="telemedicine-name" type="text" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Tu nombre" required />
              </div>
              <div className="form-group">
                <label htmlFor="telemedicine-ci">Documento de identidad</label>
                <input id="telemedicine-ci" type="text" value={ci} onChange={(e) => setCi(e.target.value)} placeholder="Número de CI" required />
              </div>
            </div>
          </>
        )}

        <div className="form-group">
          <label htmlFor="telemedicine-email">Correo electrónico</label>
          <input id="telemedicine-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="nombre@correo.com" required />
        </div>
        <div className="form-group">
          <label htmlFor="telemedicine-password">Contraseña</label>
          <input id="telemedicine-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="Mínimo 6 caracteres" required minLength={6} />
        </div>

        {error && <p className="error-text" role="alert">{error}</p>}

        <button className="telemedicine-submit" type="submit" disabled={loading}>
          {loading ? 'Procesando...' : mode === 'login' ? 'Ingresar' : 'Registrarme'}
        </button>
      </form>

        <p className="telemedicine-auth__switch">
        {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
        <button type="button" className="link-button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Crear una cuenta' : 'Iniciar sesión'}
        </button>
        </p>
      </div>
    </div>
  );
}
