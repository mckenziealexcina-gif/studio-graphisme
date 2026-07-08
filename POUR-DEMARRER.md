# 🎨 Studio Graphisme — démarrage (pour toi qui reçois le dossier)

Un studio pour créer des affiches / promos haute qualité en local
(HTML/CSS → image ultra haute déf + PDF print). Pas de cloud, tout tourne sur ta machine.

## Prérequis (2 choses)
1. **Node.js** installé → https://nodejs.org (prends la version « LTS »).
2. **Google Chrome** installé (le moteur de rendu s'appuie dessus).

## Installation (une fois, ~1 min)
Ouvre un terminal **dans ce dossier**, puis :
```bash
npm install
```
> Les polices sont déjà incluses dans `fonts/` — rien à télécharger.

## Test que tout marche
```bash
node render/render.mjs templates/poster-template.html --name demo --scale 4 --jpg 92
open output/demo.png      # (sur Windows : ouvre le fichier à la main dans output/)
```
Si `output/demo.png` s'ouvre en belle affiche → c'est bon. 🎉

## Faire une affiche
- Copie un gabarit dans `templates/` (ex. `vape-societe-embauche.html` est un bon exemple),
  modifie le texte / les couleurs, puis :
```bash
node render/render.mjs templates/mon-affiche.html --name mon-affiche --scale 4 --jpg 92
```
- Résultats dans `output/` : `.png` (impression), `.jpg` (réseaux), `.pdf` (print vectoriel).
- Formats dispo sur `.poster` : `format-portrait`, `format-square`, `format-story`,
  `format-a3`, `format-a4`… (voir `render/poster.css`).

## Canva (optionnel)
Le dossier `canva/` permet de pousser tes affiches vers Canva. C'est **personnel** :
tu dois créer ta propre intégration (5 min) → voir `canva/README.md`.
Les identifiants de celui qui t'a envoyé le dossier ne sont **pas** inclus (secrets).

## Assistant guides — générateur de guides PDF (optionnel)
Un chat en français qui fabrique des guides PDF de marque via un agent Claude.
Il faut **ta propre clé Anthropic** (chacun la sienne — ça consomme du crédit à l'usage) :
```bash
export ANTHROPIC_API_KEY=sk-ant-...   # ta clé (platform.claude.com)
npm run guides                        # → http://127.0.0.1:3005
```
Détails et fonctionnement → `guides/README.md`.

---
*Fait avec le studio graphisme. Bon design !*
