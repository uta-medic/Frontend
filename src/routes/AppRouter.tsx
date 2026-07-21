import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import { AppLayout } from '../components/layout/AppLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { PlaceholderPage } from '../pages/PlaceholderPage';
import { AppointmentsPage } from '../pages/AppointmentsPage';

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
            element={
              <PlaceholderPage
                title="Registrar síntomas"
                description="Registra los síntomas declarados por el paciente."
                icon="✚"
              />
            }
          />

          <Route
            path="/evaluaciones"
            element={
              <PlaceholderPage
                title="Evaluación de pacientes"
                description="Revisa los síntomas y asigna una prioridad clínica."
                icon="✓"
              />
            }
          />

          <Route
            path="/fichas"
            element={
              <PlaceholderPage
                title="Fichas médicas"
                description="Genera la ficha médica y registra la llegada del paciente."
                icon="▤"
              />
            }
          />

          <Route
            path="/cola"
            element={
              <PlaceholderPage
                title="Cola de atención"
                description="Consulta la cola y la posición de cada paciente."
                icon="☷"
              />
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}