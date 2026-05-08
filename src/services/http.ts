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
      if (axios.isCancel(error) || (error instanceof Error && error.name === 'AbortError')) {
        throw error;
      }
      if (attempt < retries) {
        const delay = Math.min(350 * 2 ** attempt, 2200);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
