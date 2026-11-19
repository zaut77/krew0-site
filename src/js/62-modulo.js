/* ==========================================================================
 * 62 · MODULO EXCEL PER LO STUDIO
 * "Scarica il modulo": il file Excel vuoto (generato da tools/modulo.py) da
 * mandare allo studio. "Carica il modulo compilato": legge il file restituito
 * e riempie la tabella cliente per cliente.
 * Il file si legge solo nel browser: nessun invio, nessun salvataggio.
 * Il lettore .xlsx è minimo e senza librerie: apre lo zip con
 * DecompressionStream e legge celle, testi condivisi e nomi dei fogli.
 * ========================================================================== */

const MODULO_XLSX = '__B64:assets/modulo-clienti.xlsx__';
const MODULO_NOME = 'Modulo clienti Yuxme.xlsx';
const MIME_XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/** Contenuto dei file di uno zip: { nome: () => Promise<Uint8Array> }. */
function apriZip(buf) {
  const b = new Uint8Array(buf), v = new DataView(buf);
  let fine = -1;                                   // record di fine directory, cercato dal fondo
  for (let i = b.length - 22; i >= Math.max(0, b.length - 65557); i--) if (v.getUint32(i, true) === 0x06054b50) { fine = i; break; }
  if (fine < 0) throw new Error('zip');
  const file = {}, dec = new TextDecoder();
  let p = v.getUint32(fine + 16, true);
  for (let k = v.getUint16(fine + 10, true); k > 0; k--) {
    if (v.getUint32(p, true) !== 0x02014b50) throw new Error('zip');
    const metodo = v.getUint16(p + 10, true), dim = v.getUint32(p + 20, true);
    const ln = v.getUint16(p + 28, true), le = v.getUint16(p + 30, true), lc = v.getUint16(p + 32, true), loc = v.getUint32(p + 42, true);
    const nome = dec.decode(b.subarray(p + 46, p + 46 + ln));
    const dati = loc + 30 + v.getUint16(loc + 26, true) + v.getUint16(loc + 28, true);
    file[nome] = async () => {
      const raw = b.subarray(dati, dati + dim);
      if (metodo === 0) return raw;
      if (metodo !== 8) throw new Error('zip');
      return new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
    };
    p += 46 + ln + le + lc;
  }
  return file;
}

/** Elementi con quel nome locale, ignorando gli spazi dei nomi. */
const tag = (el, n) => [...el.getElementsByTagNameNS('*', n)];

/** Righe del foglio "Clienti" (o del primo foglio) come matrice di testi. */
async function leggiXlsx(buf) {
  const zip = apriZip(buf), dec = new TextDecoder();
  const xml = async n => zip[n] ? new DOMParser().parseFromString(dec.decode(await zip[n]()), 'application/xml') : null;
  const wb = await xml('xl/workbook.xml'), rels = await xml('xl/_rels/workbook.xml.rels');
  if (!wb || !rels) throw new Error('xlsx');
  const fogli = tag(wb, 'sheet');
  const foglio = fogli.find(s => /^clienti$/i.test(s.getAttribute('name'))) || fogli[0];
  const rid = foglio.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id') || foglio.getAttribute('r:id');
  let dove = tag(rels, 'Relationship').find(r => r.getAttribute('Id') === rid).getAttribute('Target');
  dove = dove.startsWith('/') ? dove.slice(1) : 'xl/' + dove;
  const ss = await xml('xl/sharedStrings.xml');
  const testi = ss ? tag(ss, 'si').map(si => tag(si, 't').map(t => t.textContent).join('')) : [];
  const sh = await xml(dove); if (!sh) throw new Error('xlsx');
  return tag(sh, 'row').map(row => {
    const celle = [];
    tag(row, 'c').forEach(c => {
      const col = (c.getAttribute('r') || '').replace(/\d+/g, '').split('').reduce((a, l) => a * 26 + l.charCodeAt(0) - 64, 0) - 1;
      const t = c.getAttribute('t'), val = tag(c, 'v')[0];
      let x = '';
      if (t === 's') x = testi[+val.textContent] || '';
      else if (t === 'inlineStr') x = tag(c, 't').map(e => e.textContent).join('');
      else if (val) x = t === 'str' || t === 'b' ? val.textContent : String(Math.round(parseFloat(val.textContent)) || 0);
      celle[col < 0 ? celle.length : col] = x;
    });
    return Array.from(celle, x => x || '');
  });
}

/** CSV salvato da Excel: separatore ; , o tabulazione, campi tra virgolette. */
function leggiCsv(testo) {
  const prima = testo.split(/\r?\n/)[0] || '';
  const sep = [';', '\t', ','].reduce((a, s) => prima.split(s).length > prima.split(a).length ? s : a, ';');
  const righe = []; let riga = [], campo = '', q = false;
  for (let i = 0; i < testo.length; i++) {
    const ch = testo[i];
    if (q) { if (ch === '"') { if (testo[i + 1] === '"') { campo += '"'; i++; } else q = false; } else campo += ch; }
    else if (ch === '"') q = true;
    else if (ch === sep) { riga.push(campo); campo = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && testo[i + 1] === '\n') i++; riga.push(campo); righe.push(riga); riga = []; campo = ''; }
    else campo += ch;
  }
  if (campo || riga.length) { riga.push(campo); righe.push(riga); }
  return righe;
}

/* ---- eventi ---- */

$('#st-mod-get').addEventListener('click', async () => {
  const msg = $('#st-cli-msg');
  const bytes = Uint8Array.from(atob(MODULO_XLSX), c => c.charCodeAt(0));
  try { msg.textContent = await saveFile(bytes.buffer, MODULO_NOME, MIME_XLSX) + ' Mandalo allo studio con il testo della mail qui sotto.'; }
  catch (err) { msg.textContent = 'Non sono riuscito a scaricare il modulo. Riprova.'; }
});

$('#st-mod-file').addEventListener('change', async e => {
  const el = e.target, f = el.files[0], msg = $('#st-cli-msg'); if (!f) return;
  try {
    const righe = /\.csv$/i.test(f.name) ? leggiCsv(await f.text()) : await leggiXlsx(await f.arrayBuffer());
    msg.textContent = caricaClienti(righe, $('#st-cli-serv').value);
  } catch (err) {
    msg.textContent = 'Non riesco a leggere il file. Usa il modulo scaricato da qui, salvato in formato Excel (.xlsx) o CSV.';
  } finally { el.value = ''; }                       // il file non resta collegato alla pagina
});

$('#st-mail-copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('#st-mail-txt').textContent); $('#st-mail-msg').textContent = 'Testo copiato.'; }
  catch (err) { $('#st-mail-msg').textContent = 'Copia non riuscita: seleziona il testo e copialo a mano.'; }
});
