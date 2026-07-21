import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'doctor' | 'paciente' | 'admin';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  ci: string;
}

interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(sessionStorage.getItem('access_token'));
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = sessionStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });

  function login(newToken: string, newUser: AuthUser) {
    sessionStorage.setItem('access_token', newToken);
    sessionStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}