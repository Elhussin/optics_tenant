
// import { notFound } from 'next/navigation';
// import path from 'path';
// import fs from 'fs';
// export default async function getTrenMessages(locale: string, pages: string | string[]) {
//   try {
//     const files = Array.isArray(pages) ? pages : [pages];

//     const messagesArray = files.map((page) => {
//       const filePath = path.join(process.cwd(), 'messages', locale, `${page}.json`);
//       if (!fs.existsSync(filePath)) {
//         throw new Error(`Message file not found: ${filePath}`);
//       }
//       return JSON.parse(fs.readFileSync(filePath, 'utf8'));
//     });

//     return Object.assign({}, ...messagesArray);
//   } catch (error) {
//     console.error("Error loading messages:", error);
//     notFound();
//   }
// }

// lib/utils/getTrenMessages.ts
// import { notFound } from 'next/navigation';

// export default async function getTrenMessages(locale: string, page?: string) {
//   try {
//     if (!page) throw new Error("Page name is required");

//     // لاحظ: استخدم @
//     // const messages = (await import(`@/messages/${locale}/${page}.json`)).default;
//     // const formMessages = await getTrenMessages(locale, "formGenerator");

//     return { ...messages, ...formMessages };
//   } catch (error) {
//     console.error("Error loading messages:", error);
//     notFound();
//   }
// }

import { notFound } from 'next/navigation';
export async function getTrenMessages(locale: string) {
    try {
      const common = (await import(`@/messages/${locale}/common.json`)).default;
      const formGenerator = (await import(`@/messages/${locale}/formGenerator.json`)).default;
    //   const dashboard = (await import(`@/messages/${locale}/dashboard.json`)).default;
  
      return { ...common, ...formGenerator };
    } catch (error) {
      notFound();
    }
  }