import { Navigate, Outlet } from 'react-router-dom';

export type AppRole = 'doctor';

export interface AuthorizationSnapshot {
  isAuthenticated: boolean;
  roles: AppRole[];
}

export interface RoleRouteContext {
  mode: 'demo' | 'authenticated';
  requiredRole: AppRole;
}

interface RoleProtectedRouteProps {
  requiredRole: AppRole;
  authorization?: AuthorizationSnapshot;
}

export function RoleProtectedRoute({
  requiredRole,
  authorization,
}: RoleProtectedRouteProps) {
  // Modo demo temporal: no representa autenticación ni autorización reales.
  // Al integrar NestJS, authorization deberá venir del proveedor de sesión y
  // el backend seguirá siendo la autoridad final para cada operación clínica.
  if (!authorization) {
    return (
      <Outlet
        context={{ mode: 'demo', requiredRole } satisfies RoleRouteContext}
      />
    );
  }

  if (
    !authorization.isAuthenticated ||
    !authorization.roles.includes(requiredRole)
  ) {
    return <Navigate to="/asistente" replace />;
  }

  return (
    <Outlet
      context={{ mode: 'authenticated', requiredRole } satisfies RoleRouteContext}
    />
  );
}
