export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  email: string;
  name: string;
  access_token: string;
}

export interface AuthError {
  message: string;
  error: string;
  statusCode: number;
}
