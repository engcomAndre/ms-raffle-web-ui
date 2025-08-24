# Configuração do MS Raffle Web UI

## Arquitetura

- **ms-auth-core-service** (porta 8080): Responsável pelo cadastro de usuários e integração com o Keycloak
- **Keycloak** (porta 8888): Serviço de autenticação e gerenciamento de identidade

## Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes configurações:

```bash
# URL base da API do ms-auth-core-service
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# Configurações da aplicação
NEXT_PUBLIC_APP_NAME=MS Raffle
NEXT_PUBLIC_APP_VERSION=0.1.0
```

## Endpoints da API

O projeto está configurado para se comunicar com o `ms-auth-core-service` nos seguintes endpoints:

- **Cadastro**: `POST /api/auth/register`
- **Login**: `POST /api/auth/login`
- **Verificação de Token**: `GET /api/auth/verify`
- **Logout**: `POST /api/auth/logout`

## Estrutura de Dados para Cadastro

```typescript
interface UserRegistrationData {
  firstName: string
  lastName: string
  email: string
  username: string
  password: string
}
```

## Como Executar

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Configure as variáveis de ambiente (crie o arquivo `.env.local`)

3. Execute o projeto:
   ```bash
   npm run dev
   ```

4. Acesse: http://localhost:3000

## Funcionalidades Implementadas

- ✅ Página de cadastro integrada com o ms-auth-core-service
- ✅ Validações de formulário
- ✅ Tratamento de erros da API
- ✅ Serviço de autenticação configurável
- ✅ Interface responsiva e moderna

## Próximos Passos

- [ ] Implementar página de login
- [ ] Adicionar autenticação com JWT
- [ ] Implementar proteção de rotas
- [ ] Adicionar testes automatizados
