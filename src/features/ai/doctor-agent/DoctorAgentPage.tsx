import { useOutletContext } from 'react-router-dom';
import type { RoleRouteContext } from '../../../routes/RoleProtectedRoute';
import { ErrorState } from '../shared/components/ErrorState';
import { SafetyNotice } from '../shared/components/SafetyNotice';
import { UtamedicHeader } from '../shared/components/UtamedicHeader';
import { useNetworkStatus } from '../shared/hooks/useNetworkStatus';
import { ClinicalSummaryView } from './ClinicalSummaryView';
import { DifferentialForm } from './DifferentialForm';
import { DifferentialResultView } from './DifferentialResultView';
import { DoctorChatPanel } from './DoctorChatPanel';
import { DoctorQuickActions } from './DoctorQuickActions';
import {
  DOCTOR_QUICK_ACTIONS,
  DOCTOR_SAFETY_NOTICE,
} from './doctorAgent.config';
import { PatientContextPanel } from './PatientContextPanel';
import { useDoctorCopilot } from './useDoctorCopilot';

export function DoctorAgentPage() {
  const routeContext = useOutletContext<RoleRouteContext>();
  const isOnline = useNetworkStatus();
  const copilot = useDoctorCopilot();
  const isBusy = Boolean(copilot.clinicalLoading || copilot.chatLoading);

  return (
    <div className="app-shell doctor-shell">
      <UtamedicHeader />
      <main className="doctor-page">
        <header className="doctor-hero">
          <div>
            <p className="eyebrow">Copiloto clínico</p>
            <h1>Espacio de apoyo para revisión médica</h1>
            <p>
              Organiza información ficticia y prepara insumos que siempre deben
              ser verificados por el profesional.
            </p>
          </div>
          <div className="doctor-hero__status">
            <span className={`availability-badge ${isOnline ? '' : 'availability-badge--offline'}`} role="status">
              <i aria-hidden="true" /> {isOnline ? 'En línea' : 'Sin conexión'}
            </span>
            <span className="demo-role-badge">
              {routeContext.mode === 'demo'
                ? 'Modo demo de rol · Sin autenticación real'
                : 'Rol médico verificado por sesión'}
            </span>
          </div>
        </header>

        <SafetyNotice emphasis>{DOCTOR_SAFETY_NOTICE}</SafetyNotice>

        <div className="doctor-workspace">
          <PatientContextPanel
            patient={copilot.selectedPatient}
            patients={copilot.patients}
            onPatientChange={copilot.changePatient}
          />

          <div className="doctor-copilot-panel">
            <DoctorQuickActions
              actions={DOCTOR_QUICK_ACTIONS}
              disabled={isBusy || !isOnline}
              onSelect={copilot.runQuickAction}
            />

            {!isOnline && (
              <div className="connectivity-state" role="alert">
                <strong>Sin conexión</strong>
                <span>No se pueden ejecutar solicitudes del copiloto.</span>
              </div>
            )}

            {copilot.chatError && (
              <ErrorState error={copilot.chatError} onRetry={copilot.retryChat} />
            )}
            {copilot.clinicalError && (
              <ErrorState
                error={copilot.clinicalError}
                onRetry={copilot.retryClinicalRequest}
              />
            )}

            <DoctorChatPanel
              messages={copilot.chatMessages}
              isLoading={copilot.chatLoading}
              isOnline={isOnline}
              onSend={copilot.sendDoctorMessage}
              onCancel={copilot.cancelChat}
            />

            {copilot.summary && (
              <ClinicalSummaryView summary={copilot.summary} />
            )}

            <DifferentialForm
              patient={copilot.selectedPatient}
              isLoading={copilot.clinicalLoading === 'differential'}
              onSubmit={copilot.generateDifferential}
            />

            {copilot.differential && (
              <DifferentialResultView result={copilot.differential} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
