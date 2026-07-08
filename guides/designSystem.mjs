// SYSTÈME VISUEL Vape Société — verrouillé. Le thème vit ici, pas chez l'agent.
// renderDocumentToHTML(doc) -> string HTML complet, prêt pour le moteur PDF.

/* ---- 4.1 Feuille de styles ---- */
export const CSS = `
:root{
  --frame:#0E0E0E; --frame-2:#161512; --frame-line:#2a2a26;
  --gold:#D9AE45; --gold-2:#c9b37a; --gold-ink:#8a5a12; --gold-deep:#7a5314;
  --cream:#F7F1E3; --cream-2:#F1E9D6; --paper:#FBF9F4; --paper-2:#F3EFE6;
  --ink:#1a1a18; --body:#3a352d; --muted:#6f665a; --hair:#e7ddc7;
  --legal-ic:#791F1F; --legal-chip:#F7C1C1; --legal-tx:#7d2420; --legal-ac:#b5342a;
  --prod-ic:#185FA5;  --prod-chip:#C6DBF1;  --prod-tx:#1f5993;  --prod-ac:#2f77c2;
  --exch-ic:#0F6E56;  --exch-chip:#BEE3D6;  --exch-tx:#155e4c;  --exch-ac:#1c8b6d;
  --serv-ic:#993556;  --serv-chip:#F0C9D7;  --serv-tx:#8a3350;  --serv-ac:#b8506f;
  --gold-chip:#F1E1B4;
}
*{ margin:0; padding:0; box-sizing:border-box; }
html{ -webkit-print-color-adjust:exact; print-color-adjust:exact; }
body{ font-family:"Carlito","Segoe UI",sans-serif; color:var(--body);
  font-size:12.6px; line-height:1.5; -webkit-font-smoothing:antialiased; background:var(--paper); }
h1,h2,h3,.disp{ font-family:"Poppins",sans-serif; }
strong{ color:var(--ink); font-weight:700; } em{ font-style:italic; }
.page-break{ break-before:page; } .avoid-break{ break-inside:avoid; }
.cover{ background:var(--frame); color:#efe9dc; min-height:9.7in; border-radius:16px;
  padding:0.7in 0.6in 0.55in; display:flex; flex-direction:column; align-items:center;
  text-align:center; border:1px solid var(--frame-line); }
.cover .topline{ width:100%; display:flex; align-items:center; justify-content:center; gap:14px;
  border-top:1.5px solid var(--gold); border-bottom:1.5px solid var(--gold); padding:9px 0; margin-bottom:auto; }
.cover .topline .vs{ font-family:"Poppins"; font-weight:600; letter-spacing:6px; font-size:15px; color:var(--gold); }
.cover .emblem{ width:96px; height:96px; margin:22px 0 14px; }
.cover .wordmark{ font-family:"Poppins"; font-weight:600; font-size:34px; letter-spacing:6px; color:#f3ecdd; }
.cover .kicker{ font-family:"Poppins"; font-size:12px; letter-spacing:6px; color:#8f887c; margin-top:6px; }
.cover .divider{ width:66px; height:3px; background:var(--gold); border-radius:3px; margin:26px 0; }
.cover .doctitle{ font-family:"Poppins"; font-weight:600; font-size:44px; line-height:1.08; color:var(--gold); letter-spacing:.5px; }
.cover .docsub{ font-size:16px; color:#c8c1b3; margin-top:12px; max-width:6.2in; }
.cover .intro{ margin:auto 0 6px; width:100%; background:#181712; border:1px solid #2c2a24;
  border-left:4px solid var(--gold); border-radius:11px; padding:14px 18px; text-align:left;
  font-style:italic; font-size:12.4px; color:#d7cfbf; line-height:1.55; }
.cover .foot{ margin-top:16px; font-family:"Poppins"; font-size:10.5px; letter-spacing:3px; color:#6f685c; text-transform:uppercase; }
.toc-title{ font-family:"Poppins"; font-weight:600; font-size:24px; color:var(--ink); margin:2px 0 4px; }
.toc-sub{ color:var(--muted); font-size:12.5px; margin-bottom:18px; }
.toc-grid{ display:grid; grid-template-columns:1fr 1fr; gap:11px; }
.toc-item{ display:flex; align-items:center; gap:12px; background:var(--cream); border:1px solid var(--hair);
  border-radius:12px; padding:11px 14px; break-inside:avoid; }
.toc-item .chip{ width:34px; height:34px; border-radius:9px; flex-shrink:0; display:flex; align-items:center; justify-content:center; }
.toc-item .chip svg{ width:19px; height:19px; }
.toc-item .n{ font-family:"Poppins"; font-weight:600; font-size:12px; color:var(--muted); }
.toc-item .t{ font-family:"Poppins"; font-weight:600; font-size:14px; color:var(--ink); line-height:1.2; }
.section{ margin-bottom:17px; }
.section-head{ background:var(--cream); border:1px solid #E7DBC0; border-radius:13px;
  box-shadow:0 1px 2px rgba(70,55,25,.05); display:flex; align-items:flex-start; gap:13px;
  padding:13px 17px; margin-bottom:11px; break-inside:avoid; break-after:avoid; }
.section-head .chip{ width:40px; height:40px; border-radius:11px; flex-shrink:0; display:flex; align-items:center; justify-content:center; }
.section-head .chip svg{ width:23px; height:23px; }
.section-head .htext{ flex:1; }
.sec-num{ font-family:"Poppins"; font-weight:600; font-size:11px; letter-spacing:3px; text-transform:uppercase; }
.sec-title{ font-family:"Poppins"; font-weight:600; font-size:20px; color:var(--ink); line-height:1.15; margin-top:1px; }
.sec-sub{ font-size:12.2px; color:var(--muted); margin-top:3px; font-style:italic; }
.section-head .badges{ display:flex; gap:6px; flex-wrap:wrap; justify-content:flex-end; margin-left:6px; padding-top:2px; max-width:2.2in; }
.section > p{ margin:0 0 8px; }
.subhead{ font-family:"Poppins"; font-weight:600; font-size:13.5px; color:var(--gold-deep); margin:13px 0 7px; display:flex; align-items:center; gap:8px; break-after:avoid; }
.subhead::before{ content:""; width:7px; height:7px; border-radius:2px; background:currentColor; flex-shrink:0; }
.microlabel{ font-family:"Poppins"; font-weight:600; font-size:10.5px; letter-spacing:2.5px; text-transform:uppercase; color:var(--muted); margin:11px 0 6px; break-after:avoid; }
ul.dots{ list-style:none; display:flex; flex-direction:column; gap:5px; margin:2px 0 8px; }
ul.dots li{ position:relative; padding-left:16px; }
ul.dots li::before{ content:""; position:absolute; left:2px; top:7px; width:5px; height:5px; border-radius:50%; background:var(--dot,#8a5a12); }
ol.steps{ list-style:none; counter-reset:st; display:flex; flex-direction:column; gap:6px; margin:4px 0 8px; }
ol.steps li{ position:relative; padding-left:30px; counter-increment:st; }
ol.steps li::before{ content:counter(st); position:absolute; left:0; top:0.5px; width:20px; height:20px;
  border-radius:6px; background:var(--gold-chip); color:var(--gold-deep); font-family:"Poppins";
  font-weight:600; font-size:11px; display:flex; align-items:center; justify-content:center; }
.itemcard{ display:flex; align-items:flex-start; gap:11px; background:#fff; border:1px solid #EADFC8;
  border-radius:10px; padding:10px 13px; margin:6px 0; box-shadow:0 1px 2px rgba(70,55,25,.06); break-inside:avoid; }
.itemcard svg{ width:19px; height:19px; flex-shrink:0; margin-top:1px; }
.itemcard .ic-tx{ font-size:12.4px; color:var(--body); } .itemcard .ic-tx b{ color:var(--ink); }
.badge{ font-family:"Poppins"; font-weight:500; font-size:9.5px; letter-spacing:.5px; text-transform:uppercase;
  padding:4px 11px; border-radius:20px; white-space:nowrap; display:inline-block; }
.badge.nn{ background:#F0A9A2; color:#5c1712; } .badge.valider{ background:#FAC775; color:#5b3a06; }
.badge.nouveau{ background:#EBD79B; color:#6d520f; } .badge.continu{ background:#BEE3D6; color:#134e3d; }
.badge.risque{ background:#F09595; color:#501313; }
.callout{ border-radius:11px; padding:12px 16px; margin:10px 0; font-size:12.3px; line-height:1.5;
  border-left:4px solid; break-inside:avoid; }
.callout .cl-tag{ font-family:"Poppins"; font-weight:600; font-size:10.5px; letter-spacing:1.5px; text-transform:uppercase; display:block; margin-bottom:3px; }
.callout.note{ background:#FBF3DF; border-color:var(--gold); color:#5f4f2a; }
.callout.warn{ background:#FBEFD9; border-color:#C58A1E; color:#7a5411; }
.callout.legal{ background:#F9E7E4; border-color:var(--legal-ac); color:#7a2420; }
.callout.info{ background:#E9F1F9; border-color:var(--prod-ac); color:#1f5088; }
.callout.ok{ background:#E7F2EC; border-color:var(--exch-ac); color:#155e43; }
table.vt{ width:100%; border-collapse:separate; border-spacing:0; border-radius:11px; overflow:hidden;
  border:1px solid var(--hair); margin:8px 0 10px; font-size:12px; break-inside:avoid; }
table.vt th{ font-family:"Poppins"; font-weight:600; font-size:11.5px; text-align:left; color:#fff; background:var(--th,#8a5a12); padding:9px 12px; }
table.vt th + th{ border-left:1px solid rgba(255,255,255,.28); }
table.vt td{ padding:9px 12px; vertical-align:top; border-top:1px solid var(--hair); color:var(--body); background:#fff; }
table.vt td + td{ border-left:1px solid var(--hair); }
table.vt tr td b, table.vt tr td strong{ color:var(--ink); }
td.c-prod{ background:#EAF2FA !important; } td.c-serv{ background:#FBEFF3 !important; }
td.c-op{ background:#F5F0E4 !important; } td.c-legal{ background:#FBECEA !important; }
td.c-total{ background:#F0E7CE !important; } td.c-total .dur{ color:var(--gold-deep); }
.dur{ font-family:"Poppins"; font-weight:600; color:var(--ink); white-space:nowrap; }
`;

/* ---- 4.2 Polices (woff2 via jsDelivr/fontsource) ---- */
export const FONTS = `
@font-face{font-family:"Poppins";font-weight:400;font-style:normal;src:url("https://cdn.jsdelivr.net/npm/@fontsource/poppins/files/poppins-latin-400-normal.woff2") format("woff2");}
@font-face{font-family:"Poppins";font-weight:500;font-style:normal;src:url("https://cdn.jsdelivr.net/npm/@fontsource/poppins/files/poppins-latin-500-normal.woff2") format("woff2");}
@font-face{font-family:"Poppins";font-weight:600;font-style:normal;src:url("https://cdn.jsdelivr.net/npm/@fontsource/poppins/files/poppins-latin-600-normal.woff2") format("woff2");}
@font-face{font-family:"Carlito";font-weight:400;font-style:normal;src:url("https://cdn.jsdelivr.net/npm/@fontsource/carlito/files/carlito-latin-400-normal.woff2") format("woff2");}
@font-face{font-family:"Carlito";font-weight:700;font-style:normal;src:url("https://cdn.jsdelivr.net/npm/@fontsource/carlito/files/carlito-latin-700-normal.woff2") format("woff2");}
@font-face{font-family:"Carlito";font-weight:400;font-style:italic;src:url("https://cdn.jsdelivr.net/npm/@fontsource/carlito/files/carlito-latin-400-italic.woff2") format("woff2");}
`;

/* ---- 4.3 Icônes (stroke=currentColor → couleur via la pastille) ---- */
const P = {
  star: '<path d="M12 3.2l2.6 5.5 6 .8-4.4 4.2 1.1 6L12 17l-5.3 2.9 1.1-6L3.4 9.5l6-.8z"/>',
  mapping: '<path d="M12 21.3s6.6-6.3 6.6-11.3A6.6 6.6 0 0 0 5.4 10c0 5 6.6 11.3 6.6 11.3z"/><circle cx="12" cy="9.7" r="2.3"/>',
  gear: '<circle cx="12" cy="12" r="3.1"/><path d="M12 2.6v2.3M12 19.1v2.3M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.6 12h2.3M19.1 12h2.3M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6"/>',
  card: '<rect x="3" y="6" width="18" height="12" rx="2.4"/><path d="M3 10h18"/><path d="M6.5 14.5h3"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.4v2.2M12 19.4v2.2M4.4 4.4l1.6 1.6M18 18l1.6 1.6M2.4 12h2.2M19.4 12h2.2M4.4 19.6l1.6-1.6M18 6l1.6-1.6"/>',
  moon: '<path d="M20.5 14.8A8.2 8.2 0 1 1 9.2 3.5 6.5 6.5 0 0 0 20.5 14.8Z"/>',
  shield: '<path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3z"/><path d="M9 12l2 2 4-4"/>',
  speech: '<path d="M20 15a2 2 0 0 1-2 2H8l-4 3V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z"/>',
  funnel: '<path d="M4 5h16l-6 7v6l-4 2v-8z"/>',
  droplet: '<path d="M12 3s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11z"/>',
  battery: '<rect x="3" y="8" width="15" height="8" rx="2"/><path d="M21 11v2"/><path d="M6.5 10.5v3"/><path d="M9.5 10.5v3"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.5-4.5"/><path d="M4 4v4h4"/><path d="M4 13a8 8 0 0 0 14.5 4.5"/><path d="M20 20v-4h-4"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  sparkles: '<path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z"/><path d="M18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/>',
  users: '<path d="M15.5 20.5v-1.7a4 4 0 0 0-4-4h-5a4 4 0 0 0-4 4v1.7"/><circle cx="9" cy="7.3" r="3.5"/><path d="M22 20.5v-1.7a4 4 0 0 0-3-3.87"/><path d="M15.3 3.9a3.5 3.5 0 0 1 0 6.8"/>',
  check: '<circle cx="12" cy="12" r="9"/><path d="M8 12.2l2.6 2.6L16 9.5"/>',
  id: '<rect x="3" y="5" width="18" height="14" rx="2.4"/><circle cx="9" cy="11" r="2.2"/><path d="M5.8 16.2a3.6 3.6 0 0 1 6.4 0"/><path d="M14.5 9.5h4M14.5 12.5h4M14.5 15h2.5"/>',
  lock: '<rect x="4.5" y="10.5" width="15" height="9.5" rx="2.2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  flask: '<path d="M9 3h6M10 3v6l-4.5 7.5A2 2 0 0 0 7.2 20h9.6a2 2 0 0 0 1.7-3L14 9V3"/><path d="M8.2 14h7.6"/>',
  phone: '<path d="M4.5 5.5c0 8 6 14 14 14l1.8-3-4-1.8-1.6 1.4a11 11 0 0 1-5.2-5.2l1.4-1.6L9 5.5z"/>',
  box: '<path d="M12 3l8 4.2v9.6L12 21l-8-4.2V7.2z"/><path d="M4.2 7.3L12 11.4l7.8-4.1M12 11.4V21"/>',
  clipboard: '<rect x="6" y="4.5" width="12" height="16" rx="2"/><path d="M9 4.5V3.5h6v1"/><path d="M9 10h6M9 13.5h6M9 17h4"/>',
  broom: '<path d="M15 4l5 5M13.5 5.5l3.5 3.5-6.5 6.5-4.5 1 1-4.5z"/><path d="M6 15l-2 5M9 16l-1.5 4.5M11.5 17l-1 3.5"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2.4"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/><path d="M7.5 13h3M13.5 13h3M7.5 16.5h3"/>',
  alert: '<path d="M12 4l9 15.5H3z"/><path d="M12 10v4M12 17h.01"/>',
};
const icon = (name, sw = 1.8) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${P[name] || P.star}</svg>`;

/* Thème → variables CSS (couleur pastille, icône, texte, puce) */
const TH = {
  gold: { chip: "var(--gold-chip)", ic: "var(--gold-ink)", tx: "var(--gold-ink)", dot: "var(--gold-ink)" },
  legal: { chip: "var(--legal-chip)", ic: "var(--legal-ic)", tx: "var(--legal-tx)", dot: "var(--legal-ic)" },
  prod: { chip: "var(--prod-chip)", ic: "var(--prod-ic)", tx: "var(--prod-tx)", dot: "var(--prod-ic)" },
  exch: { chip: "var(--exch-chip)", ic: "var(--exch-ic)", tx: "var(--exch-tx)", dot: "var(--exch-ic)" },
  serv: { chip: "var(--serv-chip)", ic: "var(--serv-ic)", tx: "var(--serv-tx)", dot: "var(--serv-ic)" },
};
const th = (t) => TH[t] || TH.gold;
const chip = (name, t) => `<div class="chip" style="background:${th(t).chip};color:${th(t).ic}">${icon(name)}</div>`;

/* Emblème SVG (cover) */
const EMBLEM = `<svg class="emblem" viewBox="0 0 120 120" fill="none" stroke="var(--gold)" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">
  <circle cx="60" cy="60" r="55" stroke-width="2.4"/><circle cx="60" cy="60" r="47" stroke-width="1.1"/>
  <path d="M60 40 C60 40 74 58 74 69 A14 14 0 1 1 46 69 C46 58 60 40 60 40 Z" stroke-width="2.6"/>
  <path d="M53 70 a7 7 0 0 0 7 7" stroke-width="1.8"/>
  <path d="M54 34 C50 30 50 26 54 22 C58 18 58 14 54 10" stroke-width="1.8"/>
  <path d="M66 34 C70 30 70 26 66 22 C62 18 62 14 66 10" stroke-width="1.8"/></svg>`;

/* ---- Rendu des blocs ---- */
function renderBlock(b, section) {
  switch (b.type) {
    case "para":
      return `<p>${b.html}</p>`;
    case "subhead":
      return `<div class="subhead">${b.text}</div>`;
    case "micro":
      return `<div class="microlabel">${b.text}</div>`;
    case "bullets": {
      const dot = th(b.theme || section.theme).dot;
      return `<ul class="dots" style="--dot:${dot}">${b.items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
    }
    case "steps":
      return `<ol class="steps">${b.items.map((i) => `<li>${i}</li>`).join("")}</ol>`;
    case "itemcard":
      return `<div class="itemcard"><span style="color:${th(b.theme).ic}">${icon(b.icon)}</span><span class="ic-tx">${b.html}</span></div>`;
    case "callout": {
      const tag = b.tag ? `<span class="cl-tag">${b.tag}</span>` : "";
      return `<div class="callout ${b.variant}">${tag}${b.html}</div>`;
    }
    case "table": {
      const head = `<thead><tr>${b.headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>`;
      const body = `<tbody>${b.rows
        .map((row) => `<tr>${row.map((c) =>
          typeof c === "string" ? `<td>${c}</td>` : `<td class="${c.cls || ""}">${c.t}</td>`
        ).join("")}</tr>`)
        .join("")}</tbody>`;
      return `<table class="vt ${b.calendar ? "cal" : ""}" style="--th:${th(b.theme || "gold").ic}">${head}${body}</table>`;
    }
    default:
      return "";
  }
}

function renderSection(s, first) {
  const badges = (s.badges || [])
    .map((b) => `<span class="badge ${b.kind}">${b.label}</span>`)
    .join("");
  const head = `<div class="section-head">
    ${chip(s.icon, s.theme)}
    <div class="htext">
      ${s.kicker ? `<div class="sec-num" style="color:${th(s.theme).tx}">${s.kicker}</div>` : ""}
      <div class="sec-title">${s.title}</div>
      ${s.sub ? `<div class="sec-sub">${s.sub}</div>` : ""}
    </div>
    ${badges ? `<div class="badges">${badges}</div>` : ""}
  </div>`;
  const body = (s.blocks || []).map((b) => renderBlock(b, s)).join("");
  return `<div class="section ${first ? "page-break" : ""}">${head}${body}</div>`;
}

function renderCover(meta) {
  return `<div class="cover">
    <div class="topline"><span class="vs">VAPE SOCIÉTÉ</span></div>
    ${EMBLEM}
    <div class="wordmark">VAPE SOCIÉTÉ</div>
    <div class="kicker">ARTICLES POUR VAPOTEURS</div>
    <div class="divider"></div>
    <div class="doctitle">${meta.coverTitle}</div>
    ${meta.coverSubtitle ? `<div class="docsub">${meta.coverSubtitle}</div>` : ""}
    ${meta.coverIntro ? `<div class="intro">${meta.coverIntro}</div>` : ""}
    <div class="foot">${meta.docLabel}</div>
  </div>`;
}

function renderToc(toc) {
  if (!toc || !toc.length) return "";
  const items = toc
    .map((it) => `<div class="toc-item">${chip(it.icon, it.theme)}
      <div><div class="n" style="color:${th(it.theme).tx}">${it.n}</div><div class="t">${it.title}</div></div></div>`)
    .join("");
  return `<div class="page-break"><div class="toc-title">Table des matières</div>
    <div class="toc-sub">Repère la section dont tu as besoin.</div>
    <div class="toc-grid">${items}</div></div>`;
}

export function renderDocumentToHTML(doc) {
  const coverHTML = renderCover(doc.meta);
  const tocHTML = renderToc(doc.toc);
  const sectionsHTML = (doc.sections || [])
    .map((s, i) => renderSection(s, i === 0))
    .join("");
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><style>${FONTS}${CSS}</style></head><body>${coverHTML}${tocHTML}${sectionsHTML}</body></html>`;
}
