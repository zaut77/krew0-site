/**
 * INVIO PREVENTIVI YUXME — Google Apps Script
 *
 * Riceve dal Preventivatore un PDF e lo spedisce al cliente, sempre con CC in
 * copia. Gira nell'account Google di chi lo installa: le email partono dal suo
 * indirizzo e restano nella sua cartella "Inviati", come una normale email.
 *
 * COSA NON FA: non salva i dati ricevuti, non li scrive nei log, non li passa
 * ad altri servizi. Conserva solo un contatore giornaliero degli invii.
 *
 * PROTEZIONI (l'indirizzo del servizio è pubblico):
 *  - codice di invio: senza il codice giusto non parte nulla; il codice non è
 *    scritto qui né nella pagina, ne è salvata solo l'impronta (SHA-256)
 *  - testo dell'email fisso: chi chiama non può scrivere un messaggio libero
 *  - un solo allegato, solo PDF, al massimo 5 MB
 *  - tetto giornaliero di invii
 *
 * INSTALLAZIONE: vedi README.md, sezione "Invio email".
 */

const CC = 's.ciancarelli@yuxme.it';   // sempre in copia
const MITTENTE = 'Yuxme';               // nome mostrato al destinatario
const MAX_INVII_GIORNO = 150;
const MAX_PDF_BYTE = 5 * 1024 * 1024;
const MAX_RIEPILOGO = 3000;             // caratteri

/**
 * Da eseguire UNA VOLTA dall'editor per scegliere il codice di invio:
 * scrivi il codice tra gli apici, premi "Esegui", poi cancellalo da qui.
 */
function impostaCodice() {
  const codice = 'SCRIVI-QUI-IL-CODICE';
  if (codice === 'SCRIVI-QUI-IL-CODICE' || codice.length < 10) throw new Error('Scegli un codice di almeno 10 caratteri.');
  PropertiesService.getScriptProperties().setProperty('IMPRONTA_CODICE', impronta_(codice));
  Logger.log('Codice impostato. Ora cancellalo da questa funzione.');
}

/** Punto d'ingresso: la pagina invia un JSON come testo. */
function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    const props = PropertiesService.getScriptProperties();

    // 1. codice di invio
    const attesa = props.getProperty('IMPRONTA_CODICE');
    if (!attesa) return risposta_(500, 'Servizio non configurato: manca il codice di invio.');
    if (typeof d.code !== 'string' || impronta_(d.code) !== attesa) { Utilities.sleep(1500); return risposta_(403, 'Codice di invio non valido.'); }

    // 2. tetto giornaliero (unico dato conservato: un numero)
    const oggi = Utilities.formatDate(new Date(), 'Europe/Rome', 'yyyyMMdd');
    const blocco = LockService.getScriptLock(); blocco.waitLock(10000);
    const giorno = props.getProperty('GIORNO'), fatti = giorno === oggi ? Number(props.getProperty('INVII')) : 0;
    if (fatti >= MAX_INVII_GIORNO) { blocco.releaseLock(); return risposta_(429, 'Limite giornaliero di invii raggiunto.'); }
    props.setProperties({ GIORNO: oggi, INVII: String(fatti + 1) }); blocco.releaseLock();

    // 3. controlli sui dati
    const a = String(d.to || '').trim();
    if (!/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]{2,}$/.test(a)) return risposta_(400, 'Indirizzo del destinatario non valido.');
    const byte = Utilities.base64Decode(String(d.pdf || ''));
    if (byte.length < 100 || byte.length > MAX_PDF_BYTE) return risposta_(400, 'Allegato mancante o troppo grande.');
    if (byte[0] !== 37 || byte[1] !== 80 || byte[2] !== 68 || byte[3] !== 70) return risposta_(400, 'L\'allegato non è un PDF.'); // "%PDF"
    const nome = pulisci_(d.name, 120) || 'Preventivo Yuxme';
    const riepilogo = pulisci_(d.summary, MAX_RIEPILOGO, true);

    // 4. invio: oggetto e testo sono fissi, cambia solo il riepilogo
    GmailApp.sendEmail(a, nome, [
      'Buongiorno,', '', 'in allegato il preventivo Yuxme.', '', riepilogo, '', 'Resto a disposizione.',
    ].join('\n'), {
      cc: CC, replyTo: CC, name: MITTENTE,
      attachments: [Utilities.newBlob(byte, 'application/pdf', nome + '.pdf')],
    });
    return risposta_(200, 'Inviato.');
  } catch (err) {
    return risposta_(500, 'Invio non riuscito.'); // nessun dettaglio: potrebbe contenere dati del cliente
  }
}

/** Risposta JSON (Apps Script risponde sempre con HTTP 200: lo stato è nel corpo). */
function risposta_(stato, messaggio) {
  return ContentService.createTextOutput(JSON.stringify({ ok: stato === 200, status: stato, message: messaggio })).setMimeType(ContentService.MimeType.JSON);
}
/** Impronta SHA-256 in esadecimale. */
function impronta_(testo) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, testo, Utilities.Charset.UTF_8)
    .map(function (b) { return ('0' + (b & 255).toString(16)).slice(-2); }).join('');
}
/** Toglie caratteri di controllo e accorcia; se multilinea è falso toglie anche gli a capo. */
function pulisci_(v, max, multilinea) {
  var s = String(v || '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
  if (!multilinea) s = s.replace(/[\r\n]+/g, ' ');
  return s.trim().slice(0, max);
}
