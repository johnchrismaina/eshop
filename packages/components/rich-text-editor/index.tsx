import React, { useEffect, useRef, useState } from 'react';
import 'react-quill-new/dist/quill.snow.css';
import ReactQuill from 'react-quill-new';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  id?: string; // ✅ allow optional id
  className?: string; // ✅ allow optional className
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  id,
  className,
}) => {
  const [editorValue, setEditorValue] = useState(value || '');
  const quillRef = useRef(false);

  useEffect(() => {
    if (!quillRef.current) {
      quillRef.current = true;

      // 🔥 Fix: Ensure only one toolbar is present per editor
      setTimeout(() => {
        const container = id
          ? document.querySelector(`#${id} .ql-toolbar`)
          : null;

        // If id is provided, only clean toolbars inside that editor
        if (!container) {
          document.querySelectorAll('.ql-toolbar').forEach((toolbar, index) => {
            if (index > 0) toolbar.remove();
          });
        }
      }, 100);
    }
  }, [id]);

  return (
    <div id={id} className={`relative ${className || ''}`}>
      <ReactQuill
        theme="snow"
        value={editorValue}
        onChange={(content) => {
          setEditorValue(content);
          onChange(content);
        }}
        modules={{
          toolbar: [
            [{ font: [] }],
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ size: ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ color: [] }, { background: [] }],
            [{ script: 'sub' }, { script: 'super' }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ indent: '-1' }, { indent: '+1' }],
            [{ align: [] }],
            ['blockquote', 'code-block'],
            ['link', 'image', 'video'],
            ['clean'],
          ],
        }}
        placeholder="Write a detailed product description here..."
        className="bg-transparent border border-gray-700 text-gray-700 rounded-md"
        style={{ minHeight: '250px' }}
      />
      {/* Custom styling */}
      <style>{`
        .ql-toolbar {
          background: transparent;
          border-color: #444;
        }
        .ql-container {
          background: transparent !important;
          border-color: #444;
          color: #374151;
        }
        .ql-editor {
          min-height: 200px;
          font-size: 14px;   /* 👈 increase font size */
          line-height: 1.6;  /* 👈 optional for spacing */
        }
        .ql-picker {
          color: #374151 !important;
        }
        .ql-editor {
          min-height: 200px;
        }
        .ql-snow {
          border-color: #444 !important;
        }
        .ql-editor.ql-blank::before {
          color: #aaa !important;
        }
        .ql-picker-options {
          background: #E2E8F0 !important;
          color: #374151 !important;
        }
        .ql-picker-item {
          color: #374151 !important;
        }
        .ql-stroke {
          stroke: #374151 !important;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
