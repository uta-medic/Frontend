import { env } from '../../../../config/env';
import type { AiApiProvider } from '../types/ai.types';
import { mockAiApi } from './mockAiApi';
import { realAiApi } from './realAiApi';

export function createAiApiProvider(): AiApiProvider {
  return env.useAiMocks ? mockAiApi : realAiApi;
}
