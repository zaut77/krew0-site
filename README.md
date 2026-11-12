# Preventivatore Yuxme

Pagina statica per preparare preventivi e contratti Yuxme (PMI e studi
commercialisti). Non ha server: calcoli, PDF e controlli avvengono nel browser.

## Uso

```bash
python3 build.py          # rigenera index.html e artifact.html
node test/calc.test.js    # verifica le regole di prezzo
```

- `index.html` è la versione autonoma (GitHub Pages o qualsiasi server).
- `artifact.html` è la versione per claude.ai.

## Struttura

| Percorso | Contenuto |
|---|---|
| `src/page.html` | Markup delle viste |
| `src/style.css` | Stile, allineato a yuxme.it |
| `src/js/00-config.js` | **Listino**, etichette, marchio, impostazioni |
| `src/js/20-calc.js` | Regole di prezzo (funzioni pure, testate) |
| `src/js/30-validators.js` | Controlli su CF, P.IVA, date, IBAN |
| `src/js/40-quote.js` | Foglio del preventivo: anteprima e PDF |
| `src/js/50-contract-text.js` | Testi dei contratti |
| `src/js/51-contract.js`, `52-contract-pdf.js` | Campi compilabili e PDF del contratto |
| `src/js/60-pmi.js`, `61-studio.js` | Le due pagine di preventivo |
| `src/js/80-output.js` | Download, email, cancellazione dei dati |
| `vendor/` | jsPDF 2.5.1, jsPDF-AutoTable 3.8.2, font (solo per la versione autonoma) |

## Regole commerciali

- I prezzi di listino sono minimi: si possono alzare, mai abbassare.
- Gli sconti esistono solo per il Light Plus (sconto % e 1-3 mesi al 50% o gratuiti).
- Lo sconto di fascia Light vale sull'intero cumulo di licenze Light + Light Plus.
- Righe stimate: documenti × 6 (ordinarie), × 3 (semplificate).

Per cambiare un prezzo si modifica `LISTINO` in `00-config.js` e si rilancia la build.

## Privacy

Requisito: i dati dei clienti non devono restare da nessuna parte.

- Nessun salvataggio: niente localStorage, cookie o database.
- Nessuna trasmissione: la versione autonoma ha una Content-Security-Policy che
  blocca ogni connessione di rete.
- I dati si azzerano con "Cancella i dati", alla chiusura della scheda e dopo
  60 minuti di inattività.
- I dati escono solo per azione dell'utente: PDF salvato sul dispositivo ed
  email (sempre con `MAIL_CC` in copia).
- Se il servizio di invio è attivo, è l'unica destinazione di rete ammessa
  dalla Content-Security-Policy.

## Invio email

Senza configurazione, "Invia per email" apre il programma di posta dell'utente
e il PDF va allegato a mano. Per l'invio diretto con allegato:

1. Vai su https://script.google.com con l'account da cui devono partire le
   email e crea un progetto nuovo. Incolla il contenuto di `server/Code.gs`.
2. Nella funzione `impostaCodice` scrivi un codice di almeno 10 caratteri,
   premi **Esegui** e autorizza. Poi cancella il codice dal file e salva.
3. **Esegui il deployment → Nuovo deployment → App web**. Esegui come: *me*.
   Accesso: *chiunque*. Copia l'indirizzo che termina con `/exec`.
4. Incolla l'indirizzo in `MAIL_ENDPOINT` (`src/js/00-config.js`), rilancia
   `python3 build.py` e pubblica.
5. Comunica il codice di invio, a voce o per canale riservato, a chi deve usarlo.

Il servizio non salva i dati che riceve: conserva solo un contatore giornaliero.
L'email inviata resta nella cartella "Inviati" dell'account, come ogni email.
L'accesso "chiunque" è necessario perché la pagina non ha login: la protezione
è il codice di invio, più il tetto giornaliero e il testo fisso dell'email.
Per cambiare codice si ripete il punto 2.

## Punti aperti

- Testo dei contratti e riga "Condizioni particolari": da far rileggere a chi gestisce i contratti.
- Semplificata e forfettaria in Full: bozza in revisione.
- Elenco ABI in `00-config.js`: parziale e da verificare.
