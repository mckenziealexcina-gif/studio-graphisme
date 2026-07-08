// Fonction serverless Vercel — modifie l'affiche via Claude (function calling).
// L'IA ne touche QUE des champs (jamais de HTML) ; le rendu reste dans le navigateur.
// Clé : process.env.ANTHROPIC_API_KEY (variable Vercel).
import Anthropic from "@anthropic-ai/sdk";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

// Champs éditables + type (garde-fou : tout le reste est ignoré).
const FIELDS = {
  wordmark: "s", wordsub: "s", eyebrow: "s", title: "s", lede: "s",
  role: "s", typeLine: "s", ctaLabel: "s", email: "s", site: "s",
  perks: "a", succHeader: "s", succursales: "a",
  colBg: "c", colGold: "c", colInk: "c",
};

const SYSTEM = `Tu es l'assistant qui personnalise une AFFICHE DE RECRUTEMENT « Vape Société »
(style sobre : fond sombre, texte clair, or en accent). Tu modifies UNIQUEMENT les CHAMPS
via l'outil set_fields — jamais de HTML/CSS. Tu APPLIQUES les changements toi-même (appel d'outil),
tu ne demandes pas à l'utilisateur de le faire. Tu réponds en français, une phrase pour résumer.

Champs texte : wordmark, wordsub, eyebrow, title (mets \\n pour un retour à la ligne),
lede (\\n possible), role, typeLine, ctaLabel, email, site.
Listes : perks (avantages, ~4), succursales (noms).
Couleurs (hex #rrggbb) : colBg (fond), colGold (accent doré), colInk (texte principal).

Garde toujours l'esprit épuré et lisible, avec un bon contraste. Si on demande un thème
(« plus bleu », « fond crème », « ambiance néon »…), ajuste les 3 couleurs ensemble de façon
cohérente et contrastée (texte clair sur fond sombre, ou l'inverse).`;

const TOOLS = [{
  name: "set_fields",
  description: "Modifie un ou plusieurs champs de l'affiche. Ne fournis QUE les champs à changer.",
  input_schema: {
    type: "object",
    properties: {
      wordmark: { type: "string" }, wordsub: { type: "string" }, eyebrow: { type: "string" },
      title: { type: "string" }, lede: { type: "string" }, role: { type: "string" },
      typeLine: { type: "string" }, ctaLabel: { type: "string" }, email: { type: "string" }, site: { type: "string" },
      perks: { type: "array", items: { type: "string" } },
      succHeader: { type: "string" },
      succursales: { type: "array", items: { type: "string" } },
      colBg: { type: "string", description: "hex #rrggbb" },
      colGold: { type: "string", description: "hex #rrggbb" },
      colInk: { type: "string", description: "hex #rrggbb" },
    },
  },
}];

const isHex = (s) => typeof s === "string" && /^#[0-9a-fA-F]{6}$/.test(s.trim());

function mergeFields(state, input) {
  const next = { ...state };
  for (const [k, t] of Object.entries(FIELDS)) {
    if (!(k in input)) continue;
    const v = input[k];
    if (t === "s" && typeof v === "string") next[k] = v.slice(0, 400);
    else if (t === "a" && Array.isArray(v)) next[k] = v.slice(0, 10).map((x) => String(x).slice(0, 140));
    else if (t === "c" && isHex(v)) next[k] = v.trim().toLowerCase();
  }
  return next;
}

export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "POST seulement" }); return; }
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const messages = Array.isArray(body.messages) ? body.messages.slice(-20) : [];
    let state = body.state && typeof body.state === "object" ? body.state : {};

    const client = new Anthropic(); // ANTHROPIC_API_KEY (variable Vercel)
    const convo = [...messages, { role: "user", content: `ÉTAT ACTUEL (JSON):\n${JSON.stringify(state)}` }];

    let r = await client.messages.create({ model: MODEL, max_tokens: 1500, system: SYSTEM, tools: TOOLS, messages: convo });
    let guard = 0;
    while (r.stop_reason === "tool_use" && guard++ < 4) {
      const results = [];
      for (const b of r.content) {
        if (b.type !== "tool_use") continue;
        state = mergeFields(state, b.input || {});
        results.push({ type: "tool_result", tool_use_id: b.id, content: "ok" });
      }
      convo.push({ role: "assistant", content: r.content });
      convo.push({ role: "user", content: results });
      r = await client.messages.create({ model: MODEL, max_tokens: 1500, system: SYSTEM, tools: TOOLS, messages: convo });
    }

    const reply = r.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim() || "✓ Mis à jour.";
    res.status(200).json({ reply, state });
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) });
  }
}
