import { AiChatLayout } from '../shared/components/AiChatLayout';
import {
  USER_QUICK_ACTIONS,
  USER_WELCOME_MESSAGE,
} from './userAgent.config';

const USER_SAFETY_NOTICE =
  'Puedo ayudarte a encontrar centros médicos, especialidades, horarios, costos y servicios. También puedo orientarte de forma general, pero no reemplazo una evaluación médica.';

export function UserAgentPage() {
  return (
    <AiChatLayout
      agent="user"
      eyebrow="Asistente para pacientes"
      title="Asistente Utamedic"
      description="Información de servicios de salud y orientación general, en una conversación clara y segura."
      safetyNotice={USER_SAFETY_NOTICE}
      emptyTitle="Inicia una conversación"
      emptyDescription="Pregunta por una especialidad, centro médico, horario, costo o servicio."
      placeholder="Ej.: Busco un cardiólogo cerca de mí"
      welcomeMessage={USER_WELCOME_MESSAGE}
      quickActions={USER_QUICK_ACTIONS}
      enableLocation
    />
  );
}
