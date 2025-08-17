
"use client";
import React, { useMemo, useState, useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";

// ----------------------
// Types
// ----------------------
type ParagraphBlock = { type: "paragraph"; data: { html: string } };
type HeadingBlock = { type: "heading"; data: { level: 1 | 2 | 3 | 4 | 5 | 6; html: string } };
type ListBlock = { type: "list"; data: { style: "ul" | "ol"; items: string[] } };
type ImageBlock = { type: "image"; data: { url: string; alt?: string } };
type VideoBlock = { type: "video"; data: { url: string } };
type Block = ParagraphBlock | HeadingBlock | ListBlock | ImageBlock | VideoBlock;

type PageContent = { ar: Block[]; en: Block[] };

interface PageEditorProps {
    initialData?: {
        title?: string;
        slug?: string;
        content_json?: PageContent;
        seo_title?: string;
        meta_description?: string;
        meta_keywords?: string;
    };
    onSave: (data: any) => void;
}

export default function PageEditor({ initialData, onSave }: PageEditorProps) {
    // Page meta data
    const [title, setTitle] = useState(initialData?.title || "");
    const [slug, setSlug] = useState(initialData?.slug || "");
    const [seoTitle, setSeoTitle] = useState(initialData?.seo_title || "");
    const [metaDescription, setMetaDescription] = useState(initialData?.meta_description || "");
    const [metaKeywords, setMetaKeywords] = useState(initialData?.meta_keywords || "");

    // Content builder state
    const [lang, setLang] = useState<"ar" | "en">("ar");
    const [content, setContent] = useState<PageContent>(
        initialData?.content_json ?? { ar: [], en: [] }
    );
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<"content" | "seo">("content");

    // Fix hydration issues
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const activeBlock: Block | null = useMemo(() => {
        if (activeIndex === null) return null;
        return content[lang][activeIndex] ?? null;
    }, [activeIndex, content, lang]);

    // Tiptap editor
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

    useEffect(() => {
        if (!editor || !isMounted) return;
        if (activeBlock && (activeBlock.type === "paragraph" || activeBlock.type === "heading")) {
            editor.commands.setContent(activeBlock.data.html || "");
        } else {
            editor.commands.setContent("");
        }
    }, [activeBlock, editor, isMounted]);

    // Auto-generate slug from title
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);

        if (!slug || slug === title.toLowerCase().replace(/\s+/g, '-')) {
            setSlug(newTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
        }
    };

    // Block operations
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
    };

    const removeBlock = (index: number) => {
        const updated = content[lang].filter((_, i) => i !== index);
        const newContent = { ...content, [lang]: updated };
        setContent(newContent);
        setActiveIndex((prev) => (prev === index ? null : prev && prev > index ? prev - 1 : prev));
    };

    const moveBlock = (index: number, dir: -1 | 1) => {
        const target = index + dir;
        if (target < 0 || target >= content[lang].length) return;
        const arr = [...content[lang]];
        [arr[index], arr[target]] = [arr[target], arr[index]];
        setContent({ ...content, [lang]: arr });
        setActiveIndex(target);
    };

    const save = async () => {
        setIsSaving(true);
        try {
            const data = {
                title,
                slug,
                seo_title: seoTitle,
                meta_description: metaDescription,
                meta_keywords: metaKeywords,
                content_json: content,
            };

            await onSave(data);
        } catch (error) {
            console.error('Error saving page:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Block Editor Panel
    const BlockEditorPanel = () => {
        if (activeBlock == null || !isMounted) return null;

        const commonInputClasses = "w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200";

        if (activeBlock.type === "heading") {
            const b = activeBlock as HeadingBlock;
            return (
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-2xl border-2 border-purple-200 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">H</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">Heading Block</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Heading Level</label>
                            <select
                                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                                value={b.data.level}
                                onChange={(e) =>
                                    updateBlock(activeIndex as number, {
                                        ...b,
                                        data: { ...b.data, level: Number(e.target.value) as any },
                                    })
                                }
                            >
                                {[1, 2, 3, 4, 5, 6].map((lvl) => (
                                    <option key={lvl} value={lvl}>H{lvl} - Heading {lvl}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Heading Text</label>
                            <div className="border-2 border-gray-200 rounded-xl p-4 bg-white min-h-[120px] focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-100 transition-all">
                                <EditorContent editor={editor} />
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (activeBlock.type === "paragraph") {
            return (
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border-2 border-blue-200 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">P</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">Paragraph Block</h3>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Paragraph Content</label>
                        <div className="border-2 border-gray-200 rounded-xl p-4 bg-white min-h-[120px] focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition-all">
                            <EditorContent editor={editor} />
                        </div>
                    </div>
                </div>
            );
        }

        if (activeBlock.type === "list") {
            const b = activeBlock as ListBlock;
            return (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-200 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">L</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">List Block</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">List Type</label>
                            <select
                                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100"
                                value={b.data.style}
                                onChange={(e) =>
                                    updateBlock(activeIndex as number, {
                                        ...b,
                                        data: { ...b.data, style: e.target.value as "ul" | "ol" },
                                    })
                                }
                            >
                                <option value="ul">• Bulleted List</option>
                                <option value="ol">1. Numbered List</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">List Items (one per line)</label>
                            <textarea
                                className={`${commonInputClasses} min-h-[140px] focus:border-green-500 focus:ring-green-100`}
                                value={(b.data.items || []).join("\n")}
                                onChange={(e) =>
                                    updateBlock(activeIndex as number, {
                                        ...b,
                                        data: { ...b.data, items: e.target.value.split("\n").filter(item => item.trim()) },
                                    })
                                }
                                placeholder="Enter each list item on a new line"
                            />
                        </div>
                    </div>
                </div>
            );
        }

        if (activeBlock.type === "image") {
            const b = activeBlock as ImageBlock;
            return (
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-2xl border-2 border-orange-200 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">📷</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">Image Block</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                            <input
                                className={`${commonInputClasses} focus:border-orange-500 focus:ring-orange-100`}
                                value={b.data.url}
                                onChange={(e) => updateBlock(activeIndex as number, { ...b, data: { ...b.data, url: e.target.value } })}
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Alt Text</label>
                            <input
                                className={`${commonInputClasses} focus:border-orange-500 focus:ring-orange-100`}
                                value={b.data.alt || ""}
                                onChange={(e) => updateBlock(activeIndex as number, { ...b, data: { ...b.data, alt: e.target.value } })}
                                placeholder="Describe the image"
                            />
                        </div>

                        {b.data.url && (
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
                                <img
                                    src={b.data.url}
                                    alt={b.data.alt}
                                    className="max-w-full h-auto max-h-48 object-contain mx-auto rounded-lg shadow-md"
                                />
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        if (activeBlock.type === "video") {
            const b = activeBlock as VideoBlock;
            return (
                <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-2xl border-2 border-red-200 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">🎥</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">Video Block</h3>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Video URL</label>
                        <input
                            className={`${commonInputClasses} focus:border-red-500 focus:ring-red-100`}
                            value={b.data.url}
                            onChange={(e) => updateBlock(activeIndex as number, { ...b, data: { url: e.target.value } })}
                            placeholder="https://www.youtube.com/watch?v=..."
                        />
                        {b.data.url && (
                            <div className="mt-3 p-3 bg-gray-100 rounded-lg text-sm text-gray-600">
                                📹 Video: {b.data.url}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return null;
    };

    if (!isMounted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading page editor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl mb-8 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Editor</h1>
                            <p className="text-gray-600">Create and edit your pages with our powerful editor</p>
                        </div>

                        <button
                            onClick={save}
                            disabled={isSaving}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            {isSaving ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    💾 Save Page
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-xl mb-8">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab("content")}
                            className={`px-8 py-4 font-medium transition-all duration-200 ${activeTab === "content"
                                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                                }`}
                        >
                            📝 Content
                        </button>
                        <button
                            onClick={() => setActiveTab("seo")}
                            className={`px-8 py-4 font-medium transition-all duration-200 ${activeTab === "seo"
                                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                                }`}
                        >
                            🔍 SEO & Meta
                        </button>
                    </div>

                    <div className="p-6">
                        {activeTab === "seo" && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Page Title</label>
                                        <input
                                            type="text"
                                            placeholder="Enter page title"
                                            value={title}
                                            onChange={handleTitleChange}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">URL Slug</label>
                                        <input
                                            type="text"
                                            placeholder="page-url-slug"
                                            value={slug}
                                            onChange={(e) => setSlug(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">SEO Title</label>
                                    <input
                                        type="text"
                                        placeholder="SEO optimized title"
                                        value={seoTitle}
                                        onChange={(e) => setSeoTitle(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                                    <textarea
                                        placeholder="Brief description for search engines"
                                        value={metaDescription}
                                        onChange={(e) => setMetaDescription(e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Meta Keywords</label>
                                    <input
                                        type="text"
                                        placeholder="keyword1, keyword2, keyword3"
                                        value={metaKeywords}
                                        onChange={(e) => setMetaKeywords(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === "content" && (
                            <div className="space-y-6">
                                {/* Language and Toolbar */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setLang("ar"); setActiveIndex(null); }}
                                            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${lang === "ar"
                                                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                                                    : "bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200"
                                                }`}
                                        >
                                            🇸🇦 عربي
                                        </button>
                                        <button
                                            onClick={() => { setLang("en"); setActiveIndex(null); }}
                                            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${lang === "en"
                                                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                                                    : "bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200"
                                                }`}
                                        >
                                            🇺🇸 English
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { type: "heading", icon: "📰", label: "Heading" },
                                            { type: "paragraph", icon: "📄", label: "Paragraph" },
                                            { type: "list", icon: "📝", label: "List" },
                                            { type: "image", icon: "🖼️", label: "Image" },
                                            { type: "video", icon: "🎬", label: "Video" }
                                        ].map(({ type, icon, label }) => (
                                            <button
                                                key={type}
                                                onClick={() => addBlock(type as Block["type"])}
                                                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md"
                                            >
                                                <span>{icon}</span>
                                                <span className="hidden sm:inline">{label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Blocks List */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Content Blocks ({lang.toUpperCase()})</h3>

                                        {content[lang].length === 0 && (
                                            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center">
                                                <div className="text-6xl mb-4">📝</div>
                                                <p className="text-gray-500 text-lg mb-2">No blocks yet</p>
                                                <p className="text-gray-400">Add your first block using the toolbar above</p>
                                            </div>
                                        )}

                                        {content[lang].map((b, idx) => (
                                            <div key={idx} className={`bg-white rounded-2xl border-2 shadow-lg transition-all duration-200 ${activeIndex === idx
                                                    ? "border-blue-500 ring-4 ring-blue-100"
                                                    : "border-gray-200 hover:border-gray-300 hover:shadow-xl"
                                                }`}>
                                                <div className="p-4">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`px-3 py-1 rounded-lg text-sm font-medium ${b.type === "heading" ? "bg-purple-100 text-purple-700" :
                                                                    b.type === "paragraph" ? "bg-blue-100 text-blue-700" :
                                                                        b.type === "list" ? "bg-green-100 text-green-700" :
                                                                            b.type === "image" ? "bg-orange-100 text-orange-700" :
                                                                                "bg-red-100 text-red-700"
                                                                }`}>
                                                                {b.type.toUpperCase()}
                                                            </div>
                                                            <span className="text-sm text-gray-500">#{idx + 1}</span>
                                                        </div>

                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={() => moveBlock(idx, -1)}
                                                                disabled={idx === 0}
                                                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                            >
                                                                ⬆️
                                                            </button>
                                                            <button
                                                                onClick={() => moveBlock(idx, 1)}
                                                                disabled={idx === content[lang].length - 1}
                                                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                            >
                                                                ⬇️
                                                            </button>
                                                            <button
                                                                onClick={() => removeBlock(idx)}
                                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Preview */}
                                                    <div className="text-sm text-gray-600 mb-3 max-h-20 overflow-hidden">
                                                        {b.type === "paragraph" || b.type === "heading" ? (
                                                            <div dangerouslySetInnerHTML={{ __html: (b as any).data.html || "<em>Empty...</em>" }} />
                                                        ) : b.type === "list" ? (
                                                            (b as ListBlock).data.style === "ul" ? (
                                                                <ul className="list-disc pl-5">{(b as ListBlock).data.items.slice(0, 3).map((it, i) => <li key={i}>{it}</li>)}</ul>
                                                            ) : (
                                                                <ol className="list-decimal pl-5">{(b as ListBlock).data.items.slice(0, 3).map((it, i) => <li key={i}>{it}</li>)}</ol>
                                                            )
                                                        ) : b.type === "image" ? (
                                                            <div className="text-gray-400">🖼️ {(b as ImageBlock).data.url || "No image URL"}</div>
                                                        ) : (
                                                            <div className="text-gray-400">🎥 {(b as VideoBlock).data.url || "No video URL"}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}


                                    </div>
                                </div>

                            </div>
                        )}
          </div>
                </div>
            </div>
        </div>


    );
}