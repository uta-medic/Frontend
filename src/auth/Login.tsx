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
    <div className="precall-form">
      <h2>{mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</h2>

      <form onSubmit={handleSubmit}>
        {mode === 'register' && (
          <>
            <div className="form-group">
              <label>Soy:</label>
              <select value={role} onChange={(e) => setRole(e.target.value as 'doctor' | 'paciente')}>
                <option value="paciente">Paciente</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre completo</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>CI</label>
                <input type="text" value={ci} onChange={(e) => setCi(e.target.value)} required />
              </div>
            </div>
          </>
        )}

        <div className="form-group">
          <label>Correo electrónico</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Contraseña</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        </div>

        {error && <p className="error-text">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Procesando...' : mode === 'login' ? 'Ingresar' : 'Registrarme'}
        </button>
      </form>

      <p>
        {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
        <button type="button" className="link-button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
        </button>
      </p>
    </div>
  );
}