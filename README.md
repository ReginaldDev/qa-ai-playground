# 🧪 QA AI Playground

> 🌐 **Acesse a Aplicação Online (Live Demo):** [**https://qa-ai-playground.netlify.app/**](https://qa-ai-playground.netlify.app/)

Ambiente interativo de **DevTools & Engenharia de Qualidade (QA)** com design **Mobile-First**, construído com **React 18**, **TypeScript (Strict Mode)**, **Tailwind CSS v4**, **Monaco Editor** e **Google Gemini SDK (`@google/generative-ai`)**.

---

## ✨ Módulos da Plataforma

### 1. 🗄️ Smart Data Mock (Fase 1 & 2)
* **Componente:** [`src/components/features/DataMockingPanel.tsx`](./src/components/features/DataMockingPanel.tsx)
* Gera massas de dados estruturadas em **JSON estrito (RFC 8259)** a partir de prompts em linguagem natural.
* **Foco em Testes de Resiliência:** inclui *edge cases*, valores limites (*boundary values*), campos vazios (`""`, `null`) e caracteres especiais / payloads de injeção (`XSS`, `SQLi`).
* Visualização no **Monaco Editor** (`language="json"`, `vs-dark`, `readOnly`) e exportação direta para **`mock-data.json`** (pronto para fixtures do Playwright ou Cypress).

### 2. 🤖 BDD Test Generator (Fase 3)
* **Componente:** [`src/components/features/BddGeneratorPanel.tsx`](./src/components/features/BddGeneratorPanel.tsx)
* Converte especificações **BDD / Gherkin** (`Funcionalidade`, `Cenário`, `Dado`, `Quando`, `Então`) em scripts de automação executáveis aplicando boas práticas como **Page Object Model (POM)**.
* Suporte multi-framework com adaptação dinâmica de syntax highlighting e extensão de arquivo no Monaco Editor:
  * **Playwright** (`bdd-test.spec.ts` • `typescript`)
  * **Cypress** (`bdd-test.cy.ts` • `typescript`)
  * **Robot Framework** (`bdd-test.robot` • `python`)

### 3. 🔌 API Contract Check (Fase 4)
* **Componente:** [`src/components/features/ApiContractPanel.tsx`](./src/components/features/ApiContractPanel.tsx)
* Analisa payloads JSON de resposta de APIs e gera scripts executáveis de **Schema Validation** validando tipagem estrita, campos obrigatórios e objetos aninhados:
  * **Playwright API + Zod** (`api-contract.spec.ts` • `typescript`)
  * **Cypress + AJV** (`api-contract.cy.ts` • `typescript`)
  * **Postman (Chai)** (`postman-contract.js` • `javascript`)

---

## 📱 Experiência Mobile-First & Resiliência

* **Design Responsivo Mobile-First:**
  * Barra de navegação rápida por toque no topo (`Smart Mock` | `BDD Gen` | `API Contract`) e **Sidebar Off-Canvas (Drawer)** para dispositivos móveis, expandindo para layout *split-screen* em telas desktop (`lg+`).
* **Circuit Breaker & Timeout Estrito ([`src/lib/ai-client.ts`](./src/lib/ai-client.ts)):**
  * **Timeout de 15s (`AbortSignal.timeout(15000)`):** Impede carregamento infinito caso a rede ou a API externa demore para responder.
  * **Controle de Tokens (`maxOutputTokens: 1024`):** Evita respostas excessivamente longas e otimiza a latência.
  * **Fallback Local Automático:** Em caso de instabilidade da API externa (`503 High Demand`, `429 Quota` ou `Timeout`), a aplicação se auto-recupera retornando payloads e scripts de contingência locais (`Modo de Resiliência (Fallback Local)`), garantindo disponibilidade contínua.

---

## 🧪 Estratégia de Testes & Qualidade (CI/CD)

O projeto possui cobertura em duas camadas automatizadas no pipeline [`.github/workflows/smoke-tests.yml`](./.github/workflows/smoke-tests.yml), executadas a cada `push` ou `pull_request`:

### 1. Testes Unitários e de Componentes (Vitest + Testing Library)
* [`src/lib/__tests__/ai-client.test.ts`](./src/lib/__tests__/ai-client.test.ts): Valida System Prompts, sanitização de cercas Markdown, tratamento de chave de API e acionamento do **Circuit Breaker** em erros `503` e `TimeoutError`.
* [`src/components/__tests__/App.test.tsx`](./src/components/__tests__/App.test.tsx): Valida renderização dos módulos, troca dinâmica de extensões/linguagens no editor, assinatura do autor e navegação **Mobile-First**.

```bash
# Executar suíte unitária e de componentes
npm.cmd run test:unit

# Executar em modo watch
npm.cmd run test:unit:watch
```

### 2. Smoke Tests E2E (Robot Framework + Playwright Browser Library)
* [`tests/resources/playground.resource`](./tests/resources/playground.resource) & [`tests/smoke/qa_ai_playground_smoke.robot`](./tests/smoke/qa_ai_playground_smoke.robot): Suíte E2E (`CT01` a `CT05`) validando fluxos completos em Desktop (`1280x800`) e Mobile (`375x812`).

```bash
# 1. Instalar dependências Python e inicializar o Chromium do Playwright
pip install -r tests/requirements.txt
rfbrowser init chromium

# 2. Compilar e iniciar o servidor local na porta 4173
npm.cmd run build
npm.cmd run preview

# 3. Em outro terminal, rodar os Smoke Tests
npm.cmd run test:smoke
```

---

## 🚀 Como Executar o Projeto Localmente

### 1. Instalar dependências
```bash
npm.cmd install
```

### 2. Configurar a variável de ambiente (`.env`)
Copie o arquivo [`.env.example`](./.env.example) para `.env` na raiz do projeto e insira sua chave do Google AI Studio:

```env
VITE_GEMINI_API_KEY=sua_chave_do_google_gemini_aqui
```

### 3. Iniciar o servidor de desenvolvimento
```bash
npm.cmd run dev
```

### 4. Validar Build de Produção
```bash
npm.cmd run build
```

---

## 👨‍💻 Autor

Desenvolvido por [**Reginaldo Junior**](https://reginalddev.github.io/HomePage/).
