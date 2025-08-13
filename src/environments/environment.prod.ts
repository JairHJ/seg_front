// Entorno de producción (Vercel)
// Angular no conserva variables process.env en el bundle estático.
// Define aquí las URLs reales de tus servicios backend.
export const environment = {
  production: true,
  API_URL_GATEWAY: 'https://api-gateway-3pnq.onrender.com',
  API_URL_AUTH: 'https://api-gateway-3pnq.onrender.com',
  API_URL_USER: 'https://api-gateway-3pnq.onrender.com',
  API_URL_TASK: 'https://api-gateway-3pnq.onrender.com'
};