// // app/page-editor/page.tsx
// "use client";

// import dynamic from "next/dynamic";

// // منع SSR لهذا الملف لو حبيت:
// const TenantPageBuilder = dynamic(() => import("./TenantPageBuilder"), { ssr: false });

// export default function Page() {
//   return (
//     <div className="p-6">
//       <h1 className="mb-4 text-xl font-semibold">Page Builder</h1>
//       <TenantPageBuilder
//         onSave={(json) => {
//           console.log("Saved JSON:", json);
//           // أرسل json إلى API للحفظ لكل tenant
//           // fetch("/api/pages", { method: "POST", body: JSON.stringify(json) })
//         }}
//       />
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import Editor from "./Editor";
import { OutputData } from "@editorjs/editorjs";
import PageEditor from './PageEditor'
export default function DashboardPage() {
  const [content, setContent] = useState<OutputData | null>(null);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Creat Page</h1>

      <Editor onChange={setContent} />
      <PageEditor
              onSave={(json) => {
          console.log("Saved JSON:", json);
          // أرسل json إلى API للحفظ لكل tenant
          // fetch("/api/pages", { method: "POST", body: JSON.stringify(json) })
        }}
      />
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={() => console.log(content)}
      >
        Save Content
      </button>
    </div>
  );
}
