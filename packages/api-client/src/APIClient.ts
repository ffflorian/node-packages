import type {
  APIResponse,
  BasicRequestOptions,
  ApiClientConfig,
  RequestInterceptor,
  ResponseInterceptor,
  RequestInitWithMethod,
  RequestOptions,
} from './types.js';

export class APIClient {
  public interceptors: {request: RequestInterceptor[]; response: ResponseInterceptor[]} = {
    request: [],
    response: [],
  };

  constructor(
    private baseUrl: string,
    private config?: ApiClientConfig
  ) {}

  setBaseURL(baseUrl: string): void {
    this.baseUrl = baseUrl;
  }

  setConfig(config: Partial<RequestInit>): void {
    this.config = config;
  }

  private formatData(response: Response, options?: BasicRequestOptions): Promise<any> {
    const responseType = options?.responseType || 'json';
    switch (responseType) {
      case 'arraybuffer':
        return response.arrayBuffer();
      case 'blob':
        return response.blob();
      case 'text':
        return response.text();
      case 'json':
      default:
        return response.json();
    }
  }

  async request(endpoint: string, options: RequestOptions): Promise<Response> {
    const url = new URL(endpoint, this.baseUrl);

    if (options.params) {
      for (const [key, param] of Object.entries(options.params)) {
        if (param !== null && param !== undefined) {
          url.searchParams.append(key, String(param));
        }
      }
    }

    let requestOptions: RequestInitWithMethod = {
      method: options.method.toUpperCase(),
      ...this.config,
    };

    if (options.headers) {
      requestOptions.headers = {
        ...requestOptions.headers,
        ...options.headers,
      };
    }

    if (this.config?.auth) {
      const {username, password} = this.config.auth;
      const encoded = btoa(`${username}:${password}`);

      requestOptions.headers = {
        ...requestOptions.headers,
        Authorization: `Basic ${encoded}`,
      };
    }

    if (options.data) {
      if (options.data instanceof Object) {
        requestOptions.headers = {
          ...requestOptions.headers,
          'Content-Type': 'application/json',
        };
        options.data = JSON.stringify(options.data);
      }
      requestOptions.body = options.data;
    }

    if (this.interceptors.request.length > 0) {
      for (const interceptor of this.interceptors.request) {
        requestOptions = await interceptor(url, requestOptions);
      }
    }

    const response = await fetch(url, requestOptions);
    if (!response.ok) {
      throw new Error(`Request failed with status code ${response.status}`);
    }

    if (this.interceptors.response.length > 0) {
      for (const interceptor of this.interceptors.response) {
        await interceptor(response);
      }
    }

    return response;
  }

  async delete<T = any>(endpoint: string, options?: BasicRequestOptions): Promise<APIResponse<T>> {
    const request = await this.request(endpoint, {...options, method: 'DELETE'});
    const requestData = await this.formatData(request, options);
    return {data: requestData, headers: request.headers, status: request.status};
  }

  async get<T = any>(endpoint: string, options?: BasicRequestOptions): Promise<APIResponse<T>> {
    const request = await this.request(endpoint, {...options, method: 'GET'});
    const requestData = await this.formatData(request, options);
    return {data: requestData, headers: request.headers, status: request.status};
  }

  async head<T = any>(endpoint: string, options?: BasicRequestOptions): Promise<APIResponse<T>> {
    const request = await this.request(endpoint, {...options, method: 'HEAD'});
    const requestData = await this.formatData(request, options);
    return {data: requestData, headers: request.headers, status: request.status};
  }

  async patch<T = any>(endpoint: string, data?: any, options?: BasicRequestOptions): Promise<APIResponse<T>> {
    const request = await this.request(endpoint, {...options, data, method: 'PATCH'});
    const requestData = await this.formatData(request, options);
    return {data: requestData, headers: request.headers, status: request.status};
  }

  async options<T = any>(endpoint: string, options?: BasicRequestOptions): Promise<APIResponse<T>> {
    const request = await this.request(endpoint, {...options, method: 'OPTIONS'});
    const requestData = await this.formatData(request, options);
    return {data: requestData, headers: request.headers, status: request.status};
  }

  async post<T = any>(endpoint: string, data?: any, options?: BasicRequestOptions): Promise<APIResponse<T>> {
    const request = await this.request(endpoint, {data, ...options, method: 'POST'});
    const requestData = await this.formatData(request, options);
    return {data: requestData, headers: request.headers, status: request.status};
  }

  async put<T = any>(endpoint: string, data?: any, options?: BasicRequestOptions): Promise<APIResponse<T>> {
    const request = await this.request(endpoint, {data, ...options, method: 'PUT'});
    const requestData = await this.formatData(request, options);
    return {data: requestData, headers: request.headers, status: request.status};
  }
}
