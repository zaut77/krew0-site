/* ==========================================================================
 * 30 · CONTROLLI DI FORMATO
 * Ogni controllo restituisce '' se il valore è valido, altrimenti il messaggio
 * da mostrare. Verificano la forma e i caratteri di controllo, non l'esistenza
 * reale del codice.
 * ========================================================================== */

const RE_DATA = /^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/;

/** Data gg/mm/aaaa esistente (rifiuta 31/02). */
function vDate(v) {
  const m = RE_DATA.exec(v);
  if (!m) return 'Data non valida: usa il formato gg/mm/aaaa.';
  const g = +m[1], me = +m[2], a = +m[3], d = new Date(a, me - 1, g);
  const esiste = d.getFullYear() === a && d.getMonth() === me - 1 && d.getDate() === g && a > 1900 && a < 2100;
  return esiste ? '' : 'Data inesistente: controlla giorno e mese.';
}

/** Partita IVA: 11 cifre con cifra di controllo (algoritmo di Luhn). */
function vPiva(v) {
  if (!/^\d{11}$/.test(v)) return 'Partita IVA non valida: servono 11 cifre.';
  let somma = 0;
  for (let i = 0; i < 10; i++) { let n = +v[i]; if (i % 2) { n *= 2; if (n > 9) n -= 9; } somma += n; }
  return (10 - somma % 10) % 10 === +v[10] ? '' : 'Partita IVA non valida: la cifra di controllo non torna.';
}

/** Codice fiscale di persona fisica: 16 caratteri, omocodie ammesse, carattere di controllo. */
function vCf(v) {
  if (!/^[A-Z]{6}[0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{3}[A-Z]$/.test(v)) {
    return 'Codice fiscale non valido: servono 16 caratteri nel formato corretto.';
  }
  const DISPARI = [1, 0, 5, 7, 9, 13, 15, 17, 19, 21, 2, 4, 18, 20, 11, 3, 6, 8, 12, 14, 16, 10, 22, 25, 24, 23];
  let somma = 0;
  for (let i = 0; i < 15; i++) {
    const ch = v[i], n = ch >= '0' && ch <= '9' ? +ch : ch.charCodeAt(0) - 65;
    somma += i % 2 ? n : DISPARI[n]; // i pari (0-based) = posizione dispari
  }
  return String.fromCharCode(65 + somma % 26) === v[15] ? '' : 'Codice fiscale non valido: il carattere di controllo non torna.';
}

/** IBAN senza spazi: struttura, lunghezza italiana e controllo mod 97. */
function vIban(v) {
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(v)) return 'IBAN non valido: controlla i caratteri.';
  if (v.startsWith('IT') && v.length !== 27) return 'IBAN non valido: un IBAN italiano ha 27 caratteri.';
  const cifre = (v.slice(4) + v.slice(0, 4)).replace(/[A-Z]/g, ch => ch.charCodeAt(0) - 55);
  let resto = 0;
  for (const ch of cifre) resto = (resto * 10 + +ch) % 97;
  return resto === 1 ? '' : 'IBAN non valido: le cifre di controllo non tornano.';
}

/** Indirizzo email plausibile (controllo volutamente semplice). */
const vEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Indirizzo email non valido.';

/** Sportelli per ABI → { CAB: località }. null finché l'elenco non è stato caricato (vedi 51). */
let SPORTELLI = null;

/**
 * Banca e sportello ricavati da un IBAN italiano valido.
 * L'elenco non è ufficiale: se banca o sportello non ci sono, restano i codici.
 * @returns {?{banca:string, agenzia:string}} null se l'IBAN non è italiano o non è valido
 */
function ibanInfo(iban) {
  const v = String(iban || '').replace(/\s/g, '').toUpperCase();
  if (!v.startsWith('IT') || vIban(v)) return null;
  const abi = v.slice(5, 10), cab = v.slice(10, 15);
  const localita = SPORTELLI && SPORTELLI[abi] && SPORTELLI[abi][cab];
  return { banca: ABI[abi] ? `${ABI[abi]} (ABI ${abi})` : `ABI ${abi}`, agenzia: localita ? `${localita} (CAB ${cab})` : `CAB ${cab}` };
}

/** Porta il valore nella forma canonica del suo tipo (maiuscole, spazi, zeri). */
function normVal(tipo, v) {
  v = v.trim();
  if (tipo === 'cf' || tipo === 'cfpiva' || tipo === 'piva') return v.replace(/\s/g, '').toUpperCase().replace(/^IT(?=\d{11}$)/, '');
  if (tipo === 'iban') return v.replace(/\s/g, '').toUpperCase().replace(/(.{4})/g, '$1 ').trim();
  if (tipo === 'date') { const m = RE_DATA.exec(v); return m ? `${m[1].padStart(2, '0')}/${m[2].padStart(2, '0')}/${m[3]}` : v; }
  return v;
}

/** Controlla un valore secondo il tipo. Vuoto o tipo assente = nessun errore. */
function checkVal(tipo, v) {
  if (!v || !tipo) return '';
  switch (tipo) {
    case 'date': return vDate(v);
    case 'piva': return vPiva(v);
    case 'cf': return vCf(v);
    case 'iban': return vIban(v.replace(/\s/g, ''));
    default: return /^\d/.test(v) ? vPiva(v) : vCf(v); // 'cfpiva': l'uno o l'altra
  }
}
