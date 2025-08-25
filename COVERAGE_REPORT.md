# Relatório de Cobertura de Código - MS Raffle Web UI

## 📊 Resumo Executivo

**Data da Análise:** $(date)
**Total de Arquivos Analisados:** 2698 linhas de código
**Threshold Configurado:** 70%

### 📈 Métricas de Cobertura

| Métrica | Cobertura | Status |
|---------|-----------|---------|
| **Statements** | 27.72% (748/2698) | ❌ Abaixo do threshold |
| **Branches** | 50% (33/66) | ❌ Abaixo do threshold |
| **Functions** | 23.18% (16/69) | ❌ Abaixo do threshold |
| **Lines** | 27.72% (748/2698) | ❌ Abaixo do threshold |

## 🎯 Análise por Diretório

### ✅ **Alta Cobertura (>80%)**
- **`src/config/`**: 100% - Configurações do ambiente
- **`src/utils/`**: 100% - Utilitários de cookies

### 🟡 **Cobertura Média (50-80%)**
- **`src/components/`**: 75.38% - Componentes React
- **`src/services/authService.ts`**: 93.6% - Serviço de autenticação

### ❌ **Baixa Cobertura (<50%)**
- **`src/app/`**: 0% - Páginas da aplicação
- **`src/hooks/`**: 30.86% - Hooks customizados
- **`src/services/`**: 27.32% - Serviços da aplicação
- **`src/stores/`**: 40.62% - Gerenciamento de estado

## 🔍 Arquivos com Maior Cobertura

1. **`src/config/environment.ts`** - 100% (Configurações)
2. **`src/utils/cookies.ts`** - 100% (Utilitários)
3. **`src/services/authService.ts`** - 93.6% (Autenticação)
4. **`src/components/GoogleLoginSection.tsx`** - 90.51% (Login Google)
5. **`src/components/DashboardLayout.tsx`** - 85% (Layout do Dashboard)

## 🚨 Arquivos Sem Cobertura

- **`src/middleware.ts`** - Middleware de autenticação
- **`src/app/layout.tsx`** - Layout principal da aplicação
- **`src/app/page.tsx`** - Página inicial
- **`src/app/welcome/welcome.tsx`** - Página de boas-vindas
- **`src/services/tokenValidationService.ts`** - Validação de tokens

## 📋 Relatórios Disponíveis

### 1. **Relatório HTML Interativo**
- **Localização:** `coverage/index.html`
- **Recursos:** Navegação por arquivo, filtros, busca
- **Uso:** Abrir no navegador para análise detalhada

### 2. **Relatório LCOV**
- **Localização:** `coverage/lcov.info`
- **Formato:** Compatível com ferramentas CI/CD
- **Uso:** Integração com Codecov, SonarQube, etc.

### 3. **Relatório XML Cobertura**
- **Localização:** `coverage/cobertura-coverage.xml`
- **Formato:** Padrão Cobertura (equivalente ao JaCoCo)
- **Uso:** Ferramentas de análise estática

### 4. **Relatório JSON**
- **Localização:** `coverage/coverage-final.json`
- **Formato:** Estrutura de dados para análise programática
- **Uso:** Scripts de automação e dashboards

## 🎯 Recomendações para Aumentar Cobertura

### **Prioridade Alta**
1. **Implementar testes para páginas da aplicação** (`src/app/`)
2. **Cobrir middleware de autenticação** (`src/middleware.ts`)
3. **Testar serviços de validação** (`src/services/tokenValidationService.ts`)

### **Prioridade Média**
1. **Expandir testes de hooks** (`src/hooks/`)
2. **Cobrir stores de estado** (`src/stores/`)
3. **Testar serviços de login** (`src/services/`)

### **Prioridade Baixa**
1. **Refinar testes de componentes existentes**
2. **Otimizar testes de edge cases**
3. **Adicionar testes de integração**

## 🛠️ Ferramentas Configuradas

### **Jest + NYC (Equivalente ao JaCoCo)**
- Configuração em `.nycrc`
- Relatórios em múltiplos formatos
- Thresholds configuráveis

### **GitHub Actions**
- Workflow automático em `.github/workflows/coverage.yml`
- Execução em PRs e pushes
- Upload para Codecov

### **SonarQube**
- Configuração em `sonar-project.properties`
- Análise de qualidade integrada
- Relatórios de cobertura

## 📊 Histórico de Cobertura

| Data | Statements | Branches | Functions | Lines |
|------|------------|----------|-----------|-------|
| $(date) | 27.72% | 50% | 23.18% | 27.72% |

## 🔗 Comandos Úteis

```bash
# Executar testes com cobertura
npm run test:coverage

# Gerar relatórios detalhados
./scripts/coverage.sh

# Abrir relatório HTML
open coverage/index.html

# Verificar thresholds
npm run test:ci
```

## 📝 Notas

- **50 testes passando** de 7 suites
- **2 suites falhando** devido a módulos não encontrados
- **Threshold de 70%** configurado para todas as métricas
- **Relatórios compatíveis** com ferramentas de CI/CD
- **Configuração equivalente ao JaCoCo** para projetos JavaScript/TypeScript

---

*Relatório gerado automaticamente pelo sistema de cobertura configurado*
