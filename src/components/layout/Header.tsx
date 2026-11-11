import React from 'react';
import {
  Braces,
  Cpu,
  Database,
  FileCheck2,
  FlaskConical,
  Menu,
  ShieldCheck,
  Webhook,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { hasGeminiApiKey } from '../../lib/ai-client';
import { usePlaygroundStore } from '../../store/usePlaygroundStore';
import type { NavigationTabId } from '../../types';

const MOBILE_TABS: Array<{
  id: NavigationTabId;
  shortLabel: string;
}> = [
  { id: 'smart-data-mock', shortLabel: 'Smart Mock' },
  { id: 'test-cases', shortLabel: 'BDD Gen' },
  { id: 'api-validator', shortLabel: 'API Contract' },
];

export const Header: React.FC = () => {
  const apiReady = hasGeminiApiKey();
  const { activeTab, setActiveTab, setIsSidebarOpen } = usePlaygroundStore();

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

  const getTabIcon = (id: NavigationTabId) => {
    switch (id) {
      case 'smart-data-mock':
        return <Database className="w-3.5 h-3.5" />;
      case 'test-cases':
        return <FileCheck2 className="w-3.5 h-3.5" />;
      case 'api-validator':
        return <Webhook className="w-3.5 h-3.5" />;
    }
  };

  return (
    <header className="shrink-0 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80">
      {/* Main Topbar */}
      <div className="h-14 sm:h-16 px-3 sm:px-6 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Mobile Hamburger Trigger */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Abrir menu de módulos"
            className="p-2 -ml-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors lg:hidden cursor-pointer shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile Brand Icon (hidden on lg where Sidebar is visible) */}
          <div className="w-7 h-7 rounded-md bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 lg:hidden shrink-0">
            <FlaskConical className="w-4 h-4" />
          </div>

          {/* Breadcrumb / Title */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-mono text-slate-400 truncate">
            <span className="hidden sm:inline">workspace</span>
            <span className="hidden sm:inline text-slate-600">/</span>
            <span className="text-slate-100 font-semibold sm:font-medium truncate">
              {workspaceSlug}
            </span>
          </div>

          <div className="hidden md:block shrink-0">
            <Badge variant="emerald">{badgeText}</Badge>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono text-slate-400 shrink-0">
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
            <Braces className="w-3.5 h-3.5 text-indigo-400" />
            <span>Monaco Editor</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Circuit Breaker</span>
            <span className="md:hidden">CB Active</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
            <Cpu
              className={`w-3.5 h-3.5 shrink-0 ${
                apiReady ? 'text-emerald-400' : 'text-amber-400'
              }`}
            />
            <span className="text-[11px] sm:text-xs">
              {apiReady ? (
                <>
                  <span className=" sm:hidden">Gemini OK</span>
                  <span className="hidden sm:inline">Gemini SDK: Connected</span>
                </>
              ) : (
                <>
                  <span className="sm:hidden">.env</span>
                  <span className="hidden sm:inline">Gemini: .env Pendente</span>
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile-First Quick Module Switcher Bar (Visible on Mobile/Tablet < lg) */}
      <div
        role="tablist"
        aria-label="Troca rápida de módulos QA"
        className="grid grid-cols-3 gap-1 px-2.5 py-1.5 bg-slate-950/70 border-t border-slate-800/70 lg:hidden"
      >
        {MOBILE_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-xs font-mono font-medium transition-all cursor-pointer truncate ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              {getTabIcon(tab.id)}
              <span className="truncate">{tab.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
