import React from 'react';
import { Braces, Cpu, ShieldCheck } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { hasGeminiApiKey } from '../../lib/ai-client';
import { usePlaygroundStore } from '../../store/usePlaygroundStore';

export const Header: React.FC = () => {
  const apiReady = hasGeminiApiKey();
  const { activeTab } = usePlaygroundStore();

  const workspaceSlug =
    activeTab === 'test-cases'
      ? 'bdd-test-generator'
      : activeTab === 'api-validator'
        ? 'api-contract-check'
        : 'smart-data-mocking';

  const badgeText =
    activeTab === 'test-cases'
      ? 'Multi-Framework BDD'
      : activeTab === 'api-validator'
        ? 'Schema & Status Audit'
        : 'Playwright Fixture Ready';

  return (
    <header className="h-16 shrink-0 bg-slate-900/60 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>workspace</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-200 font-medium">{workspaceSlug}</span>
        </div>
        <Badge variant="emerald">{badgeText}</Badge>
      </div>

      <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
          <Braces className="w-3.5 h-3.5 text-indigo-400" />
          <span>Monaco Editor</span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Circuit Breaker Active</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
          <Cpu
            className={`w-3.5 h-3.5 ${
              apiReady ? 'text-emerald-400' : 'text-amber-400'
            }`}
          />
          <span>
            {apiReady ? 'Gemini SDK: Connected' : 'Gemini: .env Pendente'}
          </span>
        </div>
      </div>
    </header>
  );
};
