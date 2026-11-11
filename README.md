# 🧪 QA AI Playground

Ambiente interativo de **DevTools & Engenharia de Qualidade (QA)** construído com **React**, **TypeScript (Strict Mode)**, **Tailwind CSS**, **Monaco Editor** e **Google Gemini SDK (`@google/generative-ai`)**.

---

## ✨ Módulos Disponíveis

### 1. 🗄️ Smart Data Mock (Fase 1 & 2)
* **Componente:** [`src/components/features/DataMockingPanel.tsx`](./src/components/features/DataMockingPanel.tsx)
* Gera massas de dados estruturadas em **JSON estrito (RFC 8259)** a partir de prompts em linguagem natural.
* Foco em **testes de resiliência**: inclui *edge cases*, valores limites (*boundary values*), campos vazios (`""`, `null`) e caracteres especiais / payloads de injeção (`XSS`, `SQLi`).
* Visualização no **Monaco Editor** (`language="json"`, `vs-dark`, `readOnly`) e exportação direta para **`mock-data.json`** (pronto para fixtures do Playwright/Cypress).

### 2. 🤖 BDD Test Generator (Fase 3)
* **Componente:** [`src/components/features/BddGeneratorPanel.tsx`](./src/components/features/BddGeneratorPanel.tsx)
* Converte especificações **BDD / Gherkin** (`Funcionalidade`, `Cenário`, `Dado`, `Quando`, `Então`) em código de automação executável aplicando boas práticas como **Page Object Model (POM)**.
* Suporte multi-framework com adaptação dinâmica do Monaco Editor e da extensão de download:
  * **Playwright** (`bdd-test.spec.ts` • `typescript`)
  * **Cypress** (`bdd-test.cy.ts` • `typescript`)
  * **Robot Framework** (`bdd-test.robot` • `python`)

### 3. 🔌 API Contract Check (Fase 4)
* **Componente:** [`src/components/features/ApiContractPanel.tsx`](./src/components/features/ApiContractPanel.tsx)
* Analisa payloads JSON de resposta de APIs e gera scripts executáveis de **Schema Validation** validando tipagem estrita, campos obrigatórios e estruturas aninhadas:
  * **Playwright API + Zod** (`api-contract.spec.ts` • `typescript`)
  * **Cypress + AJV** (`api-contract.cy.ts` • `typescript`)
  * **Postman (Chai)** (`postman-contract.js` • `javascript`)

---

## 🛡️ Arquitetura de Resiliência (Circuit Breaker & Timeout)

A camada de integração em [`src/lib/ai-client.ts`](./src/lib/ai-client.ts) implementa:
* **Timeout Estrito de 15s (`AbortSignal.timeout(15000)`):** Impede carregamento infinito caso a rede ou a API externa demore para responder.
* **Controle de Tokens (`maxOutputTokens: 1024`):** Evita respostas excessivamente longas e otimiza o tempo de resposta.
* **Circuit Breaker / Fallback Local:** Em caso de instabilidade da API externa (`503 High Demand`, `429 Quota` ou `Timeout`), a aplicação se auto-recupera retornando payloads e scripts de contingência locais (`Modo de Resiliência (Fallback Local)`) sem interromper o fluxo de trabalho do QA.

---

## 🚀 Como Executar o Projeto

### 1. Instalar dependências
```bash
npm.cmd install
```

### 2. Configurar a variável de ambiente (`.env`)
Copie o arquivo `.env.example` para `.env` na raiz do projeto e adicione sua chave do Google AI Studio:

```env
VITE_GEMINI_API_KEY=sua_chave_do_google_gemini_aqui
```

### 3. Iniciar o servidor de desenvolvimento
```bash
npm.cmd run dev
```

### 4. Validar TypeScript e Build de Produção
```bash
npm.cmd run build
```
