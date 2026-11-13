/* ==========================================================================
 * 20 · REGOLE DI PREZZO
 * Funzioni pure: ricevono dati, restituiscono numeri, non toccano la pagina.
 * Sono le uniche a contenere logica commerciale e sono coperte da test/.
 * ========================================================================== */

/**
 * Fascia Light per numero di licenze (Light + Light Plus).
 * Lo sconto si applica all'intero cumulo: al salto di fascia cambia il prezzo
 * per riga di tutte le licenze.
 * @param {number} licenze
 * @returns {{idx:number, label:string, prezzo:number}} prezzo = € per riga
 */
function fascia(licenze) {
  const f = LISTINO.light.fasce;
  let idx = f.findIndex(([fino]) => fino == null || licenze <= fino);
  if (idx < 0) idx = f.length - 1;
  const da = idx ? f[idx - 1][0] + 1 : 1, a = f[idx][0];
  return {
    idx,
    label: a == null ? `oltre ${da - 1} licenze` : `${da}–${a} licenze`,
    prezzo: LISTINO.light.riga * (1 - f[idx][1] / 100),
  };
}

/** Righe di libro giornale stimate per documento: ×6 ordinarie, ×3 semplificate. */
const righePerDocumento = tipo => tipo === 'sem' ? LISTINO.light.mSem : tipo === 'forf' ? LISTINO.light.mForf : LISTINO.light.mOrd;

/**
 * Prezzo di listino di UN cliente dello studio.
 * Light / Light Plus: fisso + righe stimate × prezzo per riga della fascia.
 * Full: minimo per tipo + documenti oltre soglia.
 * @param {{tipo:string, serv:string, docs:number}} c
 * @param {number} prezzoRiga  € per riga della fascia corrente
 * @returns {{righe:?number, listino:number}} righe = null per il Full
 */
function prezzoCliente(c, prezzoRiga) {
  if (c.serv === 'full') {
    return { righe: null, listino: LISTINO.full[c.tipo] + Math.max(0, c.docs - LISTINO.full.inclusi) * LISTINO.full.ecc };
  }
  const righe = c.docs * righePerDocumento(c.tipo);
  return { righe, listino: LISTINO.light.fisso + righe * prezzoRiga };
}

/**
 * Preventivo PMI.
 * @param {{reg:'ord'|'sem', att:number, pas:number, corr:boolean, ov:?number}} d
 *        ov = prezzo proposto; null = minimo di listino
 */
function calcPmi(d) {
  const L = LISTINO.pmi;
  const docs = d.att + d.pas + (d.corr ? L.corr : 0);
  let base, soglia, nome;
  if (d.reg === 'sem') { base = L.sem; soglia = L.semMax; nome = 'Semplificata'; }
  else if (docs <= L.ord1Max) { base = L.ord1; soglia = L.ord1Max; nome = 'Ordinaria'; }
  else { base = L.ord2; soglia = L.ord2Max; nome = 'Ordinaria'; }
  const oltre = Math.max(0, docs - soglia), ecc = oltre * L.ecc;
  const appl = d.ov == null ? base : d.ov;
  const imp = appl + ecc, iva = imp * LISTINO.iva / 100;
  return { docs, base, soglia, nome, oltre, ecc, appl, imp, iva, tot: imp + iva, sotto: appl < base - 0.005 };
}

/**
 * Preventivo studio. Ogni riga è un gruppo di clienti uguali.
 * Sconto % e mesi agevolati valgono SOLO per i clienti in Light Plus.
 * @param {Array<{tipo,serv,n,docs,ov}>} righe  n = quanti clienti; ov = importo per cliente o null
 * @param {number} scPct     sconto % sul Light Plus
 * @param {number} mesi      mesi di avvio agevolati (0-3)
 * @param {number} promoPct  50 = al 50%, 100 = gratuiti
 */
function calcStudio(righe, scPct, mesi, promoPct) {
  const quanti = c => Math.max(0, Math.round(c.n == null ? 1 : c.n));
  const nL = righe.reduce((a, c) => a + (c.serv !== 'full' ? quanti(c) : 0), 0);
  const f = fascia(nL);
  let lis = 0, app = 0, plusApp = 0, sotto = 0, n = 0;
  const cnt = { light: 0, plus: 0, full: 0 };
  const rows = righe.map(c => {
    const p = prezzoCliente(c, f.prezzo), appl = c.ov == null ? p.listino : c.ov, delta = appl - p.listino, q = quanti(c);
    lis += p.listino * q; app += appl * q; cnt[c.serv] += q; n += q;
    if (c.serv === 'plus') plusApp += appl * q;
    if (delta < -0.005 && q) sotto++;
    return { c, q, righe: p.righe, listino: p.listino, appl, delta };
  });
  const sc = plusApp * scPct / 100;                               // sconto ricorrente
  const regime = app - sc;                                         // imponibile dal secondo anno
  const promo = plusApp * (1 - scPct / 100) / 12 * mesi * promoPct / 100; // solo primo anno
  const primo = regime - promo, iva = primo * LISTINO.iva / 100;
  return { n, nL, f, rows, lis, app, cnt, sotto, sc, regime, promo, primo, iva, tot: primo + iva };
}
