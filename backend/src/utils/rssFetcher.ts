import axios from 'axios';

const RETRYABLE_CODES = new Set(['ECONNABORTED', 'ENOTFOUND', 'ETIMEDOUT']);

const axiosConfig = {
  timeout: 8000,
  headers: { 'User-Agent': 'MyRSSBot/1.0' },
  maxRedirects: 10,
};

export async function fetchWithRetry(
  url: string,
  retries = 3,
  delayMs = 1000
): Promise<string> {
  try {
    const resp = await axios.get<string>(url, axiosConfig);
    return resp.data;
  } catch (err: any) {
    const shouldRetry =
      (err.code && RETRYABLE_CODES.has(err.code)) ||
      (err.response && err.response.status >= 500);
    if (retries > 0 && shouldRetry) {
      await new Promise((r) => setTimeout(r, delayMs));
      return fetchWithRetry(url, retries - 1, delayMs * 2);
    }
    throw err;
  }
}