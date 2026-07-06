#!/usr/bin/env node
/**
 * Pousse une affiche rendue localement vers Canva (bibliothèque + design éditable).
 *
 *   node canva/push.mjs output/vape-societe-promo.png --title "Promo été — Vape Société"
 *   node canva/push.mjs output/vape-societe-promo.png --title "Promo" --design
 *
 * Sans --design : téléverse juste l'image dans ta bibliothèque Canva (tu la déposes où tu veux).
 * Avec --design  : crée en plus un design Canva à partir de l'image (ouvrable/éditable dans Canva).
 */
import { uploadAsset, createDesign } from "./canva.mjs";

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const title = (() => { const i = args.indexOf("--title"); return i >= 0 ? args[i + 1] : undefined; })();
const makeDesign = args.includes("--design");

if (!file) { console.error("Usage: node canva/push.mjs <fichier> [--title \"...\"] [--design]"); process.exit(1); }

console.log(`→ Téléversement de ${file} vers Canva…`);
const asset = await uploadAsset(file, title);
console.log(`✓ Asset créé dans ta bibliothèque Canva : ${asset.id}  (${asset.name})`);

if (makeDesign) {
  const design = await createDesign({ assetId: asset.id, title: title || asset.name });
  const url = design.design?.urls?.edit_url ?? design.design?.url ?? design.urls?.edit_url;
  console.log(`✓ Design Canva créé : ${design.design?.id ?? design.id}`);
  if (url) console.log(`  Éditer dans Canva : ${url}`);
}
console.log("\nOuvre Canva → l'image est dans « Téléchargements / Uploads » de ta bibliothèque.");
