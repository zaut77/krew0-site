/* ==========================================================================
 * 40 · FOGLIO DEL PREVENTIVO
 * Un solo modello dati per l'anteprima in pagina, il PDF e il testo dell'email:
 *   { file, blocked, data, footer, meta:[[etichetta,valore]], cols:[{t, r?}],
 *     rows:[[…]], totals:[[etichetta, valore, evidenzia?]], notes:[…] }
 * ========================================================================== */

/** Preventivi correnti: Q.pmi e Q.st. */
const Q = {};

/** Caratteri che i font standard del PDF (codifica WinAnsi) non hanno. */
const pdfTxt = s => String(s).replace(/−/g, '-').replace(/[  ]/g, ' ').replace(/→/g, '>');

/** Anteprima del preventivo dentro l'elemento con quell'id. */
function renderSheet(id, q) {
  const cls = c => c.r ? ' class="num"' : '';
  $('#' + id).innerHTML = `
    <div class="sh-top"><img src="${BRAND.logo}" alt="Yuxme"><div><b>Preventivo</b>${esc(q.data)}</div></div>
    <div class="sh-meta">${q.meta.map(m => `<div><span>${esc(m[0])}</span>${esc(m[1])}</div>`).join('')}</div>
    <table><thead><tr>${q.cols.map(c => `<th${cls(c)}>${esc(c.t)}</th>`).join('')}</tr></thead>
      <tbody>${q.rows.map(r => `<tr>${r.map((v, i) => `<td${cls(q.cols[i])}>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>
    <div class="sh-tot">${q.totals.map(t => `<div${t[2] ? ' class="big"' : ''}><span>${esc(t[0])}</span><span>${esc(t[1])}</span></div>`).join('')}</div>
    <div class="sh-notes">${q.notes.map(n => `<p>${esc(n)}</p>`).join('')}</div>`;
}

/** PDF del preventivo (A4). Restituisce il documento jsPDF. */
function makePdf(q) {
  const { jsPDF } = window.jspdf, doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const M = 16, W = 210, K = BRAND.pdf;

  // intestazione
  doc.addImage(BRAND.logo, 'PNG', M, 14, 11 * BRAND.logoRatio, 11);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor(...K.accent); doc.text('Preventivo', W - M, 19, { align: 'right' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...K.muted); doc.text(pdfTxt(q.data), W - M, 25, { align: 'right' });
  doc.setDrawColor(...K.accent); doc.setLineWidth(.8); doc.line(M, 31, W - M, 31);

  // dati di testata, su due colonne
  let y = 40; const colW = (W - 2 * M) / 2;
  q.meta.forEach((m, i) => {
    const x = M + (i % 2) * colW; if (i && i % 2 === 0) y += 12;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(...K.label); doc.text(pdfTxt(m[0]).toUpperCase(), x, y);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5); doc.setTextColor(...K.ink); doc.text(doc.splitTextToSize(pdfTxt(m[1]), colW - 6)[0], x, y + 5);
  });
  y += 13;

  // righe
  const destra = {}; q.cols.forEach((c, i) => { if (c.r) destra[i] = { halign: 'right' }; });
  doc.autoTable({
    startY: y, margin: { left: M, right: M, bottom: 18 }, head: [q.cols.map(c => c.t)], body: q.rows.map(r => r.map(pdfTxt)),
    styles: { font: 'helvetica', fontSize: 9, cellPadding: 2.2, textColor: K.ink, lineColor: [217, 222, 232] },
    headStyles: { fillColor: K.accent, textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
    alternateRowStyles: { fillColor: [248, 249, 252] }, columnStyles: destra,
    didParseCell: d => { if (d.section === 'head' && q.cols[d.column.index].r) d.cell.styles.halign = 'right'; },
  });

  // totali, allineati a destra
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 7, margin: { left: W - M - 88, right: M, bottom: 18 }, theme: 'plain', pageBreak: 'avoid',
    body: q.totals.map(t => [pdfTxt(t[0]), pdfTxt(t[1])]),
    styles: { font: 'helvetica', fontSize: 9.5, cellPadding: 1.8, textColor: K.ink }, columnStyles: { 0: { textColor: K.muted }, 1: { halign: 'right' } },
    didParseCell: d => { if (q.totals[d.row.index][2]) Object.assign(d.cell.styles, { fillColor: K.soft, fontStyle: 'bold', fontSize: 11, textColor: K.accent, cellPadding: 3 }); },
  });

  // note
  y = doc.lastAutoTable.finalY + 10; doc.setFontSize(8); doc.setTextColor(...K.muted);
  for (const n of q.notes) {
    const righe = doc.splitTextToSize(pdfTxt(n), W - 2 * M);
    if (y + righe.length * 3.8 > 285) { doc.addPage(); y = 20; }
    doc.text(righe, M, y); y += righe.length * 3.8 + 1.5;
  }

  // piè di pagina
  const pagine = doc.getNumberOfPages();
  for (let i = 1; i <= pagine; i++) {
    doc.setPage(i); doc.setFontSize(8); doc.setTextColor(...K.muted);
    doc.text(pdfTxt(q.footer || 'Yuxme'), M, 289); doc.text(`Pagina ${i} di ${pagine}`, W - M, 289, { align: 'right' });
  }
  return doc;
}

/**
 * Riepilogo in testo semplice per l'email.
 * @param {boolean} [soloDati] senza saluti: li aggiunge il servizio di invio
 */
function quoteText(q, soloDati) {
  return [
    ...(soloDati ? [] : ['Buongiorno,', '', 'in allegato il preventivo Yuxme. In sintesi:', '']),
    ...q.meta.map(m => `${m[0]}: ${m[1]}`), '',
    ...q.rows.map(r => r.join(' · ')), '',
    ...q.totals.map(t => `${t[0]}: ${t[1]}`), '',
    ...q.notes, ...(soloDati ? [] : ['', 'Resto a disposizione.']),
  ].join('\n').replace(/−/g, '-');
}
