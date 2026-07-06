---
name: canvas-design
description: Crée des affiches / posters / promos de qualité musée en .png (haute déf) et .pdf print via un pipeline HTML/CSS/SVG rendu par Chromium. À utiliser dès que l'utilisateur demande une affiche, une promo, un flyer, un visuel réseaux sociaux, ou toute pièce graphique statique. Créer des designs originaux, jamais de copie d'artistes existants.
license: OFL pour les polices (voir fonts/), code du studio libre d'usage.
---

Ce skill crée des **objets graphiques** (affiches, promos, flyers, posts) : 90% de design visuel, 10% de texte essentiel. Deux étapes :

1. **Philosophie de design** (fichier `.md`) — un mouvement esthétique.
2. **Expression sur canvas** — un `.html` rendu en `.png` + `.pdf` via le pipeline du studio.

> Le pipeline technique de CE studio est déjà prêt (voir la section RENDU). Ne pas réinventer avec matplotlib/PIL : on écrit du **HTML/CSS/SVG** rendu par Chromium haute densité — vraie typo variable, dégradés, blend modes, grain, PDF vectoriel print.

---

## 1. CRÉER LA PHILOSOPHIE DE DESIGN

Créer une **philosophie visuelle** (pas un gabarit) qui sera interprétée par : forme, espace, couleur, composition, images, motifs, texte minimal comme accent visuel.

- **Nommer le mouvement** (1-2 mots) : « Brutalist Joy », « Chromatic Silence »…
- **Articuler** (4-6 paragraphes) comment il se manifeste par : l'espace et la forme, la couleur et la matière, l'échelle et le rythme, la composition et l'équilibre, la hiérarchie visuelle.

**Règles :**
- **Zéro redondance** : chaque principe (couleur, espace, typo) énoncé une seule fois.
- **Artisanat, répété** : la philosophie doit marteler que l'œuvre finale paraît avoir demandé des heures, façonnée avec soin par quelqu'un au sommet de son art — « meticulously crafted », « master-level execution ».
- **Laisser de la liberté** : précis sur la direction, assez ouvert pour l'interprétation.

L'info vit dans le design, pas dans les paragraphes. Sortir la philosophie en `.md`.

### Exemples condensés
- **Concrete Poetry** — communication par la forme monumentale et la géométrie audacieuse ; blocs de couleur massifs, typo sculpturale, tension spatiale brutaliste, énergie de l'affiche polonaise × Le Corbusier.
- **Chromatic Language** — la couleur comme système d'information ; zones géométriques précises, labels sans-serif minuscules, Josef Albers × dataviz.
- **Analog Meditation** — contemplation par la texture et le vide ; grain du papier, encre qui bave, vaste espace négatif, esthétique du photobook japonais.

*(Les exemples réels font 4-6 paragraphes.)*

---

## 2. DÉDUIRE LA RÉFÉRENCE SUBTILE

Avant le canvas, identifier le fil conceptuel discret de la demande. Le sujet est une **référence nichée dans l'œuvre elle-même** — pas toujours littérale, toujours sophistiquée. Celui qui connaît le sujet le ressent ; les autres voient une composition maîtrisée. Comme un jazzman qui cite un autre morceau : seuls les initiés captent, mais tout le monde apprécie.

---

## 3. LE CANVAS (qualité musée)

Construire une seule page hautement visuelle, design-forward. Utiliser motifs répétés, formes parfaites, accumulation dense de marques ; typo clinique et repères systématiques comme s'il s'agissait d'un diagramme d'une discipline imaginaire. Palette limitée, intentionnelle, cohérente. Ancrer par une phrase / des détails placés subtilement.

**Texte** : toujours minimal, visuel d'abord. Le contexte dicte l'échelle (une affiche de concert punk crie ; une identité de céramiste chuchote). Rien ne déborde, rien ne se chevauche, marges respectées — **non négociable**. Rendre la typo *partie de l'art*, pas juste posée dessus.

**Craftsmanship (CRITIQUE)** : viser une qualité qui semble avoir demandé des heures à un maître. Composition, espacement, couleur, typo — tout doit crier expertise. Vérifier deux fois : aucun chevauchement, aucun débordement, tout parfait.

---

## RENDU — pipeline du studio (concret)

Le studio vit dans le dossier racine du projet (`app graphisme/`). Toujours rendre via ce pipeline.

**A. Écrire le poster** dans `templates/<nom>.html` :
```html
<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">
<link rel="stylesheet" href="../render/poster.css">
<style> .poster{ --ink:#111; --paper:#f4f1ea; --accent:#e4483d; } /* tokens du poster */ </style>
</head><body>
  <div class="poster format-portrait"> … <div class="grain"></div> </div>
</body></html>
```
- L'élément racine **doit** être `.poster` avec une classe de format.
- Formats : `format-portrait` (1080×1350, post Insta), `format-square` (1:1), `format-story` (9:16 story/reel), `format-wide` (bannière), `format-a3` / `format-a4` / `format-a5` / `format-letter` (print, en mm → PDF à la bonne taille).
- Ajouter `<div class="grain"></div>` en dernier enfant pour le grain (`grain--soft` / `grain--strong`).

**B. Polices disponibles** (rôles CSS, self-hébergées, variables) :
`--f-display` Bricolage Grotesque · `--f-grotesk` Space Grotesk · `--f-sans` Inter · `--f-archivo` Archivo · `--f-arty` Syne · `--f-round` Unbounded · `--f-condensed` Big Shoulders Display · `--f-heavy` Anton · `--f-serif` Fraunces · `--f-editorial` Instrument Serif · `--f-fashion` DM Serif Display.
En ajouter d'autres : `bash fonts/download-fonts.sh` (éditer la liste) ou une nouvelle `@font-face`.

**C. Rendre** :
```bash
node render/render.mjs templates/<nom>.html --name <slug> --scale 4 --jpg 92
```
Sorties dans `output/` : `<slug>.png` (haute déf, impression), `<slug>.jpg` (léger, réseaux), `<slug>.pdf` (vectoriel, texte sélectionnable, taille physique).
Options : `--scale 4` (densité px), `--jpg 92` (JPG web), `--sharpen`, `--no-pdf`, `--no-png`.

**D. Vérifier** : ouvrir le JPG/PNG et inspecter. Débordement ? chevauchement ? marges ? contraste ? Ajouter `show-grid` sur `.poster` pour visualiser la grille pendant le calage.

---

## 4. RAFFINER (dernière passe)

L'utilisateur a déjà dit : *« Ce n'est pas assez parfait. Ça doit être immaculé, un chef-d'œuvre d'artisanat, prêt pour un musée. »*

Pour raffiner : **ne pas ajouter** de graphismes ; rendre l'existant plus net et cohérent. Si l'instinct dit « dessine une forme de plus », STOP → demander plutôt : « comment rendre ce qui est là plus proche d'une œuvre ? » Reprendre le code, polir, re-rendre.

## Multi-pages
Sur demande, créer d'autres pages dans la même veine mais distinctes — comme les pages d'un beau livre qui racontent une histoire discrète. Les regrouper (PDF multi-pages ou plusieurs PNG).
