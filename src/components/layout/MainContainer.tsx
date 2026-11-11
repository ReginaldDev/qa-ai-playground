import React from 'react';
import { Header } from './Header';

interface MainContainerProps {
  children: React.ReactNode;
}

export const MainContainer: React.FC<MainContainerProps> = ({ children }) => {
  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-hidden">
      <Header />
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 lg:p-6 pb-8">
        {children}
      </main>
    </div>
  );
};
