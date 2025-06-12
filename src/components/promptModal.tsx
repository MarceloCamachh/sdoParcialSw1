import { useState,useEffect, useRef } from "react";
import { generateUIFromPrompt } from "../services/prompt/promptServices";

export default function PromptModal({ isOpen, onClose, onGenerate }: any) {
  const [prompt, setPrompt] = useState("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  // Setup reconocimiento de voz
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "es-ES"; // Puedes cambiar a "en-US" si prefieres inglés
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setPrompt(prev => prev + " " + transcript);
        setListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event);
        setListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      console.warn("Este navegador no soporta reconocimiento de voz.");
    }
  }, []);

  const handleStartListening = () => {
    if (recognitionRef.current) {
      setListening(true);
      recognitionRef.current.start();
    }
  };
  
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
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={handleStartListening}
            disabled={listening}
            className={`px-4 py-2 rounded ${listening ? "bg-gray-400" : "bg-rose-500 hover:bg-rose-600"} text-white transition`}
          >
            {listening ? "🎧 Escuchando..." : "🎤 Hablar"}
          </button>
          <small className="text-gray-500">Usa tu voz para generar el diseño</small>
        </div>
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
