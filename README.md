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
- I dati escono solo per azione dell'utente: PDF salvato sul dispositivo, email
  aperta nel suo programma di posta (sempre con `MAIL_CC` in copia).

## Punti aperti

- Testo dei contratti e riga "Condizioni particolari": da far rileggere a chi gestisce i contratti.
- Semplificata e forfettaria in Full: bozza in revisione.
- Elenco ABI in `00-config.js`: parziale e da verificare.
