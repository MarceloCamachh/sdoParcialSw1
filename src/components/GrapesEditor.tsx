import React, { useEffect, useRef, useState } from "react";
import grapesjs from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";
import preset from "grapesjs-preset-webpage";
import { socket } from "../socket";

export default function GrapesEditor({ roomId }: { roomId: string }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstance = useRef<any>(null);
  const isRemoteChange = useRef(false); // ✅ FLAG para evitar loop
  const [isEditorReady, setIsEditorReady] = useState(false); // ✅ asegura que el editor está montado
  const sketch = localStorage.getItem("sketch");

  useEffect(() => {
    if (!editorRef.current) return;

    const editor = grapesjs.init({
      container: editorRef.current,
      height: "100vh",
      storageManager: false,
      plugins: [preset],
      pluginsOpts: { "gjs-preset-webpage": {} },
    });

    editorInstance.current = editor;

    // Cargar diseño local si existe
    const html = localStorage.getItem(`gjs-html-${roomId}`);
    const css = localStorage.getItem(`gjs-css-${roomId}`) || "";

    if (html || css) {
     isRemoteChange.current = true;
    editor.setComponents(html || "");
    setTimeout(() => {
      editor.setStyle(css || "");
      isRemoteChange.current = false;
    }, 0);
    }


    // Emitir cambios locales por socket
   const emitUpdate = () => {
    if (isRemoteChange.current) return; // ✅ bloquea si viene de socket

  const html = editor.getHtml();
  const css = editor.getCss() || ""; // nunca puede ser undefined

  localStorage.setItem(`gjs-html-${roomId}`, html);
  localStorage.setItem(`gjs-css-${roomId}`, css);

  socket.emit("element:update", {
    roomId,
    frame: { html, css },
  });
};

   editor.once("load", () => {
  if (html || css) {
    isRemoteChange.current = true;
    editor.setComponents(html || "");
    editor.setStyle(css || "");
    isRemoteChange.current = false;
  }

  // Agrega listeners después de que esté cargado
  editor.on("component:add", emitUpdate);
  editor.on("component:update", emitUpdate);
  console.log("CSS cargado desde localStorage:", css);

});
  if(sketch){
    const objGrapes = JSON.parse(sketch);
    editor.setComponents(objGrapes.objHtml);
    editor.setStyle(objGrapes.objCss);
  }

    // Bloques personalizados
    const bm = editor.BlockManager;

    bm.add("navbar", {
      label: "Navbar",
      category: "Layout",
      attributes: { class: "fa fa-bars" },
      content: `
        <nav style="background: #333; color: white; padding: 10px; display: flex; justify-content: space-between; align-items: center;">
          <div style="font-weight: bold;">MiLogo</div>
          <div>
            <a href="#" style="color: white; margin: 0 10px; text-decoration: none;">Inicio</a>
            <a href="#" style="color: white; margin: 0 10px; text-decoration: none;">Nosotros</a>
            <a href="#" style="color: white; margin: 0 10px; text-decoration: none;">Contacto</a>
          </div>
        </nav>
      `,
    });

    bm.add("1-column", {
      label: "1 Column",
      category: "Layout",
      attributes: { class: "fa fa-square-o" },
      content: '<div style="padding:20px; border: 1px solid #ddd;">1 Column Layout</div>',
    });

    bm.add("2-columns", {
      label: "2 Columns",
      category: "Layout",
      attributes: { class: "fa fa-columns" },
      content: `<div style="display:flex; gap:10px;">
                  <div style="flex:1; border:1px solid #ddd; padding:10px;">Column 1</div>
                  <div style="flex:1; border:1px solid #ddd; padding:10px;">Column 2</div>
                </div>`,
    });

    bm.add("button", {
      label: "Button",
      category: "Basic",
      attributes: { class: "fa fa-hand-pointer-o" },
      content: '<button style="padding:10px 15px; background:#007bff; color:white; border:none; border-radius:3px;">Click me</button>',
    });

    bm.add("image", {
      label: "Image",
      category: "Basic",
      attributes: { class: "fa fa-image" },
      content: '<img src="https://placehold.co/150x100" alt="Image" style="max-width:100%"/>',
    });

    bm.add("input", {
      label: "Input",
      category: "Form",
      attributes: { class: "fa fa-i-cursor" },
      content: '<input type="text" placeholder="Enter text" style="padding: 8px; width: 100%;"/>',
    });

    bm.add("table", {
      label: "Table",
      category: "Basic",
      attributes: { class: "fa fa-table" },
      content: `
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
          <tr>
            <th style="border:1px solid #ddd; padding:8px;">Header 1</th>
            <th style="border:1px solid #ddd; padding:8px;">Header 2</th>
          </tr>
          <tr>
            <td style="border:1px solid #ddd; padding:8px;">Cell 1</td>
            <td style="border:1px solid #ddd; padding:8px;">Cell 2</td>
          </tr>
        </table>
      `,
    });

    bm.add("mi-bloque", {
      label: "Mi bloque",
      category: "Basic",
      attributes: { class: "fa fa-cube" },
      content: '<div style="padding:20px; background: #f0f0f0;">¡Hola mundo!</div>',
    });
    setIsEditorReady(true); // ✅ marcamos que el editor ya está listo

    return () => editor.destroy();
  }, [roomId]);

  // 🔁 Listener de sockets para recibir diseño en tiempo real
useEffect(() => {
  const editor = editorInstance.current;
  if (!editor) return;

  const handleUpdate = ({ frame }: any) => {
    if (!frame?.html) return;

    const currentHtml = editor.getHtml();
    const currentCss = editor.getCss();

    const isSameHtml = currentHtml.trim() === frame.html.trim();
    const isSameCss = (currentCss || "").trim() === (frame.css || "").trim();

    if (isSameHtml && isSameCss) return;

    isRemoteChange.current = true;
    editor.setComponents(frame.html || "");
    editor.setStyle(frame.css || "");
    isRemoteChange.current = false;

    console.log("🔄 Diseño recibido desde socket");
  };

  //socket.on("element:update", handleUpdate);

  return () => {
    socket.off("element:update", handleUpdate); // ✅ correcto
  };
}, [roomId]);




  return <div ref={editorRef} style={{ flex: 1 }} />;
}
