#!/usr/bin/env node
/**
 * Harness de rendu — Studio Graphisme
 * HTML/CSS/SVG  ->  PNG haute densite (4x par defaut)  +  PDF vectoriel print-ready.
 *
 * Le rendu se fait via Chromium (Google Chrome installe) : vraie typo variable,
 * degrades, blend modes, grain SVG, backdrop-filter — tout le CSS moderne.
 *
 * Usage:
 *   node render/render.mjs <fichier.html> [options]
 *
 * Options:
 *   --name <slug>     nom de sortie (defaut: nom du fichier html)
 *   --scale <n>       densite de pixels du PNG (defaut: 4  ~ qualite impression)
 *   --out <dir>       dossier de sortie (defaut: output/)
 *   --no-pdf          ne pas generer le PDF
 *   --no-png          ne pas generer le PNG
 *   --sharpen         passe de nettete legere sur le PNG (sharp)
 *   --jpg <q>         exporte aussi un JPG qualite q (ex: --jpg 92) pour le web/reseaux
 *
 * Le gabarit doit contenir un element racine `.poster` (dimension physique en CSS).
 * Le PNG capture exactement cet element ; le PDF prend sa taille physique.
 */
import { chromium } from "playwright-core";
import sharp from "sharp";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve, basename, extname, join } from "node:path";
import { mkdirSync, existsSync, statSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

function parseArgs(argv) {
  const a = { scale: 4, out: join(ROOT, "output"), pdf: true, png: true, sharpen: false, jpg: null };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t === "--name") a.name = argv[++i];
    else if (t === "--scale") a.scale = Number(argv[++i]);
    else if (t === "--out") a.out = resolve(argv[++i]);
    else if (t === "--no-pdf") a.pdf = false;
    else if (t === "--no-png") a.png = false;
    else if (t === "--sharpen") a.sharpen = true;
    else if (t === "--jpg") a.jpg = Number(argv[++i]);
    else rest.push(t);
  }
  a.html = rest[0];
  return a;
}

async function main() {
  const opt = parseArgs(process.argv.slice(2));
  if (!opt.html) {
    console.error("Usage: node render/render.mjs <fichier.html> [--name slug] [--scale 4] [--jpg 92] [--sharpen]");
    process.exit(1);
  }
  const htmlPath = resolve(opt.html);
  if (!existsSync(htmlPath)) { console.error(`Introuvable: ${htmlPath}`); process.exit(1); }
  const name = opt.name || basename(htmlPath, extname(htmlPath));
  mkdirSync(opt.out, { recursive: true });

  const t0 = Date.now();
  let browser;
  try {
    browser = await chromium.launch({ channel: "chrome", args: ["--force-color-profile=srgb", "--disable-lcd-text"] });
  } catch (e) {
    console.error("⚠ Chrome introuvable pour Playwright. Installe Chromium bundle avec:\n   npx playwright install chromium\n(puis retire channel:'chrome' dans render.mjs)\n");
    throw e;
  }
  const page = await browser.newPage({ deviceScaleFactor: opt.scale });

  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle" });
  // Attendre que toutes les polices soient pretes (evite le FOUT dans la capture).
  await page.evaluate(async () => { if (document.fonts && document.fonts.ready) await document.fonts.ready; });
  await page.waitForTimeout(150);

  const poster = await page.$(".poster");
  if (!poster) { console.error("Le gabarit doit contenir un element racine .poster"); await browser.close(); process.exit(1); }

  // Dimensions physiques (px CSS @96dpi) pour le PDF.
  const box = await poster.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { w: r.width, h: r.height };
  });

  const results = [];
  const pngPath = join(opt.out, `${name}.png`);

  if (opt.png) {
    let buf = await poster.screenshot({ type: "png" });
    if (opt.sharpen) {
      buf = await sharp(buf).sharpen({ sigma: 0.6 }).png({ compressionLevel: 9 }).toBuffer();
    }
    const { writeFileSync } = await import("node:fs");
    writeFileSync(pngPath, buf);
    results.push(pngPath);
    if (opt.jpg) {
      const jpgPath = join(opt.out, `${name}.jpg`);
      await sharp(buf).flatten({ background: "#ffffff" }).jpeg({ quality: opt.jpg, mozjpeg: true }).toFile(jpgPath);
      results.push(jpgPath);
    }
  }

  if (opt.pdf) {
    const pdfPath = join(opt.out, `${name}.pdf`);
    // Isoler le .poster pour un PDF exactement a sa taille physique, texte vectoriel selectionnable.
    await page.emulateMedia({ media: "screen" });
    await page.addStyleTag({ content: `@page{ size:${box.w}px ${box.h}px; margin:0 } html,body{margin:0!important;padding:0!important;background:#fff!important} body>*:not(.poster){display:none!important}` });
    await page.pdf({
      path: pdfPath,
      width: `${box.w}px`,
      height: `${box.h}px`,
      printBackground: true,
      preferCSSPageSize: true,
      scale: 1,
    });
    results.push(pdfPath);
  }

  await browser.close();

  const dt = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n✓ Rendu "${name}" en ${dt}s  (canvas ${Math.round(box.w)}×${Math.round(box.h)} px @${opt.scale}x)`);
  for (const p of results) {
    const kb = Math.round(statSync(p).size / 1024);
    console.log(`   → ${p.replace(ROOT + "/", "")}  (${kb} Ko)`);
  }
  if (errors.length) {
    console.log(`\n⚠ ${errors.length} message(s) console/erreur pendant le rendu:`);
    for (const e of errors.slice(0, 5)) console.log("   " + e);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
