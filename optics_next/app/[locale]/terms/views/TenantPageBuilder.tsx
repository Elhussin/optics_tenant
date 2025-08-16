// "use client";

// import React, { useMemo, useState } from "react";
// import { EditorContent, useEditor } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";
// import Image from "@tiptap/extension-image";
// import Link from "@tiptap/extension-link";
// import Youtube from "@tiptap/extension-youtube";
// import PageEditor from './PageEditor'
// // ----------------------
// // Types
// // ----------------------
// export type ParagraphBlock = { type: "paragraph"; data: { html: string } };
// export type HeadingBlock = { type: "heading"; data: { level: 1 | 2 | 3 | 4 | 5 | 6; html: string } };
// export type ListBlock = { type: "list"; data: { style: "ul" | "ol"; items: string[] } };
// export type ImageBlock = { type: "image"; data: { url: string; alt?: string } };
// export type VideoBlock = { type: "video"; data: { url: string } };
// export type Block = ParagraphBlock | HeadingBlock | ListBlock | ImageBlock | VideoBlock;

// export type PageContent = { ar: Block[]; en: Block[] };

// export interface PageBuilderProps {
//   initial?: PageContent;
//   onSave?: (content: PageContent) => void;
// }

// // ----------------------
// // Small UI helpers
// // ----------------------
// const Btn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = "", ...props }) => (
//   <button
//     {...props}
//     className={`px-3 py-1 rounded-lg border shadow-sm text-sm hover:shadow transition ${className}`}
//   />
// );

// // ----------------------
// // Main Component
// // ----------------------
// export default function TenantPageBuilder({ initial, onSave }: PageBuilderProps) {
//   const [lang, setLang] = useState<"ar" | "en">("ar");
//   const [content, setContent] = useState<PageContent>(
//     initial ?? { ar: [], en: [] }
//   );
//   const [activeIndex, setActiveIndex] = useState<number | null>(null);

//   const activeBlock: Block | null = useMemo(() => {
//     if (activeIndex === null) return null;
//     return content[lang][activeIndex] ?? null;
//   }, [activeIndex, content, lang]);

//   // Tiptap editor for rich-text blocks (paragraph/heading)
//   const editor = useEditor({
//     extensions: [
//       StarterKit.configure({
//         heading: { levels: [1, 2, 3, 4, 5, 6] },
//       }),
//       Image,
//       Link.configure({ openOnClick: true }),
//       Youtube,
//     ],
//     immediatelyRender: false, // important for Next.js hydration
//     autofocus: false,
//     content: activeBlock && (activeBlock.type === "paragraph" || activeBlock.type === "heading")
//       ? activeBlock.data.html
//       : "",
//     onUpdate: ({ editor }) => {
//       if (!activeBlock) return;
//       if (activeBlock.type === "paragraph" || activeBlock.type === "heading") {
//         const html = editor.getHTML();
//         updateBlock(activeIndex as number, {
//           ...activeBlock,
//           data: { ...(activeBlock as any).data, html },
//         } as Block);
//       }
//     },
//   }, [activeBlock]);

//   // When switching active block, sync editor content
//   React.useEffect(() => {
//     if (!editor) return;
//     if (activeBlock && (activeBlock.type === "paragraph" || activeBlock.type === "heading")) {
//       editor.commands.setContent(activeBlock.data.html || "");
//     } else {
//       editor.commands.setContent("");
//     }
//   }, [activeBlock, editor]);

//   // ----------------------
//   // Block operations
//   // ----------------------
//   const addBlock = (type: Block["type"]) => {
//     const newBlock: Block = (() => {
//       switch (type) {
//         case "paragraph":
//           return { type, data: { html: "" } };
//         case "heading":
//           return { type, data: { level: 2, html: "" } };
//         case "list":
//           return { type, data: { style: "ul", items: [] } };
//         case "image":
//           return { type, data: { url: "", alt: "" } };
//         case "video":
//           return { type, data: { url: "" } };
//       }
//     })();

//     const updated = [...content[lang], newBlock];
//     setContent({ ...content, [lang]: updated });
//     setActiveIndex(updated.length - 1);
//   };

//   const updateBlock = (index: number, newBlock: Block) => {
//     const updated = [...content[lang]];
//     updated[index] = newBlock;
//     setContent({ ...content, [lang]: updated });
//   };

//   const removeBlock = (index: number) => {
//     const updated = content[lang].filter((_, i) => i !== index);
//     setContent({ ...content, [lang]: updated });
//     setActiveIndex((prev) => (prev === index ? null : prev && prev > index ? prev - 1 : prev));
//   };

//   const moveBlock = (index: number, dir: -1 | 1) => {
//     const target = index + dir;
//     if (target < 0 || target >= content[lang].length) return;
//     const arr = [...content[lang]];
//     [arr[index], arr[target]] = [arr[target], arr[index]];
//     setContent({ ...content, [lang]: arr });
//     setActiveIndex(target);
//   };

//   // Simple renderers for non-rich blocks
//   const BlockEditorPanel: React.FC = () => {
//     if (activeBlock == null) return null;

//     if (activeBlock.type === "heading") {
//       const b = activeBlock as HeadingBlock;
//       return (
//         <div className="p-3 border rounded-2xl bg-white shadow-sm space-y-3">
//           <div className="flex items-center gap-2">
//             <label className="text-sm">Level</label>
//             <select
//               className="border rounded px-2 py-1"
//               value={b.data.level}
//               onChange={(e) =>
//                 updateBlock(activeIndex as number, {
//                   ...b,
//                   data: { ...b.data, level: Number(e.target.value) as any },
//                 })
//               }
//             >
//               {[1, 2, 3, 4, 5, 6].map((lvl) => (
//                 <option key={lvl} value={lvl}>H{lvl}</option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <label className="text-sm block mb-1">Text</label>
//             <EditorContent editor={editor} />
//           </div>
//         </div>
//       );
//     }

//     if (activeBlock.type === "paragraph") {
//       return (
//         <div className="p-3 border rounded-2xl bg-white shadow-sm">
//           <label className="text-sm block mb-1">Paragraph</label>
//           <EditorContent editor={editor} />
//         </div>
//       );
//     }

//     if (activeBlock.type === "list") {
//       const b = activeBlock as ListBlock;
//       return (
//         <div className="p-3 border rounded-2xl bg-white shadow-sm space-y-3">
//           <div className="flex items-center gap-2">
//             <label className="text-sm">Style</label>
//             <select
//               className="border rounded px-2 py-1"
//               value={b.data.style}
//               onChange={(e) =>
//                 updateBlock(activeIndex as number, {
//                   ...b,
//                   data: { ...b.data, style: e.target.value as "ul" | "ol" },
//                 })
//               }
//             >
//               <option value="ul">Unordered</option>
//               <option value="ol">Ordered</option>
//             </select>
//           </div>
//           <div>
//             <label className="text-sm block mb-1">Items (one per line)</label>
//             <textarea
//               className="w-full border rounded p-2 min-h-[120px]"
//               value={(b.data.items || []).join("\n")}
//               onChange={(e) =>
//                 updateBlock(activeIndex as number, {
//                   ...b,
//                   data: { ...b.data, items: e.target.value.split("\n") },
//                 })
//               }
//             />
//           </div>
//         </div>
//       );
//     }

//     if (activeBlock.type === "image") {
//       const b = activeBlock as ImageBlock;
//       return (
//         <div className="p-3 border rounded-2xl bg-white shadow-sm space-y-3">
//           <div>
//             <label className="text-sm block mb-1">Image URL</label>
//             <input
//               className="w-full border rounded px-2 py-1"
//               value={b.data.url}
//               onChange={(e) => updateBlock(activeIndex as number, { ...b, data: { ...b.data, url: e.target.value } })}
//               placeholder="https://..."
//             />
//           </div>
//           <div>
//             <label className="text-sm block mb-1">Alt</label>
//             <input
//               className="w-full border rounded px-2 py-1"
//               value={b.data.alt || ""}
//               onChange={(e) => updateBlock(activeIndex as number, { ...b, data: { ...b.data, alt: e.target.value } })}
//               placeholder="Description"
//             />
//           </div>
//         </div>
//       );
//     }

//     if (activeBlock.type === "video") {
//       const b = activeBlock as VideoBlock;
//       return (
//         <div className="p-3 border rounded-2xl bg-white shadow-sm space-y-3">
//           <div>
//             <label className="text-sm block mb-1">YouTube/Vimeo URL</label>
//             <input
//               className="w-full border rounded px-2 py-1"
//               value={b.data.url}
//               onChange={(e) => updateBlock(activeIndex as number, { ...b, data: { url: e.target.value } })}
//               placeholder="https://www.youtube.com/watch?v=..."
//             />
//           </div>
//         </div>
//       );
//     }

//     return null;
//   };

//   const handleSave = () => {
//     onSave?.(content);
//     // For quick preview in console
//     // eslint-disable-next-line no-console
//     console.log("Saved JSON:", JSON.stringify(content, null, 2));
//   };

//   return (
//     <div className="max-w-6xl mx-auto p-4 space-y-4">

//       {/* Lang switch */}
//       <div className="flex items-center justify-between">
//         <div className="flex gap-2">
//           <Btn className={`${lang === "ar" ? "bg-blue-600 text-white" : "bg-white"}`} onClick={() => { setLang("ar"); setActiveIndex(null); }}>AR</Btn>
//           <Btn className={`${lang === "en" ? "bg-blue-600 text-white" : "bg-white"}`} onClick={() => { setLang("en"); setActiveIndex(null); }}>EN</Btn>
//         </div>
//         <Btn className="bg-blue-600 text-white" onClick={handleSave}>💾 Save</Btn>
//       </div>

//       {/* Add block toolbar */}
//       <div className="flex flex-wrap gap-2">
//         <Btn onClick={() => addBlock("heading")}>+ Heading</Btn>
//         <Btn onClick={() => addBlock("paragraph")}>+ Paragraph</Btn>
//         <Btn onClick={() => addBlock("list")}>+ List</Btn>
//         <Btn onClick={() => addBlock("image")}>+ Image</Btn>
//         <Btn onClick={() => addBlock("video")}>+ Video</Btn>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {/* Blocks list */}
//         <div className="space-y-2">
//           {content[lang].length === 0 && (
//             <div className="border rounded-2xl p-6 text-center text-gray-500 bg-white">
//               No blocks yet. Add one from the toolbar above.
//             </div>
//           )}

//           {content[lang].map((b, idx) => (
//             <div key={idx} className={`border rounded-2xl bg-white p-3 shadow-sm ${activeIndex === idx ? "ring-2 ring-blue-500" : ""}`}>
//               <div className="flex items-center justify-between">
//                 <div className="text-sm font-medium">{b.type.toUpperCase()}</div>
//                 <div className="flex gap-2">
//                   <Btn onClick={() => moveBlock(idx, -1)}>↑</Btn>
//                   <Btn onClick={() => moveBlock(idx, +1)}>↓</Btn>
//                   <Btn className="bg-red-50 text-red-600" onClick={() => removeBlock(idx)}>Delete</Btn>
//                 </div>
//               </div>

//               {/* quick preview */}
//               <div className="mt-2 text-xs text-gray-500 max-h-24 overflow-auto">
//                 {b.type === "paragraph" || b.type === "heading" ? (
//                   <div dangerouslySetInnerHTML={{ __html: (b as any).data.html }} />
//                 ) : b.type === "list" ? (
//                   (b as ListBlock).data.style === "ul" ? (
//                     <ul className="list-disc pl-5">{(b as ListBlock).data.items.map((it, i) => <li key={i}>{it}</li>)}</ul>
//                   ) : (
//                     <ol className="list-decimal pl-5">{(b as ListBlock).data.items.map((it, i) => <li key={i}>{it}</li>)}</ol>
//                   )
//                 ) : b.type === "image" ? (
//                   <div className="text-gray-400">{(b as ImageBlock).data.url || "(no image url)"}</div>
//                 ) : b.type === "video" ? (
//                   <div className="text-gray-400">{(b as VideoBlock).data.url || "(no video url)"}</div>
//                 ) : null}
//               </div>

//               <div className="mt-2">
//                 <Btn className="bg-gray-100" onClick={() => setActiveIndex(idx)}>Edit</Btn>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Editor panel */}
//         <div className="space-y-2">
//           {activeBlock ? (
//             <BlockEditorPanel />
//           ) : (
//             <div className="border rounded-2xl p-6 text-center text-gray-500 bg-white">
//               Select a block to edit.
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Output preview card */}
//       <div className="mt-4 border rounded-2xl bg-white p-4">
//         <div className="text-sm text-gray-500 mb-2">Current JSON (for {lang.toUpperCase()}):</div>
//         <pre className="text-xs whitespace-pre-wrap break-all">{JSON.stringify(content[lang], null, 2)}</pre>
//       </div>
//             <PageEditor
//               onSave={(json) => {
//           console.log("Saved JSON:", json);
//           // أرسل json إلى API للحفظ لكل tenant
//           // fetch("/api/pages", { method: "POST", body: JSON.stringify(json) })
//         }}
//       />
//     </div>
//   );
// }
"use client";
import PageEditor from './PageEditor'
import React, { useMemo, useState, useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";

// ----------------------
// Types
// ----------------------
export type ParagraphBlock = { type: "paragraph"; data: { html: string } };
export type HeadingBlock = { type: "heading"; data: { level: 1 | 2 | 3 | 4 | 5 | 6; html: string } };
export type ListBlock = { type: "list"; data: { style: "ul" | "ol"; items: string[] } };
export type ImageBlock = { type: "image"; data: { url: string; alt?: string } };
export type VideoBlock = { type: "video"; data: { url: string } };
export type Block = ParagraphBlock | HeadingBlock | ListBlock | ImageBlock | VideoBlock;

export type PageContent = { ar: Block[]; en: Block[] };

export interface PageBuilderProps {
  initial?: PageContent;
  onSave?: (content: PageContent) => void;
}

// ----------------------
// Small UI helpers
// ----------------------
const Btn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = "", ...props }) => (
  <button
    {...props}
    className={`px-3 py-1 rounded-lg border shadow-sm text-sm hover:shadow transition ${className}`}
  />
);

// ----------------------
// Main Component
// ----------------------
export default function TenantPageBuilder({ initial, onSave }: PageBuilderProps) {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [content, setContent] = useState<PageContent>(
    initial ?? { ar: [], en: [] }
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Fix hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const activeBlock: Block | null = useMemo(() => {
    if (activeIndex === null) return null;
    return content[lang][activeIndex] ?? null;
  }, [activeIndex, content, lang]);

  // Tiptap editor for rich-text blocks (paragraph/heading)
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Image,
      Link.configure({ openOnClick: true }),
      Youtube,
    ],
    immediatelyRender: false,
    autofocus: false,
    content: activeBlock && (activeBlock.type === "paragraph" || activeBlock.type === "heading")
      ? activeBlock.data.html
      : "",
    onUpdate: ({ editor }) => {
      if (!activeBlock || activeIndex === null) return;
      if (activeBlock.type === "paragraph" || activeBlock.type === "heading") {
        const html = editor.getHTML();
        updateBlock(activeIndex, {
          ...activeBlock,
          data: { ...(activeBlock as any).data, html },
        } as Block);
      }
    },
  }, [activeBlock]);

  // When switching active block, sync editor content
  useEffect(() => {
    if (!editor || !isMounted) return;
    if (activeBlock && (activeBlock.type === "paragraph" || activeBlock.type === "heading")) {
      editor.commands.setContent(activeBlock.data.html || "");
    } else {
      editor.commands.setContent("");
    }
  }, [activeBlock, editor, isMounted]);

  // Update content when initial prop changes
  useEffect(() => {
    if (initial) {
      setContent(initial);
    }
  }, [initial]);

  // ----------------------
  // Block operations
  // ----------------------
  const addBlock = (type: Block["type"]) => {
    const newBlock: Block = (() => {
      switch (type) {
        case "paragraph":
          return { type, data: { html: "" } };
        case "heading":
          return { type, data: { level: 2, html: "" } };
        case "list":
          return { type, data: { style: "ul", items: [] } };
        case "image":
          return { type, data: { url: "", alt: "" } };
        case "video":
          return { type, data: { url: "" } };
      }
    })();

    const updated = [...content[lang], newBlock];
    setContent({ ...content, [lang]: updated });
    setActiveIndex(updated.length - 1);
  };

  const updateBlock = (index: number, newBlock: Block) => {
    const updated = [...content[lang]];
    updated[index] = newBlock;
    const newContent = { ...content, [lang]: updated };
    setContent(newContent);
    
    // Call onSave immediately when content changes
    onSave?.(newContent);
  };

  const removeBlock = (index: number) => {
    const updated = content[lang].filter((_, i) => i !== index);
    const newContent = { ...content, [lang]: updated };
    setContent(newContent);
    setActiveIndex((prev) => (prev === index ? null : prev && prev > index ? prev - 1 : prev));
    
    // Call onSave immediately when content changes
    onSave?.(newContent);
  };

  const moveBlock = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= content[lang].length) return;
    const arr = [...content[lang]];
    [arr[index], arr[target]] = [arr[target], arr[index]];
    const newContent = { ...content, [lang]: arr };
    setContent(newContent);
    setActiveIndex(target);
    
    // Call onSave immediately when content changes
    onSave?.(newContent);
  };

  // Block Editor Panel
  const BlockEditorPanel: React.FC = () => {
    if (activeBlock == null || !isMounted) return null;

    if (activeBlock.type === "heading") {
      const b = activeBlock as HeadingBlock;
      return (
        <div className="p-3 border rounded-2xl bg-white shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <label className="text-sm">Level</label>
            <select
              className="border rounded px-2 py-1"
              value={b.data.level}
              onChange={(e) =>
                updateBlock(activeIndex as number, {
                  ...b,
                  data: { ...b.data, level: Number(e.target.value) as any },
                })
              }
            >
              {[1, 2, 3, 4, 5, 6].map((lvl) => (
                <option key={lvl} value={lvl}>H{lvl}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm block mb-1">Text</label>
            <div className="border rounded p-2 min-h-[100px]">
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>
      );
    }

    if (activeBlock.type === "paragraph") {
      return (
        <div className="p-3 border rounded-2xl bg-white shadow-sm">
          <label className="text-sm block mb-1">Paragraph</label>
          <div className="border rounded p-2 min-h-[100px]">
            <EditorContent editor={editor} />
          </div>
        </div>
      );
    }

    if (activeBlock.type === "list") {
      const b = activeBlock as ListBlock;
      return (
        <div className="p-3 border rounded-2xl bg-white shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <label className="text-sm">Style</label>
            <select
              className="border rounded px-2 py-1"
              value={b.data.style}
              onChange={(e) =>
                updateBlock(activeIndex as number, {
                  ...b,
                  data: { ...b.data, style: e.target.value as "ul" | "ol" },
                })
              }
            >
              <option value="ul">Unordered</option>
              <option value="ol">Ordered</option>
            </select>
          </div>
          <div>
            <label className="text-sm block mb-1">Items (one per line)</label>
            <textarea
              className="w-full border rounded p-2 min-h-[120px]"
              value={(b.data.items || []).join("\n")}
              onChange={(e) =>
                updateBlock(activeIndex as number, {
                  ...b,
                  data: { ...b.data, items: e.target.value.split("\n").filter(item => item.trim()) },
                })
              }
            />
          </div>
        </div>
      );
    }

    if (activeBlock.type === "image") {
      const b = activeBlock as ImageBlock;
      return (
        <div className="p-3 border rounded-2xl bg-white shadow-sm space-y-3">
          <div>
            <label className="text-sm block mb-1">Image URL</label>
            <input
              className="w-full border rounded px-2 py-1"
              value={b.data.url}
              onChange={(e) => updateBlock(activeIndex as number, { ...b, data: { ...b.data, url: e.target.value } })}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div>
            <label className="text-sm block mb-1">Alt Text</label>
            <input
              className="w-full border rounded px-2 py-1"
              value={b.data.alt || ""}
              onChange={(e) => updateBlock(activeIndex as number, { ...b, data: { ...b.data, alt: e.target.value } })}
              placeholder="Image description"
            />
          </div>
          {b.data.url && (
            <div>
              <img src={b.data.url} alt={b.data.alt} className="max-w-full h-auto max-h-48 object-contain border rounded" />
            </div>
          )}
        </div>
      );
    }

    if (activeBlock.type === "video") {
      const b = activeBlock as VideoBlock;
      return (
        <div className="p-3 border rounded-2xl bg-white shadow-sm space-y-3">
          <div>
            <label className="text-sm block mb-1">YouTube/Vimeo URL</label>
            <input
              className="w-full border rounded px-2 py-1"
              value={b.data.url}
              onChange={(e) => updateBlock(activeIndex as number, { ...b, data: { url: e.target.value } })}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
          {b.data.url && (
            <div className="text-xs text-gray-500">
              Video: {b.data.url}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  // Don't render until mounted to avoid hydration issues
  if (!isMounted) {
    return <div className="max-w-6xl mx-auto p-4">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      {/* Language switch */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Btn 
            className={`${lang === "ar" ? "bg-blue-600 text-white" : "bg-white"}`} 
            onClick={() => { 
              setLang("ar"); 
              setActiveIndex(null); 
            }}
          >
            عربي
          </Btn>
          <Btn 
            className={`${lang === "en" ? "bg-blue-600 text-white" : "bg-white"}`} 
            onClick={() => { 
              setLang("en"); 
              setActiveIndex(null); 
            }}
          >
            English
          </Btn>
        </div>
      </div>

      {/* Add block toolbar */}
      <div className="flex flex-wrap gap-2">
        <Btn onClick={() => addBlock("heading")}>+ Heading</Btn>
        <Btn onClick={() => addBlock("paragraph")}>+ Paragraph</Btn>
        <Btn onClick={() => addBlock("list")}>+ List</Btn>
        <Btn onClick={() => addBlock("image")}>+ Image</Btn>
        <Btn onClick={() => addBlock("video")}>+ Video</Btn>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Blocks list */}
        <div className="space-y-2">
          {content[lang].length === 0 && (
            <div className="border rounded-2xl p-6 text-center text-gray-500 bg-white">
              No blocks yet. Add one from the toolbar above.
            </div>
          )}

          {content[lang].map((b, idx) => (
            <div key={idx} className={`border rounded-2xl bg-white p-3 shadow-sm ${activeIndex === idx ? "ring-2 ring-blue-500" : ""}`}>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{b.type.toUpperCase()}</div>
                <div className="flex gap-2">
                  <Btn onClick={() => moveBlock(idx, -1)} disabled={idx === 0}>↑</Btn>
                  <Btn onClick={() => moveBlock(idx, +1)} disabled={idx === content[lang].length - 1}>↓</Btn>
                  <Btn className="bg-red-50 text-red-600" onClick={() => removeBlock(idx)}>Delete</Btn>
                </div>
              </div>

              {/* Quick preview */}
              <div className="mt-2 text-xs text-gray-500 max-h-24 overflow-auto">
                {b.type === "paragraph" || b.type === "heading" ? (
                  <div dangerouslySetInnerHTML={{ __html: (b as any).data.html || "Empty..." }} />
                ) : b.type === "list" ? (
                  (b as ListBlock).data.style === "ul" ? (
                    <ul className="list-disc pl-5">{(b as ListBlock).data.items.map((it, i) => <li key={i}>{it}</li>)}</ul>
                  ) : (
                    <ol className="list-decimal pl-5">{(b as ListBlock).data.items.map((it, i) => <li key={i}>{it}</li>)}</ol>
                  )
                ) : b.type === "image" ? (
                  <div className="text-gray-400">{(b as ImageBlock).data.url || "(no image url)"}</div>
                ) : b.type === "video" ? (
                  <div className="text-gray-400">{(b as VideoBlock).data.url || "(no video url)"}</div>
                ) : null}
              </div>

              <div className="mt-2">
                <Btn 
                  className={`${activeIndex === idx ? "bg-blue-100 text-blue-600" : "bg-gray-100"}`} 
                  onClick={() => setActiveIndex(idx)}
                >
                  {activeIndex === idx ? "Editing..." : "Edit"}
                </Btn>
              </div>
            </div>
          ))}
        </div>

        {/* Editor panel */}
        <div className="space-y-2">
          {activeBlock ? (
            <BlockEditorPanel />
          ) : (
            <div className="border rounded-2xl p-6 text-center text-gray-500 bg-white">
              Select a block to edit.
            </div>
          )}
        </div>
      </div>

      {/* Output preview card */}
      <div className="mt-4 border rounded-2xl bg-white p-4">
        <div className="text-sm text-gray-500 mb-2">Current JSON (for {lang.toUpperCase()}):</div>
        <pre className="text-xs whitespace-pre-wrap break-all bg-gray-50 p-2 rounded max-h-40 overflow-auto">
          {JSON.stringify(content[lang], null, 2)}
        </pre>
      </div>
      <PageEditor/>
    </div>
  );
}