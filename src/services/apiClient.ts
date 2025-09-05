import { ENV, API_ENDPOINTS } from '@/config/environment';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginResponse extends ApiResponse {
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
    permissions?: string[];
  };
}

export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public endpoint?: string
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export class ApiClient {
  private config: ApiClientConfig;
  private token: string | null = null;

  constructor(config?: Partial<ApiClientConfig>) {
    this.config = {
      baseURL: ENV.API_BASE_URL,
      timeout: 30000,
      retries: 3,
      retryDelay: 1000,
      ...config,
    };
  }

  setToken(token: string | null): void {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt = 1
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle different response statuses
      if (response.status === 401) {
        this.token = null; // Clear invalid token
        localStorage.removeItem('auth-token');
        throw new ApiClientError('Authentication required', 401, 'UNAUTHORIZED', endpoint);
      }

      if (response.status === 403) {
        throw new ApiClientError('Access forbidden', 403, 'FORBIDDEN', endpoint);
      }

      if (response.status === 429) {
        // Rate limited - implement exponential backoff
        if (attempt <= this.config.retries) {
          const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
          await this.sleep(delay);
          return this.makeRequest(endpoint, options, attempt + 1);
        }
        throw new ApiClientError('Too many requests', 429, 'RATE_LIMITED', endpoint);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiClientError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.code,
          endpoint
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiClientError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiClientError(`Request timeout: ${endpoint}`, 408, 'TIMEOUT', endpoint);
      }

      // Network error - retry if possible
      if (attempt <= this.config.retries && !(error instanceof ApiClientError)) {
        const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
        await this.sleep(delay);
        return this.makeRequest(endpoint, options, attempt + 1);
      }

      throw new ApiClientError(
        error instanceof Error ? error.message : 'Unknown error',
        undefined,
        'NETWORK_ERROR',
        endpoint
      );
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.get(API_ENDPOINTS.HEALTH);
  }

  // Auth methods (disable retry for auth)
  async login(email: string, password: string): Promise<LoginResponse> {
    return this.makeRequest(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }, 1); // Single attempt, no retries
  }

  async refreshToken(): Promise<ApiResponse> {
    return this.post(API_ENDPOINTS.AUTH.REFRESH);
  }

  async verifyToken(): Promise<ApiResponse> {
    return this.get(API_ENDPOINTS.AUTH.VERIFY);
  }
}

// Default client instance
export const apiClient = new ApiClient();
export default apiClient;