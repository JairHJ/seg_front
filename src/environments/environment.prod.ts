// Entorno de producción (Vercel)
// Angular no conserva variables process.env en el bundle estático.
// Define aquí las URLs reales de tus servicios backend.
export const environment = {
  production: true,
  API_URL_AUTH: 'https://auth-service-mjjn.onrender.com',
  API_URL_USER: 'https://user-service-5xkj.onrender.com',
  API_URL_GATEWAY: 'https://api-gateway-3pnq.onrender.com',
  API_URL_TASK: 'https://task-service-ss1h.onrender.com'
};