export interface Usuario {
  username: string;
  password: string;
  email?: string;
  otp_code?: string; // Para MFA
}

// Respuestas DIRECTAS del backend (ya no usamos envoltorio proxied_response)
export interface LoginResponse {
  access_token?: string;
  token_type?: string;
  user?: {
    id: string;
    username: string;
  };
  error?: string;
}

export interface RegisterResponse {
  message?: string;
  access_token: string;
  token_type: string;
  qr_code?: string; // QR para MFA
  mfa_secret?: string; // Solo en debug
  user: {
    id: string;
    username: string;
    email: string;
  };
  error?: string;
}

export interface RespuestaAutenticacion {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    username: string;
    email?: string;
  };
  token?: string;
  qr_code?: string;
}

export interface AuthError {
  error: string;
}
