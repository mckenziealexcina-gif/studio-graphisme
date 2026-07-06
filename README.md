# Studio Graphisme — affiches & promos (2026)

Pipeline **HTML/CSS/SVG → Chromium haute densité → PNG (impression) + JPG (réseaux) + PDF (vectoriel print)**.
Vraie typographie variable, dégradés, blend modes, grain, marges parfaites. Zéro cloud, tout local.

## Démarrage rapide

```bash
npm install                      # déjà fait (playwright-core + sharp)
bash fonts/download-fonts.sh     # déjà fait — 11 polices variables self-hébergées
node render/render.mjs templates/poster-template.html --name demo --scale 4 --jpg 92
open output/demo.png
```

## Faire une nouvelle affiche

1. Copier `templates/poster-template.html` → `templates/ma-promo.html`.
2. Éditer les tokens (`--ink`, `--paper`, `--accent`…) et le contenu. Choisir un format
   sur `.poster` (`format-portrait`, `format-square`, `format-story`, `format-a3`…).
3. Rendre : `node render/render.mjs templates/ma-promo.html --name ma-promo --scale 4 --jpg 92`
4. Résultats dans `output/`.

Ou, dans Claude Code : *« fais-moi une affiche promo pour X »* → le skill **canvas-design**
(`.claude/skills/`) crée une philosophie de design puis le HTML et le rend automatiquement.

## Arborescence

```
render/render.mjs      Harness de rendu (Playwright + sharp) — CLI
render/poster.css      Design system : tokens, rôles typo, formats, grain, grille debug
fonts/                 11 polices variables (.woff2) + fonts.css + script de MAJ
templates/             Gabarits HTML des affiches
output/                PNG / JPG / PDF générés
brand/                 (à remplir) chartes clients : couleurs, logos, polices, mentions
.claude/skills/        Skill canvas-design (philosophie de design + pipeline)
```

## Polices (rôles CSS)

`--f-display` Bricolage Grotesque · `--f-grotesk` Space Grotesk · `--f-sans` Inter ·
`--f-archivo` Archivo · `--f-arty` Syne · `--f-round` Unbounded ·
`--f-condensed` Big Shoulders Display · `--f-heavy` Anton · `--f-serif` Fraunces ·
`--f-editorial` Instrument Serif · `--f-fashion` DM Serif Display. *(toutes OFL/libres)*

## Canva (optionnel)

Intégration API Connect prête dans `canva/` (OAuth PKCE, zéro dépendance). Elle permet de
**pousser** une affiche rendue ici vers ta bibliothèque Canva, ou d'**exporter** un design Canva.
Setup en 5 min → voir **[canva/README.md](canva/README.md)**. En résumé :
`créer l'intégration sur canva.com/developers → clés dans canva/.env → node canva/connect.mjs login`.

## Options de rendu

| option | effet |
|---|---|
| `--scale 4` | densité de pixels du PNG (4 ≈ qualité impression) |
| `--jpg 92` | exporte aussi un JPG (léger, réseaux sociaux) |
| `--sharpen` | passe de netteté légère |
| `--no-pdf` / `--no-png` | ne pas générer ce format |
| `--name <slug>` | nom des fichiers de sortie |
