import { GoogleGenerativeAI } from '@google/generative-ai';
import type {
  AIResponse,
  ApiContractRequest,
  AutomationFramework,
  BddGenerationRequest,
  MockDataRequest,
} from '../types';

/**
 * System Prompt especializado em QA & Testes de Resiliência (Smart Data Mocking).
 * Instrui a LLM a retornar APENAS JSON válido, sem cercas Markdown (```json),
 * incluindo edge cases, campos vazios, caracteres especiais e limite estrito de concisão.
 */
export const QA_MOCK_SYSTEM_PROMPT = `Você é um Engenheiro de QA Sênior especialista em testes de software, automação e resiliência de aplicações.
Sua função é gerar massas de dados estruturadas para testes automatizados (como fixtures do Playwright, Cypress e testes de contrato de API).

REGRAS OBRIGATÓRIAS DE SAÍDA:
1. Retorne APENAS um JSON estritamente válido (RFC 8259).
2. NUNCA inclua formatação Markdown ao redor da resposta (como \`\`\`json ou \`\`\`), nem explicações, comentários ou texto conversacional antes ou depois do JSON.
3. Foque em gerar dados que testem a resiliência da aplicação: inclua edge cases (valores limites/boundary values), campos vazios ("", null), strings longas, acentuação complexa, emojis e caracteres especiais (ex: aspas simples/duplas, barras, payloads de injeção como <script> ou ' OR 1=1 --) além de cenários válidos.
4. Respeite o contexto e o locale solicitados pelo usuário no prompt.
5. Seja extremamente conciso. Gere no máximo 3 a 5 registros no total. Use valores de string curtos e diretos para preencher os dados, a menos que esteja gerando intencionalmente um caso de limite (boundary value) com uma string gigante.`;

/**
 * System Prompt especializado em Automação BDD multi-framework (Playwright, Cypress, Robot Framework).
 */
export const QA_BDD_SYSTEM_PROMPT =
  'Você é um SDET Sênior. Sua função é receber um cenário BDD/Gherkin e convertê-lo em um script de automação executável usando o framework solicitado. Aplique boas práticas (como Page Object Model, se aplicável ao framework). Retorne APENAS o código puro. NUNCA inclua formatação Markdown ou textos explicativos.';

/**
 * System Prompt especializado em Validação de Contrato de API (Schema Validation).
 */
export const QA_CONTRACT_SYSTEM_PROMPT =
  'Você é um SDET especialista em testes de API. O usuário enviará um payload JSON. Sua função é analisar esse JSON e gerar um script de teste de contrato (Schema Validation) que valide estritamente a tipagem, campos obrigatórios e estruturas aninhadas usando a biblioteca/framework solicitada. Retorne APENAS o código executável, sem marcações Markdown ou explicações.';

const REQUEST_TIMEOUT_MS = 15000;
export const GEMINI_MODEL_NAME = 'gemini-3.5-flash-lite';

/**
 * Payload estático de contingência (Circuit Breaker / Fallback Local)
 * com 3 registros contendo happy path, campos vazios/null, boundary values e payloads de injeção (XSS / SQLi).
 */
const FALLBACK_RESILIENCE_MOCK_DATA = [
  {
    id: 'usr_qa_01_valid',
    fullName: 'Mariana Costa',
    email: 'mariana.costa@qa-playground.dev',
    cpf: '391.842.018-77',
    role: 'QA_LEAD',
    loginAttempts: 1,
    isActive: true,
    notes: 'Happy Path: Registro padrão válido',
  },
  {
    id: 'usr_qa_02_edge_empty_xss',
    fullName: "<script>alert('XSS_RESILIENCE_TEST')</script> 🚀",
    email: '',
    cpf: null,
    role: 'GUEST',
    loginAttempts: 0,
    isActive: false,
    notes: 'Edge Case: Campos vazios ("", null) e payload de injeção XSS',
  },
  {
    id: 'usr_qa_03_edge_sqli_boundary',
    fullName: "Robert'); DROP TABLE users;--",
    email: "admin' OR '1'='1@qa-playground.dev",
    cpf: '000.000.000-00',
    role: 'BLOCKED_ACCOUNT',
    loginAttempts: 999999,
    isActive: false,
    notes: 'Edge Case: Injeção SQL (SQLi) e valor limite de tentativas',
  },
];

/**
 * Snippets de contingência (Circuit Breaker / Fallback Local) por framework de automação BDD.
 */
export const FALLBACK_BDD_SNIPPETS: Record<AutomationFramework, string> = {
  Playwright: `import { test, expect, type Page, type Locator } from '@playwright/test';

// Fallback Local (Circuit Breaker) — Playwright + Page Object Model
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByTestId('login-email');
    this.passwordInput = page.getByTestId('login-password');
    this.submitButton = page.getByRole('button', { name: /entrar/i });
    this.errorAlert = page.getByRole('alert');
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}

test.describe('Autenticação de Usuário (Fallback Local)', () => {
  test('Login com falha por credenciais inválidas', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('qa.invalido@empresa.com', 'SenhaErrada123!');

    await expect(loginPage.errorAlert).toBeVisible();
    await expect(loginPage.errorAlert).toContainText('E-mail ou senha inválidos');
    await expect(page).toHaveURL(/\\/login$/);
  });
});`,

  Cypress: `// Fallback Local (Circuit Breaker) — Cypress + Page Object Pattern
class LoginPage {
  visit(): void {
    cy.visit('/login');
  }

  fillEmail(email: string): void {
    cy.get('[data-testid="login-email"]').clear().type(email);
  }

  fillPassword(password: string): void {
    cy.get('[data-testid="login-password"]').clear().type(password);
  }

  submit(): void {
    cy.contains('button', /entrar/i).click();
  }

  getErrorAlert() {
    return cy.get('[role="alert"]');
  }
}

const loginPage = new LoginPage();

describe('Autenticação de Usuário (Fallback Local)', () => {
  it('Deve exibir alerta de erro ao realizar login com credenciais inválidas', () => {
    loginPage.visit();
    loginPage.fillEmail('qa.invalido@empresa.com');
    loginPage.fillPassword('SenhaErrada123!');
    loginPage.submit();

    loginPage
      .getErrorAlert()
      .should('be.visible')
      .and('contain.text', 'E-mail ou senha inválidos');

    cy.url().should('include', '/login');
  });
});`,

  'Robot Framework': `*** Settings ***
Documentation     Fallback Local (Circuit Breaker) — Cenário BDD em Robot Framework
Library           SeleniumLibrary

*** Variables ***
\${BASE_URL}          https://app.qa-playground.dev/login
\${BROWSER}           headlesschrome
\${INVALID_EMAIL}     qa.invalido@empresa.com
\${INVALID_PASSWORD}  SenhaErrada123!
\${EXPECTED_ERROR}    E-mail ou senha inválidos

*** Test Cases ***
Login Com Falha Por Credenciais Inválidas
    [Tags]    bdd    auth    resilience
    Dado Que O Usuário Está Na Página De Login
    Quando Ele Preenche Credenciais Inválidas E Clica Em Entrar
    Então O Sistema Deve Exibir A Mensagem De Erro Esperada
    [Teardown]    Close Browser

*** Keywords ***
Dado Que O Usuário Está Na Página De Login
    Open Browser    \${BASE_URL}    \${BROWSER}
    Wait Until Element Is Visible    css:[data-testid="login-email"]    timeout=10s

Quando Ele Preenche Credenciais Inválidas E Clica Em Entrar
    Input Text      css:[data-testid="login-email"]       \${INVALID_EMAIL}
    Input Password  css:[data-testid="login-password"]    \${INVALID_PASSWORD}
    Click Button    css:[data-testid="login-submit"]

Então O Sistema Deve Exibir A Mensagem De Erro Esperada
    Wait Until Element Is Visible    css:[role="alert"]    timeout=5s
    Element Should Contain           css:[role="alert"]    \${EXPECTED_ERROR}
    Location Should Contain          /login`,
};

/**
 * Script de contrato Zod genérico (Circuit Breaker / Fallback Local)
 * retornado quando a API externa falha na Fase 4 (API Contract Check).
 */
export const FALLBACK_ZOD_CONTRACT_SCRIPT = `import { test, expect } from '@playwright/test';
import { z } from 'zod';

// Fallback Local (Circuit Breaker) — Validação Estrita de Contrato com Playwright API + Zod
const OrderItemSchema = z.object({
  sku: z.string().min(1),
  qty: z.number().int().positive(),
  price: z.number().nonnegative(),
});

const OrderResponseSchema = z
  .object({
    orderId: z.string().min(1),
    customerId: z.string().min(1),
    status: z.enum(['CREATED', 'PAID', 'CANCELLED']),
    items: z.array(OrderItemSchema).min(1),
    totalAmount: z.number().positive(),
    createdAt: z.string().datetime(),
  })
  .strict();

test.describe('API Contract Check — Validação de Schema (Fallback Local)', () => {
  test('Deve validar estritamente o contrato JSON do endpoint de pedidos', async ({ request }) => {
    const response = await request.get('/api/v1/orders/ord_901');
    expect(response.status()).toBe(200);

    const body: unknown = await response.json();
    const parsedContract = OrderResponseSchema.safeParse(body);

    expect(
      parsedContract.success,
      parsedContract.success ? '' : JSON.stringify(parsedContract.error.format(), null, 2)
    ).toBe(true);
  });
});`;

export class MissingApiKeyError extends Error {
  constructor(
    message = 'Variável VITE_GEMINI_API_KEY não encontrada. Configure seu arquivo .env na raiz do projeto.'
  ) {
    super(message);
    this.name = 'MissingApiKeyError';
  }
}

/**
 * Verifica se a chave VITE_GEMINI_API_KEY está configurada no ambiente.
 */
export function hasGeminiApiKey(): boolean {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  return Boolean(apiKey && apiKey.trim().length > 0);
}

/**
 * Remove cercas markdown residuais caso o modelo ainda as retorne
 * e garante que o retorno é um JSON válido e identado.
 */
function sanitizeAndFormatJson(rawText: string): {
  formattedJson: string;
  recordsCount: number;
} {
  const cleaned = rawText
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(
      'A IA retornou um conteúdo que não pôde ser convertido em JSON válido. Tente refinar o prompt.'
    );
  }

  let recordsCount = 1;
  if (Array.isArray(parsed)) {
    recordsCount = parsed.length;
  } else if (parsed && typeof parsed === 'object') {
    const firstArray = Object.values(parsed as Record<string, unknown>).find((v) =>
      Array.isArray(v)
    );
    recordsCount = Array.isArray(firstArray)
      ? firstArray.length
      : Object.keys(parsed as Record<string, unknown>).length;
  }

  return {
    formattedJson: JSON.stringify(parsed, null, 2),
    recordsCount,
  };
}

/**
 * Limpa cercas Markdown residuais (ex: ```typescript, ```javascript, ```robot, ```) do código retornado.
 */
function sanitizeCodeOutput(rawText: string): string {
  return rawText
    .trim()
    .replace(
      /^```(?:typescript|ts|javascript|js|robot|robotframework|python|py|gherkin)?\s*/i,
      ''
    )
    .replace(/\s*```$/i, '')
    .trim();
}

/**
 * Cria um sinal de aborto de 15 segundos usando AbortSignal.timeout(15000)
 * com fallback seguro para AbortController caso o navegador não suporte.
 */
function createTimeoutSignal(timeoutMs: number): {
  signal: AbortSignal;
  cleanup: () => void;
} {
  if (typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal) {
    return {
      signal: AbortSignal.timeout(timeoutMs),
      cleanup: () => {},
    };
  }

  const controller = new AbortController();
  const timerId = setTimeout(() => {
    controller.abort(new DOMException('TimeoutError', 'TimeoutError'));
  }, timeoutMs);

  return {
    signal: controller.signal,
    cleanup: () => clearTimeout(timerId),
  };
}

/**
 * Verifica se o erro capturado deve acionar o Circuit Breaker (Erro 503 High Demand,
 * 429 Quota/Rate Limit, 404 rota indisponível ou Timeout de 15s).
 */
function shouldTriggerCircuitBreaker(err: unknown, signalAborted: boolean): boolean {
  if (signalAborted) {
    return true;
  }

  if (!(err instanceof Error)) {
    return false;
  }

  const msg = err.message.toLowerCase();
  return (
    err.name === 'TimeoutError' ||
    err.name === 'AbortError' ||
    msg.includes('503') ||
    msg.includes('429') ||
    msg.includes('404') ||
    msg.includes('not found') ||
    msg.includes('quota') ||
    msg.includes('high demand') ||
    msg.includes('service unavailable') ||
    msg.includes('overloaded') ||
    msg.includes('timeout') ||
    msg.includes('aborted') ||
    msg.includes('failed to fetch') ||
    msg.includes('tempo limite excedido')
  );
}

/**
 * Conecta ao Google Gemini utilizando o SDK oficial (@google/generative-ai)
 * com o modelo gemini-3.5-flash-lite, responseMimeType: 'application/json',
 * maxOutputTokens: 1024, timeout de 15 segundos e padrão Circuit Breaker / Fallback Local.
 */
export async function generateMockDataWithGemini(
  request: MockDataRequest
): Promise<AIResponse> {
  const apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)?.trim();

  if (!apiKey) {
    throw new MissingApiKeyError();
  }

  const startTime = performance.now();

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL_NAME,
    systemInstruction: QA_MOCK_SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 1024,
      responseMimeType: 'application/json',
    },
  });

  const userPrompt = [
    `Solicitação de massa de dados QA: ${request.prompt.trim()}`,
    `Locale preferencial: ${request.locale ?? 'pt-BR'}.`,
    request.includeEdgeCases !== false
      ? 'IMPORTANTE: Inclua edge cases, campos vazios ("", null), valores limites e caracteres especiais para testar a resiliência da aplicação.'
      : 'Gere registros válidos seguindo o contrato solicitado.',
  ].join('\n');

  const { signal, cleanup } = createTimeoutSignal(REQUEST_TIMEOUT_MS);

  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      const timeoutErr = new Error('TimeoutError: Tempo limite de 15s atingido.');
      timeoutErr.name = 'TimeoutError';
      reject(timeoutErr);
    }, REQUEST_TIMEOUT_MS);
  });

  try {
    const result = await Promise.race([
      model.generateContent(userPrompt, {
        signal,
        timeout: REQUEST_TIMEOUT_MS,
      }),
      timeoutPromise,
    ]);

    const rawText = result.response.text();

    if (!rawText || !rawText.trim()) {
      throw new Error('A API do Google Gemini retornou uma resposta vazia.');
    }

    const { formattedJson, recordsCount } = sanitizeAndFormatJson(rawText);
    const endTime = performance.now();

    return {
      payload: formattedJson,
      recordsCount,
      executionTimeMs: Math.round(endTime - startTime),
      model: `Google Gemini (${GEMINI_MODEL_NAME})`,
      timestamp: new Date().toLocaleTimeString('pt-BR'),
    };
  } catch (err) {
    const endTime = performance.now();

    if (shouldTriggerCircuitBreaker(err, signal.aborted)) {
      return {
        payload: JSON.stringify(FALLBACK_RESILIENCE_MOCK_DATA, null, 2),
        recordsCount: FALLBACK_RESILIENCE_MOCK_DATA.length,
        executionTimeMs: Math.round(endTime - startTime),
        model: 'Modo de Resiliência (Fallback Local)',
        timestamp: new Date().toLocaleTimeString('pt-BR'),
      };
    }

    if (err instanceof Error) {
      throw new Error(`Falha ao gerar dados no Gemini: ${err.message}`);
    }

    throw new Error('Erro inesperado ao comunicar com o SDK do Google Gemini.');
  } finally {
    cleanup();
    if (timeoutHandle !== undefined) {
      clearTimeout(timeoutHandle);
    }
  }
}

/**
 * Converte um cenário BDD/Gherkin em um script de automação executável no framework escolhido
 * (Playwright, Cypress ou Robot Framework) SEM responseMimeType: 'application/json',
 * com timeout de 15s e Circuit Breaker retornando snippet correspondente ao framework.
 */
export async function generateBddWithGemini(
  request: BddGenerationRequest
): Promise<AIResponse> {
  const apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)?.trim();

  if (!apiKey) {
    throw new MissingApiKeyError();
  }

  const startTime = performance.now();

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL_NAME,
    systemInstruction: QA_BDD_SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1024,
    },
  });

  const userPrompt = [
    `Framework exigido: ${request.framework}`,
    `Cenário BDD/Gherkin:\n${request.prompt.trim()}`,
  ].join('\n\n');

  const { signal, cleanup } = createTimeoutSignal(REQUEST_TIMEOUT_MS);

  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      const timeoutErr = new Error('TimeoutError: Tempo limite de 15s atingido.');
      timeoutErr.name = 'TimeoutError';
      reject(timeoutErr);
    }, REQUEST_TIMEOUT_MS);
  });

  try {
    const result = await Promise.race([
      model.generateContent(userPrompt, {
        signal,
        timeout: REQUEST_TIMEOUT_MS,
      }),
      timeoutPromise,
    ]);

    const rawText = result.response.text();

    if (!rawText || !rawText.trim()) {
      throw new Error('A API do Google Gemini retornou uma resposta vazia.');
    }

    const cleanedCode = sanitizeCodeOutput(rawText);
    const endTime = performance.now();

    return {
      payload: cleanedCode,
      recordsCount: 1,
      executionTimeMs: Math.round(endTime - startTime),
      model: `Google Gemini (${GEMINI_MODEL_NAME})`,
      timestamp: new Date().toLocaleTimeString('pt-BR'),
    };
  } catch (err) {
    const endTime = performance.now();

    if (shouldTriggerCircuitBreaker(err, signal.aborted)) {
      const fallbackSnippet =
        FALLBACK_BDD_SNIPPETS[request.framework] ?? FALLBACK_BDD_SNIPPETS.Playwright;

      return {
        payload: fallbackSnippet,
        recordsCount: 1,
        executionTimeMs: Math.round(endTime - startTime),
        model: 'Modo de Resiliência (Fallback Local)',
        timestamp: new Date().toLocaleTimeString('pt-BR'),
      };
    }

    if (err instanceof Error) {
      throw new Error(`Falha ao gerar script BDD no Gemini: ${err.message}`);
    }

    throw new Error('Erro inesperado ao comunicar com o SDK do Google Gemini.');
  } finally {
    cleanup();
    if (timeoutHandle !== undefined) {
      clearTimeout(timeoutHandle);
    }
  }
}

/**
 * Gera um script de teste de contrato (Schema Validation) a partir de um payload JSON
 * usando o framework de validação selecionado ('Playwright API + Zod', 'Cypress + AJV' ou 'Postman (Chai)').
 * Retorna texto puro (sem cercas Markdown), com timeout de 15s e Circuit Breaker retornando script Zod.
 */
export async function generateApiContractWithGemini(
  request: ApiContractRequest
): Promise<AIResponse> {
  const apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)?.trim();

  if (!apiKey) {
    throw new MissingApiKeyError();
  }

  const startTime = performance.now();

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL_NAME,
    systemInstruction: QA_CONTRACT_SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1024,
    },
  });

  const userPrompt = [
    `Framework de Validação exigido: ${request.framework}`,
    `Payload JSON de resposta da API:\n${request.payloadJson.trim()}`,
  ].join('\n\n');

  const { signal, cleanup } = createTimeoutSignal(REQUEST_TIMEOUT_MS);

  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      const timeoutErr = new Error('TimeoutError: Tempo limite de 15s atingido.');
      timeoutErr.name = 'TimeoutError';
      reject(timeoutErr);
    }, REQUEST_TIMEOUT_MS);
  });

  try {
    const result = await Promise.race([
      model.generateContent(userPrompt, {
        signal,
        timeout: REQUEST_TIMEOUT_MS,
      }),
      timeoutPromise,
    ]);

    const rawText = result.response.text();

    if (!rawText || !rawText.trim()) {
      throw new Error('A API do Google Gemini retornou uma resposta vazia.');
    }

    const cleanedCode = sanitizeCodeOutput(rawText);
    const endTime = performance.now();

    return {
      payload: cleanedCode,
      recordsCount: 1,
      executionTimeMs: Math.round(endTime - startTime),
      model: `Google Gemini (${GEMINI_MODEL_NAME})`,
      timestamp: new Date().toLocaleTimeString('pt-BR'),
    };
  } catch (err) {
    const endTime = performance.now();

    // Circuit Breaker: Em caso de erro 503 (High Demand) ou Timeout de 15s,
    // retorna o script de contrato Zod genérico de contingência.
    if (shouldTriggerCircuitBreaker(err, signal.aborted)) {
      return {
        payload: FALLBACK_ZOD_CONTRACT_SCRIPT,
        recordsCount: 1,
        executionTimeMs: Math.round(endTime - startTime),
        model: 'Modo de Resiliência (Fallback Local)',
        timestamp: new Date().toLocaleTimeString('pt-BR'),
      };
    }

    if (err instanceof Error) {
      throw new Error(`Falha ao gerar script de contrato no Gemini: ${err.message}`);
    }

    throw new Error('Erro inesperado ao comunicar com o SDK do Google Gemini.');
  } finally {
    cleanup();
    if (timeoutHandle !== undefined) {
      clearTimeout(timeoutHandle);
    }
  }
}
