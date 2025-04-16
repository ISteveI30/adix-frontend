const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface FetchOptions<TBody = unknown> {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: TBody;
  token?: string;
  timeout?: number;
  headers?: Record<string, string>;
  cache?: RequestCache;
}

export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function fetchWrapper<TResponse, TBody = unknown>(
  endpoint: string,
  options: FetchOptions<TBody> = {}
): Promise<TResponse> {
  const { 
    method = 'GET', 
    body, 
    // token, 
    timeout = 10000, 
    headers = {}, 
    ...restOptions 
  } = options;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    // ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: defaultHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      ...restOptions,
    });

    clearTimeout(timeoutId);

    // Clonamos la respuesta para poder leer el cuerpo múltiples veces si es necesario
    const responseClone = response.clone();
    
    if (!response.ok) {
      let errorDetails: any;
      try {
        // Usamos el clon para leer el cuerpo del error
        errorDetails = await responseClone.json().catch(() => ({}));
      } catch (e) {
        console.error('Error parsing error response:', e);
      }

      throw new ApiError(
        errorDetails?.message || response.statusText,
        response.status,
        errorDetails
      );
    }

    // Usamos la respuesta original para leer el cuerpo exitoso
    try {
      const data = await response.json();
      return data as TResponse;
    } catch (e) {
      // Si la respuesta no tiene cuerpo (como en algunos DELETE)
      return undefined as unknown as TResponse;
    }
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408);
    }

    throw error;
  }
}

export default fetchWrapper;