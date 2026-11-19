/* ==========================================================================
 * 61 · PREVENTIVO STUDIO COMMERCIALISTA
 * Due modi di lavorare, stessa tabella e stessi calcoli:
 *   'cli'   cliente per cliente: una riga per cliente, con riferimento, tipo
 *           di contabilità, fatture di vendita e di acquisto OPPURE righe di
 *           libro giornale, corrispettivi e prospetto del personale.
 *   'comp'  per composizione: una riga per gruppo di clienti uguali, quando
 *           l'elenco dei clienti non c'è (documenti medi oppure righe medie).
 * Le regole di conversione in righe sono in righeCliente (20).
 * Nel contratto ogni cliente ha una scheda da completare (units).
 * ========================================================================== */

/**
 * comp     composizione di partenza (passo 1), precompilata con un ESEMPIO
 * clients  righe del preventivo: { id, tipo, serv, n, docs, rg, co, pe, ov, units[] }
 *          docs = fatture (o documenti medi); rg = righe di libro giornale
 *          scritte a mano (se > 0 sostituiscono le fatture); co = corrispettivi;
 *          pe = prospetto del personale sì/no; ov = importo per cliente, null = listino
 *          solo in modo 'cli': rif (riferimento), fv, fa (fatture di vendita
 *          e di acquisto, docs = fv + fa), n = 1
 */
const S = {
  comp: { op: { n: 4, docs: 750, rg: 0, serv: 'light' }, hold: { n: 1, docs: 120, rg: 0, serv: 'full' }, sem: { n: 6, docs: 350, rg: 0, serv: 'plus' }, forf: { n: 3, docs: 60, rg: 0, serv: 'full' } },
  clients: [], seq: 0, mode: 'cli',
};
const nuovaRiga = (tipo, serv, n, docs, rg = 0) => ({ id: ++S.seq, tipo, serv, n, docs, rg, co: 0, pe: false, ov: null, units: [] });
/** Riga di un singolo cliente (modo 'cli'). */
const nuovoCliente = (rif, tipo, serv, fv, fa, rg, co, pe) => ({ id: ++S.seq, tipo, serv, n: 1, rif, fv, fa, rg, co, pe, docs: fv + fa, ov: null, units: [{ nome: rif }] });

// modulo della composizione: una riga per tipo di cliente
$('#comp').insertAdjacentHTML('beforeend', Object.keys(TIPI).map(t => `
  <span class="t">${TIPI[t]}</span>
  <input autocomplete="off" id="c-${t}-n" data-t="${t}" data-k="n" type="number" min="0" inputmode="numeric" value="${S.comp[t].n}" aria-label="Quanti clienti: ${TIPI[t]}">
  <input autocomplete="off" id="c-${t}-docs" data-t="${t}" data-k="docs" type="number" min="0" inputmode="numeric" value="${S.comp[t].docs}" aria-label="Documenti medi: ${TIPI[t]}">
  <input autocomplete="off" id="c-${t}-rg" data-t="${t}" data-k="rg" type="number" min="0" inputmode="numeric" value="${S.comp[t].rg || ''}" placeholder="–" aria-label="Righe medie di libro giornale, in alternativa: ${TIPI[t]}">
  <select class="e" id="c-${t}-serv" data-t="${t}" data-k="serv" aria-label="Esigenza: ${TIPI[t]}">${opts(ESIGENZE, S.comp[t].serv)}</select>`).join(''));
$('#comp').addEventListener('input', e => {
  const el = e.target; if (!el.dataset.t) return;
  S.comp[el.dataset.t][el.dataset.k] = el.dataset.k === 'serv' ? el.value : num(el.value);
});

/** Ricrea le righe del preventivo dalla composizione (sostituisce quelle presenti). */
function genera() {
  S.clients = Object.keys(TIPI).filter(t => S.comp[t].n > 0)
    .map(t => nuovaRiga(t, S.comp[t].serv, Math.min(Math.round(S.comp[t].n), MAX_CLIENTI_RIGA), S.comp[t].docs, S.comp[t].rg || 0));
  renderClients();
}

/** Intestazioni e testi della tabella nei due modi. */
const REGOLA_RIGHE = 'Righe = righe di libro giornale indicate dallo studio (senza moltiplicatore) oppure, se mancano, fatture × 6 per le ordinarie e × 3 per le semplificate. Corrispettivi e prospetto del personale (60 documenti l\'anno) si aggiungono sempre, × 6 o × 3. Le forfettarie pagano 200 € fissi, in ogni servizio. Full: righe oltre la soglia al prezzo della fascia. L\'importo si può alzare sopra il listino; campo vuoto = listino.';
const TABELLA = {
  cli: {
    titolo: '2. Prezzo per cliente',
    testa: ['Riferimento', 'Tipo di contabilità', 'Esigenza', 'Fatture di vendita*', 'Fatture di acquisto*', 'Righe libro giornale*', 'Corri&shy;spettivi*', 'Perso&shy;nale', 'Righe totali*', 'Canone*', 'Costo variabile*', 'Listino*', 'Importo applicato*', 'Al mese*', 'Controllo', ''],
    aiuto: 'Se scrivi le righe di libro giornale, le fatture non contano più (diventano grigie). ' + REGOLA_RIGHE,
    vuoto: 'Nessun cliente. Carica il modulo compilato, incolla l\'elenco da Excel qui sopra oppure premi "Aggiungi un cliente".',
  },
  comp: {
    titolo: '2. Prezzo per tipo di cliente',
    testa: ['Quanti*', 'Tipo di cliente', 'Esigenza', 'Documenti/anno*', 'Righe libro giornale*', 'Righe totali*', 'Canone*', 'Costo variabile*', 'Listino per cliente*', 'Importo per cliente*', 'Al mese per cliente*', 'Totale*', 'Controllo', ''],
    aiuto: 'Valori per singolo cliente; il totale moltiplica per il numero di clienti. Se scrivi le righe medie, i documenti non contano più. ' + REGOLA_RIGHE,
    vuoto: 'Nessuna riga. Compila la composizione qui sopra e premi "Crea il preventivo".',
  },
};

/** Ridisegna la tabella (solo quando cambiano le righe: preserva il focus mentre si scrive). */
function renderClients() {
  const cli = S.mode === 'cli', T = TABELLA[S.mode];
  const numero = (c, f, v, w, etichetta) => `<td class="num"><input autocomplete="off" class="w-num"${w ? ` style="width:${w}px"` : ''} id="r${c.id}-${f}" data-f="${f}" type="number" min="0" inputmode="numeric" value="${v}"${f === 'rg' ? ' placeholder="–"' : ''} aria-label="${etichetta}"></td>`;
  $('#st-h2').textContent = T.titolo; $('#st-hint').textContent = T.aiuto;
  // l'asterisco nelle intestazioni marca le colonne numeriche, allineate a destra
  $('#st-head').innerHTML = `<tr>${T.testa.map(t => t.endsWith('*') ? `<th class="num">${t.slice(0, -1)}</th>` : `<th>${t}</th>`).join('')}</tr>`;
  $('#st-body').innerHTML = S.clients.map(c => `<tr data-id="${c.id}">
    ${cli ? `<td><input autocomplete="off" class="w-name" style="min-width:150px" id="r${c.id}-rif" data-f="rif" type="text" value="${esc(c.rif)}" placeholder="Nome o codice del cliente" aria-label="Riferimento del cliente"></td>` : numero(c, 'n', c.n, 70, 'Quanti clienti')}
    <td><select class="w-sel" id="r${c.id}-tipo" data-f="tipo" aria-label="Tipo di contabilità">${opts(TIPI, c.tipo)}</select></td>
    <td><select class="w-sel" id="r${c.id}-serv" data-f="serv" aria-label="Esigenza">${opts(SERVIZI, c.serv)}</select></td>
    ${cli ? numero(c, 'fv', c.fv, 0, 'Fatture di vendita') + numero(c, 'fa', c.fa, 0, 'Fatture di acquisto')
          : numero(c, 'docs', c.docs, 0, 'Documenti all\'anno per cliente')}
    ${numero(c, 'rg', c.rg || '', 0, 'Righe di libro giornale')}
    ${cli ? numero(c, 'co', c.co, 0, 'Corrispettivi') + `<td class="chk"><input id="r${c.id}-pe" data-f="pe" type="checkbox"${c.pe ? ' checked' : ''} aria-label="Prospetto del personale"></td>` : ''}
    <td class="num" data-o="righe"></td><td class="num" data-o="canone"></td><td class="num" data-o="variabile"></td><td class="num" data-o="listino"></td>
    <td class="num"><input autocomplete="off" class="w-num" style="width:100px" id="r${c.id}-ov" data-f="ov" type="number" min="0" step="0.01" inputmode="decimal" value="${c.ov == null ? '' : c.ov}" aria-label="Importo per cliente"></td>
    <td class="num" data-o="mese"></td>
    ${cli ? '' : '<td class="num" data-o="tot"></td>'}
    <td data-o="esito"></td>
    <td><button class="ico" type="button" data-del title="Togli la riga" aria-label="Togli la riga">✕</button></td></tr>`).join('')
    || `<tr><td colspan="${T.testa.length}" style="padding:18px;color:var(--muted)">${T.vuoto}</td></tr>`;
  updateStudio();
}

/** Righe del canone mensile per conto e PDF: a regime e, se ci sono, nei mesi agevolati. */
function mensili(r, mesi) {
  const a = r.promo ? ' a regime' : '', nei = `Nei ${mesi === 1 ? 'mese agevolato' : mesi + ' mesi agevolati'} (Light Plus), al mese`;
  const out = [[`Canone mensile${a}, IVA esclusa`, eur(r.mese)], [`Canone mensile${a}, IVA inclusa`, eur(r.meseIva)]];
  if (r.promo) out.push([nei + ', IVA esclusa', eur(r.meseAgev)], [nei + ', IVA inclusa', eur(r.meseAgevIva)]);
  return out;
}

/** Ricalcola tutto e aggiorna celle, fascia, totali, foglio e contratto. */
function updateStudio() {
  const scPct = clampPct($('#st-sc').value), mesi = num($('#st-pm').value), pp = num($('#st-pp').value);
  const r = calcStudio(S.clients, scPct, mesi, pp), f = r.f, L = LISTINO;

  // celle calcolate di ogni riga
  r.rows.forEach(x => {
    const tr = $(`#st-body tr[data-id="${x.c.id}"]`); if (!tr) return;
    const sotto = x.delta < -0.005, campo = tr.querySelector('[data-f=ov]');
    const cella = (nome, testo) => { const td = tr.querySelector(`[data-o=${nome}]`); if (td) td.textContent = testo; }; // alcune colonne esistono in un solo modo
    cella('righe', x.righe == null ? '–' : x.soglia != null ? `${int(x.righe)} di ${int(x.soglia)}` : int(x.righe));
    cella('canone', eur(x.canone)); cella('variabile', eur(x.variabile));
    cella('listino', eur(x.listino)); cella('mese', eur(x.appl / 12));
    cella('tot', eur(x.appl * x.q));
    // righe scritte a mano: fatture (o documenti medi) in grigio, non contano
    const aMano = x.c.rg > 0 && x.righe != null;
    tr.querySelectorAll('[data-f=fv],[data-f=fa],[data-f=docs]').forEach(el => { el.classList.toggle('off', aMano); el.title = aMano ? 'Non conta: valgono le righe di libro giornale' : ''; });
    campo.placeholder = dec(x.listino); campo.dataset.min = x.listino; campo.classList.toggle('bad', sotto);
    tr.querySelector('[data-o=esito]').innerHTML = sotto ? `<span class="pill bad">Sotto ${eur(x.delta)}</span>`
      : x.delta > 0.005 ? `<span class="pill ok">Sopra +${eur(x.delta)}</span>` : '<span class="pill info">Listino</span>';
  });

  // fascia Light
  $('#st-fascia-txt').innerHTML = r.nL
    ? `<b>${r.nL} licenze</b> tra Light e Light Plus: fascia <b>${f.label}</b>, <b>${dec(f.prezzo)} €</b> per riga, più ${eur(L.light.fisso)} fissi per ditta.`
    : 'Nessun cliente in Light o Light Plus: le fasce non si applicano.';
  if (r.cnt.full) $('#st-fascia-txt').innerHTML += ` Le righe Full oltre soglia costano <b>${dec(f.prezzo)} €</b> l'una.`;
  let da = 1;
  $('#st-tiers').innerHTML = L.light.fasce.map(([fino, sconto], i) => {
    const lab = fino == null ? `oltre ${da - 1}` : `${da}–${fino}`; if (fino != null) da = fino + 1;
    return `<span class="${r.nL && i === f.idx ? 'on' : ''}">${lab} · ${dec(L.light.riga * (1 - sconto / 100))} €</span>`;
  }).join('');

  // avvisi
  const promoLab = `Light Plus: ${mesi} ${mesi === 1 ? 'mese' : 'mesi'} ${pp === 100 ? (mesi === 1 ? 'gratuito' : 'gratuiti') : 'al 50%'}`;
  const note = [];
  if (r.sotto) note.push(['bad', `${r.sotto} ${r.sotto === 1 ? 'riga ha' : 'righe hanno'} un importo sotto il listino.`]);
  if ((mesi || scPct) && !r.cnt.plus) note.push(['warn', 'Sconto e mesi agevolati valgono solo per i clienti in Light Plus: tra le righe non ce ne sono.']);
  if (!r.sotto && r.n) note.push(['ok', 'Controllo superato: nessun importo sotto il listino.']);
  showNotes($('#st-notes'), note);

  // totali
  const anno = r.promo ? 'primo anno' : 'annuo';
  $('#st-sum').innerHTML = `
    <div><span>Clienti</span><span>${r.n} (${r.cnt.light} Light, ${r.cnt.plus} Light Plus, ${r.cnt.full} Full)</span></div>
    <div><span>Canoni fissi (a listino)</span><span>${eur(r.canoni)}</span></div>
    <div><span>Costi variabili (a listino)</span><span>${eur(r.variabili)}</span></div>
    <div><span>Totale a listino</span><span>${eur(r.lis)}</span></div>
    ${Math.abs(r.app - r.lis) > 0.005 ? `<div><span>Aumenti sul listino</span><span>+ ${eur(r.app - r.lis)}</span></div>` : ''}
    <div><span>Totale importi applicati</span><span>${eur(r.app)}</span></div>
    ${r.sc ? `<div><span>Light Plus: sconto ${pct(scPct)}</span><span>− ${eur(r.sc)}</span></div>` : ''}
    ${r.promo ? `<div><span>${promoLab}</span><span>− ${eur(r.promo)}</span></div>` : ''}
    <div><span>Imponibile ${anno}</span><span>${eur(r.primo)}</span></div>
    <div><span>IVA ${L.iva}%</span><span>${eur(r.iva)}</span></div>
    <div class="tot"><span>Totale ${anno}</span><span>${eur(r.tot)}</span></div>
    ${r.promo ? `<div><span>Imponibile dal secondo anno</span><span>${eur(r.regime)}</span></div>` : ''}
    ${mensili(r, mesi).map(([k, v]) => `<div><span>${k}</span><span>${v}</span></div>`).join('')}
    <div><span>Media per cliente (imponibile)</span><span>${eur(r.n ? r.primo / r.n : 0)}</span></div>`;

  // foglio del preventivo: una riga per cliente oppure per tipo di cliente
  const attive0 = r.rows.filter(x => x.q);
  const cli = S.mode === 'cli';
  const nome = $('#st-nome').value.trim(), prep = $('#st-prep').value.trim();
  const numero = $('#st-num').value.trim(), valido = $('#st-val').value.trim();
  $('#st-val').classList.toggle('bad', !!valido && !!vDate(valido));
  Q.st = {
    file: 'Preventivo Yuxme' + (nome ? ' - ' + nome : ''), blocked: r.sotto > 0 || !r.n, data: today(), footer: piede(numero, prep, valido),
    meta: metaNumero(numero, valido).concat([['Studio', nome || 'Da indicare'], ['Clienti', `${r.n} (${r.cnt.light} Light, ${r.cnt.plus} Light Plus, ${r.cnt.full} Full Assistance)`]],
      r.nL ? [['Fascia Light', `${f.label}: ${dec(f.prezzo)} € per riga`]] : [], prep ? [['Preparato da', prep]] : []),
    small: true,
    cols: cli
      ? [{ t: '#', r: 1 }, { t: 'Cliente' }, { t: 'Tipo di contabilità' }, { t: 'Servizio' }, { t: 'Righe/anno', r: 1 }, { t: 'Canone', r: 1 }, { t: 'Costo variabile', r: 1 }, { t: 'Importo annuo', r: 1 }, { t: 'Al mese', r: 1 }]
      : [{ t: 'Clienti', r: 1 }, { t: 'Tipo di cliente' }, { t: 'Servizio' }, { t: 'Righe/anno per cliente', r: 1 }, { t: 'Canone', r: 1 }, { t: 'Costo variabile', r: 1 }, { t: 'Importo per cliente', r: 1 }, { t: 'Al mese per cliente', r: 1 }, { t: 'Totale annuo', r: 1 }],
    rows: r.rows.filter(x => x.q).map((x, i) => {
      const righe = x.righe == null ? '–' : int(x.righe), soldi = [eur(x.canone), eur(x.variabile), eur(x.appl), eur(x.appl / 12)];
      return cli ? [String(i + 1), x.c.rif || `Cliente ${i + 1}`, TIPI[x.c.tipo], SERVIZI[x.c.serv], righe].concat(soldi)
        : [String(x.q), TIPI[x.c.tipo], SERVIZI[x.c.serv], righe].concat(soldi, [eur(x.appl * x.q)]);
    }),
    totals: [['Canoni fissi (a listino)', eur(r.canoni)], ['Costi variabili (a listino)', eur(r.variabili)]].concat(
      Math.abs(r.app - r.lis) > 0.005 ? [['Aumenti sul listino', '+ ' + eur(r.app - r.lis)]] : [],
      [['Totale', eur(r.app)]],
      r.sc ? [[`Light Plus: sconto ${pct(scPct)}`, '− ' + eur(r.sc)]] : [], r.promo ? [[promoLab, '− ' + eur(r.promo)]] : [],
      [[`Imponibile ${anno}`, eur(r.primo)], [`IVA ${L.iva}%`, eur(r.iva)], [`Totale ${anno}`, eur(r.tot), 1]],
      r.promo ? [['Imponibile dal secondo anno', eur(r.regime)]] : [], mensili(r, mesi)),
    notes: ['Importi annui; "al mese" = importo annuo diviso 12. Canone e costo variabile sono a listino.'].concat(
      [`Righe di libro giornale: quelle indicate dallo studio oppure, se mancano, fatture × ${L.light.mOrd} per le ordinarie e × ${L.light.mSem} per le semplificate. Corrispettivi e prospetto del personale (${L.pmi.pers} documenti l'anno) si aggiungono × ${L.light.mOrd} o × ${L.light.mSem}. Il conteggio definitivo avviene sulle righe effettive.`],
      r.nL ? [`Light e Light Plus: ${eur(L.light.fisso)} l'anno per ditta più ${dec(f.prezzo)} € per riga di libro giornale.`] : [],
      attive0.some(x => x.c.tipo === 'forf') ? [`Clienti forfettari: ${eur(L.light.forf)} l'anno ciascuno, senza quota per riga.`] : [],
      r.cnt.full ? [`Full Assistance: compresi ${int(L.full.inclusi.op)} documenti (${int(L.full.inclusi.op * L.light.mOrd)} righe) per le ordinarie operative, ${int(L.full.inclusi.hold)} (${int(L.full.inclusi.hold * L.light.mOrd)} righe) per le holding, ${int(L.full.inclusi.sem)} (${int(L.full.inclusi.sem * L.light.mSem)} righe) per le semplificate; ogni riga in più ${dec(f.prezzo)} €, a consuntivo.`] : [],
      r.promo ? ['I mesi agevolati del Light Plus valgono sul primo anno.'] : [], r.sc ? ['Lo sconto si applica ai soli clienti in Light Plus.'] : []),
  };
  renderSheet('st-sheet', Q.st);
  aggiornaRigheIncolla();
  contractStudio(r, scPct, promoLab);
  syncOutput('st');
}

/** Come il contratto esprime soglia ed eccedenza del Full (menu "Full: soglia ed eccedenza"). */
const UNITA_FULL = {
  doc: { riga: false, plur: 'documenti contabili', PLUR: 'DOCUMENTI', sing: 'documento eccedente contabilizzato', EXTRA: 'DOCUMENTI EXTRA', a: 'a documento', compresi: 'compresi' },
  riga: { riga: true, plur: 'righe di libro giornale', PLUR: 'RIGHE DI LIBRO GIORNALE', sing: 'riga di libro giornale eccedente contabilizzata', EXTRA: 'RIGHE EXTRA', a: 'a riga', compresi: 'comprese' },
};

/** Porta nel contratto prezzi, condizioni particolari e tabelle dei moduli d'ordine. */
function contractStudio(r, scPct, promoLab) {
  const a = C.st.auto, f = r.f, L = LISTINO, nome = $('#st-nome').value.trim();
  const attive = r.rows.filter(x => x.q);
  // prezzo Full di contratto = il più basso tra gli importi applicati, mai sotto il listino
  const minimoApplicato = (tipo, listino) => {
    const v = attive.filter(x => x.c.serv === 'full' && x.c.tipo === tipo).map(x => x.appl);
    return v.length ? Math.max(listino, Math.min(...v)) : listino;
  };
  const vOp = minimoApplicato('op', L.full.op), vHold = minimoApplicato('hold', L.full.hold);

  a.soc = nome; a.data = today();
  a.lFisso = dec(L.light.fisso); a.lMese = dec(L.light.fisso / 12); a.lRiga = dec(f.prezzo);
  a.fOp = dec(vOp); a.fOpM = dec(vOp / 12);
  a.fHold = dec(vHold); a.fHoldM = vHold === L.full.hold ? '133,34' : dec(vHold / 12); // 133,34: cifra del contratto originale
  // eccedenza Full: il menu del contratto sceglie se esprimerla a documento o a riga di libro giornale.
  // Il prezzo è sempre quello della riga in fascia; a documento vale × 6 (ordinarie) o × 3 (semplificate).
  const riga = $('#st-ecc-u').value === 'riga', I = L.full.inclusi, mO = L.light.mOrd, mS = L.light.mSem;
  const u = UNITA_FULL[riga ? 'riga' : 'doc'];
  a.fDoc = int(riga ? I.op * mO : I.op); a.fDocH = int(riga ? I.hold * mO : I.hold); a.fDocS = int(riga ? I.sem * mS : I.sem);
  const ecc = riga ? f.prezzo : f.prezzo * mO, eccS = f.prezzo * mS;
  a.fEcc = dec(ecc); a.fEccS = dec(eccS);
  a.cond = [
    r.nL && f.idx ? `prezzo per riga ridotto a ${dec(f.prezzo)} € per la fascia ${f.label}` : '',
    attive.some(x => forfettariaLight(x.c)) ? `clienti forfettari in Light: ${dec(L.light.forf)} € annui fissi per cliente, senza quota a riga` : '',
    r.sc ? `Light Plus: sconto del ${pct(scPct)} sui corrispettivi` : '',
    r.promo ? promoLab + ', sul primo anno' : '',
  ].filter(Boolean).join('; ');
  C.st.min = { lFisso: L.light.fisso, lMese: L.light.fisso / 12, lRiga: f.prezzo, fOp: L.full.op, fOpM: L.full.op / 12, fHold: L.full.hold, fHoldM: 133.33, fEcc: ecc, fEccS: eccS };

  // tabelle dei moduli d'ordine: una riga per cliente, con i dati da completare
  const gruppi = { light: x => x.c.serv !== 'full', fullnh: x => x.c.serv === 'full' && x.c.tipo !== 'hold', fullh: x => x.c.serv === 'full' && x.c.tipo === 'hold' };
  const presenti = {};
  for (const k in gruppi) {
    const rows = [];
    attive.filter(gruppi[k]).forEach(x => {
      for (let i = 0; i < x.q; i++) {
        const u = x.c.units[i] || (x.c.units[i] = {});
        rows.push({ id: `${x.c.id}_${i}`, cells: [u.nome || '', u.rl || '', u.pi || '', TIPI[x.c.tipo] + (x.c.serv === 'plus' ? ' (Light Plus)' : ''), u.per || '', x.righe == null ? '–' : int(k === 'light' || riga ? x.righe : x.righe / righePerDocumento(x.c.tipo)), eur(x.appl)] });
      }
    });
    presenti[k] = rows.length > 0;
    C.st.tabs[k] = { cols: TABCOLS.concat(k === 'light' ? ['Righe/anno (stima)', 'Stima annua'] : [riga ? 'Righe/anno' : 'Documenti/anno', 'Compenso annuale']), rows };
  }
  const bozza = attive.some(x => x.c.serv === 'full' && (x.c.tipo === 'sem' || x.c.tipo === 'forf'));
  presenti.fullSem = attive.some(x => x.c.serv === 'full' && x.c.tipo === 'sem');
  C.st.dsl = dslStudio(presenti, !!(a.cond || C.st.user.cond), bozza, u);
  C.st.file = CONTRATTO_FILE.st + (nome ? '_' + nome : '');
  renderContract('st');
}

/* ---- eventi della tabella ---- */

$('#st-body').addEventListener('input', e => {
  const el = e.target, tr = el.closest('tr'); if (!tr || !el.dataset.f) return;
  const c = S.clients.find(x => x.id == tr.dataset.id), k = el.dataset.f;
  c[k] = ['docs', 'fv', 'fa', 'co', 'rg'].includes(k) ? Math.max(0, num(el.value))
    : k === 'pe' ? el.checked
    : k === 'n' ? Math.min(MAX_CLIENTI_RIGA, Math.max(0, Math.round(num(el.value))))
    : k === 'ov' ? (el.value === '' ? null : num(el.value)) : el.value;
  if (c.rif != null) {            // riga di un singolo cliente
    c.docs = c.fv + c.fa;          // corrispettivi e personale entrano in righeCliente
    if (k === 'rif') (c.units[0] || (c.units[0] = {})).nome = c.rif; // il riferimento è anche la ragione sociale nel contratto
  }
  updateStudio();
});

// uscita dall'importo: sotto il listino non si può, il campo torna al listino
$('#st-body').addEventListener('change', e => {
  const el = e.target; if (el.dataset.f !== 'ov' || el.value === '') return;
  const min = +el.dataset.min;
  if (num(el.value) >= min - 0.005) { $('#st-err').innerHTML = ''; return; }
  const c = S.clients.find(x => x.id == el.closest('tr').dataset.id);
  showNotes($('#st-err'), [['bad', `Errore: ${c.rif ? c.rif + ', ' : ''}${TIPI[c.tipo]} in ${SERVIZI[c.serv]}, ${eur(num(el.value))} è sotto il listino. Ho riportato l'importo a ${eur(min)}: si può solo alzare.`]]);
  c.ov = null; el.value = ''; updateStudio();
});

$('#st-body').addEventListener('click', e => {
  const b = e.target.closest('[data-del]'); if (!b) return;
  S.clients = S.clients.filter(x => x.id != b.closest('tr').dataset.id); renderClients();
});
$('#st-gen').addEventListener('click', genera);
$('#st-add').addEventListener('click', () => { S.clients.push(nuovaRiga('op', 'light', 1, 500)); renderClients(); });
['st-sc', 'st-pm', 'st-pp', 'st-ecc-u', 'st-nome', 'st-prep', 'st-mail', 'st-num', 'st-val'].forEach(id => $('#' + id).addEventListener('input', updateStudio));

/* ---- elenco clienti incollato da Excel ----
 * Riempie le schede dei clienti (units) di una riga del preventivo, così i
 * moduli d'ordine del contratto non vanno compilati a mano. */

/** Tiene allineata la tendina delle righe con il preventivo. */
function aggiornaRigheIncolla() {
  const sel = $('#st-paste-row'), scelta = sel.value;
  sel.innerHTML = S.clients.filter(c => c.n > 0).map(c => `<option value="${c.id}">${esc(c.rif != null ? (c.rif || 'Cliente senza riferimento') : c.n + ' × ' + TIPI[c.tipo])} – ${SERVIZI[c.serv]}</option>`).join('');
  if ([...sel.options].some(o => o.value === scelta)) sel.value = scelta;
}

$('#st-paste-go').addEventListener('click', () => {
  const riga = S.clients.find(c => c.id == $('#st-paste-row').value), msg = $('#st-paste-msg');
  // Excel separa le colonne con tabulazioni; si accetta anche il punto e virgola
  const righe = $('#st-paste').value.split(/\r?\n/).map(l => l.split(/\t|;/).map(v => v.trim())).filter(v => v.some(Boolean));
  if (!riga || !righe.length) { msg.textContent = 'Incolla almeno una riga e scegli dove inserirla.'; return; }
  righe.slice(0, riga.n).forEach((v, i) => { riga.units[i] = { nome: v[0] || '', rl: v[1] || '', pi: normVal('piva', v[2] || ''), per: v[3] || '' }; });
  const scartate = Math.max(0, righe.length - riga.n);
  msg.textContent = `Inseriti ${Math.min(righe.length, riga.n)} clienti.` + (scartate ? ` ${scartate} in più ignorati: la riga ne prevede ${riga.n}.` : '');
  $('#st-paste').value = '';
  updateStudio();
});

/* ---- modo di lavoro e elenco clienti ---- */

/** Passa da un modo all'altro. Le righe dell'altro modo vengono scartate. */
function setMode(m) {
  S.mode = m;
  $('#st-mode').querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.m === m));
  $('#st-cli-box').hidden = m !== 'cli'; $('#st-comp-box').hidden = m !== 'comp';
  $('#st-cli-msg').textContent = '';
  if (m === 'comp') genera(); else { S.clients = []; renderClients(); }
}
$('#st-mode').addEventListener('click', e => { const b = e.target.closest('button'); if (b && b.dataset.m !== S.mode) setMode(b.dataset.m); });
$('#st-cli-serv').innerHTML = opts(ESIGENZE, 'light');

/** "ordinaria", "SRL holding", "semplif.", "forfettario"… → chiave di TIPI; null se non riconosciuto. */
function tipoDaTesto(t) {
  const v = String(t || '').toLowerCase();
  if (/hold/.test(v)) return 'hold';
  if (/sempl/.test(v)) return 'sem';
  if (/forf/.test(v)) return 'forf';
  if (/ord/.test(v)) return 'op';
  return null;
}
/** "1.250", "1250", "1 250" → 1250; testo o vuoto → 0. */
const interoDa = v => { const n = parseInt(String(v || '').replace(/[.\s]/g, ''), 10); return Number.isFinite(n) && n > 0 ? n : 0; };
/** Corrispettivi: un numero, oppure "sì"/"x" = uno al mese (LISTINO.pmi.corr). */
const corrispettiviDa = v => /^(s[iì]|x|vero|true)$/i.test(String(v || '').trim()) ? LISTINO.pmi.corr : interoDa(v);

/** Prospetto del personale: "sì", "x", "1"… = sì. */
const siNo = v => /^(s[iì]|x|1|vero|true|yes)$/i.test(String(v || '').trim());

/**
 * Aggiunge i clienti letti da Excel (incollati o dal modulo compilato).
 * Colonne, in quest'ordine: riferimento, tipo di contabilità, fatture di vendita,
 * fatture di acquisto, righe di libro giornale, corrispettivi, prospetto del personale.
 * La prima riga si salta se è un'intestazione (nessun numero nelle colonne 3-6).
 * @param {string[][]} righe  celle come testo
 * @returns {string} messaggio per l'utente
 */
function caricaClienti(righe, serv) {
  righe = righe.map(v => v.map(x => String(x == null ? '' : x).trim())).filter(v => v.some(Boolean));
  const intestazione = v => !/\d/.test(v.slice(2, 6).join('')) && /[a-z]/i.test(v.join(''));
  while (righe.length && intestazione(righe[0])) righe = righe.slice(1);
  if (!righe.length) return 'Non ho trovato righe con i dati di un cliente.';
  const spazio = MAX_CLIENTI_RIGA - S.clients.length; let ignoti = 0, conRighe = 0;
  righe.slice(0, spazio).forEach(v => {
    const tipo = tipoDaTesto(v[1]); if (!tipo) ignoti++;
    const rg = interoDa(v[4]); if (rg) conRighe++;
    S.clients.push(nuovoCliente(v[0] || '', tipo || 'op', serv, interoDa(v[2]), interoDa(v[3]), rg, corrispettiviDa(v[5]), siNo(v[6])));
  });
  renderClients();
  return `Caricati ${Math.min(righe.length, spazio)} clienti.`
    + (conRighe ? ` Per ${conRighe} valgono le righe di libro giornale al posto delle fatture.` : '')
    + (ignoti ? ` Per ${ignoti} non ho riconosciuto il tipo di contabilità: li ho messi come ordinaria operativa, controllali.` : '')
    + (righe.length > spazio ? ` ${righe.length - spazio} non caricati: il limite è ${MAX_CLIENTI_RIGA} clienti.` : '');
}

// elenco incollato da Excel: colonne separate da tabulazioni (o punto e virgola)
$('#st-cli-go').addEventListener('click', () => {
  const testo = $('#st-cli-paste').value;
  $('#st-cli-msg').textContent = caricaClienti(testo.split(/\r?\n/).map(l => l.split(/\t|;/)), $('#st-cli-serv').value);
  $('#st-cli-paste').value = '';
});
$('#st-cli-add').addEventListener('click', () => {
  if (S.clients.length >= MAX_CLIENTI_RIGA) return;
  S.clients.push(nuovoCliente('', 'op', $('#st-cli-serv').value, 0, 0, 0, 0, false)); renderClients();
  const campo = $(`#r${S.clients[S.clients.length - 1].id}-rif`); if (campo) campo.focus();
});
$('#st-cli-clear').addEventListener('click', () => { S.clients = []; $('#st-cli-msg').textContent = ''; renderClients(); });
