"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import TextAlign from "@tiptap/extension-text-align";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import { useCallback, useState } from "react";
import { Language, LANGUAGES } from "@/src/features/pages/types";
import {
  Bold,
  Italic,
  Strikethrough,
  Highlighter,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Check,
  X,
  Type
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  language: Language;
}

const MenuButton = ({
  onClick,
  isActive = false,
  disabled = false,
  children,
  title,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    type="button"
    className={`p-2 rounded-lg transition-colors duration-200 flex items-center justify-center
      ${isActive
        ? "bg-blue-100 text-blue-700"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }
      ${disabled ? "opacity-50 cursor-not-allowed" : ""}
    `}
  >
    {children}
  </button>
);

const ToolbarDivider = () => (
  <div className="w-px h-6 bg-gray-200 mx-1 self-center" />
);

const UrlPopover = ({
  isOpen,
  onClose,
  onSubmit,
  initialValue = "",
  type = "link",
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
  initialValue?: string;
  type?: "link" | "image";
}) => {
  const [url, setUrl] = useState(initialValue);

  if (!isOpen) return null;

  return (
    <div className="absolute top-12 left-0 z-50 bg-white shadow-xl border rounded-lg p-3 min-w-[300px] animate-in fade-in zoom-in-95 duration-200">
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={type === "link" ? "Enter URL..." : "Enter image URL..."}
          className="flex-1 px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          autoFocus
        />
        <button
          onClick={() => {
            onSubmit(url);
            setUrl("");
          }}
          className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          <Check size={16} />
        </button>
        <button
          onClick={onClose}
          className="p-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = "Start writing...",
  editable = true,
  language,
}) => {
  const currentLang = LANGUAGES[language];
  const isRTL = currentLang.dir === "rtl";
  const [activeUrlInput, setActiveUrlInput] = useState<"link" | "image" | null>(
    null
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline cursor-pointer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg shadow-sm my-4",
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Color.configure({ types: [TextStyle.name] }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        dir: currentLang.dir,
        class: `prose max-w-none focus:outline-none min-h-[150px] px-4 py-3 ${isRTL ? "prose-rtl" : ""
          }`,
      },
    },
    immediatelyRender: false,
  });

  const addImage = useCallback(
    (url: string) => {
      if (url && editor) {
        editor.chain().focus().setImage({ src: url }).run();
      }
      setActiveUrlInput(null);
    },
    [editor]
  );

  const setLink = useCallback(
    (url: string) => {
      if (url === "") {
        editor?.chain().focus().extendMarkRange("link").unsetLink().run();
      } else if (url) {
        editor
          ?.chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: url })
          .run();
      }
      setActiveUrlInput(null);
    },
    [editor]
  );

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Header Info */}
      <div className="bg-gray-50/50 px-4 py-2 border-b border-gray-100 flex justify-between items-center">
        <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase flex items-center gap-2">
          <span className="text-lg">{currentLang.flag}</span>
          {currentLang.name}
        </div>
        <div className="text-xs text-gray-400">
          {editable ? "Editing Mode" : "Read Only"}
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-gray-100 bg-white p-2 flex flex-wrap gap-1 relative z-20">

        {/* URL Inputs Popover */}
        <div className="relative w-full">
          <UrlPopover
            isOpen={activeUrlInput === 'link'}
            onClose={() => setActiveUrlInput(null)}
            onSubmit={setLink}
            type="link"
            initialValue={editor.getAttributes("link").href}
          />
          <UrlPopover
            isOpen={activeUrlInput === 'image'}
            onClose={() => setActiveUrlInput(null)}
            onSubmit={addImage}
            type="image"
          />
        </div>

        <div className={`flex flex-wrap gap-1 w-full items-center ${isRTL ? "flex-row-reverse" : ""}`}>
          {/* History & Basic Formatting */}
          <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")} title="Bold">
            <Bold size={18} />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")} title="Italic">
            <Italic size={18} />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive("strike")} title="Strike">
            <Strikethrough size={18} />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive("highlight")} title="Highlight">
            <Highlighter size={18} />
          </MenuButton>

          <ToolbarDivider />

          {/* Headings */}
          <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive("heading", { level: 1 })} title="H1">
            <Heading1 size={18} />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive("heading", { level: 2 })} title="H2">
            <Heading2 size={18} />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive("heading", { level: 3 })} title="H3">
            <Heading3 size={18} />
          </MenuButton>

          <ToolbarDivider />

          {/* Alignment */}
          <MenuButton onClick={() => editor.chain().focus().setTextAlign("left").run()} isActive={editor.isActive({ textAlign: "left" })} title="Align Left">
            <AlignLeft size={18} />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().setTextAlign("center").run()} isActive={editor.isActive({ textAlign: "center" })} title="Align Center">
            <AlignCenter size={18} />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().setTextAlign("right").run()} isActive={editor.isActive({ textAlign: "right" })} title="Align Right">
            <AlignRight size={18} />
          </MenuButton>

          <ToolbarDivider />

          {/* Lists & Quotes */}
          <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")} title="Bullet List">
            <List size={18} />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")} title="Ordered List">
            <ListOrdered size={18} />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive("blockquote")} title="Quote">
            <Quote size={18} />
          </MenuButton>

          <ToolbarDivider />

          {/* Insert */}
          <MenuButton onClick={() => setActiveUrlInput(activeUrlInput === 'link' ? null : 'link')} isActive={editor.isActive("link")} title="Link">
            <LinkIcon size={18} />
          </MenuButton>
          <MenuButton onClick={() => setActiveUrlInput(activeUrlInput === 'image' ? null : 'image')} title="Image">
            <ImageIcon size={18} />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive("codeBlock")} title="Code Block">
            <Code size={18} />
          </MenuButton>
        </div>
      </div>

      {/* Editor Content */}
      <div className="bg-white min-h-[300px]">
        <EditorContent
          editor={editor}
          className={`min-h-[300px] outline-none ${isRTL ? "text-right" : "text-left"}`}
          style={{ direction: currentLang.dir }}
        />
      </div>

    </div>
  );
};

export default RichTextEditor;
