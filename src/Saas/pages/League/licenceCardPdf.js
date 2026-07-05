import jsPDF from "jspdf";
import fbkLogoDefault from "../../../assets/logos/fbk-logo.jpg";

// Convertit une URL image en base64 pour jsPDF
const toBase64 = (url) =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext("2d").drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });

// Étoile à 5 branches remplie (pour le drapeau du Burkina Faso)
function drawStar(doc, cx, cy, outerR, innerR, color) {
  const points = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    points.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }
  const deltas = points
    .slice(1)
    .map((p, i) => [p[0] - points[i][0], p[1] - points[i][1]]);
  doc.setFillColor(...color);
  doc.lines(deltas, points[0][0], points[0][1], [1, 1], "F", true);
}

/**
 * Génère la carte de licence fédérale au format "carte officielle papier"
 * (bannière fédération, coin drapeau, logo, champs N°/Ligue/Club, grille Renouvellement).
 */
export const generateLicenceCardPdf = async ({
  licence,
  federationName,
  leagueName,
  clubName,
  logoUrl,
}) => {
  const W = 190;
  const H = 85;
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: [W, H] });

  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, "F");

  const leftW = 76;
  doc.setDrawColor(190, 190, 190);
  doc.setLineWidth(0.3);
  doc.line(leftW, 4, leftW, H - 4);

  // --- Panneau gauche : "Renouvellement" ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 30, 30);
  doc.text("Renouvellement", leftW / 2, 8, { align: "center" });

  const gridLeft = 6;
  const gridRight = leftW - 6;
  const gridTop = 12;
  const gridBottom = H - 4;
  const rows = 6;
  const midX = (gridLeft + gridRight) / 2;
  const rowH = (gridBottom - gridTop) / rows;

  doc.setDrawColor(60, 60, 60);
  doc.setLineWidth(0.2);
  doc.rect(gridLeft, gridTop, gridRight - gridLeft, gridBottom - gridTop);
  doc.line(midX, gridTop, midX, gridBottom);
  for (let i = 1; i < rows; i++) {
    const y = gridTop + i * rowH;
    doc.line(gridLeft, y, gridRight, y);
  }

  // --- Panneau droit : informations ---
  const rx = leftW + 6;
  const rw = W - leftW - 10;

  // Coin drapeau du Burkina Faso (vert / rouge / étoile jaune)
  doc.setFillColor(0, 149, 60);
  doc.triangle(W - 28, 0, W, 0, W, 28, "F");
  doc.setFillColor(238, 43, 44);
  doc.triangle(W - 28, 0, W, 0, W - 14, 14, "F");
  drawStar(doc, W - 10, 8, 3, 1.2, [250, 204, 21]);

  // Nom fédération
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(120, 20, 20);
  doc.text("FEDERATION", rx, 12);
  doc.text((federationName || "—").toUpperCase(), rx, 19);

  doc.setDrawColor(120, 20, 20);
  doc.setLineWidth(0.4);
  doc.line(rx, 22, rx + rw - 20, 22);

  // Logo circulaire : logo_url dynamique si fourni, sinon logo FBK par défaut
  const cx = rx + 16;
  const cy = 40;
  const r = 14;
  let logoDrawn = false;
  try {
    const base64 = await toBase64(logoUrl || fbkLogoDefault);
    if (base64) {
      doc.addImage(base64, "PNG", cx - r, cy - r, r * 2, r * 2);
      logoDrawn = true;
    }
  } catch {
    /* silencieux */
  }
  if (!logoDrawn) {
    doc.setDrawColor(170, 170, 170);
    doc.setLineWidth(0.3);
    doc.circle(cx, cy, r);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(170, 170, 170);
    doc.text("LOGO", cx, cy + 1, { align: "center" });
  }

  // "LICENCE FEDERALE"
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(200, 30, 30);
  doc.text("LICENCE FEDERALE", cx + r + 8, 42);

  // Champs
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(30, 30, 30);
  doc.setDrawColor(60, 60, 60);
  doc.setLineWidth(0.2);

  const fieldY = 58;
  doc.text("N°", rx, fieldY);
  doc.roundedRect(rx + 8, fieldY - 4, 26, 6, 1, 1);
  doc.setFont("courier", "bold");
  doc.setFontSize(8);
  doc.setTextColor(200, 30, 30);
  doc.text(licence?.numero || "", rx + 10, fieldY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(30, 30, 30);
  doc.text("Délivrée le :", rx + 38, fieldY);
  doc.roundedRect(rx + 38 + 22, fieldY - 4, rw - (38 + 22) - 2, 6, 1, 1);
  const dateDelivrance = licence?.created_at
    ? new Date(licence.created_at).toLocaleDateString("fr-FR")
    : "";
  doc.setTextColor(60, 60, 60);
  doc.text(dateDelivrance, rx + 38 + 24, fieldY);

  const ligneY2 = fieldY + 9;
  doc.setTextColor(30, 30, 30);
  doc.text("Ligue :", rx, ligneY2);
  doc.roundedRect(rx + 16, ligneY2 - 4, rw - 18, 6, 1, 1);
  doc.setFont("helvetica", "bold");
  doc.text(leagueName || "—", rx + 18, ligneY2);

  const ligneY3 = ligneY2 + 8;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 30, 30);
  doc.text("Club :", rx, ligneY3);
  doc.roundedRect(rx + 16, ligneY3 - 4, rw - 18, 6, 1, 1);
  doc.setFont("helvetica", "bold");
  doc.text(clubName || "—", rx + 18, ligneY3);

  doc.save(`licence-${licence?.numero || licence?.id}.pdf`);
};
