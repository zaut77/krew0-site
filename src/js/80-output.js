/* ==========================================================================
 * 80 · USCITA DEI DATI: PDF, EMAIL, VISUALIZZAZIONE, CANCELLAZIONE
 * Unico punto da cui i dati lasciano la pagina, e sempre per azione esplicita
 * dell'utente:
 *   - PDF salvato sul suo dispositivo
 *   - email: dal servizio di invio (se configurato) o dal SUO programma di posta
 * A parte l'invio email richiesto dall'utente, nessun dato viene trasmesso a server. Il PDF scaricato e l'email inviata
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
  document.querySelectorAll(`[data-mail="${k}"],[data-mailto="${k}"]`).forEach(a => a.setAttribute('aria-disabled', bloccato));
  $(`[data-share="${k}"]`).disabled = bloccato;
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
 * Due strade:
 *  A. servizio di invio (MAIL_ENDPOINT, solo nella pagina autonoma): il PDF
 *     parte in allegato dal servizio, con MAIL_CC sempre in copia. Serve il
 *     codice di invio, chiesto una volta e tenuto solo in memoria.
 *  B. posta dell'utente: Gmail in una nuova scheda oppure l'app di posta del
 *     dispositivo (mailto:) con destinatario, copia, oggetto e riepilogo già
 *     scritti; il PDF viene scaricato e va allegato a mano. Usata se il
 *     servizio non è configurato o dentro claude.ai.
 *  C. condivisione di sistema: vedi "Condividi il PDF" più sotto. */
let mailCode = ''; // codice di invio: mai salvato, azzerato dopo l'inattività
const usaServizio = () => STANDALONE && !!MAIL_ENDPOINT;
const mostraCodice = (k, on) => { $(`[data-coderow="${k}"]`).hidden = !on; if (on) $(`#${k}-code`).focus(); };

/** Destinatario valido oppure null (con messaggio già mostrato). */
function destinatario(k) {
  const dest = $(`#${k}-mail`).value.trim();
  if (Q[k].blocked) { pdfMsg(k, 'Sistema prima gli importi sotto il minimo.'); return null; }
  const errore = dest ? vEmail(dest) : 'Scrivi l\'email del destinatario nei dati qui sopra.';
  if (errore) { pdfMsg(k, errore); $(`#${k}-mail`).focus(); return null; }
  return dest;
}

/** Strada A: invio dal servizio. Il corpo è testo semplice per evitare il preflight CORS. */
async function inviaConServizio(k, dest) {
  const q = Q[k];
  pdfMsg(k, 'Invio in corso…');
  try {
    const res = await fetch(MAIL_ENDPOINT, {
      method: 'POST', redirect: 'follow', referrerPolicy: 'no-referrer',
      body: JSON.stringify({ code: mailCode, to: dest, name: safeName(q.file), summary: quoteText(q, true), pdf: makePdf(q).output('datauristring').split(',')[1] }),
    });
    const esito = await res.json();
    if (esito.ok) { mostraCodice(k, false); pdfMsg(k, `Email inviata a ${dest}, con ${MAIL_CC} in copia.` + FINE); return; }
    if (esito.status === 403) { mailCode = ''; mostraCodice(k, true); }
    pdfMsg(k, esito.message || 'Invio non riuscito.');
  } catch (err) { pdfMsg(k, 'Invio non riuscito: controlla la connessione e riprova. In alternativa scarica il PDF e invialo dalla tua posta.'); }
}

/**
 * Strada B: posta dell'utente. Si usa un link vero (<a href>), perché è
 * l'unico modo affidabile in ogni ambiente: Gmail in una nuova scheda oppure
 * il programma di posta predefinito (mailto:). Il PDF viene scaricato a parte.
 * @param {HTMLAnchorElement} a  link cliccato: gli si assegna l'indirizzo giusto
 * @param {boolean} gmail        true = Gmail nel browser, false = mailto:
 */
function preparaLinkPosta(a, k, dest, gmail) {
  const q = Q[k], enc = encodeURIComponent, corpo = quoteText(q).slice(0, 1500); // i link lunghi vengono troncati
  a.href = gmail
    ? `https://mail.google.com/mail/?view=cm&fs=1&to=${enc(dest)}&cc=${enc(MAIL_CC)}&su=${enc(q.file)}&body=${enc(corpo)}`
    : `mailto:${enc(dest)}?cc=${enc(MAIL_CC)}&subject=${enc(q.file)}&body=${enc(corpo)}`;
  savePdf(makePdf(q), q.file).catch(() => {});
  pdfMsg(k, `Ho aperto ${gmail ? 'Gmail' : 'il programma di posta'} e scaricato il PDF: allegalo prima di inviare. Destinatario ${dest}, in copia ${MAIL_CC}.` + FINE);
}

// "Invia per email": servizio di invio se configurato, altrimenti Gmail
document.addEventListener('click', e => {
  const a = e.target.closest('[data-mail]'); if (!a) return;
  const k = a.dataset.mail, dest = destinatario(k);
  if (!dest) { e.preventDefault(); return; }
  if (!usaServizio()) { preparaLinkPosta(a, k, dest, true); return; } // il browser segue il link appena impostato
  e.preventDefault();
  if (!mailCode) { pdfMsg(k, 'Scrivi il codice di invio e premi Invia.'); mostraCodice(k, true); return; }
  inviaConServizio(k, dest);
});
// "Invia con l'app di posta": programma di posta predefinito del dispositivo
document.addEventListener('click', e => {
  const a = e.target.closest('[data-mailto]'); if (!a) return;
  const k = a.dataset.mailto, dest = destinatario(k);
  if (!dest) { e.preventDefault(); return; }
  preparaLinkPosta(a, k, dest, false);
});
/* "Condividi il PDF": foglio di condivisione del sistema (telefoni, tablet e
 * alcuni computer). È l'unico modo in cui una pagina può passare un ALLEGATO
 * all'app di posta; in cambio non può precompilare destinatario e copia, che
 * vengono ricordati nel testo del messaggio. */
const fileProva = () => new File(['%PDF'], 'prova.pdf', { type: 'application/pdf' });
const puoCondividere = STANDALONE && !!navigator.canShare && navigator.canShare({ files: [fileProva()] });
document.querySelectorAll('[data-share]').forEach(b => { b.hidden = !puoCondividere; });

document.addEventListener('click', async e => {
  const b = e.target.closest('[data-share]'); if (!b) return;
  const k = b.dataset.share, q = Q[k], dest = $(`#${k}-mail`).value.trim();
  if (q.blocked) { pdfMsg(k, 'Sistema prima gli importi sotto il minimo.'); return; }
  const file = new File([makePdf(q).output('blob')], safeName(q.file) + '.pdf', { type: 'application/pdf' });
  try {
    await navigator.share({ files: [file], title: q.file, text: `${q.file}\nDestinatario: ${dest || 'da indicare'}\nIn copia: ${MAIL_CC}` });
    pdfMsg(k, `PDF passato all'app scelta. Ricorda di mettere ${MAIL_CC} in copia.` + FINE);
  } catch (err) { if (err && err.name !== 'AbortError') pdfMsg(k, 'Condivisione non riuscita: usa uno degli altri pulsanti.'); }
});

document.addEventListener('click', e => {
  const b = e.target.closest('[data-sendcode]'); if (!b) return;
  const k = b.dataset.sendcode, dest = destinatario(k); if (!dest) return;
  mailCode = $(`#${k}-code`).value; $(`#${k}-code`).value = '';
  if (!mailCode) { pdfMsg(k, 'Scrivi il codice di invio.'); return; }
  inviaConServizio(k, dest);
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

/** Numero e validità proposti per un nuovo preventivo. */
function datiPredefiniti() {
  $('#pmi-num').value = nuovoNumero('P'); $('#st-num').value = nuovoNumero('S');
  $('#pmi-val').value = $('#st-val').value = tra(VALIDITA_GIORNI);
}

/**
 * Riporta la pagina allo stato iniziale: svuota campi, contratti, righe e
 * anteprime. Restano solo i numeri d'esempio, che non sono dati di clienti.
 * @param {string} motivo testo mostrato all'utente
 */
function wipeAll(motivo) {
  document.querySelectorAll('main input, main select, main textarea').forEach(el => {
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
  ['pmi', 'st'].forEach(k => mostraCodice(k, false));
  ['pmi-err', 'st-err'].forEach(id => { $('#' + id).innerHTML = ''; });
  ['pmi', 'st', 'pmi-c', 'st-c'].forEach(k => pdfMsg(k, ''));
  $('#st-paste-msg').textContent = '';
  datiPredefiniti();
  $('#st-cli-msg').textContent = '';
  renderPmi(); setMode('cli'); // svuota le righe: le schede dei clienti spariscono con loro
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
  idleTimer = setTimeout(() => { mailCode = ''; wipeAll(`Dati cancellati dopo ${IDLE_WIPE_MIN} minuti di inattività.`); }, IDLE_WIPE_MIN * 60000);
};
['input', 'click', 'keydown'].forEach(ev => document.addEventListener(ev, riarmaInattivita, true));

// ritorno da "indietro/avanti": il browser può ripresentare la pagina com'era
window.addEventListener('pageshow', e => { if (e.persisted) wipeAll('Dati cancellati: la pagina era rimasta in memoria nel browser.'); });
