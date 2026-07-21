import axios from 'axios';
import { env } from './env';

export const httpClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 20_000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});
