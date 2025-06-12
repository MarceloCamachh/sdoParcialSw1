import { useState } from "react";
import { uploadScketch } from "../services/designService";



export default function SketchModal({ isOpen, onClose, onGenerate }: any) {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const handleFileChange = (e: any) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    // Aquí puedes manejar la lógica para procesar el archivo
    // Por ejemplo, crear un FormData y enviarlo
    const formData = new FormData();
    formData.append('sketch', file);
    const response = await uploadScketch(formData);
    console.log(response);
    localStorage.setItem("sketch", JSON.stringify(response));
    // Llamar a onGenerate con el archivo o los datos procesados
    setIsLoading(false);
    onClose();
    onGenerate("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow max-w-lg w-full">
        <h2 className="text-lg font-bold mb-4">📁 Subir boceto</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full p-3 border rounded"
              accept="image/*" // Ajusta los tipos de archivo según tus necesidades
            />
          </div>
          <div className="flex justify-end gap-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className={`px-4 py-2 ${!isLoading? "bg-indigo-600" : "bg-indigo-300"} text-white rounded`}
              disabled={!file || isLoading}
            >
              Subir
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}