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
  Eye,
  Edit3,
} from "lucide-react";
import { cn } from "@/src/shared/utils/cn";
import { GlassCard } from "@/src/shared/components/ui/GlassCard";
import { Badge } from "@/src/shared/components/ui/Badge";
import CharacterCount from "@tiptap/extension-character-count";

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
    className={cn(
      "p-2 rounded-lg transition-all duration-200 flex items-center justify-center",
      "hover:scale-105 active:scale-95",
            isActive
        ? "bg-primary/10 text-primary shadow-sm"
        : "text-secondary hover:bg-elevated hover:text-main",
      disabled && "opacity-30 cursor-not-allowed hover:scale-100",
    )}
  >
    {children}
  </button>
);

const ToolbarDivider = () => (
  <div className="w-px h-6 bg-border-main/50 mx-1 self-center" />
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
    <div className="absolute top-12 left-0 z-50 glass shadow-xl border border-border-main rounded-xl p-4 min-w-[320px] animate-fade-in">
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={type === "link" ? "Enter URL..." : "Enter image URL..."}
          className={cn(
            "flex-1 px-3 py-2 text-sm rounded-lg transition-all duration-200",
            "border-2 border-border-main bg-white dark:bg-gray-800",
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
            "text-main placeholder:text-secondary",
          )}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSubmit(url);
              setUrl("");
            }
          }}
        />
        <button
          onClick={() => {
            onSubmit(url);
            setUrl("");
          }}
          className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all active:scale-95 shadow-sm"
        >
          <Check size={16} />
        </button>
        <button
          onClick={onClose}
          className="p-2 bg-elevated text-secondary rounded-lg hover:bg-elevated/80 transition-all active:scale-95"
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
    null,
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      CharacterCount,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer hover:text-primary/80",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-xl shadow-lg my-4",
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
        class: cn(
          "prose max-w-none focus:outline-none min-h-[150px] px-4 py-3",
          isRTL && "prose-rtl",
        ),
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
    [editor],
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
    [editor],
  );

  if (!editor) {
    return (
      <GlassCard className="min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-secondary text-sm">Loading editor...</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="group">
      {/* Background Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />

      <GlassCard
        className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-border-main"
        padding="none"
      >
        {/* Header with Language Info */}
        <div className="glass px-4 py-3 border-b border-border-main/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{currentLang.flag}</span>
            <div>
              <h3 className="text-sm font-semibold text-main">
                {currentLang.name}
              </h3>
            </div>
          </div>
          <Badge variant={editable ? "warning" : "info"} size="sm">
            {editable ? (
              <>
                <Edit3 size={12} className="mr-1" />
                Editing
              </>
            ) : (
              <>
                <Eye size={12} className="mr-1" />
                Read Only
              </>
            )}
          </Badge>
        </div>

        {/* Toolbar */}
        <div className="border-b border-border-main bg-elevated/30 p-2 relative z-20">
          {/* URL Popovers */}
          <div className="relative w-full">
            <UrlPopover
              isOpen={activeUrlInput === "link"}
              onClose={() => setActiveUrlInput(null)}
              onSubmit={setLink}
              type="link"
              initialValue={editor.getAttributes("link").href}
            />
            <UrlPopover
              isOpen={activeUrlInput === "image"}
              onClose={() => setActiveUrlInput(null)}
              onSubmit={addImage}
              type="image"
            />
          </div>

          <div
            className={cn(
              "flex flex-wrap gap-1 w-full items-center",
              isRTL && "flex-row-reverse",
            )}
          >
            {/* Basic Formatting */}
            <MenuButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive("bold")}
              title="Bold (Ctrl+B)"
            >
              <Bold size={18} />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive("italic")}
              title="Italic (Ctrl+I)"
            >
              <Italic size={18} />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive("strike")}
              title="Strikethrough"
            >
              <Strikethrough size={18} />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              isActive={editor.isActive("highlight")}
              title="Highlight"
            >
              <Highlighter size={18} />
            </MenuButton>

            <ToolbarDivider />

            {/* Headings */}
            <MenuButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              isActive={editor.isActive("heading", { level: 1 })}
              title="Heading 1"
            >
              <Heading1 size={18} />
            </MenuButton>
            <MenuButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              isActive={editor.isActive("heading", { level: 2 })}
              title="Heading 2"
            >
              <Heading2 size={18} />
            </MenuButton>
            <MenuButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              isActive={editor.isActive("heading", { level: 3 })}
              title="Heading 3"
            >
              <Heading3 size={18} />
            </MenuButton>

            <ToolbarDivider />

            {/* Alignment */}
            <MenuButton
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              isActive={editor.isActive({ textAlign: "left" })}
              title="Align Left"
            >
              <AlignLeft size={18} />
            </MenuButton>
            <MenuButton
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
              isActive={editor.isActive({ textAlign: "center" })}
              title="Align Center"
            >
              <AlignCenter size={18} />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              isActive={editor.isActive({ textAlign: "right" })}
              title="Align Right"
            >
              <AlignRight size={18} />
            </MenuButton>

            <ToolbarDivider />

            {/* Lists & Quotes */}
            <MenuButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive("bulletList")}
              title="Bullet List"
            >
              <List size={18} />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive("orderedList")}
              title="Numbered List"
            >
              <ListOrdered size={18} />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive("blockquote")}
              title="Quote"
            >
              <Quote size={18} />
            </MenuButton>

            <ToolbarDivider />

            {/* Insert */}
            <MenuButton
              onClick={() =>
                setActiveUrlInput(activeUrlInput === "link" ? null : "link")
              }
              isActive={editor.isActive("link")}
              title="Insert Link"
            >
              <LinkIcon size={18} />
            </MenuButton>
            <MenuButton
              onClick={() =>
                setActiveUrlInput(activeUrlInput === "image" ? null : "image")
              }
              title="Insert Image"
            >
              <ImageIcon size={18} />
            </MenuButton>
            <MenuButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              isActive={editor.isActive("codeBlock")}
              title="Code Block"
            >
              <Code size={18} />
            </MenuButton>
          </div>
        </div>

        {/* Editor Content */}
        <div className="bg-white dark:bg-gray-900 min-h-[320px] relative">
          {/* Placeholder */}
          {editor.isEmpty && (
            <div
              className={cn(
                "absolute top-4 px-4 pointer-events-none text-secondary/50",
                isRTL ? "right-0" : "left-0",
              )}
            >
              {placeholder}
            </div>
          )}

          <EditorContent
            editor={editor}
            className={cn(
              "min-h-[320px] outline-none prose max-w-none",
              "prose-headings:text-main prose-p:text-main",
              "prose-strong:text-main prose-code:text-main",
              "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
              isRTL ? "text-right" : "text-left",
            )}
            style={{ direction: currentLang.dir }}
          />
        </div>

        {/* Character Count Footer */}
        <div className="px-4 py-2 bg-elevated/30 border-t border-border-main/50 flex justify-between items-center text-xs text-secondary">
          <span>
            {editor.storage.characterCount?.characters() || 0} characters
          </span>
          <span>{editor.storage.characterCount?.words() || 0} words</span>
        </div>
      </GlassCard>
    </div>
  );
};

export default RichTextEditor;
