import { createContext, useContext } from 'react';
import type { NavigationTabId } from '../types';
import type { ToastItem } from '../components/ui/Toast';

export interface PlaygroundState {
  activeTab: NavigationTabId;
  setActiveTab: (tab: NavigationTabId) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  dismissToast: (id: string) => void;
}

export const PlaygroundContext = createContext<PlaygroundState | undefined>(undefined);

export function usePlaygroundStore(): PlaygroundState {
  const context = useContext(PlaygroundContext);
  if (!context) {
    throw new Error('usePlaygroundStore deve ser utilizado dentro de um PlaygroundProvider');
  }
  return context;
}
