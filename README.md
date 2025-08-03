# 🎰 MS Raffle - Sistema de Gerenciamento de Rifas

Sistema moderno de gerenciamento de rifas desenvolvido com Next.js 15 e Tailwind CSS, com autenticação Google OAuth 2.0 integrada.

## ✨ Características

- **Next.js 15** - Framework React moderno com App Router
- **Tailwind CSS** - Framework CSS utility-first para estilização rápida
- **TypeScript** - Tipagem estática para melhor desenvolvimento
- **Google OAuth 2.0** - Autenticação segura com Google
- **Design Responsivo** - Interface adaptável para todos os dispositivos
- **Componentes Modernos** - UI/UX atual e intuitivo
- **Performance Otimizada** - Turbopack para desenvolvimento rápido
- **Middleware de Proteção** - Rotas protegidas por autenticação

## 🚀 Tecnologias

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Autenticação**: Google OAuth 2.0, Google Identity Services (GSI)
- **Build Tool**: Turbopack
- **Linting**: ESLint
- **Package Manager**: npm
- **Middleware**: Next.js Middleware para proteção de rotas

## 📁 Estrutura do Projeto

```
ms-raffle-web-ui/
├── src/
│   ├── app/
│   │   ├── dashboard/          # Dashboard administrativo
│   │   ├── login/             # Página de login
│   │   ├── playground/        # Área principal pós-login
│   │   ├── register/          # Página de registro
│   │   ├── welcome/           # Página de boas-vindas
│   │   ├── globals.css        # Estilos globais
│   │   ├── layout.tsx         # Layout raiz com Google Script
│   │   └── page.tsx           # Página inicial com redirecionamento
│   ├── components/
│   │   ├── DashboardLayout.tsx    # Layout para páginas de dashboard
│   │   ├── GoogleLoginSection.tsx # Componente de login Google
│   │   └── GoogleScript.tsx       # Carregamento do script Google
│   ├── hooks/
│   │   └── useGoogleButtonSafe.ts # Hook de autenticação segura
│   ├── utils/
│   │   └── cookies.ts             # Utilitários para cookies
│   └── middleware.ts              # Middleware de proteção de rotas
├── public/                        # Arquivos estáticos
├── .env.local                     # Variáveis de ambiente (Google OAuth)
├── package.json                   # Dependências e scripts
└── README.md                      # Documentação
```

## 🛠️ Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/engcomAndre/ms-raffle-web-ui.git
   cd ms-raffle-web-ui
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env.local
   # Configure suas credenciais do Google OAuth no .env.local
   ```

4. **Execute o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

5. **Acesse a aplicação**
   ```
   http://localhost:3000
   ```

## 📱 Páginas Disponíveis

### 🏠 Página Inicial (`/`)
- Redirecionamento inteligente baseado no status de autenticação
- Usuários autenticados → `/playground`
- Usuários não autenticados → `/welcome`

### 🎉 Welcome (`/welcome`)
- Página de boas-vindas com login e registro
- Login tradicional (email/senha)
- **Login com Google OAuth 2.0**
- Formulário de registro com validação de senha
- Design moderno e responsivo

### 🔐 Login (`/login`)
- Formulário de autenticação tradicional
- **Integração com Google OAuth 2.0**
- Validação de campos em tempo real
- Redirecionamento automático pós-login

### 📝 Registro (`/register`)
- Formulário completo de cadastro
- Validações de senha com critérios de segurança
- Campo de confirmação de senha
- Feedback visual de sucesso/erro

### 🎮 Playground (`/playground`)
- **Área principal pós-login**
- Dashboard com header e sidebar
- Menu de usuário com dropdown (Perfil/Logout)
- Seção "Minhas Rifas"

### 📊 Dashboard (`/dashboard`)
- Interface administrativa completa
- Sidebar colapsível
- Menu de usuário com dropdown
- Cards informativos

## 🎨 Design System

### Cores
- **Primária**: Azul (`blue-500`, `blue-600`)
- **Secundária**: Roxo (`purple-500`, `purple-600`)
- **Sucesso**: Verde (`green-500`, `green-600`)
- **Aviso**: Amarelo (`yellow-500`, `yellow-600`)
- **Erro**: Vermelho (`red-500`, `red-600`)

### Componentes
- **Cards**: Fundo branco com sombras suaves
- **Botões**: Bordas arredondadas com transições
- **Inputs**: Focus states com anéis coloridos
- **Gradientes**: Backgrounds modernos

## 🔧 Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run start    # Servidor de produção
npm run lint     # Verificação de código
```

## 🔐 Autenticação

### Google OAuth 2.0
O sistema utiliza autenticação Google OAuth 2.0 para login seguro:
- **Google Identity Services (GSI)** - API moderna do Google
- **Renderização tradicional** - Fallback para máxima compatibilidade
- **Armazenamento seguro** - Tokens em localStorage e cookies
- **Middleware de proteção** - Rotas protegidas automaticamente

### Configuração do Google OAuth
1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a API "Google+ API" ou "People API"
4. Configure as "Authorized JavaScript origins":
   - `http://localhost:3000` (desenvolvimento)
   - Seu domínio de produção
5. Adicione as credenciais ao `.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu_client_id_aqui
   GOOGLE_CLIENT_SECRET=sua_client_secret_aqui
   ```

### Credenciais de Teste
Para testar o sistema tradicionalmente:
- **Email**: `admin@msraffle.com`
- **Senha**: `123456`

**Recomendado**: Use o login com Google para uma experiência mais segura!

## 🛡️ Segurança e Performance

### Middleware de Proteção
- **Rotas protegidas**: `/playground` e `/dashboard`
- **Redirecionamento automático** para usuários não autenticados
- **Verificação de tokens** em cookies e localStorage

### Otimizações
- **Script do Google carregado de forma otimizada**
- **Manipulação segura do DOM** para evitar conflitos React
- **Fallback robusto** para casos de falha na autenticação
- **Loading states** e feedback visual em tempo real

### Compatibilidade
- **Cross-browser**: Funciona em todos os navegadores modernos
- **Mobile-first**: Design responsivo para dispositivos móveis
- **Acessibilidade**: Componentes seguem padrões ARIA

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
3. Deploy automático a cada push

### Outras Plataformas
O projeto é compatível com qualquer plataforma que suporte Next.js:
- **Netlify** - Configure as variáveis de ambiente no dashboard
- **Railway** - Adicione as env vars no projeto
- **DigitalOcean App Platform** - Configure no painel de controle
- **AWS Amplify** - Use o console AWS para env vars

### Configuração de Produção
Lembre-se de atualizar o Google Cloud Console com:
- **Authorized JavaScript origins**: Adicione seu domínio de produção
- **Authorized redirect URIs**: Configure as URLs de callback

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Equipe

- **Desenvolvimento**: MS Raffle Team
- **Design**: Interface moderna e intuitiva
- **Tecnologia**: Stack atual e performática

## 📞 Suporte

Para dúvidas ou suporte, entre em contato através dos canais oficiais do projeto.

---

**MS Raffle** - Transformando a gestão de rifas com tecnologia moderna! 🎰✨
