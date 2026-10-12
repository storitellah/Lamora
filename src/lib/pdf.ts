/**
 * A tiny, dependency-free PDF writer: one page holding one JPEG.
 *
 * PDF can embed JPEG data as-is (the DCTDecode filter), so a valid file is
 * just a handful of text objects plus the image bytes and a cross-reference
 * table of byte offsets. This replaces the old "open a print window" export,
 * which pop-up blockers, home-screen web apps and the installed app all stop.
 */
export function jpegToPdf(jpeg: Uint8Array, pxW: number, pxH: number, pageWmm: number, pageHmm: number): Blob {
  const pt = (mm: number) => (mm * 72) / 25.4;
  const W = pt(pageWmm), H = pt(pageHmm);
  // Fit the image inside the page, centred, keeping its aspect ratio.
  const s = Math.min(W / pxW, H / pxH);
  const iw = pxW * s, ih = pxH * s, ix = (W - iw) / 2, iy = (H - ih) / 2;

  const enc = new TextEncoder();
  const parts: Uint8Array[] = [];
  const offsets: number[] = [];
  let length = 0;
  const add = (b: Uint8Array | string) => {
    const bytes = typeof b === "string" ? enc.encode(b) : b;
    parts.push(bytes); length += bytes.length;
  };
  const obj = (n: number, body: string) => { offsets[n] = length; add(`${n} 0 obj\n${body}\nendobj\n`); };

  add("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
  obj(1, "<< /Type /Catalog /Pages 2 0 R >>");
  obj(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  obj(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W.toFixed(2)} ${H.toFixed(2)}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
  offsets[4] = length;
  add(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${pxW} /Height ${pxH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`);
  add(jpeg);
  add("\nendstream\nendobj\n");
  const content = `q ${iw.toFixed(2)} 0 0 ${ih.toFixed(2)} ${ix.toFixed(2)} ${iy.toFixed(2)} cm /Im0 Do Q`;
  obj(5, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`);

  const xref = length;
  let table = `xref\n0 6\n0000000000 65535 f \n`;
  for (let i = 1; i <= 5; i++) table += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  add(table + `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  return new Blob(parts as BlobPart[], { type: "application/pdf" });
}
