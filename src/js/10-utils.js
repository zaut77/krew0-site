/* ==========================================================================
 * 10 · UTILITÀ
 * ========================================================================== */

/** Primo elemento che corrisponde al selettore. */
const $ = sel => document.querySelector(sel);

const IT = 'it-IT';
/** 1234.5 → "1.234,50 €" */
const eur = n => new Intl.NumberFormat(IT, { style: 'currency', currency: 'EUR', useGrouping: 'always' }).format(n || 0);
/** 1234.5 → "1.235" */
const int = n => new Intl.NumberFormat(IT, { useGrouping: 'always' }).format(Math.round(n || 0));
/** 1234.5 → "1.234,50" */
const dec = n => new Intl.NumberFormat(IT, { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: 'always' }).format(n);
/** 12.5 → "12,5%" */
const pct = n => new Intl.NumberFormat(IT, { maximumFractionDigits: 1 }).format(n) + '%';

/** Valore di un campo numerico; accetta la virgola. Mai NaN. */
const num = v => { const x = parseFloat(String(v).replace(',', '.')); return Number.isFinite(x) ? x : 0; };
/** "1.234,50" → 1234.5 (NaN se non è un numero). */
const itNum = v => parseFloat(String(v).replace(/\./g, '').replace(',', '.'));
/** Percentuale tra 0 e 100. */
const clampPct = v => Math.min(100, Math.max(0, num(v)));

/**
 * Escape per l'inserimento in innerHTML o in attributi tra doppi apici.
 * Ogni testo scritto dall'utente passa da qui prima di finire nel DOM.
 */
const esc = s => String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

const today = () => new Date().toLocaleDateString(IT);
/** <option> di una select a partire da { valore: etichetta }. */
const opts = (map, sel) => Object.entries(map).map(([k, v]) => `<option value="${k}"${k === sel ? ' selected' : ''}>${esc(v)}</option>`).join('');
/** Scrive un elenco di avvisi [['bad'|'warn'|'ok', testo]] in un contenitore .notes. */
const showNotes = (el, notes) => { el.innerHTML = notes.map(([tipo, testo]) => `<p class="${tipo}">${esc(testo)}</p>`).join(''); };
/** Nome di file senza caratteri vietati dai sistemi operativi. */
const safeName = s => s.replace(/[\\/:*?"<>|]/g, ' ').replace(/\s+/g, ' ').trim();

/** Data di oggi più n giorni, in gg/mm/aaaa. */
const tra = giorni => { const d = new Date(); d.setDate(d.getDate() + giorni); return d.toLocaleDateString(IT, { day: '2-digit', month: '2-digit', year: 'numeric' }); };
/**
 * Numero del preventivo. Senza server non può esistere un progressivo comune:
 * si usa data e ora di creazione, che è univoco per chi lo emette. Modificabile.
 * @param {string} sigla 'P' (PMI) o 'S' (studio)
 */
function nuovoNumero(sigla) {
  const d = new Date(), z = n => String(n).padStart(2, '0');
  return `YX${sigla}-${d.getFullYear()}${z(d.getMonth() + 1)}${z(d.getDate())}-${z(d.getHours())}${z(d.getMinutes())}`;
}
/** Riga del piè di pagina del preventivo. */
const piede = (numero, prep, valido) => [numero && 'Preventivo n. ' + numero, prep && 'preparato da ' + prep, valido && 'valido fino al ' + valido].filter(Boolean).join(' · ') || 'Yuxme';
/** Voci di testata comuni: numero e validità (se presenti). */
const metaNumero = (numero, valido) => [].concat(numero ? [['Preventivo n.', numero]] : [], valido ? [['Valido fino al', valido]] : []);
