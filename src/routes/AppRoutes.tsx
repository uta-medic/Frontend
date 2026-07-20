import { Navigate, Route, Routes } from 'react-router-dom';
import { DoctorAgentPage } from '../features/ai/doctor-agent/DoctorAgentPage';
import { UserAgentPage } from '../features/ai/user-agent/UserAgentPage';
import { RoleProtectedRoute } from './RoleProtectedRoute';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/asistente" replace />} />
      <Route path="/asistente" element={<UserAgentPage />} />
      <Route element={<RoleProtectedRoute requiredRole="doctor" />}>
        <Route path="/medico/copiloto" element={<DoctorAgentPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/asistente" replace />} />
    </Routes>
  );
}
