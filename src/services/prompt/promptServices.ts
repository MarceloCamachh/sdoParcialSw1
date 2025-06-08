export async function generateUIFromPrompt(prompt: string) {
   const template = await fetch("/prompts/promptTemplate.txt").then(res => res.text());

   const finalPrompt = template.replace("{{user_prompt}}", prompt);

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
            parts: [{ text: finalPrompt }],
          },
        ],
      }),
    }
  );

  const data = await response.json();

  return (
    data?.candidates?.[0]?.content?.parts?.[0]?.text ??
    "⚠️ No se generó contenido. Revisa tu prompt o clave."
  );
}
