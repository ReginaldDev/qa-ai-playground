# 🧪 QA AI Playground - Especificação Técnica

## 📌 Visão Geral
O **QA AI Playground** é um ambiente de testes interativo focado em profissionais de Qualidade (QA) e Engenheiros de Testes. A plataforma integra Inteligência Artificial para facilitar a criação de cenários de testes, geração de massa de dados e validação de APIs.

## 🛠️ Stack Tecnológica (Frontend Moderno)
* **Linguagem:** TypeScript (Strict mode ativado)
* **Framework UI:** React (via Vite ou Next.js)
* **Estilização:** Tailwind CSS + Shadcn/UI (para componentes de interface rápidos, bonitos e acessíveis)
* **Integração AI:** API da OpenAI, Google Gemini ou Anthropic Claude.
* **Gerenciamento de Estado:** Zustand ou Context API.
* **Editor de Código UI:** Monaco Editor (para exibir os JSONs e scripts gerados com *syntax highlighting*).

## 🚀 Funcionalidades do MVP (Foco na Fase 1)

### Fase 1: Smart Data Mocking (Massa de Dados)
* **Input:** Textarea para o QA descrever a massa de dados em linguagem natural.
* **Engine:** Chamada para a LLM solicitando retorno estrito em formato JSON.
* **Output:** Componente exibindo o payload gerado, com botões para "Copiar" e "Fazer Download (.json)".

## 🧱 Arquitetura de Pastas Sugerida (TypeScript/React)

```
/src
│
├── /components
│   ├── /ui                  # Componentes base (Botões, Inputs - via Shadcn)
│   ├── /layout              # Sidebar, Header, MainContainer
│   └── /features            # Componentes específicos (DataMockingPanel.tsx)
│
├── /hooks                   # Hooks customizados (ex: useAiPrompt.ts)
│
├── /lib                     # Configurações de serviços externos
│   └── ai-client.ts         # Instância e configuração da API de IA
│
├── /types                   # Definições de interfaces TypeScript
│   └── index.ts             # Ex: interface MockDataRequest, AIResponse
│
├── /store                   # Gerenciamento de estado (Zustand)
│
└── App.tsx                  # Ponto de entrada da UI principal
```

## 📝 Regras de Negócio e UX
1. O design deve ter um aspecto "DevTool" (modo escuro por padrão, fontes monoespaçadas para dados).
2. A IA deve ser instruída via *System Prompt* a retornar APENAS dados válidos estruturados, sem texto conversacional.
3. Tratamento de erro visual caso a API da IA falhe (ex: Toast notification de "Erro ao gerar dados").

