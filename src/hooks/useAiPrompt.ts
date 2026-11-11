import { useState, useCallback } from 'react';
import type { AIResponse, MockDataRequest } from '../types';
import {
  generateMockDataWithGemini,
  hasGeminiApiKey,
  MissingApiKeyError,
} from '../lib/ai-client';
import { usePlaygroundStore } from '../store/usePlaygroundStore';

const INITIAL_JSON_PREVIEW = `{
  "fixtureInfo": {
    "status": "READY_FOR_GENERATION",
    "targetRunner": "Playwright / Cypress / API Contract",
    "resilienceFocus": [
      "edge_cases",
      "empty_fields",
      "special_characters"
    ]
  },
  "sampleTestCases": [
    {
      "id": "usr_valid_01",
      "fullName": "Fernanda Lima",
      "email": "fernanda.lima.qa@devtool.io",
      "document": "519.283.746-10",
      "notes": "Happy path record",
      "isActive": true
    },
    {
      "id": "usr_edge_empty_and_special_02",
      "fullName": "O'Connor \\"Drop\\" <script>alert(1)</script> 🚀",
      "email": "",
      "document": null,
      "notes": "Edge case: campos vazios, null e caracteres especiais para teste de resiliência",
      "isActive": false
    }
  ]
}`;

export function useAiPrompt() {
  const { addToast } = usePlaygroundStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMissingApiKey, setIsMissingApiKey] = useState<boolean>(() => !hasGeminiApiKey());
  const [response, setResponse] = useState<AIResponse>({
    payload: INITIAL_JSON_PREVIEW,
    recordsCount: 2,
    executionTimeMs: 0,
    model: hasGeminiApiKey() ? 'Google Gemini (Pronto)' : 'Aguardando VITE_GEMINI_API_KEY',
    timestamp: '--:--:--',
  });

  const executePrompt = useCallback(
    async (request: MockDataRequest) => {
      if (!request.prompt.trim()) {
        const msg = 'Descreva o cenário ou estrutura da massa de dados antes de gerar.';
        setError(msg);
        addToast({
          type: 'error',
          title: 'Prompt Vazio',
          message: msg,
        });
        return;
      }

      setError(null);

      if (!hasGeminiApiKey()) {
        setIsMissingApiKey(true);
        const msg =
          'Chave VITE_GEMINI_API_KEY não encontrada! Crie um arquivo .env na raiz do projeto com VITE_GEMINI_API_KEY=sua_chave e reinicie o servidor Vite.';
        setError(msg);
        addToast({
          type: 'error',
          title: 'Erro ao gerar dados',
          message: msg,
        });
        return;
      }

      setIsMissingApiKey(false);
      setIsLoading(true);

      try {
        const result = await generateMockDataWithGemini(request);
        setResponse(result);

        if (result.model === 'Modo de Resiliência (Fallback Local)') {
          addToast({
            type: 'info',
            title: 'Circuit Breaker Ativado',
            message:
              'API externa indisponível (503/Timeout). Massa de contingência carregada via Fallback Local.',
          });
        } else {
          addToast({
            type: 'success',
            title: 'Massa de Dados Gerada',
            message: `${result.recordsCount} registros gerados em ${result.executionTimeMs} ms.`,
          });
        }
      } catch (err) {
        if (err instanceof MissingApiKeyError) {
          setIsMissingApiKey(true);
        }
        const message =
          err instanceof Error ? err.message : 'Erro inesperado ao gerar massa de dados.';
        setError(message);
        addToast({
          type: 'error',
          title: 'Erro ao gerar dados',
          message,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [addToast]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    isMissingApiKey,
    response,
    executePrompt,
    clearError,
  };
}
