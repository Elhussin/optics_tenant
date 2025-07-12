'use client';
import React, { createContext, useState, useContext, ReactNode } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Aside from '@/components/layout/Aside';
type AsideContextType = {
  setAsideContent: (content: ReactNode) => void;
};

const AsideContext = createContext<AsideContextType | undefined>(undefined);

export function AsideProvider({ children }: { children: ReactNode }) {
  const [asideContent, setAsideContent] = useState<ReactNode>(null);

  return (
    <AsideContext.Provider value={{ setAsideContent }}>
      <AsideContentWrapper content={asideContent}>
        {children}
      </AsideContentWrapper>
    </AsideContext.Provider>
  );
}

function AsideContentWrapper({
  children,
  content,
}: {
  children: ReactNode;
  content: ReactNode;
}) {
  return (
    <MainLayout mainContent={children}
    asideContent={content || <Aside/>} />
  );
}

export function useAside() {
  const context = useContext(AsideContext);
  if (!context) {
    throw new Error("useAside must be used within an AsideProvider");
  }
  return context;
}
