import JSZip from "jszip";
import { saveAs } from "file-saver";
import { generateFlutterMainFromGemini } from "../services/prompt/generateFlutterMain";

export async function exportFlutterProject(roomId: string, title: string) {
  console.log("🔄 Iniciando exportación Flutter...");

  const html = localStorage.getItem(`gjs-html-${roomId}`) || "<p>No hay diseño</p>";
  const css = localStorage.getItem(`gjs-css-${roomId}`) || "";
  console.log("✅ HTML y CSS recuperados desde localStorage");

  const mainDart = await generateFlutterMainFromGemini(roomId, title);
  console.log("✅ Código main.dart generado con Gemini");

  const zipUrl = "/template/flutter-template.zip";
  console.log("📦 Cargando template desde:", zipUrl);

  const response = await fetch(zipUrl);
  if (!response.ok) {
    console.warn("❌ No se pudo cargar el ZIP del template.");
    return;
  }

  const blob = await response.blob();
  const templateZip = await JSZip.loadAsync(blob);
  console.log("✅ Template cargado y descomprimido");

  // Verifica si lib/main.dart existe antes de sobrescribir
  if (!templateZip.file("lib/main.dart")) {
    console.warn("⚠️ Archivo lib/main.dart no encontrado en el ZIP base. Se creará uno nuevo.");
  } else {
    console.log("📄 lib/main.dart encontrado. Será reemplazado.");
  }

  templateZip.file("lib/main.dart", mainDart);

  const outputBlob = await templateZip.generateAsync({ type: "blob" });
  console.log("✅ Proyecto generado, iniciando descarga...");

  saveAs(outputBlob, "flutter_project.zip");
  console.log("📥 ¡Descarga iniciada!");
}
