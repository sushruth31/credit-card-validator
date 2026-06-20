import axios, { type AxiosInstance } from 'axios';
import { API_CONFIG } from '../constants';

/**
 * Base HTTP client over one configured axios instance. Verbs return the
 * response body directly; failures reject with the native AxiosError, whose
 * `response` field tells a 4xx envelope apart from a dead connection. Domain
 * services extend this and call the protected verbs.
 */
export class ApiClient {
  private readonly http: AxiosInstance;

  constructor(baseURL = API_CONFIG.BASE_URL) {
    this.http = axios.create({
      baseURL,
      headers: { 'Content-Type': API_CONFIG.CONTENT_TYPE },
      timeout: API_CONFIG.TIMEOUT,
    });
  }

  protected async post<T>(url: string, data?: unknown): Promise<T> {
    const { data: body } = await this.http.post<T>(url, data);
    return body;
  }
}
