import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import { AppLayout } from '../components/layout/AppLayout';
import { AppointmentsPage } from '../pages/AppointmentsPage';
import { DashboardPage } from '../pages/DashboardPage';
import { MedicalTicketsPage } from '../pages/MedicalTicketsPage';
import { QueuePage } from '../pages/QueuePage';
import { RegisterSymptomsPage } from '../pages/RegisterSymptomsPage';
import { TriageAssessmentsPage } from '../pages/TriageAssessmentsPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />

          <Route
            path="/citas"
            element={<AppointmentsPage />}
          />

          <Route
            path="/sintomas"
            element={<RegisterSymptomsPage />}
          />

          <Route
            path="/evaluaciones"
            element={<TriageAssessmentsPage />}
          />

          <Route
            path="/fichas"
            element={<MedicalTicketsPage />}
          />

          <Route
            path="/cola"
            element={<QueuePage />}
          />
        </Route>

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}