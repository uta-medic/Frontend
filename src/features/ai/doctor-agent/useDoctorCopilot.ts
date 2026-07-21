import { useCallback, useEffect, useRef, useState } from 'react';
import { createAiApiProvider } from '../shared/api/aiApi';
import { AiApiError } from '../shared/api/aiApi.errors';
import { useAiChat } from '../shared/hooks/useAiChat';
import type {
  ClinicalDifferentialResult,
  ClinicalSummary,
  DemoPatient,
  DifferentialRequest,
} from '../shared/types/ai.types';
import type { DoctorQuickAction } from './doctorAgent.config';
import { DOCTOR_WELCOME_MESSAGE } from './doctorAgent.config';
import { getDoctorPatients } from './doctorPatientsApi';

const aiApi = createAiApiProvider();

type ClinicalRequest =
  | { type: 'summary' }
  | { type: 'differential'; request: DifferentialRequest };

export function useDoctorCopilot() {
  const [patients, setPatients] = useState<DemoPatient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>();
  const [patientsError, setPatientsError] = useState<AiApiError>();
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientsLoaded, setPatientsLoaded] = useState(false);
  const [summary, setSummary] = useState<ClinicalSummary>();
  const [differential, setDifferential] =
    useState<ClinicalDifferentialResult>();
  const [clinicalError, setClinicalError] = useState<AiApiError>();
  const [clinicalLoading, setClinicalLoading] = useState<
    'summary' | 'differential'
  >();
  const clinicalController = useRef<AbortController | undefined>(undefined);
  const patientsController = useRef<AbortController | undefined>(undefined);
  const lastClinicalRequest = useRef<ClinicalRequest | undefined>(undefined);
  const chat = useAiChat('doctor', DOCTOR_WELCOME_MESSAGE);
  const cancelChatRequest = chat.cancelRequest;
  const startNewChatConversation = chat.startNewConversation;
  const selectedPatient = patients.find(
    (patient) => patient.patientId === selectedPatientId,
  );

  useEffect(
    () => () => {
      patientsController.current?.abort();
      clinicalController.current?.abort();
    },
    [],
  );

  const cancelClinicalRequest = useCallback(() => {
    clinicalController.current?.abort();
    clinicalController.current = undefined;
    setClinicalLoading(undefined);
  }, []);

  const generateSummary = useCallback(async () => {
    if (!selectedPatientId) return;

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
      if (!selectedPatientId) return;

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
    (message: string) => {
      if (!selectedPatientId) return Promise.resolve();
      return chat.sendMessage(message, { patientId: selectedPatientId });
    },
    [chat, selectedPatientId],
  );

  const runQuickAction = useCallback(
    async (action: DoctorQuickAction) => {
      if (!selectedPatient) return;
      await sendDoctorMessage(action.prompt);
    },
    [selectedPatient, sendDoctorMessage],
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

  const loadPatients = useCallback(
    async () => {
      patientsController.current?.abort();
      cancelClinicalRequest();
      cancelChatRequest();

      const controller = new AbortController();
      patientsController.current = controller;
      setPatientsError(undefined);
      setPatientsLoading(true);
      setPatientsLoaded(false);
      setPatients([]);
      setSelectedPatientId(undefined);
      setSummary(undefined);
      setDifferential(undefined);
      setClinicalError(undefined);

      try {
        const nextPatients = await getDoctorPatients(controller.signal);
        setPatients(nextPatients);
        setSelectedPatientId(nextPatients[0]?.patientId);
        setPatientsLoaded(true);
        await startNewChatConversation();
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setPatientsError(
            error instanceof AiApiError
              ? error
              : new AiApiError('No se pudo cargar la lista de pacientes.'),
          );
        }
      } finally {
        if (patientsController.current === controller) {
          patientsController.current = undefined;
          setPatientsLoading(false);
        }
      }
    },
    [cancelChatRequest, cancelClinicalRequest, startNewChatConversation],
  );

  const retryPatients = useCallback(() => loadPatients(), [loadPatients]);

  useEffect(() => {
    void loadPatients();
  }, [loadPatients]);

  return {
    selectedPatient,
    selectedPatientId,
    patients,
    patientsError,
    patientsLoading,
    patientsLoaded,
    summary,
    differential,
    clinicalError,
    clinicalLoading,
    chatMessages: chat.messages,
    chatLoading: chat.isLoading,
    chatError: chat.error,
    changePatient,
    loadPatients,
    retryPatients,
    runQuickAction,
    generateDifferential,
    retryClinicalRequest,
    sendDoctorMessage,
    retryChat: chat.retryLastMessage,
    cancelChat: chat.cancelRequest,
  };
}
