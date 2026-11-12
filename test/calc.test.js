/* Test delle regole di prezzo e dei controlli di formato.
 * Uso: node test/calc.test.js   (nessuna dipendenza)
 * I casi vengono dalle fonti: mail e fogli di Parretta e Sala. */
const fs = require('fs'), path = require('path'), assert = require('assert');
const src = f => fs.readFileSync(path.join(__dirname, '../src/js', f), 'utf8');
const api = new Function(src('00-config.js') + src('20-calc.js') + src('30-validators.js') +
  ';return {LISTINO,fascia,prezzoCliente,calcPmi,calcStudio,vCf,vPiva,vIban,vDate,vEmail,ibanInfo,normVal};')();
const { fascia, calcPmi, calcStudio, vCf, vPiva, vIban, vDate, vEmail, ibanInfo, normVal } = api;
const quasi = (a, b) => assert.ok(Math.abs(a - b) < 0.005, `${a} ≠ ${b}`);
const riga = (tipo, serv, n, docs, ov = null) => ({ tipo, serv, n, docs, ov, units: [] });
let n = 0; const test = (nome, fn) => { fn(); n++; console.log('ok  ' + nome); };

test('fasce Light: confini', () => {
  assert.equal(fascia(10).label, '1–10 licenze'); quasi(fascia(10).prezzo, 0.30);
  assert.equal(fascia(11).label, '11–20 licenze'); quasi(fascia(11).prezzo, 0.27);
  assert.equal(fascia(101).label, 'oltre 100 licenze'); quasi(fascia(101).prezzo, 0.15);
});
test('Light: 10 ordinarie × 800 documenti = 20.400 (call del 27/10)', () => {
  quasi(calcStudio([riga('op', 'light', 10, 800)], 0, 0, 50).app, 20400);
});
test('Light: 80 licenze × 3.600 righe = 99.840 sull\'intero cumulo (foglio fasce)', () => {
  quasi(calcStudio([riga('op', 'light', 80, 600)], 0, 0, 50).app, 99840);
});
test('Full: 40 ordinarie + 60 semplificate + 30 forfettarie a 200 (mail del 13/10)', () => {
  const r = calcStudio([riga('op', 'full', 40, 500), riga('sem', 'full', 60, 300), riga('forf', 'full', 30, 50)], 0, 0, 50);
  quasi(r.app, 40 * 2700 + 60 * 1600 + 30 * 200);
});
test('Full: documenti oltre 1.500 a 1,50', () => {
  quasi(calcStudio([riga('op', 'full', 1, 1700)], 0, 0, 50).app, 2700 + 200 * 1.5);
});
test('sconto e mesi agevolati solo sul Light Plus', () => {
  const r = calcStudio([riga('op', 'light', 4, 750), riga('sem', 'plus', 6, 350)], 10, 2, 100);
  quasi(r.sc, 6 * 915 * 0.10);                 // solo le 6 Light Plus
  quasi(r.promo, 6 * 915 * 0.90 / 12 * 2);     // 2 mesi gratuiti sul prezzo scontato
  quasi(r.primo, r.app - r.sc - r.promo);
  quasi(r.regime, r.app - r.sc);
});
test('importo sotto listino segnalato', () => {
  assert.equal(calcStudio([riga('op', 'full', 2, 100, 2000)], 0, 0, 50).sotto, 1);
  assert.equal(calcStudio([riga('op', 'full', 2, 100, 3500)], 0, 0, 50).sotto, 0);
});
test('PMI: fasce ed eccedenza', () => {
  quasi(calcPmi({ reg: 'ord', att: 200, pas: 300, corr: false, ov: null }).base, 2900);
  quasi(calcPmi({ reg: 'ord', att: 320, pas: 410, corr: false, ov: null }).base, 3300);
  const s = calcPmi({ reg: 'sem', att: 300, pas: 288, corr: true, ov: null });
  assert.equal(s.docs, 600); quasi(s.ecc, 150); quasi(s.imp, 2150);
  assert.equal(calcPmi({ reg: 'ord', att: 100, pas: 100, corr: false, ov: 2000 }).sotto, true);
});
test('controlli di formato', () => {
  assert.equal(vCf('RSSMRA85T10A562S'), ''); assert.notEqual(vCf('RSSMRA85T10A562X'), '');
  assert.equal(vPiva('10819810960'), ''); assert.notEqual(vPiva('10819810961'), '');
  assert.equal(vIban('IT60X0542811101000000123456'), ''); assert.notEqual(vIban('IT61X0542811101000000123456'), '');
  assert.equal(vDate('10/12/1985'), ''); assert.notEqual(vDate('31/02/2020'), '');
  assert.equal(vEmail('a@b.it'), ''); assert.notEqual(vEmail('a@b'), '');
  assert.equal(normVal('iban', 'it60x0542811101000000123456'), 'IT60 X054 2811 1010 0000 0123 456');
  assert.deepEqual(ibanInfo('IT60X0542811101000000123456'), { banca: 'ABI 05428', agenzia: 'CAB 11101' });
  assert.equal(ibanInfo('IT61X0542811101000000123456'), null);
});
console.log(`\n${n} test superati`);
