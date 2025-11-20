import fs from "fs";
import path from "path";

import { fetchFigmaFile } from "./figma_api/figmaClient.js";
import { figmaNodeToIR } from "./parser/figmaToIR.js";
import { renderHtml } from "./renderer/convertToHTML.js";
import { renderCss } from "./renderer/convertToCss.js";

async function main() {
  try {
    const file = await fetchFigmaFile();

    const pages = file.document.children;
    const firstPage = pages[0];
    const rootFrame = firstPage.children[0];

    const irRoot = figmaNodeToIR(rootFrame, undefined, true);

    const html = renderHtml(irRoot);
    const css = renderCss(irRoot);

    const outDir = path.resolve("output");
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

    fs.writeFileSync(path.join(outDir, "index.html"), html);
    fs.writeFileSync(path.join(outDir, "styles.css"), css);

    console.log("Generated output/index.html and output/styles.css");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
