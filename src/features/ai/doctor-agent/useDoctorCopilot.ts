import { useCallback, useRef, useState } from 'react';
import { createAiApiProvider } from '../shared/api/aiApi';
import { AiApiError } from '../shared/api/aiApi.errors';
import { useAiChat } from '../shared/hooks/useAiChat';
import type {
  ClinicalDifferentialResult,
  ClinicalSummary,
  DifferentialRequest,
} from '../shared/types/ai.types';
import type { DoctorQuickAction } from './doctorAgent.config';
import { DOCTOR_WELCOME_MESSAGE } from './doctorAgent.config';
import { DEMO_PATIENTS } from './doctorMockData';

const aiApi = createAiApiProvider();

type ClinicalRequest =
  | { type: 'summary' }
  | { type: 'differential'; request: DifferentialRequest };

export function useDoctorCopilot() {
  const [selectedPatientId, setSelectedPatientId] = useState(
    DEMO_PATIENTS[0].patientId,
  );
  const [summary, setSummary] = useState<ClinicalSummary>();
  const [differential, setDifferential] =
    useState<ClinicalDifferentialResult>();
  const [clinicalError, setClinicalError] = useState<AiApiError>();
  const [clinicalLoading, setClinicalLoading] = useState<
    'summary' | 'differential'
  >();
  const clinicalController = useRef<AbortController | undefined>(undefined);
  const lastClinicalRequest = useRef<ClinicalRequest | undefined>(undefined);
  const chat = useAiChat('doctor', DOCTOR_WELCOME_MESSAGE);
  const selectedPatient =
    DEMO_PATIENTS.find(
      (patient) => patient.patientId === selectedPatientId,
    ) ?? DEMO_PATIENTS[0];

  const cancelClinicalRequest = useCallback(() => {
    clinicalController.current?.abort();
    clinicalController.current = undefined;
    setClinicalLoading(undefined);
  }, []);

  const generateSummary = useCallback(async () => {
    cancelClinicalRequest();
    const controller = new AbortController();
    clinicalController.current = controller;
    lastClinicalRequest.current = { type: 'summary' };
    setClinicalError(undefined);
    setClinicalLoading('summary');

    try {
      const result = await aiApi.generateClinicalSummary(
        { patientId: selectedPatientId },
        { signal: controller.signal },
      );
      setSummary(result);
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        setClinicalError(
          error instanceof AiApiError
            ? error
            : new AiApiError('No se pudo generar el resumen clínico.'),
        );
      }
    } finally {
      if (clinicalController.current === controller) {
        clinicalController.current = undefined;
        setClinicalLoading(undefined);
      }
    }
  }, [cancelClinicalRequest, selectedPatientId]);

  const generateDifferential = useCallback(
    async (request: DifferentialRequest) => {
      cancelClinicalRequest();
      const controller = new AbortController();
      clinicalController.current = controller;
      lastClinicalRequest.current = { type: 'differential', request };
      setClinicalError(undefined);
      setClinicalLoading('differential');

      try {
        const result = await aiApi.generateDifferential(
          { patientId: selectedPatientId, ...request },
          { signal: controller.signal },
        );
        setDifferential(result);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setClinicalError(
            error instanceof AiApiError
              ? error
              : new AiApiError(
                  'No se pudieron generar posibilidades diferenciales.',
                ),
          );
        }
      } finally {
        if (clinicalController.current === controller) {
          clinicalController.current = undefined;
          setClinicalLoading(undefined);
        }
      }
    },
    [cancelClinicalRequest, selectedPatientId],
  );

  const retryClinicalRequest = useCallback(async () => {
    if (lastClinicalRequest.current?.type === 'summary') {
      await generateSummary();
    } else if (lastClinicalRequest.current?.type === 'differential') {
      await generateDifferential(lastClinicalRequest.current.request);
    }
  }, [generateDifferential, generateSummary]);

  const sendDoctorMessage = useCallback(
    (message: string) =>
      chat.sendMessage(message, { patientId: selectedPatientId }),
    [chat, selectedPatientId],
  );

  const runQuickAction = useCallback(
    async (action: DoctorQuickAction) => {
      if (action.kind === 'summary') {
        await generateSummary();
        return;
      }

      if (action.kind === 'differential') {
        await generateDifferential({
          chiefComplaint: selectedPatient.chiefComplaint,
          symptoms: selectedPatient.symptoms,
          duration: 'Duración pendiente de precisar',
        });
        return;
      }

      await sendDoctorMessage(action.prompt);
    },
    [generateDifferential, generateSummary, selectedPatient, sendDoctorMessage],
  );

  const changePatient = useCallback(
    async (patientId: string) => {
      if (patientId === selectedPatientId) return;

      cancelClinicalRequest();
      chat.cancelRequest();
      setSelectedPatientId(patientId);
      setSummary(undefined);
      setDifferential(undefined);
      setClinicalError(undefined);
      lastClinicalRequest.current = undefined;
      await chat.startNewConversation();
    },
    [cancelClinicalRequest, chat, selectedPatientId],
  );

  return {
    selectedPatient,
    selectedPatientId,
    patients: DEMO_PATIENTS,
    summary,
    differential,
    clinicalError,
    clinicalLoading,
    chatMessages: chat.messages,
    chatLoading: chat.isLoading,
    chatError: chat.error,
    changePatient,
    runQuickAction,
    generateDifferential,
    retryClinicalRequest,
    sendDoctorMessage,
    retryChat: chat.retryLastMessage,
    cancelChat: chat.cancelRequest,
  };
}
