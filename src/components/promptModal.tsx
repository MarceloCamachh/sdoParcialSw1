import { useState } from "react";
import { generateUIFromPrompt } from "../services/prompt/promptServices";

export default function PromptModal({ isOpen, onClose, onGenerate }: any) {
  const [prompt, setPrompt] = useState("");

  const handleGenerate = async () => {
    const code = await generateUIFromPrompt(prompt);
    onGenerate(code);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow max-w-lg w-full">
        <h2 className="text-lg font-bold mb-4">🧠 Generar interfaz desde prompt</h2>
        <textarea
          className="w-full p-3 border rounded mb-4"
          rows={5}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ej. Diseña una pantalla con una navbar, una sección de testimonios y un botón de contacto..."
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
            Cancelar
          </button>
          <button onClick={handleGenerate} className="px-4 py-2 bg-indigo-600 text-white rounded">
            Generar
          </button>
        </div>
      </div>
    </div>
  );
}
