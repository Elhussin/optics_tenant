// // 🎯 Option 1: Editor.js (أفضل محرر مجاني)
// import EditorJS from '@editorjs/editorjs';
// import Header from '@editorjs/header';
// import List from '@editorjs/list';
// import Image from '@editorjs/image';
// import Paragraph from '@editorjs/paragraph';

// const EditorJSComponent = () => {
//   const editor = new EditorJS({
//     holder: 'editorjs',
//     tools: {
//       header: Header,
//       list: List,
//       image: Image,
//       paragraph: Paragraph
//     },
//     data: {
//       blocks: []
//     }
//   });

//   return <div id="editorjs" className="prose max-w-none"></div>;
// };

// // 🎯 Option 2: Craft.js (أقوى محرر drag & drop)
// import { Editor, Frame, Element } from "@craftjs/core";
// import { Text, Button, Container } from "./components";

// const CraftEditor = () => (
//   <Editor resolver={{ Text, Button, Container }}>
//     <Frame>
//       <Element is={Container} padding={20}>
//         <Text text="Hello World" />
//         <Button />
//       </Element>
//     </Frame>
//   </Editor>
// );

// // 🎯 Option 3: BlockNote (محرر حديث مثل Notion)
// import { useBlockNote } from "@blocknote/react";
// import { BlockNoteEditor } from "@blocknote/core";

// const BlockNoteEditor = () => {
//   const editor = useBlockNote({
//     initialContent: [
//       {
//         type: "paragraph",
//         content: "Welcome to BlockNote!"
//       }
//     ]
//   });

//   return <BlockNoteEditor editor={editor} />;
// };

// // 🎯 Option 4: Novel.sh (محرر AI-powered)
// import { Editor } from "novel";

// const NovelEditor = () => (
//   <Editor
//     className="relative min-h-[500px] w-full border-stone-200"
//     defaultValue=""
//     onUpdate={() => {}}
//     onDebouncedUpdate={() => {}}
//   />
// );

// // 🎯 Option 5: TinyMCE (محرر تجاري قوي)
// import { Editor } from '@tinymce/tinymce-react';

// const TinyMCEEditor = () => (
//   <Editor
//     apiKey="your-api-key"
//     init={{
//       height: 500,
//       menubar: false,
//       plugins: [
//         'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
//         'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
//         'insertdatetime', 'media', 'table', 'help', 'wordcount'
//       ],
//       toolbar: 'undo redo | blocks | ' +
//         'bold italic forecolor | alignleft aligncenter ' +
//         'alignright alignjustify | bullist numlist outdent indent | ' +
//         'removeformat | help',
//     }}
//   />
// );

// // 🎯 مقارنة سريعة:

// /*
// ┌─────────────────┬─────────────┬──────────────┬──────────────┬─────────────────┐
// │ المحرر          │ التعقيد     │ الإمكانيات   │ التخصيص     │ التكلفة        │
// ├─────────────────┼─────────────┼──────────────┼──────────────┼─────────────────┤
// │ المحرر الحالي   │ بسيط ⭐⭐    │ محدودة ⭐⭐   │ عالي ⭐⭐⭐⭐⭐ │ مجاني ⭐⭐⭐⭐⭐  │
// │ Editor.js       │ متوسط ⭐⭐⭐  │ جيدة ⭐⭐⭐⭐  │ جيد ⭐⭐⭐⭐   │ مجاني ⭐⭐⭐⭐⭐  │
// │ Craft.js        │ عالي ⭐⭐⭐⭐  │ ممتازة ⭐⭐⭐⭐⭐│ ممتاز ⭐⭐⭐⭐⭐ │ مجاني ⭐⭐⭐⭐⭐  │
// │ BlockNote       │ متوسط ⭐⭐⭐  │ جيدة ⭐⭐⭐⭐  │ محدود ⭐⭐⭐  │ مجاني ⭐⭐⭐⭐⭐  │
// │ Novel           │ بسيط ⭐⭐    │ متوسطة ⭐⭐⭐ │ محدود ⭐⭐   │ مجاني ⭐⭐⭐⭐⭐  │
// │ TinyMCE         │ بسيط ⭐⭐    │ ممتازة ⭐⭐⭐⭐⭐│ محدود ⭐⭐   │ مدفوع ⭐      │
// └─────────────────┴─────────────┴──────────────┴──────────────┴─────────────────┘
// */


"use client";

import { useEffect, useRef } from "react";
import EditorJS, { OutputData } from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";

interface EditorProps {
  data?: OutputData; // لو عايز تدي بيانات موجودة
  onChange?: (data: OutputData) => void; // لما يتغير المحتوى
  holder?: string; // id للـdiv
}

export default function Editor({ data, onChange, holder = "editorjs" }: EditorProps) {
  const editorRef = useRef<EditorJS | null>(null);

  useEffect(() => {
    if (!editorRef.current) {
      const editor = new EditorJS({
        holder,
        tools: {
          header: Header,
          list: List,
        },
        data,
        async onChange(api) {
          const savedData = await api.saver.save();
          onChange?.(savedData);
        },
      });
      editorRef.current = editor;
    }

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  return <div id={holder} className="prose max-w-none" />;
}
