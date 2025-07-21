
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

'use client';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const locales = ['en', 'ar'];

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const changeLanguage = (locale: string) => {
    const newPath = `/${locale}${pathname.slice(3)}`;
    Cookies.set('django_language', locale, { path: '/' }); // لتزامن Django
    router.push(newPath);
  };

  return (
    <div className="flex gap-2">
      {locales.map((l) => (
        <button key={l} onClick={() => changeLanguage(l)}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
