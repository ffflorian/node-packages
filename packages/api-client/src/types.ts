export type ApiClientConfig = {auth?: {password: string; username: string}} & Partial<Omit<RequestInit, 'method'>>;

export interface APIResponse<T> {
  data: T;
  headers: Headers;
  status: number;
}

export type BasicRequestOptions = Omit<RequestOptions, 'method'>;

export interface Interceptors {
  request: RequestInterceptor[];
  response: ResponseInterceptor[];
}

export type RequestInitWithMethodAndURL = {
  url: URL;
} & Omit<RequestInit, 'method'> &
  Required<Pick<RequestInit, 'method'>>;

export type RequestInterceptor = (
  options: RequestInitWithMethodAndURL
) => Promise<RequestInitWithMethodAndURL> | RequestInitWithMethodAndURL;

export interface RequestOptions {
  data?: any;
  headers?: HeadersInit;
  method:
    | 'DELETE'
    | 'delete'
    | 'GET'
    | 'get'
    | 'HEAD'
    | 'head'
    | 'OPTIONS'
    | 'options'
    | 'PATCH'
    | 'patch'
    | 'POST'
    | 'post'
    | 'PUT'
    | 'put';
  params?: object;
  responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
}

export type ResponseInterceptor = (response: Response) => Promise<void> | void;
