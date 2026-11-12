/* ==========================================================================
 * 80 · USCITA DEI DATI: PDF, EMAIL, VISUALIZZAZIONE, CANCELLAZIONE
 * Unico punto da cui i dati lasciano la pagina, e sempre per azione esplicita
 * dell'utente:
 *   - PDF salvato sul suo dispositivo
 *   - email aperta nel SUO programma di posta (link mailto:, nessun invio dal sito)
 * Nessun dato viene trasmesso a server. Il PDF scaricato e l'email inviata
 * restano dove l'utente li ha messi: da qui in poi non sono più sotto il
 * controllo della pagina.
 * ========================================================================== */

/** true fuori da claude.ai (es. GitHub Pages): download e stampa nativi del browser. */
const STANDALONE = !(window.claude && window.claude.use);

/** Messaggio sotto i pulsanti di una scheda (k = 'pmi' | 'st' | 'pmi-c' | 'st-c'). */
function pdfMsg(k, testo) { const el = $(`[data-pdfmsg="${k}"]`); el.textContent = testo; el.hidden = !testo; }

/** Abilita o blocca i pulsanti di uscita in base alla validità del preventivo. */
function syncOutput(k) {
  const bloccato = !!Q[k].blocked;
  document.querySelectorAll(`[data-pdf="${k}"],[data-pdf="${k}-c"],[data-view="${k}"]`).forEach(b => { b.disabled = bloccato; });
  $(`[data-mail="${k}"]`).setAttribute('aria-disabled', bloccato);
}

/**
 * Consegna un PDF all'utente. In claude.ai passa dalla conferma della
 * piattaforma; altrove usa il download del browser.
 * @returns {Promise<string>} messaggio da mostrare
 */
async function savePdf(doc, nome) {
  const file = safeName(nome) + '.pdf';
  if (STANDALONE) { doc.save(file); return 'PDF scaricato.'; }
  const dl = await window.claude.use('downloads');
  if (!dl) return 'Da questa vista il download non è disponibile. Apri la pagina su claude.ai e riprova.';
  try { await dl.save({ filename: file, data: doc.output('arraybuffer') }); return 'PDF salvato.'; }
  catch (err) {
    if (err && err.code === 'declined') return 'Download annullato.';
    if (err && err.code === 'rate_limited') return 'C\'è già una richiesta di download aperta: confermala o riprova tra poco.';
    throw err;
  }
}

const FINE = ' Quando hai finito, premi "Cancella i dati".';

/* ---- scarica il PDF (preventivo: data-pdf="pmi|st"; contratto: "pmi-c|st-c") ---- */
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-pdf]'); if (!b || b.disabled) return;
  const k = b.dataset.pdf, contratto = k.endsWith('-c'), key = contratto ? k.slice(0, -2) : k;
  pdfMsg(k, '');
  if (contratto && showContractErrors(key).length) { pdfMsg(k, 'Correggi i campi segnati in rosso nel contratto prima di scaricarlo.'); return; }
  try {
    const esito = contratto ? await savePdf(makeContractPdf(key), C[key].file) : await savePdf(makePdf(Q[k]), Q[k].file);
    pdfMsg(k, esito + FINE);
  } catch (err) { pdfMsg(k, 'Non sono riuscito a creare il PDF. Riprova.'); }
});

/* ---- invia per email ----
 * Apre il programma di posta dell'utente con destinatario, copia fissa a
 * MAIL_CC, oggetto e riepilogo. L'allegato non si può aggiungere da una
 * pagina web: scarichiamo il PDF e chiediamo di allegarlo. */
document.addEventListener('click', e => {
  const a = e.target.closest('[data-mail]'); if (!a) return;
  e.preventDefault();
  const k = a.dataset.mail, q = Q[k], dest = $(`#${k}-mail`).value.trim();
  if (q.blocked) { pdfMsg(k, 'Sistema prima gli importi sotto il minimo.'); return; }
  const errore = dest ? vEmail(dest) : 'Scrivi l\'email del destinatario nei dati qui sopra.';
  if (errore) { pdfMsg(k, errore); $(`#${k}-mail`).focus(); return; }

  const corpo = quoteText(q).slice(0, 1500); // i programmi di posta troncano i link lunghi
  const link = `mailto:${encodeURIComponent(dest)}?cc=${encodeURIComponent(MAIL_CC)}&subject=${encodeURIComponent(q.file)}&body=${encodeURIComponent(corpo)}`;
  const tmp = document.createElement('a'); tmp.href = link; tmp.click(); // dentro il gesto dell'utente
  savePdf(makePdf(q), q.file).catch(() => {});
  pdfMsg(k, `Ho aperto il programma di posta e scaricato il PDF: allegalo prima di inviare. Destinatario ${dest}, in copia ${MAIL_CC}. Se la posta non si è aperta, scrivi tu a questi due indirizzi.` + FINE);
});

/* ---- visualizza il contratto compilato (sola lettura) ---- */
let viewKey = null, blobUrl = null;
const chiudiViewer = () => { $('#viewer').hidden = true; $('#viewer-doc').innerHTML = ''; $('#viewer-t').textContent = ''; document.body.style.overflow = ''; };

document.addEventListener('click', e => {
  const b = e.target.closest('[data-view]'); if (!b || b.disabled) return;
  viewKey = b.dataset.view;
  renderContract(viewKey, 'viewer-doc');
  $('#viewer-t').textContent = C[viewKey].file;
  $('#viewer-print').hidden = !STANDALONE; // la stampa passa dal PDF, che ha il layout dell'originale
  $('#viewer').hidden = false; $('#viewer').scrollTop = 0; document.body.style.overflow = 'hidden';
});
$('#viewer-x').addEventListener('click', chiudiViewer);
$('#viewer-dl').addEventListener('click', () => { chiudiViewer(); $(`[data-pdf="${viewKey}-c"]`).click(); });
$('#viewer-print').addEventListener('click', () => {
  if (showContractErrors(viewKey).length) { chiudiViewer(); pdfMsg(viewKey + '-c', 'Correggi i campi segnati in rosso nel contratto prima di stamparlo.'); return; }
  if (blobUrl) URL.revokeObjectURL(blobUrl);
  blobUrl = makeContractPdf(viewKey).output('bloburl');
  window.open(blobUrl, '_blank');
});

/* ---- cancellazione dei dati ---- */

/**
 * Riporta la pagina allo stato iniziale: svuota campi, contratti, righe e
 * anteprime. Restano solo i numeri d'esempio, che non sono dati di clienti.
 * @param {string} motivo testo mostrato all'utente
 */
function wipeAll(motivo) {
  document.querySelectorAll('main input, main select').forEach(el => {
    if (el.type === 'checkbox') el.checked = el.defaultChecked;
    else if (el.tagName === 'SELECT') { const i = [...el.options].findIndex(o => o.defaultSelected); el.selectedIndex = i < 0 ? 0 : i; }
    else el.value = el.defaultValue;
  });
  pmi.reg = 'ord';
  $('#pmi-reg').querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.r === 'ord'));
  for (const k of ['pmi', 'st']) { C[k].user = {}; C[k].auto = {}; }
  Object.keys(TIPI).forEach(t => { S.comp[t] = { n: num($(`#c-${t}-n`).value), docs: num($(`#c-${t}-docs`).value), serv: $(`#c-${t}-serv`).value }; });
  if (blobUrl) { URL.revokeObjectURL(blobUrl); blobUrl = null; }
  chiudiViewer();
  ['pmi-err', 'st-err'].forEach(id => { $('#' + id).innerHTML = ''; });
  ['pmi', 'st', 'pmi-c', 'st-c'].forEach(k => pdfMsg(k, ''));
  renderPmi(); genera(); // genera() ricrea le righe: le schede dei clienti spariscono con loro
  document.querySelectorAll('[data-wipemsg]').forEach(el => showNotes(el, [['ok', motivo]]));
}

document.addEventListener('click', e => {
  if (e.target.closest('[data-wipe]')) wipeAll('Dati cancellati. I PDF già scaricati e le email già inviate restano sul tuo dispositivo e nella tua posta.');
});
// appena si ricomincia a scrivere, l'avviso di cancellazione sparisce
document.addEventListener('input', () => document.querySelectorAll('[data-wipemsg]').forEach(el => { el.innerHTML = ''; }));

// inattività: dopo IDLE_WIPE_MIN minuti senza interazioni i dati vengono cancellati
let idleTimer = null;
const riarmaInattivita = () => {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => wipeAll(`Dati cancellati dopo ${IDLE_WIPE_MIN} minuti di inattività.`), IDLE_WIPE_MIN * 60000);
};
['input', 'click', 'keydown'].forEach(ev => document.addEventListener(ev, riarmaInattivita, true));

// ritorno da "indietro/avanti": il browser può ripresentare la pagina com'era
window.addEventListener('pageshow', e => { if (e.persisted) wipeAll('Dati cancellati: la pagina era rimasta in memoria nel browser.'); });
