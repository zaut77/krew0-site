/* ==========================================================================
 * 51 · CONTRATTI: CAMPI, ANTEPRIMA, ERRORI
 * Il testo (50) contiene campi [[chiave]]. Il valore di un campo si cerca,
 * in ordine, tra:
 *   1. user     ciò che l'utente ha scritto in quel campo
 *   2. alias    un altro campo già compilato (es. il nome ripetuto nel SEPA)
 *   3. derived  un valore calcolato (indirizzo composto, banca dall'IBAN)
 *   4. auto     ciò che arriva dal preventivo (canone, prezzi, data)
 * Così un dato scritto una volta compare in tutte le sezioni, ma resta
 * correggibile nel singolo punto.
 * ========================================================================== */

/** Stato dei due contratti. min = soglie sotto cui un prezzo non può scendere. */
const C = {
  pmi: { user: {}, auto: {}, min: {}, dsl: DSL_PMI, tabs: {}, file: 'Contratto Yuxme PMI' },
  st: { user: {}, auto: {}, min: {}, dsl: '', tabs: {}, file: 'Contratto Yuxme' },
};

/** Campo ripetuto → campo della prima parte da cui prende il valore. */
const ALIAS = { sNome: 'sig', prNome: 'sig', prNato: 'natoA', prIl: 'natoIl', sCf: 'cf', sPiva: 'piva' };
/** Tipo di controllo per chiave ('pi' = P.IVA nelle tabelle dei moduli d'ordine). */
const FTYPE = { cf: 'cf', sCf: 'cf', cfAz: 'cfpiva', sPiva: 'cfpiva', piva: 'piva', natoIl: 'date', prIl: 'date', decor: 'date', data: 'date', sIban: 'iban', pi: 'piva' };
/** Nel contratto studi "piva" è «codice fiscale e partita iva»: accetta entrambi. */
const ftype = (c, k) => c === 'st' && k === 'piva' ? 'cfpiva' : FTYPE[k];
/** Nomi leggibili dei campi prezzo, per i messaggi d'errore. */
const NOMI = { canone: 'canone mensile', lFisso: 'costo fisso Light', lMese: 'costo fisso mensile Light', lRiga: 'prezzo per riga', fOp: 'costo fisso Full non holding', fOpM: 'mensile Full non holding', fHold: 'costo fisso Full holding', fHoldM: 'mensile Full holding', fEcc: 'costo per documento eccedente' };
const TABCOLS = ['Ragione sociale', 'Rappresentante legale', 'P.Iva', 'Regime', 'Periodicità iva'];
/** Campo modificabile di ogni colonna delle tabelle clienti (null = sola lettura). */
const TABFIELDS = ['nome', 'rl', 'pi', null, 'per'];

/** Valori calcolati da altri campi dello stesso contratto. */
function derived(c, k) {
  const u = C[c].user, unisci = a => a.filter(Boolean).join(' ');
  if (k === 'sInd') {
    if (c === 'st') return u.dom || '';
    return [unisci([u.resVia && 'Via ' + u.resVia, u.resN]), unisci([u.resCap, u.resA, u.resPr && `(${u.resPr})`])].filter(Boolean).join(', ');
  }
  if (k === 'sBanca' || k === 'sAgenzia') { const info = ibanInfo(u.sIban); return info ? (k === 'sBanca' ? info.banca : info.agenzia) : ''; }
  return '';
}

/** Valore corrente di un campo (vedi l'ordine in testa al file). */
const cval = (c, k) => C[c].user[k] != null ? C[c].user[k] : (ALIAS[k] && cval(c, ALIAS[k])) || derived(c, k) || C[c].auto[k] || '';

/** Testo → blocchi { t: tipo, x: contenuto }. La sintassi è descritta in 50. */
const parseDsl = s => s.split('\n').map(l => l.trim()).filter(Boolean).map(l =>
  l.startsWith('# ') ? { t: 'h1', x: l.slice(2) } : l.startsWith('## ') ? { t: 'h2', x: l.slice(3) } :
  l.startsWith('= ') ? { t: 'c', x: l.slice(2) } : l.startsWith('- ') ? { t: 'li', x: l.slice(2) } :
  l.startsWith('~ ') ? { t: 'dash', x: l.slice(2) } : l.startsWith('@tab:') ? { t: 'tab', x: l.slice(5) } :
  l.startsWith('@style:') ? { t: 'style', x: l.slice(7) } : l === '@br' ? { t: 'br' } :
  l[0] === '@' ? { t: l.slice(1) } : { t: 'p', x: l });

/** [[chiave|suggerimento]] oppure [[?chiave]]. */
const FLD = /\[\[(\??)([a-zA-Z0-9]+)(?:\|([^\]]*))?\]\]/g;

/**
 * HTML di una riga di testo. clean = sola lettura (vista "Visualizza").
 * Testo e valori passano sempre da esc().
 */
function htmlText(c, x, clean) {
  let out = '', last = 0, m; FLD.lastIndex = 0;
  while ((m = FLD.exec(x))) {
    out += esc(x.slice(last, m.index)); last = FLD.lastIndex;
    const [, casella, k, ph] = m, on = !!cval(c, k);
    if (clean) out += casella ? (on ? '☑' : '☐') : esc(cval(c, k) || '______________');
    else if (casella) out += `<span class="chk" role="checkbox" tabindex="0" aria-checked="${on}" data-c="${c}" data-k="${k}">${on ? '☑' : '☐'}</span>`;
    else out += `<span class="fld" contenteditable="true" spellcheck="false" data-c="${c}" data-k="${k}" data-ph="${esc(ph || '')}">${esc(cval(c, k))}</span>`;
  }
  return out + esc(x.slice(last));
}

/**
 * Disegna il contratto in pagina.
 * @param {'pmi'|'st'} c
 * @param {string} [target] id di destinazione; se presente la vista è in sola lettura
 */
function renderContract(c, target) {
  const clean = !!target, TAG = { h1: 'h3', h2: 'h4', c: 'p', li: 'li', dash: 'li', p: 'p' };
  const tabella = t => `<div class="sheetscroll"><table><thead><tr>${t.cols.map((h, i) => `<th${i > 4 ? ' class="num"' : ''}>${esc(h)}</th>`).join('')}</tr></thead><tbody>${
    t.rows.map(r => `<tr>${r.cells.map((v, i) => {
      const f = TABFIELDS[i];
      return f && !clean
        ? `<td><span class="fld" contenteditable="true" spellcheck="false" data-cid="${r.id}" data-f="${f}" data-ph="${i ? '…' : 'ragione sociale'}">${esc(v)}</span></td>`
        : `<td${i > 4 ? ' class="num"' : ''}>${esc(v)}</td>`;
    }).join('')}</tr>`).join('')}</tbody></table></div>`;
  $('#' + (target || c + '-contract')).innerHTML = `<div class="sh-top"><img src="${BRAND.logo}" alt="Yuxme"></div>` +
    parseDsl(C[c].dsl).map(b => {
      if (b.t === 'br') return '<hr>';
      if (b.t === 'tab') return tabella(C[c].tabs[b.x]);
      if (!TAG[b.t]) return ''; // marcatori di impaginazione: servono solo al PDF
      return `<${TAG[b.t]} class="k-${b.t}">${htmlText(c, b.x, clean)}</${TAG[b.t]}>`;
    }).join('');
  if (!clean) showContractErrors(c);
}

/** Messaggio se un prezzo del contratto è sotto il suo minimo, altrimenti ''. */
function sottoMinimo(c) {
  for (const k in C[c].min) {
    const v = itNum(cval(c, k));
    if (Number.isNaN(v) || v < C[c].min[k] - 0.005) return `Nel contratto il campo "${NOMI[k]}" è sotto il minimo di ${dec(C[c].min[k])} €. Riportalo almeno a quel valore.`;
  }
  return '';
}

/** Scheda del singolo cliente in una riga dello studio; cid = "idRiga_indice". */
function unitOf(cid) {
  const [g, i] = String(cid).split('_'), riga = S.clients.find(x => x.id == g);
  return riga ? (riga.units[+i] || (riga.units[+i] = {})) : null;
}

/** Tutti gli errori di formato e di prezzo del contratto. */
function contractErrors(c) {
  const out = [], u = C[c].user;
  for (const k in u) { const e = checkVal(ftype(c, k), u[k]); if (e) out.push({ k, e }); }
  if (c === 'st') S.clients.forEach(g => {
    for (let i = 0; i < Math.min(g.n, g.units.length); i++) {
      const unit = g.units[i] || {}, e = checkVal('piva', unit.pi || '');
      if (e) out.push({ cid: `${g.id}_${i}`, e: `${unit.nome || TIPI[g.tipo] + ' ' + (i + 1)}: ${e}` });
    }
  });
  const m = sottoMinimo(c); if (m) out.push({ e: m });
  return out;
}

/** Mostra gli errori sopra il contratto e colora di rosso i campi coinvolti. */
function showContractErrors(c) {
  const errs = contractErrors(c), min = C[c].min;
  showNotes($(`#${c}-cerr`), errs.map(x => ['bad', x.e]));
  document.querySelectorAll(`#${c}-contract .fld`).forEach(el => {
    const k = el.dataset.k, cid = el.dataset.cid;
    const formato = errs.some(x => (k && x.k === k) || (cid && el.dataset.f === 'pi' && x.cid === cid));
    const prezzo = !!k && min[k] != null && !(itNum(cval(c, k)) >= min[k] - 0.005);
    el.classList.toggle('bad', formato || prezzo);
  });
  return errs;
}

/** Riallinea i campi che ripetono un valore appena cambiato. */
function syncFields(c, tranne) {
  document.querySelectorAll(`#${c}-contract .fld[data-k]`).forEach(el => {
    if (el === tranne) return;
    const v = cval(c, el.dataset.k); if (el.textContent !== v) el.textContent = v;
  });
}

/* ---- eventi dei campi (delegati: il contratto viene ridisegnato spesso) ---- */

// scrittura: salva il valore e aggiorna le ripetizioni
document.addEventListener('input', e => {
  const el = e.target; if (!el.classList || !el.classList.contains('fld')) return;
  const v = el.textContent.replace(/\s+/g, ' ').trim();
  if (el.dataset.cid) { const unit = unitOf(el.dataset.cid); if (unit) unit[el.dataset.f] = v; return; }
  const { c, k } = el.dataset;
  if (v) C[c].user[k] = v; else delete C[c].user[k];
  syncFields(c, el);
});

// uscita dal campo: forma canonica, controlli, prezzi mai sotto il minimo
document.addEventListener('focusout', e => {
  const el = e.target; if (!el.classList || !el.classList.contains('fld')) return;
  if (el.dataset.cid) {
    const unit = unitOf(el.dataset.cid);
    if (unit && el.dataset.f === 'pi') { unit.pi = normVal('piva', unit.pi || ''); el.textContent = unit.pi; }
    showContractErrors('st'); return;
  }
  const { c, k } = el.dataset, t = ftype(c, k), st = C[c];
  if (st.user[k] != null && t) { st.user[k] = normVal(t, st.user[k]); el.textContent = st.user[k]; }
  if (st.min[k] != null && st.user[k] != null && !(itNum(st.user[k]) >= st.min[k] - 0.005)) {
    delete st.user[k]; el.textContent = cval(c, k); syncFields(c, el); showContractErrors(c);
    $(`#${c}-cerr`).insertAdjacentHTML('afterbegin', `<p class="bad">${esc(`Errore: il campo "${NOMI[k]}" non può scendere sotto ${dec(st.min[k])} €. Ho ripristinato il valore.`)}</p>`);
    return;
  }
  syncFields(c, el); showContractErrors(c);
});

// Invio chiude il campo; spazio o Invio spuntano una casella
document.addEventListener('keydown', e => {
  const el = e.target; if (!el.classList) return;
  if (el.classList.contains('fld') && e.key === 'Enter') { e.preventDefault(); el.blur(); }
  if (el.classList.contains('chk') && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); el.click(); }
});

// incolla: solo testo semplice, mai HTML
document.addEventListener('paste', e => {
  const el = e.target.closest && e.target.closest('.fld'); if (!el) return;
  e.preventDefault();
  document.execCommand('insertText', false, (e.clipboardData.getData('text/plain') || '').replace(/\s+/g, ' '));
});

// caselle da spuntare
document.addEventListener('click', e => {
  const el = e.target.closest('.chk'); if (!el) return;
  const { c, k } = el.dataset, on = !cval(c, k);
  C[c].user[k] = on ? '1' : '';
  document.querySelectorAll(`.chk[data-c="${c}"][data-k="${k}"]`).forEach(o => { o.textContent = on ? '☑' : '☐'; o.setAttribute('aria-checked', on); });
});
