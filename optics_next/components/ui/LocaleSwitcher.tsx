

'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

type Option = { label: string; value: string };

const languages: Option[] = [
  { label: 'EN', value: 'en' },
  { label: 'AR', value: 'ar' },
];

const countries: Option[] = [
  { label: 'KSA', value: 'sa' },
  { label: 'EGY', value: 'eg' },
  { label: 'UAE', value: 'ae' },
];

const currencies: Option[] = [
  { label: 'SAR', value: 'sar' },
  { label: 'EGP', value: 'egp' },
  { label: 'AED', value: 'aed' },
];

// خريطة العملة حسب الدولة
const currencyMap: Record<string, string> = {
  sa: 'sar',
  eg: 'egp',
  ae: 'aed',
};

export default function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const [language, setLanguage] = useState(Cookies.get('language') || 'en');
  const [country, setCountry] = useState(Cookies.get('country') || '');
  const [currency, setCurrency] = useState(Cookies.get('currency') || '');

  // محاولة اكتشاف البلد والعملة بناءً على IP فقط في أول زيارة
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
          // fallback للقيم الافتراضية في حال فشل API
          setCountry('sa');
          setCurrency('sar');
        });
    }
  }, []);

  // تحديث الكوكيز عند تغيّر القيم
  useEffect(() => {
    Cookies.set('language', language, { path: '/', expires: 30 });
    Cookies.set('country', country, { path: '/', expires: 30 });
    Cookies.set('currency', currency, { path: '/', expires: 30 });
  }, [language, country, currency]);

  // تحديث اللغة وإعادة توجيه المسار
  const handleLanguageChange = (value: string) => {
    setLanguage(value);

    const pathSegments = pathname.split('/');
    if (pathSegments.length > 1) {
      pathSegments[1] = value; 
    } else {
      pathSegments.unshift('', value);
    }

    const newPath = pathSegments.join('/');
    router.push(newPath);
    router.refresh(); // إذا أردت إجبار إعادة جلب البيانات
    // window.location.href = newPath    
    // setLanguage(value);
  };

  return (
    <div className="flex flex-row gap-4 items-center ">
      {/* اللغة */}
      <div>
        <select
          className="header-select"
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
        >
          {languages.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      {/* الدولة */}
      <div>
        <select
          disabled
          className="header-select disabled:opacity-50"
          value={country}
          onChange={(e) => {
            const selected = e.target.value;
            setCountry(selected);
            setCurrency(currencyMap[selected] || 'sar');
          }}
        >
          {countries.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* العملة */}
      <div>
        <select
          disabled
          className="header-select disabled:opacity-50"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          {currencies.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
