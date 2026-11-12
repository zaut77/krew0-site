'use strict';
/* ==========================================================================
 * PREVENTIVATORE YUXME
 * Pagina statica, senza server: tutto il calcolo avviene nel browser.
 * I file in src/js sono concatenati in ordine numerico da build.py.
 *
 *   00 config      listino, etichette, marchio, impostazioni
 *   10 utils       formattazione e piccoli aiuti per il DOM
 *   20 calc        regole di prezzo (funzioni pure, coperte da test/)
 *   30 validators  controlli di formato: CF, P.IVA, date, IBAN
 *   40 quote       foglio del preventivo: anteprima HTML e PDF
 *   50 testi       testi dei contratti
 *   51 contract    campi compilabili, anteprima, errori
 *   52 contract-pdf  PDF del contratto con il layout dell'originale
 *   60 pmi · 61 studio   le due pagine di preventivo
 *   70 guide       guida animata
 *   80 output      download, email, cancellazione dei dati
 *   90 app         navigazione e avvio
 *
 * PRIVACY (requisito): nessun dato del cliente viene salvato o trasmesso.
 * Non si usano localStorage, cookie, fetch o moduli inviati; lo stato vive
 * solo in memoria e si azzera con "Cancella i dati", alla chiusura della
 * scheda o dopo IDLE_WIPE_MIN minuti di inattività. Non aggiungere chiamate
 * di rete o salvataggi senza rivedere questo requisito.
 * ========================================================================== */

/**
 * Listino. Importi annui, IVA esclusa. Sono PREZZI MINIMI: l'interfaccia
 * permette di salire, mai di scendere.
 * Fonti: Circolare servizi (PMI); mail "Richiesta preventivo" del 13/10/2026
 * e foglio "Preventivatore Full Assistance" (Full); proposta fasce Light del
 * 27/10/2026 (Light). Semplificata e forfettaria in Full: bozza in revisione.
 */
const LISTINO = Object.freeze({
  iva: 22,
  pmi: {
    ord1: 2900, ord1Max: 500,   // ordinaria fino a 500 documenti
    ord2: 3300, ord2Max: 1500,  // ordinaria fino a 1.500 documenti
    sem: 2000, semMax: 500,     // semplificata fino a 500 documenti
    ecc: 1.5,                   // € per documento oltre soglia, a consuntivo
    corr: 12,                   // documenti l'anno aggiunti se ci sono corrispettivi
  },
  light: {
    fisso: 600,                 // € l'anno per ditta, mai scontato
    riga: 0.30,                 // € per riga di libro giornale, prima fascia
    mOrd: 6, mSem: 3, mForf: 1, // righe stimate per documento
    // [ultima licenza della fascia, sconto % sul prezzo per riga]; null = senza limite.
    // Lo sconto vale sull'intero cumulo di licenze Light + Light Plus.
    fasce: [[10, 0], [20, 10], [30, 20], [50, 30], [100, 40], [null, 50]],
  },
  full: { op: 2700, hold: 1600, sem: 1600, forf: 200, inclusi: 1500, ecc: 1.5 },
});

/** Tipi di cliente dello studio (chiave usata anche in LISTINO.full). */
const TIPI = { op: 'Ordinaria operativa', hold: 'Ordinaria holding', sem: 'Semplificata', forf: 'Forfettaria' };
/** Servizi per gli studi. Light Plus = Light con connettori da attivare: è l'unico con sconti. */
const SERVIZI = { light: 'Light', plus: 'Light Plus', full: 'Full Assistance' };
const ESIGENZE = {
  light: 'Lo studio tiene controllo e validazione (Light)',
  plus: 'Come il Light, con connettori da attivare (Light Plus)',
  full: 'Delega completa, responsabilità a Yuxme (Full)',
};

/** Marchio. Il segnaposto del logo è sostituito da build.py con assets/logo-yuxme.png in base64. */
const BRAND = {
  logo: '__LOGO__',
  logoRatio: 494 / 138, // larghezza / altezza
  pdf: { accent: [54, 41, 110], soft: [237, 235, 247], ink: [63, 64, 61], muted: [107, 109, 102], label: [77, 64, 132] },
};

/** Indirizzo sempre in copia quando un preventivo parte per email. */
const MAIL_CC = 's.ciancarelli@yuxme.it';
/** Minuti di inattività dopo i quali i dati inseriti vengono cancellati. */
const IDLE_WIPE_MIN = 60;
/** Tetto di clienti per riga, per non generare PDF ingestibili. */
const MAX_CLIENTI_RIGA = 500;

/**
 * Codici ABI delle banche principali, per ricavare il nome dall'IBAN.
 * Elenco parziale e inserito a memoria: DA VERIFICARE con il registro ABI.
 * Se l'ABI non è in elenco si mostra il solo codice.
 */
const ABI = {
  '03069': 'Intesa Sanpaolo', '02008': 'UniCredit', '01030': 'Banca Monte dei Paschi di Siena',
  '05034': 'Banco BPM', '05387': 'BPER Banca', '01005': 'BNL', '07601': 'Poste Italiane',
  '03015': 'FinecoBank', '03268': 'Banca Sella', '05696': 'Banca Popolare di Sondrio',
  '03032': 'Credito Emiliano', '06230': 'Crédit Agricole Italia', '03062': 'Banca Mediolanum',
  '03104': 'Deutsche Bank', '03440': 'Banco di Desio e della Brianza', '03075': 'Banca Generali',
  '03296': 'Fideuram',
};
