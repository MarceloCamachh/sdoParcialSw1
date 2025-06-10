export async function generateFlutterMainFromGemini(roomId: string, title: string): Promise<string> {
  const html = localStorage.getItem(`gjs-html-${roomId}`) || "<p>No hay diseño</p>";
  const css = localStorage.getItem(`gjs-css-${roomId}`) || "";

  const prompt = `
Convierte el siguiente diseño HTML + CSS en código Flutter dentro de un archivo main.dart ejecutable.

- Usa widgets comunes como Text, ElevatedButton, TextField, etc.
- Aplica estilos cuando sea posible.
- Usa MaterialApp y Scaffold.
- El título de la App debe ser: "${title}"
- No expliques nada, responde solo con el contenido completo de main.dart

HTML:
${html}

CSS:
${css}
`.trim();

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    }
  );

  const raw = response?.ok
    ? (await response.json())?.candidates?.[0]?.content?.parts?.[0]?.text ?? ""
    : "";

  const cleaned = raw
    .replace(/```dart\s*/g, "")
    .replace(/```/g, "")
    .trim();

  return cleaned || "// ⚠️ No se generó contenido válido.";
}
