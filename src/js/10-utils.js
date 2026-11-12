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
