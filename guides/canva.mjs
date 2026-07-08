// Export du PDF généré vers Canva — réutilise le client Canva déjà en place.
// N'AUCUNE réécriture de l'auth : on importe uploadAsset/createDesign existants.
import { writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { uploadAsset, createDesign } from "../canva/canva.mjs";

export async function exportToCanva(pdfBuffer, title = "Guide — Vape Société") {
  const tmp = join(tmpdir(), `guide-${Date.now()}.pdf`);
  writeFileSync(tmp, pdfBuffer);
  try {
    const asset = await uploadAsset(tmp, title);
    const design = await createDesign({ assetId: asset.id, title });
    const editUrl = design.design?.urls?.edit_url ?? design.design?.url ?? design.urls?.edit_url ?? null;
    return { assetId: asset.id, designId: design.design?.id ?? design.id, editUrl };
  } finally {
    try { unlinkSync(tmp); } catch {}
  }
}
