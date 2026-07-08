// Moteur PDF — HTML -> PDF Letter via Chromium (Playwright, déjà installé dans ce studio).
// Fond imprimé, pied de page « VAPE SOCIÉTÉ · <docLabel> » + numéros de page.
import { chromium } from "playwright-core";

export async function renderPDF(html, docLabel = "Guide", numbers = true) {
  const browser = await chromium.launch({
    channel: "chrome",
    args: ["--force-color-profile=srgb", "--no-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    // Attendre les polices (évite le FOUT dans le PDF).
    await page.evaluate(async () => { try { if (document.fonts) await document.fonts.ready; } catch {} });

    const footer = numbers
      ? `<div style="width:100%;font-family:Poppins,sans-serif;font-size:8px;color:#9a917f;
          padding:0 0.5in;box-sizing:border-box;display:flex;justify-content:space-between;align-items:center;">
          <span style="color:#8a5a12;font-weight:600;letter-spacing:1.3px;">VAPE SOCIÉTÉ&nbsp;·&nbsp;${docLabel}</span>
          <span>Page <span class="pageNumber"></span>&nbsp;/&nbsp;<span class="totalPages"></span></span></div>`
      : "<div></div>";

    const pdf = await page.pdf({
      format: "Letter",
      printBackground: true,
      displayHeaderFooter: numbers,
      headerTemplate: "<div></div>",
      footerTemplate: footer,
      margin: { top: "0.5in", bottom: numbers ? "0.6in" : "0in", left: "0.5in", right: "0.5in" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
