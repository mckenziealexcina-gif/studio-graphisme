# Assistant guides — générateur de guides PDF piloté par agent

Un panneau de chat en français : tu décris un guide, un **agent Claude** remplit un
**document structuré** (JSON) via des outils (function calling), et le serveur le rend en
**PDF de marque Vape Société** (cover foncée + emblème doré, sections à bandeau crème,
pastilles colorées par catégorie, badges arrondis, numéros de page). Aperçu live + export Canva.

## Principe (non négociable)
Le rendu est **déterministe** : `modèle JSON → HTML → PDF`. L'agent ne produit **jamais** de
HTML/CSS — il ne fait que remplir le modèle via 5 outils. Le thème visuel vit dans le moteur,
donc l'agent ne peut pas casser l'identité de marque, et le document reste toujours valide
(validation zod avant chaque rendu).

## Lancer
```bash
export ANTHROPIC_API_KEY=sk-ant-...      # requis pour le chat
# option : export ANTHROPIC_MODEL=claude-opus-4-8   (défaut)
npm run guides                           # → http://127.0.0.1:3005
```
Ouvre l'URL, discute (« Crée un aide-mémoire de fermeture pour l'employé »), l'aperçu PDF se met
à jour à chaque réponse. Bouton **Exporter vers Canva** → pousse le PDF via l'intégration
Canva existante du studio.

> Sans `ANTHROPIC_API_KEY`, le serveur démarre et l'UI s'affiche, mais le chat renvoie une
> erreur d'authentification. Le rendu PDF, lui, ne dépend pas de la clé.

## Fichiers
```
guides/schema.mjs        Modèle DocumentModel (zod) + EMPTY_DOC
guides/designSystem.mjs  CSS + polices (Poppins/Carlito) + icônes + renderDocumentToHTML(doc)
guides/render.mjs        renderPDF(html, docLabel, numbers) — Playmwright/Chrome, Letter, pied de page
guides/agent.mjs         system prompt FR + outils + boucle d'agent (claude-opus-4-8)
guides/canva.mjs         exportToCanva(pdf) — réutilise canva/canva.mjs
guides/server.mjs        http natif : GET / · POST /api/guide/chat · POST /api/guide/canva
guides/web/index.html    UI : chat + aperçu PDF (iframe) + bouton Canva
```

## Sémantique des couleurs (thème)
rouge = légal / non négociable · bleu = produit · vert = garanties/échanges ·
rose = service/client · or = marque / opérations. Max ~2 couleurs actives par section en plus de l'or.

## Notes d'adaptation à ce repo
- Écrit en **JS/ESM** (comme `render.mjs`), pas en TypeScript.
- **Playwright** (déjà présent) au lieu de Puppeteer pour le rendu — même résultat.
- Serveur en **http natif** (zéro dépendance de plus) ; deps ajoutées : `@anthropic-ai/sdk`, `zod`.
- Polices chargées depuis jsDelivr au rendu (Poppins essentielle au look ; sinon repli sans-serif).
