import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  Sparkles,
  Copy,
  Check,
  Download,
  Terminal,
  AlertCircle,
  KeyRound,
  Wand2,
  RotateCcw,
  FileJson,
  Clock,
  Layers,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Badge } from '../ui/Badge';
import { useAiPrompt } from '../../hooks/useAiPrompt';
import type { PromptPreset } from '../../types';

const QA_PROMPT_PRESETS: PromptPreset[] = [
  {
    id: 'users-resilience-edge',
    title: 'Usuários + Edge Cases & Campos Vazios',
    category: 'Resiliência / Auth',
    prompt:
      'Gere apenas 3 registros de usuários para teste de resiliência de API de cadastro contendo id, fullName, email, cpf, role e metadata. Inclua casos válidos, campos vazios ("", null) e caracteres especiais (aspas, emojis, tags HTML/XSS).',
  },
  {
    id: 'checkout-payment-edge',
    title: 'Checkout & Pagamentos (Limites)',
    category: 'Fintech / Pagamentos',
    prompt:
      'Gere apenas 3 registros de transações de checkout contendo transactionId, amount, currency, paymentMethod, customer e cardSummary. Inclua valores limites (0, -0.01, 99999999.99), campos vazios e caracteres especiais no nome do titular.',
  },
];

export const DataMockingPanel: React.FC = () => {
  const [prompt, setPrompt] = useState<string>(
    'Gere apenas 3 registros de usuários para teste de API de cadastro (id, fullName, email, cpf, telefone, perfil e status), incluindo casos de borda com campos vazios, null e caracteres especiais para testar a resiliência do backend.'
  );
  const [locale, setLocale] = useState<'pt-BR' | 'en-US'>('pt-BR');
  const [includeEdgeCases, setIncludeEdgeCases] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const { isLoading, error, isMissingApiKey, response, executePrompt, clearError } =
    useAiPrompt();

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await executePrompt({
      prompt,
      locale,
      includeEdgeCases,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      void handleGenerate();
    }
  };

  const handleCopyJson = async () => {
    await navigator.clipboard.writeText(response.payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPlaywrightFixture = () => {
    const blob = new Blob([response.payload], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mock-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const jsonLinesCount = response.payload.split('\n').length;

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Top Feature Header (Mobile-First) */}
      <div className="flex flex-col gap-3 sm:gap-4 border-b border-slate-800/80 pb-4 sm:pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-100">
              Smart Data Mocking
            </h1>
            <Badge variant="indigo">Fase 2 • Gemini AI + Monaco</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
            Gere fixtures JSON reais com foco em resiliência, edge cases, campos vazios e caracteres especiais para Playwright e testes de API.
          </p>
        </div>

        {/* Quick Template Pills */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2">
          <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
            <Wand2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            Templates QA:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {QA_PROMPT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  clearError();
                  setPrompt(preset.prompt);
                }}
                className="text-xs font-mono px-3 py-2 sm:px-2.5 sm:py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 active:bg-slate-800 text-slate-300 border border-slate-800 hover:border-indigo-500/40 transition-colors cursor-pointer text-left"
              >
                {preset.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Friendly Alert if VITE_GEMINI_API_KEY is missing */}
      {isMissingApiKey && (
        <div
          role="region"
          aria-label="Configuração de ambiente necessária"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3.5 py-3 sm:px-4 sm:py-3.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs sm:text-sm"
        >
          <div className="flex items-start gap-2.5 sm:gap-3">
            <KeyRound className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-100">
                Configuração necessária: variável <code className="font-mono text-amber-300">VITE_GEMINI_API_KEY</code> não detectada
              </p>
              <p className="text-xs text-amber-200/80 leading-relaxed">
                Crie um arquivo{' '}
                <code className="font-mono bg-slate-950/70 px-1.5 py-0.5 rounded border border-amber-500/30">
                  .env
                </code>{' '}
                na raiz do projeto com{' '}
                <code className="font-mono bg-slate-950/70 px-1.5 py-0.5 rounded border border-amber-500/30 break-all">
                  VITE_GEMINI_API_KEY=sua_chave_aqui
                </code>{' '}
                e reinicie o servidor.
              </p>
            </div>
          </div>
          <div className="self-start sm:self-center shrink-0">
            <Badge variant="amber">.env ausente</Badge>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div
          role="alert"
          className="flex items-start sm:items-center justify-between gap-3 px-3.5 py-3 sm:px-4 rounded-lg bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs sm:text-sm"
        >
          <div className="flex items-start sm:items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5 sm:mt-0" />
            <span className="leading-relaxed">{error}</span>
          </div>
          <button
            type="button"
            onClick={clearError}
            className="text-xs font-mono underline text-rose-300 hover:text-white cursor-pointer shrink-0"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Mobile-First Stacked -> Desktop Split Grid (lg:grid-cols-12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Input Form Card */}
        <form
          onSubmit={handleGenerate}
          className="lg:col-span-5 bg-slate-900/70 border border-slate-800/90 rounded-xl p-3.5 sm:p-5 space-y-4 sm:space-y-5 shadow-xl shadow-slate-950/50"
        >
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 sm:pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400 shrink-0" />
              <h2 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-200">
                Prompt de Entrada (QA Spec)
              </h2>
            </div>
            <span className="hidden sm:inline text-[11px] font-mono text-slate-500">
              Ctrl + Enter para gerar
            </span>
          </div>

          <Textarea
            id="qa-prompt-input"
            label="Descrição da Massa de Dados"
            rows={6}
            value={prompt}
            onChange={(e) => {
              if (error) clearError();
              setPrompt(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ex: Gere apenas 3 registros de produtos de um e-commerce com id, sku, price, stockQuantity e casos extremos (campos vazios, caracteres especiais)..."
            helperText="O System Prompt já instrui a IA a injetar edge cases, campos vazios e caracteres especiais em JSON estrito."
          />

          {/* Generation Parameters (Mobile-First 1 col -> sm:2 cols) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-1">
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 flex flex-col gap-1.5">
              <label
                htmlFor="locale-select"
                className="text-[11px] font-mono uppercase text-slate-400"
              >
                Locale dos Dados
              </label>
              <select
                id="locale-select"
                value={locale}
                onChange={(e) => setLocale(e.target.value as 'pt-BR' | 'en-US')}
                className="bg-slate-900 border border-slate-800 rounded px-2.5 py-2 sm:py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="pt-BR">pt-BR (CPF, CEP, BRL)</option>
                <option value="en-US">en-US (SSN, ZIP, USD)</option>
              </select>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between gap-1.5">
              <span className="text-[11px] font-mono uppercase text-slate-400">
                Resiliência & Edge Cases
              </span>
              <label className="inline-flex items-center gap-2 cursor-pointer py-0.5">
                <input
                  type="checkbox"
                  checked={includeEdgeCases}
                  onChange={(e) => setIncludeEdgeCases(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500/40"
                />
                <span className="text-xs text-slate-300 font-mono">
                  Forçar campos vazios / especiais
                </span>
              </label>
            </div>
          </div>

          {/* Action Bar (Mobile-First Full-Width Stack -> sm:Row) */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pt-2 border-t border-slate-800/80">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => {
                clearError();
                setPrompt('');
              }}
              className="w-full sm:w-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Limpar
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full sm:w-auto sm:min-w-44 py-2.5"
            >
              <Sparkles className="w-4 h-4" />
              {isLoading ? 'Consultando Gemini...' : 'Gerar Dados'}
            </Button>
          </div>
        </form>

        {/* Output Panel: Monaco Editor */}
        <section
          aria-label="Resultado do Payload JSON no Monaco Editor"
          className="lg:col-span-7 bg-slate-900/80 border border-slate-800/90 rounded-xl overflow-hidden shadow-xl shadow-slate-950/60 flex flex-col"
        >
          {/* Code Editor Window Topbar (Mobile-First Stacked -> sm:Row) */}
          <div className="p-3 sm:px-4 sm:py-3 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
            <div className="flex items-center justify-between sm:justify-start gap-2.5">
              <div className="flex items-center gap-2.5">
                {/* Window Traffic Lights (Desktop/Tablet) */}
                <div className="hidden sm:flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                </div>

                <div className="hidden sm:block h-4 w-px bg-slate-800" />

                <div className="flex items-center gap-1.5 text-xs font-mono text-slate-200">
                  <FileJson className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>mock-data.json</span>
                </div>
              </div>

              {response.model === 'Modo de Resiliência (Fallback Local)' ? (
                <Badge variant="amber">Fallback Local</Badge>
              ) : (
                <Badge variant="emerald">Read-Only</Badge>
              )}
            </div>

            {/* QA Output Actions (2-col grid on Mobile -> Flex on sm+) */}
            <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCopyJson}
                title="Copiar JSON para a área de transferência"
                className="w-full sm:w-auto py-2 sm:py-1.5"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-emerald-300">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 shrink-0" />
                    <span>Copiar</span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadPlaywrightFixture}
                title="Baixar arquivo mock-data.json pronto para Playwright fixtures"
                className="w-full sm:w-auto py-2 sm:py-1.5"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="truncate">Fixture (.json)</span>
              </Button>
            </div>
          </div>

          {/* Monaco Editor Container (Responsive Height: 300px mobile -> 380px tablet -> 440px desktop) */}
          <div className="relative bg-[#1e1e1e] h-[300px] sm:h-[380px] lg:h-[440px] w-full">
            {isLoading && (
              <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center gap-3 p-4 text-center">
                <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                <span className="text-xs font-mono text-indigo-300">
                  Gerando massa de dados com Google Gemini...
                </span>
              </div>
            )}

            <Editor
              height="100%"
              language="json"
              theme="vs-dark"
              value={response.payload}
              options={{
                readOnly: true,
                domReadOnly: true,
                minimap: { enabled: false },
                fontSize: 12,
                lineNumbers: 'on',
                lineNumbersMinChars: 3,
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                automaticLayout: true,
                renderLineHighlight: 'none',
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>

          {/* DevTool Status Bar */}
          <div className="px-3.5 py-2.5 sm:px-4 bg-slate-900/95 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                Linhas: <strong className="text-slate-200">{jsonLinesCount}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Tempo:{' '}
                <strong className="text-slate-200">
                  {response.executionTimeMs} ms
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 truncate">
              <span className="hidden sm:inline">UTF-8 • JSON</span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span className="text-indigo-300 truncate">{response.model}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
