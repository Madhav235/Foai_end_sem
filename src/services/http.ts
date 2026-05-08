import axios from 'axios';

export const http = axios.create({
  timeout: 10000,
  headers: {
    Accept: 'application/json',
  },
});

export async function withRetry<T>(request: () => Promise<T>, retries = 2): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await request();
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 450 * (attempt + 1)));
      }
    }
  }

  throw lastError;
}
