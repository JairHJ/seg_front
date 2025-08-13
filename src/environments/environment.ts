// Entorno de desarrollo
// NOTA: Angular reemplaza este archivo por environment.prod.ts en builds de producción.
// Las variables de Vercel no se inyectan en runtime del bundle estático,
// por lo que las URLs deben definirse aquí en build time.
export const environment = {
	production: false,
	// Unificación: todas las llamadas pasan por el gateway para centralizar logs
	API_URL_GATEWAY: 'https://api-gateway-3pnq.onrender.com',
	// Alias (ya no se usan directamente en código tras refactor)
	API_URL_AUTH: 'https://api-gateway-3pnq.onrender.com',
	API_URL_USER: 'https://api-gateway-3pnq.onrender.com',
	API_URL_TASK: 'https://api-gateway-3pnq.onrender.com'
};
