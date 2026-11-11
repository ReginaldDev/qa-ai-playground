import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { MainContainer } from './components/layout/MainContainer';
import { DataMockingPanel } from './components/features/DataMockingPanel';
import { BddGeneratorPanel } from './components/features/BddGeneratorPanel';
import { ApiContractPanel } from './components/features/ApiContractPanel';
import { ToastContainer, type ToastItem } from './components/ui/Toast';
import { PlaygroundContext } from './store/usePlaygroundStore';
import type { NavigationTabId } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTabId>('smart-data-mock');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const handleSelectTab = useCallback((tab: NavigationTabId) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  }, []);

  return (
    <PlaygroundContext.Provider
      value={{
        activeTab,
        setActiveTab: handleSelectTab,
        isSidebarOpen,
        setIsSidebarOpen,
        toasts,
        addToast,
        dismissToast,
      }}
    >
      <div className="min-h-dvh h-dvh w-full bg-slate-950 text-slate-100 flex flex-col lg:flex-row overflow-hidden">
        {/* Responsive Sidebar (Off-canvas Drawer on Mobile, Fixed Left Rail on Desktop lg+) */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Right Main Workspace Area */}
        <MainContainer>
          {activeTab === 'smart-data-mock' && <DataMockingPanel />}
          {activeTab === 'test-cases' && <BddGeneratorPanel />}
          {activeTab === 'api-validator' && <ApiContractPanel />}
        </MainContainer>

        {/* Global DevTools Toast Notifications */}
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    </PlaygroundContext.Provider>
  );
};

export default App;
