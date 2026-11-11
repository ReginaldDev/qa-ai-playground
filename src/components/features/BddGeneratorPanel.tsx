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
  FileCode2,
  Clock,
  Layers,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Badge } from '../ui/Badge';
import {
  FALLBACK_BDD_SNIPPETS,
  generateBddWithGemini,
  hasGeminiApiKey,
  MissingApiKeyError,
} from '../../lib/ai-client';
import { usePlaygroundStore } from '../../store/usePlaygroundStore';
import type {
  AIResponse,
  AutomationFramework,
  PromptPreset,
} from '../../types';

const FRAMEWORKS: AutomationFramework[] = [
  'Playwright',
  'Cypress',
  'Robot Framework',
];

const FRAMEWORK_METADATA: Record<
  AutomationFramework,
  {
    extension: '.spec.ts' | '.cy.ts' | '.robot';
    filename: string;
    editorLanguage: 'typescript' | 'python';
    badgeLabel: string;
  }
> = {
  Playwright: {
    extension: '.spec.ts',
    filename: 'bdd-test.spec.ts',
    editorLanguage: 'typescript',
    badgeLabel: 'Playwright (.spec.ts)',
  },
  Cypress: {
    extension: '.cy.ts',
    filename: 'bdd-test.cy.ts',
    editorLanguage: 'typescript',
    badgeLabel: 'Cypress (.cy.ts)',
  },
  'Robot Framework': {
    extension: '.robot',
    filename: 'bdd-test.robot',
    editorLanguage: 'python',
    badgeLabel: 'Robot (.robot)',
  },
};

const BDD_GHERKIN_PRESETS: PromptPreset[] = [
  {
    id: 'login-failure',
    title: 'Login com falha',
    category: 'Auth / Negativo',
    prompt: `Funcionalidade: Autenticação de Usuário
  Cenário: Login com falha por credenciais inválidas
    Dado que o usuário está na página de login "/login"
    Quando ele preenche o campo de e-mail com "qa.invalido@empresa.com"
    E preenche a senha com "SenhaErrada123!"
    E clica no botão "Entrar"
    Então o sistema deve exibir o alerta "E-mail ou senha inválidos"
    E o usuário deve permanecer na rota "/login"`,
  },
  {
    id: 'add-to-cart',
    title: 'Adicionar produto ao carrinho',
    category: 'E-commerce / Checkout',
    prompt: `Funcionalidade: Carrinho de Compras
  Cenário: Adicionar produto disponível ao carrinho com sucesso
    Dado que o cliente acessa a página do produto "Teclado Mecânico Pro"
    Quando ele seleciona a quantidade "2"
    E clica no botão "Adicionar ao Carrinho"
    Então o contador do carrinho no cabeçalho deve exibir "2"
    E o drawer lateral do carrinho deve listar "Teclado Mecânico Pro" com subtotal atualizado`,
  },
];

export const BddGeneratorPanel: React.FC = () => {
  const { addToast } = usePlaygroundStore();
  const [framework, setFramework] = useState<AutomationFramework>('Playwright');
  const [prompt, setPrompt] = useState<string>(BDD_GHERKIN_PRESETS[0].prompt);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isMissingApiKey, setIsMissingApiKey] = useState<boolean>(() => !hasGeminiApiKey());
  const [copied, setCopied] = useState<boolean>(false);

  const [response, setResponse] = useState<AIResponse>({
    payload: FALLBACK_BDD_SNIPPETS.Playwright,
    recordsCount: 1,
    executionTimeMs: 0,
    model: hasGeminiApiKey() ? 'Google Gemini (Pronto)' : 'Aguardando VITE_GEMINI_API_KEY',
    timestamp: '--:--:--',
  });

  const currentMeta = FRAMEWORK_METADATA[framework];

  const handleSelectFramework = (selected: AutomationFramework) => {
    setFramework(selected);
    if (response.executionTimeMs === 0) {
      setResponse((prev) => ({
        ...prev,
        payload: FALLBACK_BDD_SNIPPETS[selected],
      }));
    }
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!prompt.trim()) {
      const msg = 'Insira um cenário BDD/Gherkin antes de gerar o script de automação.';
      setError(msg);
      addToast({
        type: 'error',
        title: 'Cenário Vazio',
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
        title: 'Erro ao gerar script BDD',
        message: msg,
      });
      return;
    }

    setIsMissingApiKey(false);
    setIsLoading(true);

    try {
      const result = await generateBddWithGemini({
        prompt,
        framework,
      });
      setResponse(result);

      if (result.model === 'Modo de Resiliência (Fallback Local)') {
        addToast({
          type: 'info',
          title: 'Circuit Breaker Ativado',
          message: `API indisponível (503/Timeout). Snippet ${framework} carregado via Fallback Local.`,
        });
      } else {
        addToast({
          type: 'success',
          title: `Script ${framework} Gerado`,
          message: `Código gerado em ${result.executionTimeMs} ms.`,
        });
      }
    } catch (err) {
      if (err instanceof MissingApiKeyError) {
        setIsMissingApiKey(true);
      }
      const message =
        err instanceof Error ? err.message : 'Erro inesperado ao converter cenário BDD.';
      setError(message);
      addToast({
        type: 'error',
        title: 'Erro ao gerar script BDD',
        message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      void handleGenerate();
    }
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(response.payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSpec = () => {
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
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Top Feature Header (Mobile-First) */}
      <div className="flex flex-col gap-3 sm:gap-4 border-b border-slate-800/80 pb-4 sm:pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-100">
              BDD Test Generator
            </h1>
            <Badge variant="indigo">Fase 3 • Multi-Framework</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
            Converta cenários BDD/Gherkin em scripts executáveis para Playwright, Cypress ou Robot Framework.
          </p>
        </div>

        {/* Gherkin Quick Templates */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2">
          <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
            <Wand2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            Exemplos Gherkin:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {BDD_GHERKIN_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setError(null);
                  setPrompt(preset.prompt);
                }}
                className="text-xs font-mono px-3 py-2 sm:px-2.5 sm:py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 active:bg-slate-800 text-slate-300 border border-slate-800 hover:border-indigo-500/40 transition-colors cursor-pointer"
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
            onClick={() => setError(null)}
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
                Configuração & Cenário Gherkin
              </h2>
            </div>
            <span className="hidden sm:inline text-[11px] font-mono text-slate-500">
              Ctrl + Enter para gerar
            </span>
          </div>

          {/* Framework de Automação Selector (Responsive 1-col on tiny screens or 3-col) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Framework de Automação
            </label>
            <div
              role="group"
              aria-label="Framework de Automação"
              className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 p-1.5 rounded-lg bg-slate-950/90 border border-slate-800"
            >
              {FRAMEWORKS.map((fw) => {
                const isSelected = framework === fw;
                return (
                  <button
                    key={fw}
                    type="button"
                    onClick={() => handleSelectFramework(fw)}
                    className={`px-3 py-2 rounded-md text-xs font-mono font-medium transition-all cursor-pointer truncate ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-950/50'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 active:bg-slate-800'
                    }`}
                  >
                    {fw}
                  </button>
                );
              })}
            </div>
          </div>

          <Textarea
            id="bdd-gherkin-input"
            label="Cenário BDD / Gherkin"
            rows={7}
            value={prompt}
            onChange={(e) => {
              if (error) setError(null);
              setPrompt(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Funcionalidade: Checkout...\n  Cenário: Compra com sucesso...\n    Dado que..."
            helperText={`O cenário será convertido para ${framework} (${currentMeta.extension}) aplicando boas práticas de SDET.`}
          />

          {/* Action Bar (Mobile-First Full-Width Stack -> sm:Row) */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pt-2 border-t border-slate-800/80">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => {
                setError(null);
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
              {isLoading ? `Gerando ${framework}...` : 'Gerar Automação'}
            </Button>
          </div>
        </form>

        {/* Output Panel: Monaco Editor */}
        <section
          aria-label="Resultado do Script de Automação no Monaco Editor"
          className="lg:col-span-7 bg-slate-900/80 border border-slate-800/90 rounded-xl overflow-hidden shadow-xl shadow-slate-950/60 flex flex-col"
        >
          {/* Code Editor Window Topbar */}
          <div className="p-3 sm:px-4 sm:py-3 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
            <div className="flex items-center justify-between sm:justify-start gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="hidden sm:flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                </div>

                <div className="hidden sm:block h-4 w-px bg-slate-800" />

                <div className="flex items-center gap-1.5 text-xs font-mono text-slate-200">
                  <FileCode2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{currentMeta.filename}</span>
                </div>
              </div>

              {response.model === 'Modo de Resiliência (Fallback Local)' ? (
                <Badge variant="amber">Fallback Local</Badge>
              ) : (
                <Badge variant="emerald">{currentMeta.badgeLabel}</Badge>
              )}
            </div>

            {/* QA Output Actions (2-col grid on Mobile -> Flex on sm+) */}
            <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCopyCode}
                title="Copiar código para a área de transferência"
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
                onClick={handleDownloadSpec}
                title={`Baixar arquivo ${currentMeta.filename}`}
                className="w-full sm:w-auto py-2 sm:py-1.5"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="truncate">Download ({currentMeta.extension})</span>
              </Button>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="relative bg-[#1e1e1e] h-[300px] sm:h-[380px] lg:h-[440px] w-full">
            {isLoading && (
              <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center gap-3 p-4 text-center">
                <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                <span className="text-xs font-mono text-indigo-300">
                  Convertendo Gherkin para {framework} ({currentMeta.extension})...
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

            <div className="flex items-center gap-2 sm:gap-3 truncate">
              <span className="hidden sm:inline">
                UTF-8 • {currentMeta.editorLanguage === 'typescript' ? 'TypeScript' : 'Python / Robot'}
              </span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span className="text-indigo-300 truncate">{response.model}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
