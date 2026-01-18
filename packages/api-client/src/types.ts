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

export type RequestInitWithMethodAndURL = Required<Pick<RequestInit, 'method'>> &
  Omit<RequestInit, 'method'> & {
    url: URL;
  };

export type RequestInterceptor = (
  options: RequestInitWithMethodAndURL
) => RequestInitWithMethodAndURL | Promise<RequestInitWithMethodAndURL>;

export type ResponseInterceptor = (response: Response) => void | Promise<void>;
