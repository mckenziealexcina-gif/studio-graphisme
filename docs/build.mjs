// Build du site : injecte les polices base64 dans app.src.html -> index.html (autonome).
//   node docs/build.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(HERE, "app.src.html"), "utf8");
const fonts = readFileSync(join(HERE, "fonts-embedded.css"), "utf8");
const out = src.replace("/*FONTS_HERE*/", () => fonts);
writeFileSync(join(HERE, "index.html"), out);
console.log(`✓ docs/index.html généré (${Math.round(Buffer.byteLength(out) / 1024)} Ko)`);
