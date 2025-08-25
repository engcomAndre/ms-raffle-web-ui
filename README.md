# MS Raffle Web UI

Interface web para o sistema MS Raffle, construída com Next.js 15, React 19 e TypeScript.

## 🚀 Funcionalidades

- **Autenticação**: Login com usuário/senha e Google OAuth
- **Registro de usuários**: Cadastro completo com validações
- **Dashboard**: Interface administrativa
- **Playground**: Área de testes e desenvolvimento
- **Responsivo**: Design adaptável para todos os dispositivos

## 🛠️ Tecnologias

- **Frontend**: Next.js 15, React 19, TypeScript
- **Estilização**: Tailwind CSS 4
- **Estado**: Zustand
- **Autenticação**: Google OAuth, JWT
- **Testes**: Jest, React Testing Library

## 📦 Instalação

```bash
# Clonar o repositório
git clone <repository-url>
cd ms-raffle-web-ui

# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev
```

## 🧪 Testes

O projeto inclui uma suite completa de testes automatizados:

### Executar Testes

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com cobertura
npm run test:coverage

# Executar testes em CI
npm run test:ci
```

### Cobertura de Testes

- **Componentes**: Testes de renderização e interação
- **Serviços**: Testes de lógica de negócio
- **Hooks**: Testes de hooks personalizados
- **Utilitários**: Testes de funções auxiliares
- **Integração**: Testes de fluxos completos

### Arquivos de Teste

- `src/__tests__/welcome.test.tsx` - Testes do componente principal
- `src/__tests__/authService.test.ts` - Testes do serviço de autenticação
- `src/__tests__/hooks.test.tsx` - Testes dos hooks personalizados
- `src/__tests__/utils.test.ts` - Testes das funções utilitárias
- `src/__tests__/components.test.tsx` - Testes dos componentes
- `src/__tests__/integration.test.tsx` - Testes de integração

## 🔧 Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run start` - Servidor de produção
- `npm run lint` - Verificação de código
- `npm test` - Executar testes
- `npm run test:watch` - Testes em modo watch
- `npm run test:coverage` - Testes com cobertura
- `npm run test:ci` - Testes para CI/CD

## 📁 Estrutura do Projeto

```
src/
├── app/                 # Páginas da aplicação
├── components/          # Componentes reutilizáveis
├── services/           # Serviços de API e autenticação
├── hooks/              # Hooks personalizados
├── stores/             # Gerenciamento de estado
├── utils/              # Funções utilitárias
├── types/              # Definições de tipos
└── __tests__/          # Testes automatizados
```

## 🌐 Variáveis de Ambiente

Crie um arquivo `.env.local` com:

```env
NEXT_PUBLIC_API_URL=sua-api-url
GOOGLE_CLIENT_ID=seu-google-client-id
```

## 📱 Responsividade

- Design mobile-first
- Breakpoints para tablet e desktop
- Componentes adaptáveis

## 🔒 Segurança

- Validação de formulários
- Sanitização de inputs
- Autenticação JWT
- OAuth seguro

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.
