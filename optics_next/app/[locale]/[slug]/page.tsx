import React from "react";

async function getPageData(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pages/${slug}/`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Page not found");
  return res.json();
}

export default async function DynamicPage({ params }: { params: { slug: string } }) {
  const page = await getPageData(params.slug);

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{page.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: page.body }} />
    </main>
  );
}
