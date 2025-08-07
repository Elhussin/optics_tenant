'use client';
import { useRouter, usePathname } from '@/app/i18n/navigation';
import { useLocale } from 'next-intl';
import { useTransition } from 'react';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { languages, countries, currencies, currencyMap } from '@/constants';

export default function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale(); 
  const [isPending, startTransition] = useTransition();

  const [language, setLanguage] = useState(locale);
  const [country, setCountry] = useState(Cookies.get('country') || 'sa');
  const [currency, setCurrency] = useState(Cookies.get('currency') || 'sar');

  // Sync language state with locale changes
  useEffect(() => {
    setLanguage(locale);
  }, [locale]);

  // IP-based country/currency detection (only once)
  useEffect(() => {
    const cookieCountry = Cookies.get('country');
    const cookieCurrency = Cookies.get('currency');

    if (!cookieCountry || !cookieCurrency) {
      fetch('https://ipapi.co/json/')
        .then((res) => res.json())
        .then((data) => {
          const detectedCountry = data.country_code?.toLowerCase() || 'sa';
          const matchedCountry = countries.find((c) => c.value === detectedCountry) || countries[0];
          const mappedCurrency = currencyMap[matchedCountry.value] || 'sar';

          setCountry(matchedCountry.value);
          setCurrency(mappedCurrency);
          
          Cookies.set('country', matchedCountry.value, { path: '/', expires: 30 });
          Cookies.set('currency', mappedCurrency, { path: '/', expires: 30 });
        })
        .catch(() => {
          setCountry('sa');
          setCurrency('sar');
          Cookies.set('country', 'sa', { path: '/', expires: 30 });
          Cookies.set('currency', 'sar', { path: '/', expires: 30 });
        });
    }
  }, []);

  // Update cookies when country/currency changes (not language - that's handled by next-intl)
  useEffect(() => {
    if (country) {
      Cookies.set('country', country, { path: '/', expires: 30 });
    }
  }, [country]);

  useEffect(() => {
    if (currency) {
      Cookies.set('currency', currency, { path: '/', expires: 30 });
    }
  }, [currency]);

  const handleLanguageChange = (newLang: string) => {
    if (newLang !== locale) {
      startTransition(() => {
        // This will change the URL and trigger a re-render with new locale
        router.replace(pathname, { locale: newLang });
      });
    }
  };

  const handleCountryChange = (selected: string) => {
    setCountry(selected);
    const newCurrency = currencyMap[selected] || 'sar';
    setCurrency(newCurrency);
  };

  return (
    <div className="flex flex-row gap-4 items-center">
      {/* Language Selector */}
      <div>
        <select
          className="header-select"
          value={locale} // Use locale instead of language state
          disabled={isPending}
          onChange={(e) => handleLanguageChange(e.target.value)}
        >
          {languages.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      {/* Country Selector */}
      <div>
        <select
          disabled
          className="header-select disabled:opacity-50"
          value={country}
          onChange={(e) => handleCountryChange(e.target.value)}
        >
          {/* <option value="">{country}</option> */}
          {countries.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Currency Selector */}
      <div>
        <select
          disabled
          className="header-select disabled:opacity-50"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          {/* <option value="">{currency}</option> */}
          {currencies.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      
      {/* Loading indicator */}
      {isPending && (
        <div className="text-sm text-gray-500">
          Switching language...
        </div>
      )}
    </div>
  );
}