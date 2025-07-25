
// "use client"
// import { useState, useEffect } from "react";
// export default function LanguageToggle() {
//     const [language, setLanguage] = useState("en");
//     const changeLanguage = (lang: string) => {
//         document.cookie = `django_language=${lang};path=/`;
//         window.location.reload();
//     };
//     useEffect(() => {
//         const language = document.cookie
//             .split(';')
//             .find((cookie) => cookie.startsWith('django_language='));
//         if (language) {
//             setLanguage(language.split('=')[1]);
//         }
//     }, []);
//     return (
//         <select value={language} onChange={(e) => changeLanguage(e.target.value)}>
//             <option value="en">EN</option>
//             <option value="ar">AR</option>
//         </select>
//     );
// }

// 'use client';

// import { useEffect, useState } from 'react';
// import Cookies from 'js-cookie';
// import { useRouter } from 'next/navigation';

// const supportedLanguages = ['en', 'ar'];

// export default function LanguageToggle() {
//   const router = useRouter();
//   const [lang, setLang] = useState(() => Cookies.get('django_language') || 'en');

//   const changeLanguage = (newLang: string) => {
//     Cookies.set('django_language', newLang, { path: '/' });
//     setLang(newLang);
//     router.refresh(); // لإعادة تحميل البيانات إذا كانت SSR
//   };

//   return (
//     <div className="flex gap-2">
//       {supportedLanguages.map((l) => (
//         <button
//           key={l}
//           className={`px-2 py-1 border rounded ${lang === l ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
//           onClick={() => changeLanguage(l)}
//         >
//           {l.toUpperCase()}
//         </button>
//       ))}
//     </div>
//   );
// }

// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter, usePathname } from 'next/navigation';
// import Cookies from 'js-cookie';

// // const locales = ['en', 'ar'];
// // const countries = [
// //   { code: 'sa', name: 'Saudi Arabia', currency: 'SAR' },
// //   { code: 'eg', name: 'Egypt', currency: 'EGP' },
// //   { code: 'us', name: 'USA', currency: 'USD' },
// //   { code: 'ae', name: 'UAE', currency: 'AED' },
// // ];

// // export default function LanguageSwitcher() {
// //   const router = useRouter();
// //   const pathname = usePathname();

// //   const [locale, setLocale] = useState(Cookies.get('django_language') || 'en');
// //   const [country, setCountry] = useState(Cookies.get('country') || '');
// //   const [currency, setCurrency] = useState(Cookies.get('currency') || '');

// //   // جلب البلد والعملة تلقائياً إذا لم تكن محفوظة
// //   useEffect(() => {
// //     if (!country || !currency) {
// //       fetch('https://ipapi.co/json/')
// //         .then((res) => res.json())
// //         .then((data) => {
// //           const detectedCountry = data.country_code?.toLowerCase() || 'sa';
// //           const countryInfo = countries.find((c) => c.code === detectedCountry) || countries[0];
// //           setCountry(countryInfo.code);
// //           setCurrency(countryInfo.currency);
// //           Cookies.set('country', countryInfo.code, { path: '/' });
// //           Cookies.set('currency', countryInfo.currency, { path: '/' });
// //         });
// //     }
// //   }, []);

// //   // تغيير اللغة
// //   const handleLanguageChange = (newLocale: string) => {
// //     setLocale(newLocale);
// //     Cookies.set('django_language', newLocale, { path: '/' });

// //     const basePath = pathname.split('/').slice(2).join('/') || '';
// //     router.push(`/${newLocale}/${basePath}`);
// //   };

// //   // تغيير البلد والعملة بناء على الاختيار
// //   const handleCountryChange = (code: string) => {
// //     const countryInfo = countries.find((c) => c.code === code);
// //     if (countryInfo) {
// //       setCountry(code);
// //       setCurrency(countryInfo.currency);
// //       Cookies.set('country', code, { path: '/' });
// //       Cookies.set('currency', countryInfo.currency, { path: '/' });
// //     }
// //   };

// //   return (
// //     <div className="flex flex-col gap-2 md:flex-row md:items-center">
// //       <div>
// //         <label className="text-sm block mb-1">Language:</label>
// //         <select
// //           value={locale}
// //           onChange={(e) => handleLanguageChange(e.target.value)}
// //           className="border p-1 rounded"
// //         >
// //           {locales.map((lang) => (
// //             <option key={lang} value={lang}>
// //               {lang.toUpperCase()}
// //             </option>
// //           ))}
// //         </select>
// //       </div>

// //       <div>
// //         <label className="text-sm block mb-1">Country:</label>
// //         <select
// //           value={country}
// //           onChange={(e) => handleCountryChange(e.target.value)}
// //           className="border p-1 rounded"
// //         >
// //           {countries.map((c) => (
// //             <option key={c.code} value={c.code}>
// //               {c.name}
// //             </option>
// //           ))}
// //         </select>
// //       </div>

// //       <div>
// //         <label className="text-sm block mb-1">Currency:</label>
// //         <input
// //           type="text"
// //           readOnly
// //           value={currency}
// //           className="border p-1 rounded bg-gray-100 cursor-not-allowed"
// //         />
// //       </div>
// //     </div>
// //   );
// // }

// const locales = [
//   { label: "العربية - السعودية", prompt: "ar-sa-sar" },
//   { label: "English - US", prompt: "en-us-usd" },
//   { label: "Français - France", prompt: "fr-fr-eur" },
// ];

// export default function LocaleSwitcher() {
//   const handleChange = (prompt: string) => {
//     const [lang, country, currency] = prompt.split('-');
//     Cookies.set("django_language", lang);
//     Cookies.set("country", country);
//     Cookies.set("currency", currency);

//     // redirect to new language path
//     const currentPath = window.location.pathname;
//     window.location.pathname = `/${lang}${currentPath.slice(3)}`;
//   };

//   return (
//     <select onChange={(e) => handleChange(e.target.value)} className="border px-2 py-1 rounded">
//       {locales.map((item) => (
//         <option key={item.prompt} value={item.prompt}>
//           {item.label}
//         </option>
//       ))}
//     </select>
//   );
// }


// 'use client';

// import { useRouter, usePathname } from 'next/navigation';
// import Cookies from 'js-cookie';
// import { useState } from 'react';

// const locales = ['en', 'ar'];
// const countries = [
//   { code: 'sa', currency: 'sar', label: 'KSA' },
//   { code: 'eg', currency: 'egp', label: 'EGY' },
//   { code: 'ae', currency: 'aed', label: 'UAE' },
//   { code: 'us', currency: 'usd', label: 'USA' },
// ];

// export default function LanguageSwitcher() {
//   const router = useRouter();
//   const pathname = usePathname();

//   const [locale, setLocale] = useState('en');
//   const [country, setCountry] = useState('sa');

//   const handleChange = (newLocale: string, newCountry: string) => {
//     const selectedCountry = countries.find(c => c.code === newCountry);
//     const newCurrency = selectedCountry?.currency || 'sar';

//     // تخزين في الكوكيز (اختياري - لدجانغو أو API)
//     Cookies.set('django_language', newLocale, { path: '/' });
//     Cookies.set('country', newCountry, { path: '/' });
//     Cookies.set('currency', newCurrency, { path: '/' });

//     // تحديث الـ route (مثلاً: /en-sa-sar/products)
//     const basePath = pathname.split('/').slice(3).join('/') || ''; // إزالة /lang/country
//     const newPath = `/${newCountry}-${newCurrency}/${basePath}`;
//     router.push(newPath);
//   };

//   return (
//     <div className="flex gap-2 items-center">
//       <select
//         value={locale}
//         onChange={(e) => {
//           const newLocale = e.target.value;
//           setLocale(newLocale);
//           handleChange(newLocale, country);
//         }}
//         className="border rounded p-1"
//       >
//         {locales.map((lang) => (
//           <option key={lang} value={lang}>
//             {lang.toUpperCase()}
//           </option>
//         ))}
//       </select>

//       <select
//         value={country}
//         onChange={(e) => {
//           const newCountry = e.target.value;
//           setCountry(newCountry);
//           handleChange(locale, newCountry);
//         }}
//         className="border rounded p-1"
//       >
//         {countries.map((c) => (
//           <option key={c.code} value={c.code}>
//             {c.label}
//           </option>
//         ))}
//       </select>
//     </div>
//   );
// }


'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

type Option = { label: string; value: string };

const languages: Option[] = [
  { label: 'English', value: 'en' },
  { label: 'العربية', value: 'ar' },
];

const countries: Option[] = [
  { label: 'Saudi Arabia', value: 'sa' },
  { label: 'Egypt', value: 'eg' },
  { label: 'UAE', value: 'ae' },
];

const currencies: Option[] = [
  { label: 'SAR', value: 'sar' },
  { label: 'EGP', value: 'egp' },
  { label: 'AED', value: 'aed' },
];

export default function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const [language, setLanguage] = useState(Cookies.get('language') || 'ar');
  const [country, setCountry] = useState(Cookies.get('country') || 'sa');
  const [currency, setCurrency] = useState(Cookies.get('currency') || 'sar');

  // حفظ القيم في الكوكيز عند التغيير
  useEffect(() => {
    // Cookies.set('language', language, { path: '/', expires: 30 });
    Cookies.set('country', country, { path: '/', expires: 30 });
    Cookies.set('currency', currency, { path: '/', expires: 30 });
  }, [language, country, currency]);

  // تغيير اللغة وإعادة توجيه المستخدم (اختياري)
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    const newPath = `/${value}${pathname.substring(3)}`;
    router.push(newPath);
  };

  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div>
        <label className="block text-sm font-medium mb-1">Language</label>
        <select
          className="p-2 border rounded"
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

      <div>
        <label className="block text-sm font-medium mb-1">Country</label>
        <select
          className="p-2 border rounded"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        >
          {countries.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Currency</label>
        <select
          className="p-2 border rounded"
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
