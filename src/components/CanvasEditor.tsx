import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDesignById, updateDesign, Design } from "../services/designService";
import GrapesEditor from "./GrapesEditor"; // asegúrate de que exporte el editor que acepta roomId
import { socket } from "../socket";

export default function CanvasEditor() {
  const params = useParams<{ roomId?: string }>();
  const roomId = params.roomId;
  const [currentDesign, setCurrentDesign] = useState<Design | null>(null);

  if (!roomId) {
    return <div className="text-red-500 text-center mt-10">❌ Room ID inválido</div>;
  }

  const handleSave = async () => {
    if (!currentDesign) return alert("⚠️ No hay diseño para guardar");

    const html = localStorage.getItem(`gjs-html-${roomId}`);
const css = localStorage.getItem(`gjs-css-${roomId}`) || "";


    const updated = await updateDesign(currentDesign.id, {
      data: {
        html,
        css,
      },
    });

    setCurrentDesign(updated);
    alert("✅ Diseño actualizado");
  };

  useEffect(() => {
    const fetchDesign = async () => {
      const design = await getDesignById(roomId);
      setCurrentDesign(design);

     if (design?.data?.html && !localStorage.getItem(`gjs-html-${roomId}`)) {
  localStorage.setItem(`gjs-html-${roomId}`, design.data.html);
  localStorage.setItem(`gjs-css-${roomId}`, design.data.css || "");
}



      socket.emit("join", roomId);
      console.log("🧩 Joined room:", roomId);
    };

    fetchDesign();
  }, [roomId]);

  return (
    <>
      <Navbar />
      <div className="flex w-full h-[calc(100vh-3.5rem)] bg-gray-100 relative">
        <GrapesEditor roomId={roomId} />

        {/* Botones flotantes */}
       <div
  id="custom-buttons"
  className="fixed top-[56px] left-[150px] z-50 flex gap-2"
>

  <button
    onClick={handleSave}
    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
  >
    💾 Guardar diseño
  </button>
  <button
    onClick={() => {
      navigator.clipboard.writeText(roomId);
      alert("📋 ID copiado al portapapeles: " + roomId);
    }}
    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
  >
    🔗 Compartir ID
  </button>
</div>
      </div>
    </>
  );
}
