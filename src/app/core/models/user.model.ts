export interface Usuario {
  username: string;
  password: string;
  email?: string;
  otp_code?: string; // Para MFA
}

export interface LoginResponse {
  proxied_response: {
    access_token?: string;
    token_type?: string;
    user?: {
      id: number;
      username: string;
    };
    error?: string;
  };
}

export interface RegisterResponse {
  proxied_response: {
    message: string;
    access_token: string;
    token_type: string;
    qr_code?: string; // QR para MFA
    user: {
      id: number;
      username: string;
      email: string;
    };
  };
}

export interface RespuestaAutenticacion {
  success: boolean;
  error?: string;
  user?: {
    id: number;
    username: string;
    email?: string;
  };
}

export interface AuthError {
  proxied_response: {
    error: string;
  };
}
