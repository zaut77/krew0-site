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

/** Moltiplicatore documenti → righe di libro giornale: ×6 ordinarie (holding comprese), ×3 semplificate. */
const righePerDocumento = tipo => tipo === 'sem' ? LISTINO.light.mSem : LISTINO.light.mOrd;
/** Le forfettarie pagano un importo fisso, senza quota a riga, in ogni servizio. */
const forfettaria = c => c.tipo === 'forf';
/** Compatibilità con il contratto (51/61): forfettaria in Light o Light Plus. */
const forfettariaLight = c => forfettaria(c) && c.serv !== 'full';

/**
 * Righe di libro giornale di un cliente in un anno.
 * Base: le righe scritte a mano (rg) se ci sono, altrimenti le fatture (docs) × 6 o × 3.
 * Le righe a mano NON si moltiplicano. Corrispettivi (co) e prospetto del personale
 * (pe = sì → LISTINO.pmi.pers documenti) si aggiungono sempre, × 6 o × 3.
 * @param {{tipo:string, docs:number, rg?:number, co?:number, pe?:boolean}} c
 */
function righeCliente(c) {
  const m = righePerDocumento(c.tipo);
  const base = c.rg > 0 ? c.rg : (c.docs || 0) * m;
  return base + ((c.co || 0) + (c.pe ? LISTINO.pmi.pers : 0)) * m;
}

/**
 * Prezzo di listino di UN cliente dello studio, diviso in canone e costo variabile.
 * Light / Light Plus: 600 € fissi + righe × prezzo per riga della fascia.
 * Full: minimo per tipo + righe oltre la soglia (documenti inclusi × 6 o × 3)
 *       × prezzo per riga della fascia.
 * Forfettarie, in ogni servizio: importo fisso, nessuna quota variabile.
 * @param {{tipo:string, serv:string, docs:number, rg?:number, co?:number, pe?:boolean}} c
 * @param {number} prezzoRiga  € per riga della fascia corrente
 * @returns {{righe:?number, soglia:?number, canone:number, variabile:number, listino:number}}
 *          righe = null per le forfettarie; soglia = righe incluse (solo Full)
 */
function prezzoCliente(c, prezzoRiga) {
  const F = LISTINO.full, full = c.serv === 'full';
  if (forfettaria(c)) {
    const canone = full ? F.forf : LISTINO.light.forf;
    return { righe: null, soglia: null, canone, variabile: 0, listino: canone };
  }
  const righe = righeCliente(c);
  if (full) {
    const soglia = F.inclusi[c.tipo] * righePerDocumento(c.tipo);
    const variabile = Math.max(0, righe - soglia) * prezzoRiga;
    return { righe, soglia, canone: F[c.tipo], variabile, listino: F[c.tipo] + variabile };
  }
  const variabile = righe * prezzoRiga;
  return { righe, soglia: null, canone: LISTINO.light.fisso, variabile, listino: LISTINO.light.fisso + variabile };
}

/**
 * Preventivo PMI.
 * @param {{reg:'ord'|'sem'|'hold', att:number, pas:number, corr:boolean, pers:boolean, ov:?number}} d
 *        documenti = fatture attive + passive + corrispettivi (1 × 12) + prospetto del personale (5 × 12)
 *        ov = prezzo proposto; null = minimo di listino
 */
function calcPmi(d) {
  const L = LISTINO.pmi;
  const docs = d.att + d.pas + (d.corr ? L.corr : 0) + (d.pers ? L.pers : 0);
  let base, soglia, nome;
  if (d.reg === 'sem') { base = L.sem; soglia = L.semMax; nome = 'Semplificata'; }
  else if (d.reg === 'hold') { base = L.hold; soglia = L.holdMax; nome = 'Holding'; }
  else if (docs <= L.ord1Max) { base = L.ord1; soglia = L.ord1Max; nome = 'Ordinaria'; }
  else { base = L.ord2; soglia = L.ord2Max; nome = 'Ordinaria'; }
  const oltre = Math.max(0, docs - soglia), ecc = oltre * L.ecc;
  const appl = d.ov == null ? base : d.ov;
  const imp = appl + ecc, iva = imp * LISTINO.iva / 100;
  // canone mensile = prezzo annuo / 12; l'eccedenza si paga a consuntivo e non entra nel canone
  const mese = appl / 12;
  return { docs, base, soglia, nome, oltre, ecc, appl, imp, iva, tot: imp + iva, mese, meseIva: mese * (1 + LISTINO.iva / 100), sotto: appl < base - 0.005 };
}

/**
 * Preventivo studio. Ogni riga è un gruppo di clienti uguali.
 * Sconto % e mesi agevolati valgono SOLO per i clienti in Light Plus.
 * @param {Array<{tipo,serv,n,docs,rg,co,pe,ov}>} righe  n = quanti clienti; ov = importo per cliente o null
 * @param {number} scPct     sconto % sul Light Plus
 * @param {number} mesi      mesi di avvio agevolati (0-3)
 * @param {number} promoPct  50 = al 50%, 100 = gratuiti
 */
function calcStudio(righe, scPct, mesi, promoPct) {
  const quanti = c => Math.max(0, Math.round(c.n == null ? 1 : c.n));
  // licenze che contano per la fascia: tutte quelle in Light e Light Plus, forfettarie comprese.
  // La mail di Parretta del 27/10/2026 parla di sconto "sull'intero cumulo di aziende portato"
  // senza eccezioni; le forfettarie contano per la fascia ma pagano comunque l'importo fisso.
  const nL = righe.reduce((a, c) => a + (c.serv !== 'full' ? quanti(c) : 0), 0);
  const f = fascia(nL);
  let lis = 0, app = 0, plusApp = 0, sotto = 0, n = 0, canoni = 0, variabili = 0;
  const cnt = { light: 0, plus: 0, full: 0 };
  const rows = righe.map(c => {
    const p = prezzoCliente(c, f.prezzo), appl = c.ov == null ? p.listino : c.ov, delta = appl - p.listino, q = quanti(c);
    lis += p.listino * q; app += appl * q; cnt[c.serv] += q; n += q;
    canoni += p.canone * q; variabili += p.variabile * q;
    if (c.serv === 'plus') plusApp += appl * q;
    if (delta < -0.005 && q) sotto++;
    return { c, q, righe: p.righe, soglia: p.soglia, canone: p.canone, variabile: p.variabile, listino: p.listino, appl, delta };
  });
  const sc = plusApp * scPct / 100;                               // sconto ricorrente
  const regime = app - sc;                                         // imponibile dal secondo anno
  const promo = plusApp * (1 - scPct / 100) / 12 * mesi * promoPct / 100; // solo primo anno
  const primo = regime - promo, iva = primo * LISTINO.iva / 100, conIva = 1 + LISTINO.iva / 100;
  // canone mensile a regime (dal secondo anno) e, se ci sono mesi agevolati, quanto si paga in quei mesi
  const mese = regime / 12, meseAgev = mesi ? (regime - plusApp * (1 - scPct / 100) * promoPct / 100) / 12 : null;
  return { n, nL, f, rows, lis, app, canoni, variabili, cnt, sotto, sc, regime, promo, primo, iva, tot: primo + iva,
    mese, meseIva: mese * conIva, meseAgev, meseAgevIva: meseAgev == null ? null : meseAgev * conIva };
}
