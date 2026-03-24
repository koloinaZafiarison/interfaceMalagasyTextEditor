// API Client wrapper with error handling for Malagasy Text Editor

import { API_CONFIG } from './api-config';
import type { ApiResponse } from '@/types/api';

interface FetchOptions extends RequestInit {
  timeout?: number;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithTimeout(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { timeout = API_CONFIG.timeout, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function retryFetch(
  url: string,
  options: FetchOptions = {},
  attempts = API_CONFIG.retryAttempts
): Promise<Response> {
  try {
    return await fetchWithTimeout(url, options);
  } catch (error) {
    if (attempts <= 1) throw error;
    
    await new Promise(resolve => 
      setTimeout(resolve, API_CONFIG.retryDelay)
    );
    
    return retryFetch(url, options, attempts - 1);
  }
}

export async function apiGet<T>(url: string): Promise<ApiResponse<T>> {
  try {
    const response = await retryFetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new ApiError(
        `Request failed: ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();
    return { data, status: 'success' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { error: message, status: 'error' };
  }
}

export async function apiPost<T, R>(
  url: string,
  body: T
): Promise<ApiResponse<R>> {
  try {
    const response = await retryFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new ApiError(
        `Request failed: ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();
    return { data, status: 'success' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { error: message, status: 'error' };
  }
}

export { ApiError };
