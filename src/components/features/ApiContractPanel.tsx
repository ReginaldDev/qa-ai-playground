import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  Sparkles,
  Copy,
  Check,
  Download,
  Webhook,
  AlertCircle,
  KeyRound,
  Wand2,
  RotateCcw,
  FileCode2,
  Clock,
  Layers,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Badge } from '../ui/Badge';
import {
  FALLBACK_ZOD_CONTRACT_SCRIPT,
  generateApiContractWithGemini,
  hasGeminiApiKey,
  MissingApiKeyError,
} from '../../lib/ai-client';
import { usePlaygroundStore } from '../../store/usePlaygroundStore';
import type {
  AIResponse,
  ContractValidationFramework,
  PromptPreset,
} from '../../types';

const VALIDATION_FRAMEWORKS: ContractValidationFramework[] = [
  'Playwright API + Zod',
  'Cypress + AJV',
  'Postman (Chai)',
];

const CONTRACT_FRAMEWORK_META: Record<
  ContractValidationFramework,
  {
    extension: '.spec.ts' | '.cy.ts' | '.js';
    filename: string;
    editorLanguage: 'typescript' | 'javascript';
    badgeLabel: string;
  }
> = {
  'Playwright API + Zod': {
    extension: '.spec.ts',
    filename: 'api-contract.spec.ts',
    editorLanguage: 'typescript',
    badgeLabel: 'Playwright + Zod (.spec.ts)',
  },
  'Cypress + AJV': {
    extension: '.cy.ts',
    filename: 'api-contract.cy.ts',
    editorLanguage: 'typescript',
    badgeLabel: 'Cypress + AJV (.cy.ts)',
  },
  'Postman (Chai)': {
    extension: '.js',
    filename: 'postman-contract.js',
    editorLanguage: 'javascript',
    badgeLabel: 'Postman Chai (.js)',
  },
};

const CONTRACT_JSON_PRESETS: PromptPreset[] = [
  {
    id: 'order-response',
    title: 'Pedido E-commerce (Aninhado)',
    category: 'Orders API',
    prompt: `{
  "orderId": "ord_901",
  "customerId": "cus_123",
  "status": "PAID",
  "items": [
    {
      "sku": "KB-MECH-01",
      "qty": 2,
      "price": 199.90
    }
  ],
  "totalAmount": 399.80,
  "createdAt": "2026-11-10T20:15:00Z"
}`,
  },
  {
    id: 'user-profile',
    title: 'Perfil de Usuário & Roles',
    category: 'Auth API',
    prompt: `{
  "id": "usr_01H9QA88",
  "fullName": "Mariana Costa",
  "email": "mariana.costa@empresa.com.br",
  "isActive": true,
  "permissions": ["READ_REPORTS", "EXECUTE_TESTS"],
  "profile": {
    "department": "Quality Engineering",
    "seniority": "SENIOR"
  }
}`,
  },
];

export const ApiContractPanel: React.FC = () => {
  const { addToast } = usePlaygroundStore();
  const [framework, setFramework] = useState<ContractValidationFramework>(
    'Playwright API + Zod'
  );
  const [payloadJson, setPayloadJson] = useState<string>(
    CONTRACT_JSON_PRESETS[0].prompt
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isMissingApiKey, setIsMissingApiKey] = useState<boolean>(() => !hasGeminiApiKey());
  const [copied, setCopied] = useState<boolean>(false);

  const [response, setResponse] = useState<AIResponse>({
    payload: FALLBACK_ZOD_CONTRACT_SCRIPT,
    recordsCount: 1,
    executionTimeMs: 0,
    model: hasGeminiApiKey() ? 'Google Gemini (Pronto)' : 'Aguardando VITE_GEMINI_API_KEY',
    timestamp: '--:--:--',
  });

  const currentMeta = CONTRACT_FRAMEWORK_META[framework];

  const handleGenerateContract = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!payloadJson.trim()) {
      const msg = 'Cole o payload JSON de resposta da sua API antes de gerar o contrato.';
      setError(msg);
      addToast({
        type: 'error',
        title: 'Payload Vazio',
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
        title: 'Erro ao gerar contrato',
        message: msg,
      });
      return;
    }

    setIsMissingApiKey(false);
    setIsLoading(true);

    try {
      const result = await generateApiContractWithGemini({
        payloadJson,
        framework,
      });
      setResponse(result);

      if (result.model === 'Modo de Resiliência (Fallback Local)') {
        addToast({
          type: 'info',
          title: 'Circuit Breaker Ativado',
          message:
            'API indisponível (503/Timeout). Script de contrato Zod genérico carregado via Fallback Local.',
        });
      } else {
        addToast({
          type: 'success',
          title: 'Teste de Contrato Gerado',
          message: `Script (${framework}) gerado em ${result.executionTimeMs} ms.`,
        });
      }
    } catch (err) {
      if (err instanceof MissingApiKeyError) {
        setIsMissingApiKey(true);
      }
      const message =
        err instanceof Error
          ? err.message
          : 'Erro inesperado ao gerar script de teste de contrato.';
      setError(message);
      addToast({
        type: 'error',
        title: 'Erro ao gerar contrato',
        message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      void handleGenerateContract();
    }
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(response.payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadContract = () => {
    const blob = new Blob([response.payload], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentMeta.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const codeLinesCount = response.payload.split('\n').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Feature Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-100">
              API Contract Check
            </h1>
            <Badge variant="indigo">Fase 4 • Schema Validation</Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Analise payloads JSON de resposta da sua API e gere scripts executáveis de validação estrita de schema e tipagem.
          </p>
        </div>

        {/* Quick JSON Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-slate-500 mr-1 flex items-center gap-1">
            <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
            Payloads de Exemplo:
          </span>
          {CONTRACT_JSON_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                setError(null);
                setPayloadJson(preset.prompt);
              }}
              className="text-xs font-mono px-2.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-indigo-500/40 transition-colors cursor-pointer"
            >
              {preset.title}
            </button>
          ))}
        </div>
      </div>

      {/* Friendly Alert if VITE_GEMINI_API_KEY is missing */}
      {isMissingApiKey && (
        <div
          role="region"
          aria-label="Configuração de ambiente necessária"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-200 text-sm"
        >
          <div className="flex items-start gap-3">
            <KeyRound className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-100">
                Configuração necessária: variável <code className="font-mono text-amber-300">VITE_GEMINI_API_KEY</code> não detectada
              </p>
              <p className="text-xs text-amber-200/80 leading-relaxed">
                Para conectar ao Google Gemini, crie um arquivo{' '}
                <code className="font-mono bg-slate-950/70 px-1.5 py-0.5 rounded border border-amber-500/30">
                  .env
                </code>{' '}
                na raiz do projeto contendo{' '}
                <code className="font-mono bg-slate-950/70 px-1.5 py-0.5 rounded border border-amber-500/30">
                  VITE_GEMINI_API_KEY=sua_chave_aqui
                </code>{' '}
                e reinicie o servidor (<code className="font-mono">npm.cmd run dev</code>).
              </p>
            </div>
          </div>
          <Badge variant="amber">.env ausente</Badge>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-rose-950/50 border border-rose-500/40 text-rose-200 text-sm"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-xs font-mono underline text-rose-300 hover:text-white cursor-pointer shrink-0"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Split DevTools Workspace: Left (JSON Input + Validation Framework Select) | Right (Monaco Editor Output) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Framework Select & JSON Payload Input */}
        <form
          onSubmit={handleGenerateContract}
          className="lg:col-span-5 bg-slate-900/70 border border-slate-800/90 rounded-xl p-5 space-y-5 shadow-xl shadow-slate-950/50"
        >
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Webhook className="w-4 h-4 text-indigo-400" />
              <h2 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-200">
                Payload da API & Validador
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              Ctrl + Enter para gerar
            </span>
          </div>

          {/* Select para Framework de Validação */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="contract-framework-select"
              className="text-xs font-semibold uppercase tracking-wider text-slate-400"
            >
              Framework de Validação
            </label>
            <select
              id="contract-framework-select"
              value={framework}
              onChange={(e) =>
                setFramework(e.target.value as ContractValidationFramework)
              }
              className="w-full rounded-lg bg-slate-950/90 border border-slate-800 px-3.5 py-2.5 text-sm font-mono text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-colors"
            >
              {VALIDATION_FRAMEWORKS.map((fw) => (
                <option key={fw} value={fw}>
                  {fw}
                </option>
              ))}
            </select>
          </div>

          <Textarea
            id="api-contract-json-input"
            label="Cole aqui o payload JSON de resposta da sua API"
            rows={10}
            value={payloadJson}
            onChange={(e) => {
              if (error) setError(null);
              setPayloadJson(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Cole aqui o payload JSON de resposta da sua API..."
            helperText={`A IA analisará tipagem, campos obrigatórios e objetos aninhados gerando o contrato em ${framework}.`}
          />

          {/* Action Bar */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setError(null);
                setPayloadJson('');
              }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Limpar
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full sm:w-auto min-w-44"
            >
              <Sparkles className="w-4 h-4" />
              {isLoading ? 'Gerando Contrato...' : 'Gerar Teste de Contrato'}
            </Button>
          </div>
        </form>

        {/* Right Column: Monaco Editor Output Panel */}
        <section
          aria-label="Script de Teste de Contrato no Monaco Editor"
          className="lg:col-span-7 bg-slate-900/80 border border-slate-800/90 rounded-xl overflow-hidden shadow-xl shadow-slate-950/60 flex flex-col"
        >
          {/* Code Editor Window Topbar */}
          <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Window Traffic Lights */}
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
              </div>

              <div className="h-4 w-px bg-slate-800" />

              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <FileCode2 className="w-4 h-4 text-indigo-400" />
                <span>{currentMeta.filename}</span>
              </div>

              {response.model === 'Modo de Resiliência (Fallback Local)' ? (
                <Badge variant="amber">Circuit Breaker • Fallback Local</Badge>
              ) : (
                <Badge variant="emerald">{currentMeta.badgeLabel}</Badge>
              )}
            </div>

            {/* QA Output Actions */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCopyCode}
                title="Copiar script de contrato para a área de transferência"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar</span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadContract}
                title={`Baixar arquivo ${currentMeta.filename}`}
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>Download ({currentMeta.extension})</span>
              </Button>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="relative bg-[#1e1e1e] h-[440px] w-full">
            {isLoading && (
              <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                <span className="text-xs font-mono text-indigo-300">
                  Gerando validação de schema com {framework}...
                </span>
              </div>
            )}

            <Editor
              height="100%"
              language={currentMeta.editorLanguage}
              theme="vs-dark"
              value={response.payload}
              options={{
                readOnly: true,
                domReadOnly: true,
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                automaticLayout: true,
                renderLineHighlight: 'none',
                padding: { top: 16, bottom: 16 },
              }}
            />
          </div>

          {/* DevTool Status Bar */}
          <div className="px-4 py-2.5 bg-slate-900/95 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                Linhas: <strong className="text-slate-200">{codeLinesCount}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Tempo:{' '}
                <strong className="text-slate-200">
                  {response.executionTimeMs} ms
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span>
                UTF-8 •{' '}
                {currentMeta.editorLanguage === 'typescript'
                  ? 'TypeScript'
                  : 'JavaScript'}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-indigo-300">{response.model}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

