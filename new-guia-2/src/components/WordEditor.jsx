import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Document from '@tiptap/extension-document';
import { useRef, useState } from 'react';
import mammoth from 'mammoth';
import CustomImage from './CustomImage';

const WordEditor = () => {
  const [showImageOptions, setShowImageOptions] = useState(false);
  const fileInputRef = useRef(null);
  const wordInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      Document.extend({
        content: 'block+',
      }),
      StarterKit,
      CustomImage, // só esse que lida com imagens
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: '',
    editorProps: {
    handlePaste(view, event) {
      const clipboardData = event.clipboardData;
      if (!clipboardData) return false;

      const html = clipboardData.getData('text/html');
      const items = clipboardData.items;

      if (html) {
        const container = document.createElement('div');
        container.innerHTML = html;

        const imgTags = container.querySelectorAll('img');
        let pastedSomething = false;

        for (let i = 0; i < imgTags.length; i++) {
          const img = imgTags[i];
          const src = img.getAttribute('src');

          if (src && src.startsWith('file:///')) {
            for (let j = 0; j < items.length; j++) {
              const item = items[j];
              if (item.kind === 'file' && item.type.startsWith('image/')) {
                const blob = item.getAsFile();
                const url = URL.createObjectURL(blob);

                const node = view.state.schema.nodes.image.create({ src: url });
                const tr = view.state.tr.replaceSelectionWith(node);
                view.dispatch(tr);

                setTimeout(() => URL.revokeObjectURL(url), 10000);
                pastedSomething = true;
                break;
              }
            }
          } else if (src && (src.startsWith('http') || src.startsWith('data:image'))) {
            const node = view.state.schema.nodes.image.create({ src });
            const tr = view.state.tr.replaceSelectionWith(node);
            view.dispatch(tr);
            pastedSomething = true;
          }
        }

        if (pastedSomething) {
          event.preventDefault();
          return true;
        }
      }

      return false;
    },
    },
  });

  if (!editor) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file && editor) {
      const reader = new FileReader();
      reader.onload = () => {
        editor.chain().focus().setImage({ src: reader.result }).run();
      };
      reader.readAsDataURL(file);
    }
    setShowImageOptions(false);
  };

  const handleImageFromUrl = () => {
    const url = prompt('URL da imagem:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
    setShowImageOptions(false);
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const importWord = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (file && file.name.endsWith('.docx')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const { value: html } = await mammoth.convertToHtml({
          arrayBuffer,
          convertImage: mammoth.images.inline(element => 
            element.read("base64").then(imageBuffer => ({
              src: `data:${element.contentType};base64,${imageBuffer}`
            }))
          ),
        });
        console.log(html)

        editor.commands.setContent(html);
      } catch (error) {
        alert('Erro ao importar arquivo Word.');
        console.error(error);
      }
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4">
      {/* Toolbar */}
      <div className="relative inline-block">
        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => editor.chain().focus().toggleBold().run()} className="btn">
            Negrito
          </button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()} className="btn">
            Itálico
          </button>
          <button onClick={() => editor.chain().focus().toggleBulletList().run()} className="btn">
            Lista
          </button>
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="btn">
            Título
          </button>
          <button onClick={() => setShowImageOptions(!showImageOptions)} className="btn">
            Imagem
          </button>
          <button onClick={addTable} className="btn">
            Tabela
          </button>
          <button onClick={() => wordInputRef.current && wordInputRef.current.click()} className="btn">
            Importar Word
          </button>
        </div>

        {showImageOptions && (
          <div className="absolute z-10 mt-1 bg-white border border-gray-300 rounded shadow p-2 space-y-2 w-48">
            <button
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="block w-full text-left px-3 py-1 hover:bg-gray-100 rounded"
            >
              Upload do computador
            </button>
            <button
              onClick={handleImageFromUrl}
              className="block w-full text-left px-3 py-1 hover:bg-gray-100 rounded"
            >
              Inserir via URL
            </button>
          </div>
        )}
      </div>

      {/* Editor area */}
      <div className="bg-gray-100 rounded-lg shadow border border-gray-300 min-h-[700px] max-h-[85vh] overflow-auto p-4 cursor-text">
        <EditorContent editor={editor} className="outline-none min-h-[600px]" />
      </div>

      {/* Hidden inputs */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleImageUpload}
      />
      <input
        type="file"
        accept=".docx"
        ref={wordInputRef}
        className="hidden"
        onChange={importWord}
      />
    </div>
  );
};

export default WordEditor;