import { Navigate, Route, Routes } from 'react-router-dom';
import { DoctorAgentPage } from '../features/ai/doctor-agent/DoctorAgentPage';
import { UserAgentPage } from '../features/ai/user-agent/UserAgentPage';
import { LandingPage } from '../features/landing/LandingPage';
import { RoleProtectedRoute } from './RoleProtectedRoute';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/asistente" element={<UserAgentPage />} />
      <Route element={<RoleProtectedRoute requiredRole="doctor" />}>
        <Route path="/medico/copiloto" element={<DoctorAgentPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
