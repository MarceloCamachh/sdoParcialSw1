export function extraerHTML(texto: string): string {
  const htmlMatch = texto.match(/<html[\s\S]*?<\/html>/i);
  if (htmlMatch) return htmlMatch[0];

  // fallback: busca cualquier bloque de código HTML
  const divMatch = texto.match(/<div[\s\S]*?>[\s\S]*?<\/div>/i);
  if (divMatch) return divMatch[0];

  return "";
}

export function extraerCSS(texto: string): string {
  const cssMatch = texto.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  if (cssMatch) return cssMatch[1].trim();

  // fallback: intenta extraer bloques de CSS si viene sin etiqueta <style>
  const soloCss = texto.match(/([a-zA-Z0-9\.\#][^{]+{[^}]+})/g);
  if (soloCss) return soloCss.join("\n");

  return "";
}