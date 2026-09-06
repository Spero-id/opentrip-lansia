"use client";

import dynamic from "next/dynamic";

const Editor = dynamic(
  () => import("@hugerte/hugerte-react").then((mod) => mod.Editor),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 border border-slate-300 rounded-lg p-4 bg-slate-50 text-slate-400 animate-pulse text-sm flex items-center justify-center">
        Memuat Text Editor...
      </div>
    ),
  }
);

interface WysiwygEditorProps {
  value: string;
  onChange: (content: string) => void;
  height?: number;
}

export default function WysiwygEditor({ value, onChange, height = 350 }: WysiwygEditorProps) {
  return (
    <Editor
      hugerteScriptSrc="/hugerte/hugerte.min.js"
      value={value}
      onEditorChange={(newContent) => onChange(newContent)}
      init={{
        height,
        menubar: false,
        plugins: [
          "advlist",
          "autolink",
          "lists",
          "link",
          "image",
          "charmap",
          "preview",
          "anchor",
          "searchreplace",
          "visualblocks",
          "code",
          "fullscreen",
          "insertdatetime",
          "media",
          "table",
          "help",
          "wordcount",
        ],
        toolbar:
          "undo redo | blocks | " +
          "bold italic forecolor | alignleft aligncenter " +
          "alignright alignjustify | bullist numlist outdent indent | " +
          "removeformat | link image table | help",
        content_style: "body { font-family: system-ui, -apple-system, sans-serif; font-size: 14px; line-height: 1.6; }",
        promotion: false,
        branding: false,
      }}
    />
  );
}
