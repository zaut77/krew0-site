'use strict';
/* ==========================================================================
 * PREVENTIVATORE YUXME
 * Pagina statica, senza server: tutto il calcolo avviene nel browser.
 * I file in src/js sono concatenati in ordine numerico da build.py.
 *
 *   00 config      listino, etichette, marchio, impostazioni
 *   05 abi         nomi delle banche per codice ABI (generato)
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

/**
 * Marchio e risorse grafiche. I segnaposto ASSET (immagine) e B64 (file in
 * base64) tra doppi trattini bassi sono sostituiti da build.py.
 */
const BRAND = {
  logo: '__ASSET:assets/logo-yuxme.png__',            // logo del sito yuxme.it
  logoRatio: 494 / 138,                                // larghezza / altezza
  logoContratto: '__ASSET:assets/logo-contratto.png__', // logo dei contratti originali, con la dicitura
  sepaSimbolo: '__ASSET:assets/sepa-simbolo.png__',     // simbolo nel mandato SEPA originale
  sepaFreccia: '__ASSET:assets/sepa-freccia.png__',     // freccia accanto alla firma del mandato
  pdf: { accent: [54, 41, 110], soft: [237, 235, 247], ink: [63, 64, 61], muted: [107, 109, 102], label: [77, 64, 132] },
};
/**
 * Font Carlito (licenza SIL OFL), metricamente compatibile con il Calibri dei
 * contratti originali, ridotto ai caratteri latini. Usato solo nei PDF dei contratti.
 */
const PDF_FONTS = {
  Regular: '__B64:vendor/pdf-fonts/Carlito-Regular.ttf__',
  Bold: '__B64:vendor/pdf-fonts/Carlito-Bold.ttf__',
  Italic: '__B64:vendor/pdf-fonts/Carlito-Italic.ttf__',
};

/** Indirizzo sempre in copia quando un preventivo parte per email. */
const MAIL_CC = 's.ciancarelli@yuxme.it';
/**
 * Indirizzo del servizio di invio email (Google Apps Script, vedi server/Code.gs
 * e README). Vuoto = nessun invio dal sito: si apre il programma di posta
 * dell'utente. Se valorizzato, build.py autorizza la connessione a Google nella
 * Content-Security-Policy; è l'UNICA destinazione di rete ammessa.
 */
const MAIL_ENDPOINT = '';
/** Minuti di inattività dopo i quali i dati inseriti vengono cancellati. */
const IDLE_WIPE_MIN = 60;
/** Tetto di clienti per riga, per non generare PDF ingestibili. */
const MAX_CLIENTI_RIGA = 500;
/** Giorni di validità proposti per un preventivo (la data resta modificabile). */
const VALIDITA_GIORNI = 30;
/** Elenco degli sportelli per ABI e CAB: caricato dallo stesso sito solo quando si scrive un IBAN. */
const ABICAB_URL = 'data/abicab.txt.gz';
