'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

type LocaleContextType = {
  country: string;
  currency: string;
};

const LocaleContext = createContext<LocaleContextType>({
  country: 'default',
  currency: 'default',
});

export const useLocale = () => useContext(LocaleContext);

export const LocaleProvider = ({ children }: { children: React.ReactNode }) => {
  const [country, setCountry] = useState('default');
  const [currency, setCurrency] = useState('default');

  useEffect(() => {
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? match[2] : null;
    };

    const savedCountry = getCookie('country');
    const savedCurrency = getCookie('currency');

    if (savedCountry) setCountry(savedCountry);
    if (savedCurrency) setCurrency(savedCurrency);
  }, []);

  return (
    <LocaleContext.Provider value={{ country, currency }}>
      {children}
    </LocaleContext.Provider>
  );
};
