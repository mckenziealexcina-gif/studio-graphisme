// Agent de production des guides. Il ne produit JAMAIS de HTML : il édite le
// DocumentModel via des OUTILS (function calling). Le serveur applique + rend.
import Anthropic from "@anthropic-ai/sdk";
import { DocumentModel, Section, EMPTY_DOC } from "./schema.mjs";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

export const SYSTEM_PROMPT = `Tu es l'assistant de production des documents de formation « Vape Société ».
Ton rôle : construire et modifier des guides PDF de marque à partir d'un MODÈLE DE
DOCUMENT structuré (JSON), en discutant avec l'utilisateur en français (québécois,
ton chaleureux et concis).

RÈGLES ABSOLUES
- Tu ne produis JAMAIS de HTML/CSS de mise en page. Tu modifies le document UNIQUEMENT
  via les OUTILS fournis. Le rendu visuel est géré par le moteur — tu n'as pas à t'en soucier.
- Tu APPLIQUES les changements toi-même (appels d'outils). Tu ne demandes pas à l'utilisateur
  de faire des étapes manuelles. Tu ne poses une question que si l'intention est vraiment ambiguë.
- Tu PRÉSERVES fidèlement le contenu fourni. Reformulation mineure permise seulement si le format
  l'exige (ex. raccourcir une puce pour un badge). Tu n'inventes pas de procédures ; si une info
  manque, marque-la avec un callout "warn" (tag « À valider ») plutôt que de deviner.

SÉMANTIQUE DES COULEURS (theme) — respecte-la
- legal (rouge) : légal / risque élevé / non négociable (âge, prix minimum, mélanges, garanties dures).
- prod (bleu) : produits (e-liquides, machines).
- exch (vert) : échanges / garanties / après-vente.
- serv (rose) : service client / vente / compte client.
- gold : marque, accueil, opérations (ouverture/fermeture, outils, caisse) et tout le reste.
- Max ~1–2 couleurs actives par section en plus de l'or. L'icône doit AIDER à repérer la section ;
  si elle n'ajoute rien au titre, choisis-en une plus parlante.

BADGES
- "nn" « Non négociable » sur les sections légales.
- "valider" « À valider » sur les points à confirmer (notes internes, procédures manquantes).
- "nouveau" « Nouveau » sur les ajouts récents (ex. test Google Form).
- "continu" « En continu » sur les étapes qui ne se terminent jamais.

COMPOSANTS À TA DISPOSITION (blocks)
para, subhead, micro (petit label majuscules), bullets, steps (numéroté),
itemcard (icône + point clé mis en avant), callout (note/warn/legal/info/ok),
table (avec cellules calendrier codées couleur via cls c-prod/c-serv/c-op/c-legal/c-total).
Les champs html (para, itemcard, callout, cellules) acceptent du HTML INLINE léger : <b>, <em>, «», <sup>.

MÉTHODE
- Pour créer un guide : d'abord replace_document avec meta + toc (si multi-sections) + sections.
- Pour éditer : cible la bonne section (upsert_section) ou ajoute/retire un bloc.
- Après tes appels d'outils, résume en une phrase ce que tu as changé. Le PDF se met à jour tout seul.`;

// Outils (function calling). Schémas permissifs — la validation stricte se fait
// côté serveur avec zod (DocumentModel) après application.
export const TOOLS = [
  {
    name: "replace_document",
    description: "Remplace tout le document (création ou refonte). doc = DocumentModel complet {meta, toc?, sections}.",
    input_schema: { type: "object", properties: { doc: { type: "object" } }, required: ["doc"] },
  },
  {
    name: "update_meta",
    description: "Met à jour meta (coverTitle, coverSubtitle, coverIntro, docLabel, footerNumbers).",
    input_schema: { type: "object", properties: { meta: { type: "object" } }, required: ["meta"] },
  },
  {
    name: "upsert_section",
    description: "Ajoute ou remplace une section par id. Fournir 'index' (entier) pour l'insérer à une position.",
    input_schema: {
      type: "object",
      properties: { section: { type: "object" }, index: { type: "integer" } },
      required: ["section"],
    },
  },
  {
    name: "remove_section",
    description: "Supprime une section par id.",
    input_schema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
  },
  {
    name: "set_toc",
    description: "Définit la table des matières visuelle (liste d'items {n, title, icon, theme}).",
    input_schema: { type: "object", properties: { toc: { type: "array" } }, required: ["toc"] },
  },
];

/** Applique un appel d'outil au document courant, valide, renvoie le nouveau doc. */
export function applyTool(name, input, current) {
  let next;
  switch (name) {
    case "replace_document":
      next = input.doc;
      break;
    case "update_meta":
      next = { ...current, meta: { ...current.meta, ...(input.meta || {}) } };
      break;
    case "upsert_section": {
      const sec = Section.parse(input.section);
      const sections = [...(current.sections || [])];
      const idx = sections.findIndex((s) => s.id === sec.id);
      if (Number.isInteger(input.index)) {
        if (idx >= 0) sections.splice(idx, 1);
        const at = Math.max(0, Math.min(input.index, sections.length));
        sections.splice(at, 0, sec);
      } else if (idx >= 0) {
        sections[idx] = sec;
      } else {
        sections.push(sec);
      }
      next = { ...current, sections };
      break;
    }
    case "remove_section":
      next = { ...current, sections: (current.sections || []).filter((s) => s.id !== input.id) };
      break;
    case "set_toc":
      next = { ...current, toc: input.toc || [] };
      break;
    default:
      throw new Error("Outil inconnu: " + name);
  }
  return DocumentModel.parse(next); // le doc reste toujours valide → rendu jamais cassé
}

/** Un tour d'agent : discute + édite le doc via outils, renvoie {reply, doc}. */
export async function runAgentTurn(messages, doc) {
  const client = new Anthropic(); // lit ANTHROPIC_API_KEY ou le profil ant
  let current = DocumentModel.parse(doc ?? EMPTY_DOC);

  const convo = [
    ...messages,
    { role: "user", content: `ÉTAT ACTUEL DU DOCUMENT:\n${JSON.stringify(current)}` },
  ];

  let res = await client.messages.create({
    model: MODEL, max_tokens: 8000, system: SYSTEM_PROMPT, tools: TOOLS, messages: convo,
  });

  while (res.stop_reason === "tool_use") {
    const results = [];
    for (const block of res.content) {
      if (block.type !== "tool_use") continue;
      try {
        current = applyTool(block.name, block.input, current);
        results.push({ type: "tool_result", tool_use_id: block.id, content: "ok" });
      } catch (e) {
        results.push({ type: "tool_result", tool_use_id: block.id, content: `ERREUR: ${e.message}`, is_error: true });
      }
    }
    convo.push({ role: "assistant", content: res.content });
    convo.push({ role: "user", content: results });
    res = await client.messages.create({
      model: MODEL, max_tokens: 8000, system: SYSTEM_PROMPT, tools: TOOLS, messages: convo,
    });
  }

  const reply = res.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
  return { reply, doc: DocumentModel.parse(current) };
}
