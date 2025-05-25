import saveAs from "file-saver";
import JSZip from "jszip";
import { Design } from "../services/designService";
type ExtendedDesign = Design & { classNames?: string[] };

export const generateAngularProject = async (design: ExtendedDesign) => {
  const zip = new JSZip();
  const templatePath = "/angular-template";

  // 1️⃣ Copiar base del template Angular
  const templateFiles = [
    "angular.json", "package.json", "package-lock.json", "tsconfig.json",
    "tsconfig.app.json", "tsconfig.spec.json", "src/index.html",
    "src/main.ts", "src/styles.css", "src/app/app.component.ts",
    "src/app/app.component.spec.ts", "src/app/app.config.ts",
    "src/app/app.routes.ts", "src/app/app.component.css",
  ];

  await Promise.all(templateFiles.map(async (file) => {
    const response = await fetch(`${templatePath}/${file}`);
    const content = await response.text();
    zip.file(file, content);
  }));

  // 2️⃣ Generar app.component.html con elementos visuales
  const dynamicHtml = `
    <div style="position: relative; min-height: 100vh;">
      <h1>${design.title}</h1>
      ${design.data.map((el: any) => {
        const style = `
          position: absolute;
          width: ${el.width}px;
          height: ${el.height}px;
          transform: translate(${el.translate[0]}px, ${el.translate[1]}px) rotate(${el.rotate}deg);
          display: flex;
          align-items: center;
          justify-content: center;
          ${el.type === "rectangle" ? "background-color: #38bdf8;" : ""}
        `.trim();

        if (el.type === "text") return `<p style="${style}">${el.content}</p>`;
        if (el.type === "button") return `<button style="${style}">${el.content}</button>`;
        if (el.type === "input") return `<input style="${style}" placeholder="${el.content}" />`;
        if (el.type === "rectangle") return `<div style="${style}"></div>`;
        return "";
      }).join("\n")}
    </div>
  `;
  zip.file("src/app/app.component.html", dynamicHtml);

  // 3️⃣ Generar un componente Angular por clase UML
  for (const className of design.classNames || []) {
    const kebabName = className.toLowerCase().replace(/\s+/g, "-");
    const classFolder = `src/app/components/${kebabName}`;

    const html = `<p>${className} works!</p>`;
    const css = `/* estilos de ${className} */`;
    const ts = `
      import { Component } from '@angular/core';

      @Component({
        selector: 'app-${kebabName}',
        templateUrl: './${kebabName}.component.html',
        styleUrls: ['./${kebabName}.component.css'],
      })
      export class ${className}Component {}
    `.trim();

    zip.file(`${classFolder}/${kebabName}.component.ts`, ts);
    zip.file(`${classFolder}/${kebabName}.component.html`, html);
    zip.file(`${classFolder}/${kebabName}.component.css`, css);
  }

  // 4️⃣ Generar ZIP final
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "angular-project.zip");
};
