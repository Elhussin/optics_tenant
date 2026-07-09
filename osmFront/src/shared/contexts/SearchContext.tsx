// SearchContext.tsx
import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from "react";

interface SearchContextType {
  isSearchVisible: boolean;
  toggleSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const toggleSearch = useCallback(() => setIsSearchVisible(prev => !prev), []);

  const value = useMemo(() => ({
    isSearchVisible,
    toggleSearch
  }), [isSearchVisible, toggleSearch]);

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) throw new Error("useSearch must be used within SearchProvider");
  return context;
};
