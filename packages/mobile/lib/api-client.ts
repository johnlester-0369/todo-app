import Constants from 'expo-constants'
import { authUserClient } from './auth-client'

interface RequestConfig<TBody = unknown> {
  method?: string
  headers?: Record<string, string>
  body?: TBody
  params?: Record<string, unknown>
  timeout?: number
  signal?: AbortSignal
  skipAuth?: boolean
  /**
   * If true, suppresses console.error logging for HTTP errors.
   * Useful during logout flow when 401 errors are expected.
   */
  silent?: boolean
}

interface ApiResponse<T = unknown> {
  data: T
  status: number
  statusText: string
  headers: Headers
}

interface ApiError extends Error {
  response?: {
    status: number
    data: unknown
  }
  isAborted?: boolean
}

class ApiClient {
  private baseURL: string
  private timeout: number
  private defaultHeaders: Record<string, string>

  constructor(config: {
    baseURL: string
    timeout?: number
    headers?: Record<string, string>
  }) {
    this.baseURL = config.baseURL
    this.timeout = config.timeout || 30000
    this.defaultHeaders = config.headers || {}
  }

  /**
   * Build complete URL with query parameters
   */
  private buildURL(endpoint: string, params?: Record<string, unknown>): string {
    const url = new URL(endpoint, this.baseURL)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    return url.toString()
  }

  /**
   * Get authentication headers from Better Auth
   * Retrieves session cookies from SecureStore and formats them for request headers
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    try {
      // Get cookies from Better Auth client (stored in SecureStore)
      const cookies = authUserClient.getCookie()

      if (cookies) {
        return {
          Cookie: cookies,
        }
      }

      return {}
    } catch (error) {
      // Silently fail - this is expected during logout
      return {}
    }
  }

  /**
   * Prepare request body and headers
   * Handles FormData, JSON, and other body types
   * Now includes authentication headers from Better Auth
   */
  private async prepareRequest(
    body?: unknown,
    headers?: Record<string, string>,
    skipAuth?: boolean,
  ) {
    let processedBody: BodyInit | undefined
    let processedHeaders = { ...this.defaultHeaders, ...headers }

    // Add authentication headers unless explicitly skipped
    if (!skipAuth) {
      const authHeaders = await this.getAuthHeaders()
      processedHeaders = { ...processedHeaders, ...authHeaders }
    }

    // Handle FormData (don't stringify, don't set Content-Type)
    if (body instanceof FormData) {
      processedBody = body
      // Remove Content-Type to let fetch set it with boundary
      delete processedHeaders['Content-Type']
    }
    // Handle JSON (default)
    else if (body !== undefined) {
      processedBody = JSON.stringify(body)
      // Keep JSON Content-Type if not explicitly overridden
      if (!processedHeaders['Content-Type']) {
        processedHeaders['Content-Type'] = 'application/json'
      }
    }

    return { body: processedBody, headers: processedHeaders }
  }

  /**
   * Main request handler
   */
  private async request<T = unknown>(
    endpoint: string,
    config: RequestConfig = {},
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      params,
      timeout = this.timeout,
      signal,
      skipAuth = false,
      silent = false,
    } = config

    const url = this.buildURL(endpoint, params)

    // Setup timeout with AbortController
    const timeoutController = new AbortController()
    const timeoutId = setTimeout(() => timeoutController.abort(), timeout)

    // Combine external signal with timeout signal
    let combinedSignal: AbortSignal

    if (signal) {
      // If external signal provided, we need to handle both signals
      const combinedController = new AbortController()

      // Abort if external signal aborts
      signal.addEventListener('abort', () => combinedController.abort(), {
        once: true,
      })

      // Abort if timeout occurs
      timeoutController.signal.addEventListener(
        'abort',
        () => combinedController.abort(),
        { once: true },
      )

      combinedSignal = combinedController.signal
    } else {
      // Only use timeout signal
      combinedSignal = timeoutController.signal
    }

    // Prepare body and headers (now includes auth headers)
    const { body: processedBody, headers: processedHeaders } =
      await this.prepareRequest(body, headers, skipAuth)

    try {
      const response = await fetch(url, {
        method,
        headers: processedHeaders,
        body: processedBody,
        credentials: 'omit',
        signal: combinedSignal,
      })

      clearTimeout(timeoutId)

      // Parse response based on content type
      let data: T
      const contentType = response.headers.get('content-type')

      if (contentType && contentType.includes('application/json')) {
        data = (await response.json()) as T
      } else {
        data = (await response.text()) as T
      }

      // Handle error status codes
      if (!response.ok) {
        this.handleErrorResponse(response.status, data, silent)
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      }
    } catch (error) {
      clearTimeout(timeoutId)

      // Handle abort (from external signal or timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        // Check if it was user-initiated abort (external signal)
        if (signal?.aborted) {
          const abortError: ApiError = new Error('Request cancelled')
          abortError.isAborted = true
          throw abortError
        }

        // Otherwise it was a timeout
        if (!silent) {
          console.error('Request timeout. Please try again.')
        }
        const timeoutError: ApiError = new Error('Request timeout')
        throw timeoutError
      }

      // Re-throw API errors (from handleErrorResponse)
      if ((error as ApiError).response) {
        throw error
      }

      // Handle network errors
      if (!silent) {
        if (error instanceof TypeError) {
          console.error('Network error. Please check your connection.')
        } else {
          console.error('An unexpected error occurred.')
        }
      }

      throw error
    }
  }

  /**
   * Handle HTTP error responses with logging
   * @param silent - If true, suppresses console.error logging
   */
  private handleErrorResponse(
    status: number,
    data: unknown,
    silent: boolean = false,
  ): never {
    // Only log if not in silent mode
    if (!silent) {
      if (status === 401) {
        console.error('Session expired. Please login again.')
      } else if (status === 403) {
        console.error('Access denied. Insufficient permissions.')
      } else if (status === 404) {
        console.error('Resource not found.')
      } else if (status >= 500) {
        console.error('Server error. Please try again later.')
      }
    }

    // Create error with response data
    const errorData = data as { message?: string }
    const error: ApiError = new Error(
      errorData?.message || `HTTP Error ${status}`,
    )
    error.response = {
      status,
      data,
    }

    throw error
  }

  /**
   * GET request
   */
  async get<T = unknown>(
    endpoint: string,
    config?: {
      params?: Record<string, unknown>
      signal?: AbortSignal
      skipAuth?: boolean
      silent?: boolean
    },
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
      ...config,
    })
  }

  /**
   * POST request
   */
  async post<T = unknown, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    config?: RequestConfig<TBody>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body,
      ...config,
    })
  }

  /**
   * PUT request
   */
  async put<T = unknown, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    config?: RequestConfig<TBody>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body,
      ...config,
    })
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(
    endpoint: string,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      ...config,
    })
  }

  /**
   * PATCH request
   */
  async patch<T = unknown, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    config?: RequestConfig<TBody>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body,
      ...config,
    })
  }
}

/**
 * Get backend base URL from Expo config
 * Matches pattern used in auth-client.ts
 */
const BACKEND_BASE_URL =
  (Constants.expoConfig?.extra?.BETTER_AUTH_BASE_URL as string) ||
  'http://localhost:3000'

// Create and export singleton instance
const apiClient = new ApiClient({
  baseURL: BACKEND_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

export default apiClient
export type { ApiResponse, ApiError, RequestConfig }
