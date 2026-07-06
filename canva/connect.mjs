#!/usr/bin/env node
/**
 * Canva Connect — connexion OAuth 2.0 (Authorization Code + PKCE S256).
 * Zéro dépendance (built-ins node). Ouvre le navigateur, capture le code
 * sur un mini-serveur local, échange contre des tokens, les stocke en local.
 *
 *   node canva/connect.mjs login     # lance la connexion (ouvre le navigateur)
 *   node canva/connect.mjs status    # affiche l'état du token
 *   node canva/connect.mjs refresh   # force un rafraîchissement
 *
 * Endpoints (verifiés — Canva Connect, base https://api.canva.com/rest/v1) :
 *   Authorize : https://www.canva.com/api/oauth/authorize
 *   Token     : https://api.canva.com/rest/v1/oauth/token  (Basic auth, form-urlencoded)
 */
import http from "node:http";
import crypto from "node:crypto";
import { execFile } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
export const TOKEN_FILE = join(HERE, ".canva-token.json");
const ENV_FILE = join(HERE, ".env");

const AUTHORIZE_URL = "https://www.canva.com/api/oauth/authorize";
const TOKEN_URL = "https://api.canva.com/rest/v1/oauth/token";
// Permissions demandées : upload d'asset, création/lecture de design, export, profil.
const SCOPES = [
  "asset:read", "asset:write",
  "design:content:read", "design:content:write", "design:meta:read",
  "profile:read",
].join(" ");

function loadEnv() {
  if (!existsSync(ENV_FILE)) {
    console.error(`\n✗ Fichier manquant : canva/.env\n  → copie canva/.env.example en canva/.env et remplis CANVA_CLIENT_ID / CANVA_CLIENT_SECRET.\n  (Comment obtenir ces valeurs : voir canva/README.md)\n`);
    process.exit(1);
  }
  const env = {};
  for (const line of readFileSync(ENV_FILE, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  const id = env.CANVA_CLIENT_ID, secret = env.CANVA_CLIENT_SECRET;
  const redirect = env.CANVA_REDIRECT_URI || "http://127.0.0.1:3001/callback";
  if (!id || !secret) {
    console.error("\n✗ CANVA_CLIENT_ID / CANVA_CLIENT_SECRET vides dans canva/.env\n");
    process.exit(1);
  }
  return { id, secret, redirect };
}

const b64url = (buf) => buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

function basicAuth(id, secret) {
  return "Basic " + Buffer.from(`${id}:${secret}`).toString("base64");
}

async function exchangeToken(env, body) {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Authorization": basicAuth(env.id, env.secret), "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body).toString(),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Token endpoint ${res.status}: ${JSON.stringify(json)}`);
  return json;
}

function saveTokens(t) {
  const record = {
    access_token: t.access_token,
    refresh_token: t.refresh_token,
    scope: t.scope,
    expires_at: Date.now() + (t.expires_in ?? 0) * 1000,
    saved_at: new Date().toISOString(),
  };
  writeFileSync(TOKEN_FILE, JSON.stringify(record, null, 2));
  return record;
}

export function loadTokens() {
  if (!existsSync(TOKEN_FILE)) return null;
  return JSON.parse(readFileSync(TOKEN_FILE, "utf8"));
}

/** Renvoie un access_token valide, en rafraîchissant si nécessaire. Importé par canva.mjs. */
export async function getValidAccessToken() {
  const env = loadEnv();
  const tok = loadTokens();
  if (!tok) throw new Error("Pas encore connecté à Canva → lance : node canva/connect.mjs login");
  if (Date.now() < tok.expires_at - 60_000) return tok.access_token;
  // Rafraîchir
  const next = await exchangeToken(env, { grant_type: "refresh_token", refresh_token: tok.refresh_token });
  return saveTokens(next).access_token;
}

function openBrowser(url) {
  const cmd = process.platform === "darwin" ? "open" : process.platform === "win32" ? "cmd" : "xdg-open";
  const args = process.platform === "win32" ? ["/c", "start", "", url] : [url];
  execFile(cmd, args, () => {});
}

async function login() {
  const env = loadEnv();
  const verifier = b64url(crypto.randomBytes(64));
  const challenge = b64url(crypto.createHash("sha256").update(verifier).digest());
  const state = b64url(crypto.randomBytes(16));
  const authURL = `${AUTHORIZE_URL}?` + new URLSearchParams({
    client_id: env.id,
    response_type: "code",
    scope: SCOPES,
    code_challenge: challenge,
    code_challenge_method: "s256",
    redirect_uri: env.redirect,
    state,
  }).toString();

  const port = Number(new URL(env.redirect).port || 3001);
  const path = new URL(env.redirect).pathname;
  const host = new URL(env.redirect).hostname; // doit correspondre au redirect (Canva impose 127.0.0.1)

  const code = await new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const u = new URL(req.url, env.redirect);
      if (u.pathname !== path) { res.writeHead(404); res.end(); return; }
      const err = u.searchParams.get("error");
      if (err) { res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" }); res.end(`<h1>Erreur Canva: ${err}</h1>`); server.close(); return reject(new Error(err)); }
      if (u.searchParams.get("state") !== state) { res.writeHead(400); res.end("state mismatch"); server.close(); return reject(new Error("state mismatch (CSRF)")); }
      const c = u.searchParams.get("code");
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(`<html><body style="font-family:system-ui;background:#0a0a0a;color:#ccff33;display:grid;place-items:center;height:100vh;margin:0"><div style="text-align:center"><h1>✓ Canva connecté</h1><p style="color:#f5f5f7">Tu peux fermer cet onglet et revenir au terminal.</p></div></body></html>`);
      server.close();
      resolve(c);
    });
    server.on("error", reject);
    server.listen(port, host, () => {
      console.log(`\n→ Ouverture du navigateur pour autoriser l'accès Canva…`);
      console.log(`  (si rien ne s'ouvre, colle cette URL dans ton navigateur)\n\n  ${authURL}\n`);
      openBrowser(authURL);
    });
  });

  const tokens = await exchangeToken(env, {
    grant_type: "authorization_code",
    code,
    code_verifier: verifier,
    redirect_uri: env.redirect,
  });
  const rec = saveTokens(tokens);
  console.log(`\n✓ Connecté. Token stocké dans canva/.canva-token.json`);
  console.log(`  scopes : ${rec.scope}`);
  console.log(`  expire : ${new Date(rec.expires_at).toLocaleString("fr-FR")}`);
  console.log(`\nProchaine étape : pousser une affiche →  node canva/push.mjs output/vape-societe-promo.png --title "Promo été"\n`);
}

function status() {
  const tok = loadTokens();
  if (!tok) { console.log("Non connecté. Lance : node canva/connect.mjs login"); return; }
  const valid = Date.now() < tok.expires_at;
  console.log(`Connecté ✓`);
  console.log(`  scopes : ${tok.scope}`);
  console.log(`  access_token : ${valid ? "valide" : "expiré (sera rafraîchi automatiquement)"} — expire ${new Date(tok.expires_at).toLocaleString("fr-FR")}`);
}

async function refresh() {
  const env = loadEnv();
  const tok = loadTokens();
  if (!tok) { console.log("Non connecté."); return; }
  const next = await exchangeToken(env, { grant_type: "refresh_token", refresh_token: tok.refresh_token });
  const rec = saveTokens(next);
  console.log(`✓ Rafraîchi. Expire ${new Date(rec.expires_at).toLocaleString("fr-FR")}`);
}

// Détection "module principal" sûre même si le chemin contient un espace (app graphisme).
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const cmd = process.argv[2];
  const fn = { login, status, refresh }[cmd];
  if (!fn) {
    console.log("Usage: node canva/connect.mjs <login|status|refresh>");
  } else {
    Promise.resolve().then(fn).catch((e) => { console.error("✗", e.message); process.exit(1); });
  }
}
