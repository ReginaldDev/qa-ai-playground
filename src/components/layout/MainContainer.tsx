import React from 'react';
import { Header } from './Header';

interface MainContainerProps {
  children: React.ReactNode;
}

export const MainContainer: React.FC<MainContainerProps> = ({ children }) => {
  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-hidden">
      <Header />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
};

