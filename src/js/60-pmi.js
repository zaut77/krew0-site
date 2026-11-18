/* ==========================================================================
 * 60 · PREVENTIVO PMI
 * Legge il modulo, calcola, aggiorna conto, foglio del preventivo e contratto.
 * ========================================================================== */

/** Regime scelto con il selettore a due pulsanti. */
const pmi = { reg: 'ord' };

/** Dati del modulo PMI nella forma attesa da calcPmi. */
function leggiPmi() {
  const ov = $('#pmi-ov').value;
  return { reg: pmi.reg, att: num($('#pmi-att').value), pas: num($('#pmi-pas').value), corr: $('#pmi-corr').checked, ov: ov === '' ? null : num(ov) };
}

function renderPmi() {
  const d = leggiPmi(), r = calcPmi(d), L = LISTINO.pmi;

  // campo prezzo: suggerimento, minimo e stato d'errore
  const campo = $('#pmi-ov');
  campo.placeholder = dec(r.base); campo.dataset.min = r.base; campo.classList.toggle('bad', r.sotto);

  // conto
  $('#pmi-fascia').textContent = `${r.nome} fino a ${int(r.soglia)} documenti`;
  $('#pmi-sum').innerHTML = `
    <div><span>Documenti all'anno</span><span>${int(r.docs)}</span></div>
    <div><span>Minimo di listino</span><span>${eur(r.base)}</span></div>
    ${d.ov != null ? `<div><span>Prezzo proposto</span><span>${eur(r.appl)}</span></div>` : ''}
    <div><span>Eccedenza stimata (${int(r.oltre)} doc × ${eur(L.ecc)}), a consuntivo</span><span>${eur(r.ecc)}</span></div>
    <div><span>Imponibile annuo</span><span>${eur(r.imp)}</span></div>
    <div><span>IVA ${LISTINO.iva}%</span><span>${eur(r.iva)}</span></div>
    <div class="tot"><span>Totale annuo</span><span>${eur(r.tot)}</span></div>
    <div><span>Pari a, al mese (imponibile)</span><span>${eur(r.imp / 12)}</span></div>`;

  const note = [];
  if (r.sotto) note.push(['bad', `Il prezzo proposto è ${eur(r.base - r.appl)} sotto il minimo di listino (${eur(r.base)}).`]);
  else if (r.appl > r.base + 0.005) note.push(['ok', `Prezzo proposto ${eur(r.appl - r.base)} sopra il minimo di listino.`]);
  if (r.oltre) note.push(['warn', `I documenti superano la soglia di ${int(r.soglia)}: l'eccedenza si paga a fine anno sul consuntivo.`]);
  else if (r.docs >= r.soglia * 0.9) note.push(['warn', `Sei entro il 10% dalla soglia di ${int(r.soglia)} documenti: conviene tenersi larghi.`]);
  showNotes($('#pmi-notes'), note);

  // foglio del preventivo
  const nome = $('#pmi-nome').value.trim(), prep = $('#pmi-prep').value.trim();
  const numero = $('#pmi-num').value.trim(), valido = $('#pmi-val').value.trim();
  $('#pmi-val').classList.toggle('bad', !!valido && !!vDate(valido));
  Q.pmi = {
    file: 'Preventivo Yuxme PMI' + (nome ? ' - ' + nome : ''), blocked: r.sotto, data: today(), footer: piede(numero, prep, valido),
    meta: metaNumero(numero, valido).concat([['Cliente', nome || 'Da indicare'], ['Servizio', 'Contabilità PMI'], ['Regime contabile', r.nome], ['Documenti all\'anno', int(r.docs)]],
      prep ? [['Preparato da', prep]] : []),
    cols: [{ t: 'Voce' }, { t: 'Dettaglio' }, { t: 'Importo annuo', r: 1 }],
    rows: [['Canone annuo', `${r.nome}, fino a ${int(r.soglia)} documenti`, eur(r.appl)]]
      .concat(r.oltre ? [['Eccedenza stimata, a consuntivo', `${int(r.oltre)} documenti × ${eur(L.ecc)}`, eur(r.ecc)]] : []),
    totals: [['Imponibile annuo', eur(r.imp)], [`IVA ${LISTINO.iva}%`, eur(r.iva)], ['Totale annuo', eur(r.tot), 1], ['Pari a, al mese (imponibile)', eur(r.imp / 12)]],
    notes: ['Importi annui.',
      `Documenti = fatture attive, fatture passive e ricevute${d.corr ? `, più ${L.corr} documenti l'anno per i corrispettivi` : ''}.`,
      `I documenti oltre ${int(r.soglia)} costano ${eur(L.ecc)} l'uno e si calcolano a fine anno sul consuntivo.`],
  };
  renderSheet('pmi-sheet', Q.pmi);

  // contratto: i dati economici arrivano dal preventivo
  const a = C.pmi.auto;
  a.soc = nome; a.canone = dec(r.appl / 12); a.soglia = int(r.soglia); a.data = today(); a.sepa = '1';
  C.pmi.min = { canone: r.base / 12 };
  C.pmi.file = 'Contratto Yuxme PMI' + (nome ? ' - ' + nome : '');
  renderContract('pmi');
  syncOutput('pmi');
}

/* ---- eventi ---- */

$('#pmi-reg').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  pmi.reg = b.dataset.r;
  $('#pmi-reg').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
  renderPmi();
});

// ogni modifica del modulo ricalcola; i campi del contratto hanno eventi propri (51)
$('#v-pmi').addEventListener('input', e => {
  if (e.target.closest('.contract')) return;
  if (e.target.id === 'pmi-ov') $('#pmi-err').innerHTML = '';
  renderPmi();
});

// uscita dal prezzo proposto: sotto il minimo non si può, il campo torna al listino
$('#pmi-ov').addEventListener('change', e => {
  const el = e.target, min = +el.dataset.min;
  if (el.value === '' || num(el.value) >= min - 0.005) return;
  showNotes($('#pmi-err'), [['bad', `Errore: ${eur(num(el.value))} è sotto il minimo di listino. Ho riportato il prezzo a ${eur(min)}: si può solo alzare.`]]);
  el.value = ''; renderPmi();
});
