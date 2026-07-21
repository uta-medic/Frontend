import { useCallback, useEffect, useRef, useState } from 'react';
import { createAiApiProvider } from '../api/aiApi';
import { AiApiError } from '../api/aiApi.errors';
import type {
  AiAgent,
  AssistantChatMessage,
  ChatMessage,
  SendMessageContext,
} from '../types/ai.types';

const aiApi = createAiApiProvider();

interface PendingRequest {
  content: string;
  context?: SendMessageContext;
}

function createUserMessage(content: string): ChatMessage {
  return {
    id: `local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role: 'user',
    content,
    createdAt: new Date().toISOString(),
  };
}

function createWelcomeMessage(content?: string): AssistantChatMessage[] {
  if (!content) return [];

  return [
    {
      id: `welcome-${Date.now()}`,
      role: 'assistant',
      content,
      responseType: 'general',
      createdAt: new Date().toISOString(),
    },
  ];
}

export function useAiChat(agent: AiAgent, welcomeMessage?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    createWelcomeMessage(welcomeMessage),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AiApiError>();
  const conversationId = useRef<string | undefined>(undefined);
  const activeRequest = useRef<AbortController | undefined>(undefined);
  const loading = useRef(false);
  const lastFailedRequest = useRef<PendingRequest | undefined>(undefined);

  const cancelRequest = useCallback(() => {
    activeRequest.current?.abort();
    activeRequest.current = undefined;
    loading.current = false;
    setIsLoading(false);
  }, []);

  useEffect(() => cancelRequest, [cancelRequest]);

  const executeRequest = useCallback(
    async (request: PendingRequest, appendUserMessage: boolean) => {
      const normalizedContent = request.content.trim();
      if (!normalizedContent || loading.current) return;

      const controller = new AbortController();
      activeRequest.current = controller;
      loading.current = true;

      if (appendUserMessage) {
        setMessages((current) => [
          ...current,
          createUserMessage(normalizedContent),
        ]);
      }

      setError(undefined);
      setIsLoading(true);

      try {
        const result = await aiApi.sendMessage(
          {
            agent,
            message: normalizedContent,
            conversationId: conversationId.current,
            context: request.context,
          },
          { signal: controller.signal },
        );

        setMessages((current) => [...current, result.message]);
        conversationId.current = result.conversationId;
        lastFailedRequest.current = undefined;
      } catch (requestError) {
        if (
          !(requestError instanceof DOMException) ||
          requestError.name !== 'AbortError'
        ) {
          const nextError =
            requestError instanceof AiApiError
              ? requestError
              : new AiApiError(
                  requestError instanceof Error
                    ? requestError.message
                    : 'No pudimos obtener una respuesta.',
                );
          lastFailedRequest.current = request;
          setError(nextError);
        }
      } finally {
        if (activeRequest.current === controller) {
          activeRequest.current = undefined;
          loading.current = false;
          setIsLoading(false);
        }
      }
    },
    [agent],
  );

  const sendMessage = useCallback(
    (content: string, context?: SendMessageContext) =>
      executeRequest({ content, context }, true),
    [executeRequest],
  );

  const retryLastMessage = useCallback(async () => {
    if (lastFailedRequest.current) {
      await executeRequest(lastFailedRequest.current, false);
    }
  }, [executeRequest]);

  const startNewConversation = useCallback(async () => {
    const previousConversationId = conversationId.current;
    cancelRequest();
    conversationId.current = undefined;
    lastFailedRequest.current = undefined;
    setError(undefined);
    setMessages(createWelcomeMessage(welcomeMessage));

    if (previousConversationId && aiApi.deleteConversation) {
      try {
        await aiApi.deleteConversation({
          agent,
          conversationId: previousConversationId,
        });
      } catch (deleteError) {
        setError(
          deleteError instanceof AiApiError
            ? deleteError
            : new AiApiError('No pudimos cerrar la conversación anterior.'),
        );
      }
    }
  }, [agent, cancelRequest, welcomeMessage]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    cancelRequest,
    retryLastMessage,
    startNewConversation,
  };
}
