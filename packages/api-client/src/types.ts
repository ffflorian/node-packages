export interface RequestOptions {
  data?: any;
  headers?: HeadersInit;
  method:
    | 'GET'
    | 'POST'
    | 'PUT'
    | 'DELETE'
    | 'PATCH'
    | 'HEAD'
    | 'OPTIONS'
    | 'get'
    | 'post'
    | 'put'
    | 'delete'
    | 'patch'
    | 'head'
    | 'options';
  params?: object;
  responseType?: 'arraybuffer' | 'json' | 'text' | 'blob';
}

export type ApiClientConfig = Partial<Omit<RequestInit, 'method'>> & {auth?: {password: string; username: string}};

export type BasicRequestOptions = Omit<RequestOptions, 'method'>;

export type RequestInitWithMethod = Required<Pick<RequestInit, 'method'>> & Omit<RequestInit, 'method'>;

export type RequestInterceptor = (
  url: URL,
  options: RequestInitWithMethod
) => RequestInitWithMethod | Promise<RequestInitWithMethod>;

export type ResponseInterceptor = (response: Response) => void | Promise<void>;

export interface APIResponse<T> {
  data: T;
  headers: Headers;
  status: number;
}
