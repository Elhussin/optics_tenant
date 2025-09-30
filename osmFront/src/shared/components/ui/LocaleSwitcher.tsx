// 'use client';
// import { useRouter, usePathname } from '@/src/app/i18n/navigation';
// import { useLocale } from 'next-intl';
// import { useTransition } from 'react';
// import { useEffect, useState } from 'react';
// import Cookies from 'js-cookie';
// import { languages, countries, currencies, currencyMap } from '@/src/shared/constants';
// import { Loader2 } from 'lucide-react';
// export default function LocaleSwitcher() {
//   const router = useRouter();
//   const pathname = usePathname();
//   const locale = useLocale(); 
//   const [isPending, startTransition] = useTransition();

//   const [language, setLanguage] = useState(locale||'en'||process.env.DEFAULT_LANGUAGE);
//   const [country, setCountry] = useState(Cookies.get('country') || process.env.DEFAULT_COUNTRY);
//   const [currency, setCurrency] = useState(Cookies.get('currency') || process.env.DEFAULT_CURRENCY);


//   // Sync language state with locale changes
//   useEffect(() => {
//     setLanguage(locale);
//   }, [locale]);

//   // IP-based country/currency detection (only once)
//   useEffect(() => {
//     const cookieCountry = Cookies.get('country');
//     const cookieCurrency = Cookies.get('currency');

//     if (!cookieCountry || !cookieCurrency) {
//       fetch('https://ipapi.co/json/')
//         .then((res) => res.json())
//         .then((data) => {
//           const detectedCountry = data.country_code?.toLowerCase() || 'sa';
//           const matchedCountry = countries.find((c) => c.value === detectedCountry) || countries[0];
//           const mappedCurrency = currencyMap[matchedCountry.value] || 'sar';

//           setCountry(matchedCountry.value);
//           setCurrency(mappedCurrency);
//           setLanguage(process.env.DEFAULT_LANGUAGE || 'en');
          
//           Cookies.set('country', matchedCountry.value, { path: '/', expires: 30 });
//           Cookies.set('currency', mappedCurrency, { path: '/', expires: 30 });
//           Cookies.set('language', process.env.DEFAULT_LANGUAGE || 'en', { path: '/', expires: 30 });
//         })
//         .catch(() => {
//           setCountry(process.env.DEFAULT_COUNTRY || 'sa');
//           setCurrency(process.env.DEFAULT_CURRENCY || 'sar');
//           setLanguage(process.env.DEFAULT_LANGUAGE || 'en');
//           Cookies.set('country', process.env.DEFAULT_COUNTRY || 'sa', { path: '/', expires: 30 });
//           Cookies.set('currency', process.env.DEFAULT_CURRENCY || 'sar', { path: '/', expires: 30 });
//           Cookies.set('language', process.env.DEFAULT_LANGUAGE || 'en', { path: '/', expires: 30 });
//         });
//     }
//   }, []);

//   // Update cookies when country/currency changes (not language - that's handled by next-intl)
//   useEffect(() => {
//     if (country) {
//       Cookies.set('country', country, { path: '/', expires: 30 });
//     }
//   }, [country]);

//   useEffect(() => {
//     if (currency) {
//       Cookies.set('currency', currency, { path: '/', expires: 30 });
//     }
//   }, [currency]);

//   const handleLanguageChange = (newLang: string) => {
//     if (newLang !== locale) {
//       startTransition(() => {
//         // This will change the URL and trigger a re-render with new locale
//         router.replace(pathname, { locale: newLang });
//       });
//     }
//   };

//   const handleCountryChange = (selected: string) => {
//     setCountry(selected);
//     const newCurrency = currencyMap[selected] || 'sar';
//     setCurrency(newCurrency);
//   };

//   return (
//     <div className="flex flex-row gap-4 items-center">
//       {/* Language Selector */}
//       <div>
//         <select
//           className="header-select"
//           value={locale} // Use locale instead of language state
//           disabled={isPending}
//           onChange={(e) => handleLanguageChange(e.target.value)}
//         >
//           {languages.map((l) => (
//             <option key={l.value} value={l.value}>
//               {l.label}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Country Selector */}
//       <div>
//         <select
//           disabled
//           className="header-select disabled:opacity-50"
//           value={country}
//           onChange={(e) => handleCountryChange(e.target.value)}
//         >
//           {/* <option value="">{country}</option> */}
//           {countries.map((c) => (
//             <option key={c.value} value={c.value}>
//               {c.label}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Currency Selector */}
//       <div>
//         <select
//           disabled
//           className="header-select disabled:opacity-50"
//           value={currency}
//           onChange={(e) => setCurrency(e.target.value)}
//         >
//           {/* <option value="">{currency}</option> */}
//           {currencies.map((c) => (
//             <option key={c.value} value={c.value}>
//               {c.label}
//             </option>
//           ))}
//         </select>
//       </div>
      
//       {/* Loading indicator */}
//       {isPending && (
//         <Loader2 className="animate-spin" />
//       )}
//     </div>
//   );
// }

'use client';

import { useRouter, usePathname } from '@/src/app/i18n/navigation';
import { useLocale } from 'next-intl';
import { useTransition, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { languages, countries, currencies, currencyMap } from '@/src/shared/constants';
import { Loader2 } from 'lucide-react';

export default function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const [isPending, startTransition] = useTransition();

  // Fallbacks: locale > env default > 'en'
  const defaultLanguage = process.env.DEFAULT_LANGUAGE || 'en';
  const defaultCountry = process.env.DEFAULT_COUNTRY || 'sa';
  const defaultCurrency = process.env.DEFAULT_CURRENCY || 'sar';

  const [language, setLanguage] = useState(locale || defaultLanguage);
  const [country, setCountry] = useState(Cookies.get('country') || defaultCountry);
  const [currency, setCurrency] = useState(Cookies.get('currency') || defaultCurrency);

  // Sync language state with locale
  useEffect(() => {
    setLanguage(locale || defaultLanguage);
  }, [locale]);

  // Detect country/currency via IP (only if cookies not present)
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        const detectedCountry = data.country_code?.toLowerCase() || defaultCountry;
        const matchedCountry = countries.find(c => c.value === detectedCountry) || countries[0];
        const mappedCurrency = currencyMap[matchedCountry.value] || defaultCurrency;

        setCountry(matchedCountry.value);
        setCurrency(mappedCurrency);
        setLanguage(defaultLanguage);

        Cookies.set('country', matchedCountry.value, { path: '/', expires: 30 });
        Cookies.set('currency', mappedCurrency, { path: '/', expires: 30 });
        Cookies.set('language', defaultLanguage, { path: '/', expires: 30 });
      } catch (error) {
        // Fallback if IP detection fails
        setCountry(defaultCountry);
        setCurrency(defaultCurrency);
        setLanguage(defaultLanguage);

        Cookies.set('country', defaultCountry, { path: '/', expires: 30 });
        Cookies.set('currency', defaultCurrency, { path: '/', expires: 30 });
        Cookies.set('language', defaultLanguage, { path: '/', expires: 30 });
      }
    };

    if (!Cookies.get('country') || !Cookies.get('currency')) {
      fetchLocation();
    }
  }, []);

  // Update cookies when country/currency changes
  useEffect(() => {
    if (country) Cookies.set('country', country, { path: '/', expires: 30 });
  }, [country]);

  useEffect(() => {
    if (currency) Cookies.set('currency', currency, { path: '/', expires: 30 });
  }, [currency]);

  // Handle language change
  const handleLanguageChange = (newLang: string) => {
    if (newLang !== locale) {
      startTransition(() => {
        router.replace(pathname, { locale: newLang });
      });
    }
  };

  // Handle country change
  const handleCountryChange = (selected: string) => {
    setCountry(selected);
    setCurrency(currencyMap[selected] || defaultCurrency);
  };

  return (
    <div className="flex flex-row gap-4 items-center">
      {/* Language Selector */}
      <div>
        <select
          className="header-select"
          value={locale}
          disabled={isPending}
          onChange={(e) => handleLanguageChange(e.target.value)}
        >
          {languages.map(l => (
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
          {countries.map(c => (
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
          {currencies.map(c => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Loading Indicator */}
      {isPending && <Loader2 className="animate-spin" />}
    </div>
  );
}
