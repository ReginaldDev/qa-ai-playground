import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  QA_MOCK_SYSTEM_PROMPT,
  QA_BDD_SYSTEM_PROMPT,
  QA_CONTRACT_SYSTEM_PROMPT,
  FALLBACK_BDD_SNIPPETS,
  FALLBACK_ZOD_CONTRACT_SCRIPT,
  MissingApiKeyError,
  hasGeminiApiKey,
  generateMockDataWithGemini,
  generateBddWithGemini,
  generateApiContractWithGemini,
} from '../ai-client';

const mockGenerateContent = vi.fn();

vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: class {
      getGenerativeModel() {
        return {
          generateContent: mockGenerateContent,
        };
      }
    },
  };
});

describe('ai-client.ts — Unit Tests (Engine, Sanitização & Circuit Breaker)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('VITE_GEMINI_API_KEY', 'test_gemini_api_key_123');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('System Prompts & Configuração de Ambiente', () => {
    it('deve conter as 5 regras obrigatórias no QA_MOCK_SYSTEM_PROMPT incluindo concisão', () => {
      expect(QA_MOCK_SYSTEM_PROMPT).toContain('1. Retorne APENAS um JSON estritamente válido');
      expect(QA_MOCK_SYSTEM_PROMPT).toContain('5. Seja extremamente conciso. Gere no máximo 3 a 5 registros no total.');
    });

    it('deve definir corretamente QA_BDD_SYSTEM_PROMPT e QA_CONTRACT_SYSTEM_PROMPT', () => {
      expect(QA_BDD_SYSTEM_PROMPT).toContain('Page Object Model');
      expect(QA_CONTRACT_SYSTEM_PROMPT).toContain('Schema Validation');
    });

    it('hasGeminiApiKey deve retornar true quando a chave existe e false quando vazia', () => {
      expect(hasGeminiApiKey()).toBe(true);
      vi.stubEnv('VITE_GEMINI_API_KEY', '');
      expect(hasGeminiApiKey()).toBe(false);
    });

    it('deve lançar MissingApiKeyError quando VITE_GEMINI_API_KEY não estiver configurada', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', '');
      await expect(
        generateMockDataWithGemini({ prompt: 'Gere 3 usuários' })
      ).rejects.toThrow(MissingApiKeyError);
    });
  });

  describe('Módulo 1: generateMockDataWithGemini (Smart Data Mock)', () => {
    it('deve sanitizar cercas Markdown (```json) e retornar JSON formatado com contagem de registros', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => '```json\n[{"id": 1, "name": "QA 1"}, {"id": 2, "name": "QA 2"}]\n```',
        },
      });

      const res = await generateMockDataWithGemini({
        prompt: 'Gere apenas 2 usuários',
        locale: 'pt-BR',
        includeEdgeCases: true,
      });

      expect(res.recordsCount).toBe(2);
      expect(JSON.parse(res.payload)).toHaveLength(2);
      expect(res.model).toContain('Google Gemini');
    });

    it('deve acionar o Circuit Breaker (Fallback Local) quando a API retornar erro 503 High Demand', async () => {
      mockGenerateContent.mockRejectedValueOnce(
        new Error('[503 Service Unavailable] High demand on free tier')
      );

      const res = await generateMockDataWithGemini({
        prompt: 'Gere apenas 3 registros de usuários',
      });

      expect(res.model).toBe('Modo de Resiliência (Fallback Local)');
      expect(res.recordsCount).toBe(3);
      const parsed = JSON.parse(res.payload);
      expect(parsed).toHaveLength(3);
      expect(parsed[1].fullName).toContain('<script>');
    });

    it('deve acionar o Circuit Breaker quando ocorrer Timeout de 15s (TimeoutError)', async () => {
      const timeoutError = new Error('TimeoutError: Tempo limite de 15s atingido.');
      timeoutError.name = 'TimeoutError';
      mockGenerateContent.mockRejectedValueOnce(timeoutError);

      const res = await generateMockDataWithGemini({
        prompt: 'Gere apenas 3 registros',
      });

      expect(res.model).toBe('Modo de Resiliência (Fallback Local)');
      expect(res.recordsCount).toBe(3);
    });
  });

  describe('Módulo 2: generateBddWithGemini (BDD Test Generator Multi-Framework)', () => {
    it('deve injetar o framework escolhido no prompt e limpar cercas ```typescript', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () =>
            "```typescript\nimport { test, expect } from '@playwright/test';\ntest('login', async () => {});\n```",
        },
      });

      const res = await generateBddWithGemini({
        prompt: 'Cenário: Login com sucesso',
        framework: 'Playwright',
      });

      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.stringContaining('Framework exigido: Playwright'),
        expect.any(Object)
      );
      expect(res.payload).not.toContain('```');
      expect(res.payload).toContain("import { test, expect } from '@playwright/test';");
    });

    it('deve retornar o snippet de Fallback Local correspondente ao framework selecionado (Robot Framework) em erro 503', async () => {
      mockGenerateContent.mockRejectedValueOnce(new Error('503 Service Unavailable'));

      const res = await generateBddWithGemini({
        prompt: 'Cenário: Login com falha',
        framework: 'Robot Framework',
      });

      expect(res.model).toBe('Modo de Resiliência (Fallback Local)');
      expect(res.payload).toBe(FALLBACK_BDD_SNIPPETS['Robot Framework']);
      expect(res.payload).toContain('*** Test Cases ***');
    });
  });

  describe('Módulo 3: generateApiContractWithGemini (API Contract Check)', () => {
    it('deve remover cercas markdown do script de contrato gerado pela IA', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () =>
            "```javascript\npm.test('Status code is 200', function () { pm.response.to.have.status(200); });\n```",
        },
      });

      const res = await generateApiContractWithGemini({
        payloadJson: '{"orderId": "ord_1"}',
        framework: 'Postman (Chai)',
      });

      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.stringContaining('Framework de Validação exigido: Postman (Chai)'),
        expect.any(Object)
      );
      expect(res.payload).not.toContain('```');
      expect(res.payload).toContain("pm.test('Status code is 200'");
    });

    it('deve retornar o script Zod genérico via Circuit Breaker quando a API falhar com 503', async () => {
      mockGenerateContent.mockRejectedValueOnce(new Error('503 High demand'));

      const res = await generateApiContractWithGemini({
        payloadJson: '{"orderId": "ord_901"}',
        framework: 'Playwright API + Zod',
      });

      expect(res.model).toBe('Modo de Resiliência (Fallback Local)');
      expect(res.payload).toBe(FALLBACK_ZOD_CONTRACT_SCRIPT);
      expect(res.payload).toContain("import { z } from 'zod'");
    });
  });
});

