// Configurações de ambiente da aplicação
export const environment = {
  // URL base da API do ms-auth-core-service
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  
  // Configurações da aplicação
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'MS Raffle',
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
  
  // Endpoints da API
  endpoints: {
    auth: {
      register: '/v1/users',
      login: '/v1/token',
      verify: '/api/auth/verify',
      logout: '/api/auth/logout',
    }
  }
}
