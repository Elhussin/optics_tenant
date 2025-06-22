
import React from 'react';
// import { Inter } from 'next/font/google';
import '../styles/globals.css';


export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (

    <html lang="ar" dir="rtl">
    <head>
      <title>تسجيل الدخول</title>
      <meta name="description" content="صفحة تسجيل الدخول للمستخدمين الجدد" />
      <link rel="icon" href="/favicon.ico" />
    </head>
    <body className="bg-gray-100">

    <section>
      {/* يمكن وضع عناصر الواجهة المشتركة مثل Sidebar, Header... */}
      {children}
    </section>
    </body>
    </html>
  );
}
