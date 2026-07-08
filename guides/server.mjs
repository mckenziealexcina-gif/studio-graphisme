// Serveur « Assistant guides » — zéro dépendance de plus (http natif de node).
//   node guides/server.mjs        → http://127.0.0.1:3005
// Routes : GET / (UI) · POST /api/guide/chat · POST /api/guide/canva
import http from "node:http";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderDocumentToHTML } from "./designSystem.mjs";
import { renderPDF } from "./render.mjs";
import { runAgentTurn } from "./agent.mjs";
import { EMPTY_DOC } from "./schema.mjs";
import { exportToCanva } from "./canva.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.GUIDES_PORT || 3005);

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let d = "";
    req.on("data", (c) => (d += c));
    req.on("end", () => resolve(d));
    req.on("error", reject);
  });
const sendJSON = (res, code, obj) => {
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(obj));
};

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
      const html = readFileSync(join(HERE, "web", "index.html"));
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
      return;
    }

    if (req.method === "POST" && req.url === "/api/guide/chat") {
      const { messages = [], doc } = JSON.parse((await readBody(req)) || "{}");
      const { reply, doc: nextDoc } = await runAgentTurn(messages, doc ?? EMPTY_DOC);
      const html = renderDocumentToHTML(nextDoc);
      const pdf = await renderPDF(html, nextDoc.meta.docLabel, nextDoc.meta.footerNumbers);
      sendJSON(res, 200, { reply, doc: nextDoc, pdfBase64: pdf.toString("base64") });
      return;
    }

    if (req.method === "POST" && req.url === "/api/guide/canva") {
      const { pdfBase64, title } = JSON.parse((await readBody(req)) || "{}");
      if (!pdfBase64) return sendJSON(res, 400, { error: "Aucun PDF à exporter." });
      const out = await exportToCanva(Buffer.from(pdfBase64, "base64"), title || "Guide — Vape Société");
      sendJSON(res, 200, { ok: true, ...out });
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  } catch (e) {
    console.error("✗", e);
    sendJSON(res, 500, { error: String(e?.message || e) });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`\n✓ Assistant guides → http://127.0.0.1:${PORT}`);
  console.log(`  chat: POST /api/guide/chat  ·  export: POST /api/guide/canva`);
  console.log(`  modèle: ${process.env.ANTHROPIC_MODEL || "claude-opus-4-8"}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log(`  ⚠ ANTHROPIC_API_KEY absente — le chat renverra une erreur tant qu'elle n'est pas définie.`);
  }
});
