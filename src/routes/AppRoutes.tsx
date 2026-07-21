import { Navigate, Route, Routes } from 'react-router-dom';
import TelemedicinePage from '../App';
import { AppLayout } from '../components/layout/AppLayout';
import { DoctorAgentPage } from '../features/ai/doctor-agent/DoctorAgentPage';
import { UserAgentPage } from '../features/ai/user-agent/UserAgentPage';
import { LandingPage } from '../features/landing/LandingPage';
import { AppointmentsPage } from '../pages/AppointmentsPage';
import { DashboardPage } from '../pages/DashboardPage';
import { MedicalTicketsPage } from '../pages/MedicalTicketsPage';
import { QueuePage } from '../pages/QueuePage';
import { RegisterSymptomsPage } from '../pages/RegisterSymptomsPage';
import { TriageAssessmentsPage } from '../pages/TriageAssessmentsPage';
import { RoleProtectedRoute } from './RoleProtectedRoute';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/asistente" element={<UserAgentPage />} />
      <Route path="/teleconsulta" element={<TelemedicinePage />} />
      <Route element={<RoleProtectedRoute requiredRole="doctor" />}>
        <Route path="/medico/copiloto" element={<DoctorAgentPage />} />
        <Route path="/gestion" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="citas" element={<AppointmentsPage />} />
          <Route path="sintomas" element={<RegisterSymptomsPage />} />
          <Route path="evaluaciones" element={<TriageAssessmentsPage />} />
          <Route path="fichas" element={<MedicalTicketsPage />} />
          <Route path="cola" element={<QueuePage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
