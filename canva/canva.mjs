#!/usr/bin/env node
/**
 * Canva Connect — helpers API (importables).
 * Base: https://api.canva.com/rest/v1
 *   uploadAsset(path, name)   POST /asset-uploads  → poll GET /asset-uploads/{id}
 *   createDesign({...})       POST /designs
 *   exportDesign(id, fmt)     POST /exports        → poll GET /exports/{id}
 */
import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { getValidAccessToken } from "./connect.mjs";

const BASE = "https://api.canva.com/rest/v1";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(path, { method = "GET", headers = {}, body } = {}) {
  const token = await getValidAccessToken();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...headers },
    body,
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(`Canva ${method} ${path} → ${res.status}: ${text}`);
  return json;
}

/** Téléverse un fichier local (png/jpg/pdf…) dans la bibliothèque Canva. Renvoie l'asset. */
export async function uploadAsset(filePath, name) {
  const bytes = readFileSync(filePath);
  const assetName = name || basename(filePath);
  const meta = JSON.stringify({ name_base64: Buffer.from(assetName).toString("base64") });
  let job = await api("/asset-uploads", {
    method: "POST",
    headers: { "Content-Type": "application/octet-stream", "Asset-Upload-Metadata": meta },
    body: bytes,
  });
  const jobId = job.job?.id ?? job.id;
  for (let i = 0; i < 30; i++) {
    const status = job.job?.status ?? job.status;
    if (status === "success") return (job.job ?? job).asset;
    if (status === "failed") throw new Error(`Upload échoué: ${JSON.stringify(job)}`);
    await sleep(1000);
    job = await api(`/asset-uploads/${jobId}`);
  }
  throw new Error("Upload: timeout de polling");
}

/** Crée un design Canva. Passe { asset_id } pour partir d'une image téléversée. */
export async function createDesign({ assetId, title, designType } = {}) {
  const body = {};
  if (assetId) body.asset_id = assetId;
  if (title) body.title = title;
  if (designType) body.design_type = designType; // ex: {type:'preset', name:'instagram_post'}
  return api("/designs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}

/** Exporte un design existant. format: 'png' | 'jpg' | 'pdf'. Renvoie les URLs. */
export async function exportDesign(designId, format = "png") {
  let job = await api("/exports", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ design_id: designId, format: { type: format } }),
  });
  const id = job.job?.id ?? job.id;
  for (let i = 0; i < 40; i++) {
    const status = job.job?.status ?? job.status;
    if (status === "success") return (job.job ?? job).urls ?? job;
    if (status === "failed") throw new Error(`Export échoué: ${JSON.stringify(job)}`);
    await sleep(1500);
    job = await api(`/exports/${id}`);
  }
  throw new Error("Export: timeout de polling");
}
