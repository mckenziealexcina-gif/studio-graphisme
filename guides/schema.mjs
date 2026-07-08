// Modèle de document structuré — le contenu, jamais du HTML.
// L'agent ne produit QUE ce modèle (via outils) ; le moteur le rend.
import { z } from "zod";

export const Theme = z.enum(["gold", "legal", "prod", "exch", "serv"]);
// gold=marque/opérations · legal=rouge(légal/risque) · prod=bleu(produit)
// exch=vert(garanties/échanges) · serv=rose(service/client)

export const Icon = z.enum([
  "star", "mapping", "gear", "card", "sun", "moon", "shield", "speech", "funnel",
  "droplet", "battery", "refresh", "compass", "sparkles", "clock", "users", "check",
  "id", "lock", "flask", "phone", "box", "clipboard", "broom", "alert", "calendar",
]);

export const BadgeKind = z.enum(["nn", "valider", "nouveau", "continu", "risque"]);
// nn=«Non négociable»(rouge) valider=«À valider»(ambre)
// nouveau=«Nouveau»(or) continu=«En continu»(vert) risque=«Risque élevé»(rouge)

export const Badge = z.object({ kind: BadgeKind, label: z.string() });

const Cell = z.object({
  t: z.string(),
  cls: z.enum(["c-prod", "c-serv", "c-op", "c-legal", "c-total", ""]).optional(),
});

export const Block = z.discriminatedUnion("type", [
  z.object({ type: z.literal("para"), html: z.string() }),
  z.object({ type: z.literal("subhead"), text: z.string() }),
  z.object({ type: z.literal("micro"), text: z.string() }), // petit label majuscules
  z.object({ type: z.literal("bullets"), items: z.array(z.string()), theme: Theme.optional() }),
  z.object({ type: z.literal("steps"), items: z.array(z.string()) }), // liste numérotée
  z.object({ type: z.literal("itemcard"), icon: Icon, theme: Theme, html: z.string() }),
  z.object({
    type: z.literal("callout"),
    variant: z.enum(["note", "warn", "legal", "info", "ok"]),
    tag: z.string().optional(),
    html: z.string(),
  }),
  z.object({
    type: z.literal("table"),
    headers: z.array(z.string()),
    rows: z.array(z.array(z.union([z.string(), Cell]))),
    theme: Theme.optional(),
    calendar: z.boolean().optional(),
  }),
]);

export const Section = z.object({
  id: z.string(),
  kicker: z.string().optional(), // ex. "SECTION 7" ou "ÉTAPE 1 / 9"
  title: z.string(),
  sub: z.string().optional(),
  icon: Icon,
  theme: Theme,
  badges: z.array(Badge).default([]),
  blocks: z.array(Block).default([]),
});

export const TocItem = z.object({ n: z.string(), title: z.string(), icon: Icon, theme: Theme });

export const DocumentModel = z.object({
  meta: z.object({
    docLabel: z.string(),           // footer, ex. "Guide de l'employé"
    coverTitle: z.string(),         // gros titre doré de la cover
    coverSubtitle: z.string(),
    coverIntro: z.string().optional(), // encadré italique bas de cover
    footerNumbers: z.boolean().default(true),
  }),
  toc: z.array(TocItem).default([]),   // si non vide → page TDM visuelle après la cover
  sections: z.array(Section).default([]),
});

// Document de départ (vide mais valide) pour un tout nouveau guide.
export const EMPTY_DOC = {
  meta: {
    docLabel: "Guide",
    coverTitle: "Nouveau guide",
    coverSubtitle: "",
    footerNumbers: true,
  },
  toc: [],
  sections: [],
};
