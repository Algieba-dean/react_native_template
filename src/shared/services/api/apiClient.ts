import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { defaultAppConfig } from '@app/appConfig';
import { ApiResponse, ApiError, RequestConfig } from './types';
import { structuredLogger } from '@shared/utils/structuredLogger';

export class ApiClient {
  private instance: AxiosInstance;

  constructor(
    baseURL: string = defaultAppConfig.apiBaseUrl,
    timeout: number = defaultAppConfig.timeoutMs,
  ) {
    this.instance = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.instance.interceptors.request.use(
      config => {
        structuredLogger.debug('api.client', 'request', {
          method: config.method?.toUpperCase() || 'UNKNOWN',
        });
        return config;
      },
      error => {
        structuredLogger.error('api.client', 'request_rejected');
        return Promise.reject(this.normalizeError(error));
      },
    );

    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        structuredLogger.debug('api.client', 'response', { status: response.status });
        return response;
      },
      (error: AxiosError) => {
        structuredLogger.error('api.client', 'request_failed', {
          code: error.code || 'ERR_UNKNOWN',
          status: error.response?.status || 0,
        });
        return Promise.reject(this.normalizeError(error));
      },
    );
  }

  private normalizeError(error: any): ApiError {
    if (axios.isAxiosError(error)) {
      return {
        code: error.code || 'ERR_NETWORK',
        message: (error.response?.data as any)?.message || error.message,
        status: error.response?.status,
        details: error.response?.data,
      };
    }
    return {
      code: 'ERR_UNKNOWN',
      message: error?.message || 'An unexpected error occurred',
    };
  }

  async get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.get<T>(url, config as AxiosRequestConfig);
    return { data: response.data, status: response.status };
  }

  async post<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.post<T>(url, data, config as AxiosRequestConfig);
    return { data: response.data, status: response.status };
  }

  async put<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.put<T>(url, data, config as AxiosRequestConfig);
    return { data: response.data, status: response.status };
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.delete<T>(url, config as AxiosRequestConfig);
    return { data: response.data, status: response.status };
  }
}

export const apiClient = new ApiClient();
