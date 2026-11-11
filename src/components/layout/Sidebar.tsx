import React from 'react';
import {
  Database,
  FileCheck2,
  Webhook,
  FlaskConical,
  Terminal,
  Sparkles,
  X,
} from 'lucide-react';
import type { NavigationItem, NavigationTabId } from '../../types';
import { Badge } from '../ui/Badge';
import { hasGeminiApiKey } from '../../lib/ai-client';

interface SidebarProps {
  activeTab: NavigationTabId;
  onSelectTab: (tab: NavigationTabId) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'smart-data-mock',
    label: 'Smart Data Mock',
    badge: 'Fase 2',
    description: 'Geração de massa de dados JSON',
  },
  {
    id: 'test-cases',
    label: 'BDD Test Generator',
    badge: 'Fase 3',
    description: 'Playwright, Cypress & Robot',
  },
  {
    id: 'api-validator',
    label: 'API Contract Check',
    badge: 'Fase 4',
    description: 'Validação de Schema & Status',
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
}) => {
  const apiReady = hasGeminiApiKey();

  const getIcon = (id: NavigationTabId) => {
    switch (id) {
      case 'smart-data-mock':
        return <Database className="w-4 h-4" />;
      case 'test-cases':
        return <FileCheck2 className="w-4 h-4" />;
      case 'api-validator':
        return <Webhook className="w-4 h-4" />;
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          aria-hidden="true"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-xs transition-opacity lg:hidden"
        />
      )}

      {/* Sidebar Drawer (Mobile-First Off-Canvas -> Desktop Static Rail) */}
      <aside
        aria-label="Menu Lateral de Módulos"
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-slate-900 border-r border-slate-800/80 flex flex-col justify-between select-none transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 lg:w-72 lg:max-w-none lg:shrink-0 lg:bg-slate-900/90 ${
          isOpen ? 'translate-x-0 shadow-2xl shadow-black/80' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="h-14 sm:h-16 px-4 sm:px-5 flex items-center justify-between gap-2 border-b border-slate-800/80">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 shrink-0 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-inner">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm tracking-tight text-slate-100 truncate">
                    QA AI Playground
                  </span>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    v0.4
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono truncate">
                  DevTools & Test Suite
                </span>
              </div>
            </div>

            {/* Close Drawer Button (Mobile Only) */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar menu de navegação"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors lg:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Section */}
          <div className="p-3">
            <div className="px-2.5 py-2 text-[11px] font-mono uppercase tracking-wider text-slate-500">
              Módulos de Qualidade
            </div>

            <nav className="space-y-1.5" aria-label="Navegação Principal">
              {NAVIGATION_ITEMS.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={item.disabled}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-start gap-3 px-3 py-3 rounded-lg text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600/15 text-indigo-200 border border-indigo-500/30 shadow-sm'
                        : item.disabled
                          ? 'opacity-50 cursor-not-allowed text-slate-500'
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100 active:bg-slate-800'
                    }`}
                  >
                    <div
                      className={`mt-0.5 p-1.5 rounded-md shrink-0 ${
                        isActive
                          ? 'bg-indigo-500/20 text-indigo-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {getIcon(item.id)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium truncate">
                          {item.label}
                        </span>
                        {item.badge && (
                          <Badge variant={isActive ? 'indigo' : 'slate'}>
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer / Environment Status & Author Credits */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-400 font-mono">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              Gemini Engine
            </span>
            {apiReady ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-300 font-mono text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                API Key Ativa
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-amber-300 font-mono text-[11px]">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Configurar .env
              </span>
            )}
          </div>
          <div className="p-2.5 rounded-md bg-slate-900/90 border border-slate-800 text-xs text-slate-400 leading-relaxed flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>
              Desenvolvido por{' '}
              <a
                href="https://reginalddev.github.io/HomePage/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-slate-200 hover:text-indigo-400 transition-colors underline decoration-slate-700 hover:decoration-indigo-400 underline-offset-2"
              >
                Reginaldo Junior
              </a>
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
