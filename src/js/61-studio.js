/* ==========================================================================
 * 61 · PREVENTIVO STUDIO COMMERCIALISTA
 * Due modi di lavorare, stessa tabella e stessi calcoli:
 *   'cli'   cliente per cliente: una riga per cliente, con riferimento, tipo
 *           di contabilità, fatture di vendita, di acquisto e corrispettivi.
 *           Documenti = vendite + acquisti + corrispettivi.
 *   'comp'  per composizione: una riga per gruppo di clienti uguali, quando
 *           l'elenco dei clienti non c'è.
 * Nel contratto ogni cliente ha una scheda da completare (units).
 * ========================================================================== */

/**
 * comp     composizione di partenza (passo 1), precompilata con un ESEMPIO
 * clients  righe del preventivo: { id, tipo, serv, n, docs, ov, units[] }
 *          ov = importo per cliente scelto dall'utente; null = listino
 *          solo in modo 'cli': rif (riferimento), fv, fa, co (fatture di
 *          vendita, di acquisto, corrispettivi), n = 1
 */
const S = {
  comp: { op: { n: 4, docs: 750, serv: 'light' }, hold: { n: 1, docs: 120, serv: 'full' }, sem: { n: 6, docs: 350, serv: 'plus' }, forf: { n: 3, docs: 60, serv: 'full' } },
  clients: [], seq: 0, mode: 'cli',
};
const nuovaRiga = (tipo, serv, n, docs) => ({ id: ++S.seq, tipo, serv, n, docs, ov: null, units: [] });
/** Riga di un singolo cliente (modo 'cli'). */
const nuovoCliente = (rif, tipo, serv, fv, fa, co) => ({ id: ++S.seq, tipo, serv, n: 1, rif, fv, fa, co, docs: fv + fa + co, ov: null, units: [{ nome: rif }] });

// modulo della composizione: una riga per tipo di cliente
$('#comp').insertAdjacentHTML('beforeend', Object.keys(TIPI).map(t => `
  <span class="t">${TIPI[t]}</span>
  <input autocomplete="off" id="c-${t}-n" data-t="${t}" data-k="n" type="number" min="0" inputmode="numeric" value="${S.comp[t].n}" aria-label="Quanti clienti: ${TIPI[t]}">
  <input autocomplete="off" id="c-${t}-docs" data-t="${t}" data-k="docs" type="number" min="0" inputmode="numeric" value="${S.comp[t].docs}" aria-label="Documenti medi: ${TIPI[t]}">
  <select class="e" id="c-${t}-serv" data-t="${t}" data-k="serv" aria-label="Esigenza: ${TIPI[t]}">${opts(ESIGENZE, S.comp[t].serv)}</select>`).join(''));
$('#comp').addEventListener('input', e => {
  const el = e.target; if (!el.dataset.t) return;
  S.comp[el.dataset.t][el.dataset.k] = el.dataset.k === 'serv' ? el.value : num(el.value);
});

/** Ricrea le righe del preventivo dalla composizione (sostituisce quelle presenti). */
function genera() {
  S.clients = Object.keys(TIPI).filter(t => S.comp[t].n > 0)
    .map(t => nuovaRiga(t, S.comp[t].serv, Math.min(Math.round(S.comp[t].n), MAX_CLIENTI_RIGA), S.comp[t].docs));
  renderClients();
}

/** Intestazioni e testi della tabella nei due modi. */
const TABELLA = {
  cli: {
    titolo: '2. Prezzo per cliente',
    testa: ['Riferimento', 'Tipo di contabilità', 'Esigenza', 'Fatture di vendita*', 'Fatture di acquisto*', 'Corrispettivi*', 'Documenti*', 'Righe stimate*', 'Listino*', 'Importo applicato*', 'Controllo', ''],
    aiuto: 'Documenti = fatture di vendita + fatture di acquisto + corrispettivi dell\'anno. Righe di libro giornale stimate = documenti × 6 per le ordinarie, × 3 per le semplificate, × 1 per le forfettarie. L\'importo si può alzare sopra il listino; campo vuoto = listino.',
    vuoto: 'Nessun cliente. Incolla l\'elenco da Excel qui sopra oppure premi "Aggiungi un cliente".',
  },
  comp: {
    titolo: '2. Prezzo per tipo di cliente',
    testa: ['Quanti*', 'Tipo di cliente', 'Esigenza', 'Documenti/anno*', 'Righe stimate*', 'Listino per cliente*', 'Importo per cliente*', 'Totale*', 'Controllo', ''],
    aiuto: 'Righe di libro giornale stimate = documenti × 6 per le ordinarie, × 3 per le semplificate, × 1 per le forfettarie. Documenti, righe e importi sono per singolo cliente; il totale moltiplica per il numero di clienti. L\'importo si può alzare sopra il listino; campo vuoto = listino.',
    vuoto: 'Nessuna riga. Compila la composizione qui sopra e premi "Crea il preventivo".',
  },
};

/** Ridisegna la tabella (solo quando cambiano le righe: preserva il focus mentre si scrive). */
function renderClients() {
  const cli = S.mode === 'cli', T = TABELLA[S.mode];
  const numero = (c, f, v, w, etichetta) => `<td class="num"><input autocomplete="off" class="w-num"${w ? ` style="width:${w}px"` : ''} id="r${c.id}-${f}" data-f="${f}" type="number" min="0" inputmode="numeric" value="${v}" aria-label="${etichetta}"></td>`;
  $('#st-h2').textContent = T.titolo; $('#st-hint').textContent = T.aiuto;
  // l'asterisco nelle intestazioni marca le colonne numeriche, allineate a destra
  $('#st-head').innerHTML = `<tr>${T.testa.map(t => t.endsWith('*') ? `<th class="num">${t.slice(0, -1)}</th>` : `<th>${t}</th>`).join('')}</tr>`;
  $('#st-body').innerHTML = S.clients.map(c => `<tr data-id="${c.id}">
    ${cli ? `<td><input autocomplete="off" class="w-name" style="min-width:170px" id="r${c.id}-rif" data-f="rif" type="text" value="${esc(c.rif)}" placeholder="Nome o codice del cliente" aria-label="Riferimento del cliente"></td>` : numero(c, 'n', c.n, 70, 'Quanti clienti')}
    <td><select class="w-sel" id="r${c.id}-tipo" data-f="tipo" aria-label="Tipo di contabilità">${opts(TIPI, c.tipo)}</select></td>
    <td><select class="w-sel" id="r${c.id}-serv" data-f="serv" aria-label="Esigenza">${opts(SERVIZI, c.serv)}</select></td>
    ${cli ? numero(c, 'fv', c.fv, 0, 'Fatture di vendita') + numero(c, 'fa', c.fa, 0, 'Fatture di acquisto') + numero(c, 'co', c.co, 0, 'Corrispettivi') + '<td class="num" data-o="docs"></td>'
          : numero(c, 'docs', c.docs, 0, 'Documenti all\'anno per cliente')}
    <td class="num" data-o="righe"></td><td class="num" data-o="listino"></td>
    <td class="num"><input autocomplete="off" class="w-num" style="width:110px" id="r${c.id}-ov" data-f="ov" type="number" min="0" step="0.01" inputmode="decimal" value="${c.ov == null ? '' : c.ov}" aria-label="Importo per cliente"></td>
    ${cli ? '' : '<td class="num" data-o="tot"></td>'}
    <td data-o="esito"></td>
    <td><button class="ico" type="button" data-del title="Togli la riga" aria-label="Togli la riga">✕</button></td></tr>`).join('')
    || `<tr><td colspan="${T.testa.length}" style="padding:18px;color:var(--muted)">${T.vuoto}</td></tr>`;
  updateStudio();
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
    cella('righe', x.righe == null ? '–' : int(x.righe));
    cella('listino', eur(x.listino));
    cella('tot', eur(x.appl * x.q));
    cella('docs', int(x.c.docs));
    campo.placeholder = dec(x.listino); campo.dataset.min = x.listino; campo.classList.toggle('bad', sotto);
    tr.querySelector('[data-o=esito]').innerHTML = sotto ? `<span class="pill bad">Sotto listino ${eur(x.delta)}</span>`
      : x.delta > 0.005 ? `<span class="pill ok">Sopra listino +${eur(x.delta)}</span>` : '<span class="pill info">Listino</span>';
  });

  // fascia Light
  $('#st-fascia-txt').innerHTML = r.nL
    ? `<b>${r.nL} licenze</b> tra Light e Light Plus: fascia <b>${f.label}</b>, <b>${dec(f.prezzo)} €</b> per riga, più ${eur(L.light.fisso)} fissi per ditta.`
    : 'Nessun cliente in Light o Light Plus: le fasce non si applicano.';
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
    <div><span>Totale a listino</span><span>${eur(r.lis)}</span></div>
    <div><span>Totale importi applicati</span><span>${eur(r.app)}</span></div>
    ${r.sc ? `<div><span>Light Plus: sconto ${pct(scPct)}</span><span>− ${eur(r.sc)}</span></div>` : ''}
    ${r.promo ? `<div><span>${promoLab}</span><span>− ${eur(r.promo)}</span></div>` : ''}
    <div><span>Imponibile ${anno}</span><span>${eur(r.primo)}</span></div>
    <div><span>IVA ${L.iva}%</span><span>${eur(r.iva)}</span></div>
    <div class="tot"><span>Totale ${anno}</span><span>${eur(r.tot)}</span></div>
    ${r.promo ? `<div><span>Imponibile dal secondo anno</span><span>${eur(r.regime)}</span></div>` : ''}
    <div><span>Media per cliente (imponibile)</span><span>${eur(r.n ? r.primo / r.n : 0)}</span></div>`;

  // foglio del preventivo: una riga per cliente oppure per tipo di cliente
  const cli = S.mode === 'cli';
  const nome = $('#st-nome').value.trim(), prep = $('#st-prep').value.trim();
  const numero = $('#st-num').value.trim(), valido = $('#st-val').value.trim();
  $('#st-val').classList.toggle('bad', !!valido && !!vDate(valido));
  Q.st = {
    file: 'Preventivo Yuxme' + (nome ? ' - ' + nome : ''), blocked: r.sotto > 0 || !r.n, data: today(), footer: piede(numero, prep, valido),
    meta: metaNumero(numero, valido).concat([['Studio', nome || 'Da indicare'], ['Clienti', `${r.n} (${r.cnt.light} Light, ${r.cnt.plus} Light Plus, ${r.cnt.full} Full Assistance)`]],
      r.nL ? [['Fascia Light', `${f.label}: ${dec(f.prezzo)} € per riga`]] : [], prep ? [['Preparato da', prep]] : []),
    cols: cli
      ? [{ t: '#', r: 1 }, { t: 'Cliente' }, { t: 'Tipo di contabilità' }, { t: 'Servizio' }, { t: 'Documenti/anno', r: 1 }, { t: 'Importo annuo', r: 1 }]
      : [{ t: 'Clienti', r: 1 }, { t: 'Tipo di cliente' }, { t: 'Servizio' }, { t: 'Documenti/anno per cliente', r: 1 }, { t: 'Importo annuo per cliente', r: 1 }, { t: 'Totale annuo', r: 1 }],
    rows: r.rows.filter(x => x.q).map((x, i) => cli
      ? [String(i + 1), x.c.rif || `Cliente ${i + 1}`, TIPI[x.c.tipo], SERVIZI[x.c.serv], int(x.c.docs), eur(x.appl)]
      : [String(x.q), TIPI[x.c.tipo], SERVIZI[x.c.serv], int(x.c.docs), eur(x.appl), eur(x.appl * x.q)]),
    totals: [['Totale', eur(r.app)]].concat(
      r.sc ? [[`Light Plus: sconto ${pct(scPct)}`, '− ' + eur(r.sc)]] : [], r.promo ? [[promoLab, '− ' + eur(r.promo)]] : [],
      [[`Imponibile ${anno}`, eur(r.primo)], [`IVA ${L.iva}%`, eur(r.iva)], [`Totale ${anno}`, eur(r.tot), 1]],
      r.promo ? [['Imponibile dal secondo anno', eur(r.regime)]] : []),
    notes: ['Importi annui.'].concat(
      cli ? ['Documenti = fatture di vendita + fatture di acquisto + corrispettivi dell\'anno.'] : [],
      r.nL ? [`Light e Light Plus: ${eur(L.light.fisso)} l'anno per ditta più una quota per riga di libro giornale. Le righe sono stimate: documenti × ${L.light.mOrd} per le ordinarie, × ${L.light.mSem} per le semplificate. Il conteggio definitivo avviene sulle righe effettive.`] : [],
      r.cnt.full ? [`Full Assistance: fino a ${int(L.full.inclusi)} documenti l'anno per cliente; oltre, ${eur(L.full.ecc)} a documento, a consuntivo.`] : [],
      r.promo ? ['I mesi agevolati del Light Plus valgono sul primo anno.'] : [], r.sc ? ['Lo sconto si applica ai soli clienti in Light Plus.'] : []),
  };
  renderSheet('st-sheet', Q.st);
  aggiornaRigheIncolla();
  contractStudio(r, scPct, promoLab);
  syncOutput('st');
}

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
  a.fDoc = int(L.full.inclusi); a.fEcc = dec(L.full.ecc);
  a.cond = [
    r.nL && f.idx ? `prezzo per riga ridotto a ${dec(f.prezzo)} € per la fascia ${f.label}` : '',
    r.sc ? `Light Plus: sconto del ${pct(scPct)} sui corrispettivi` : '',
    r.promo ? promoLab + ', sul primo anno' : '',
  ].filter(Boolean).join('; ');
  C.st.min = { lFisso: L.light.fisso, lMese: L.light.fisso / 12, lRiga: f.prezzo, fOp: L.full.op, fOpM: L.full.op / 12, fHold: L.full.hold, fHoldM: 133.33, fEcc: L.full.ecc };

  // tabelle dei moduli d'ordine: una riga per cliente, con i dati da completare
  const gruppi = { light: x => x.c.serv !== 'full', fullnh: x => x.c.serv === 'full' && x.c.tipo !== 'hold', fullh: x => x.c.serv === 'full' && x.c.tipo === 'hold' };
  const presenti = {};
  for (const k in gruppi) {
    const rows = [];
    attive.filter(gruppi[k]).forEach(x => {
      for (let i = 0; i < x.q; i++) {
        const u = x.c.units[i] || (x.c.units[i] = {});
        rows.push({ id: `${x.c.id}_${i}`, cells: [u.nome || '', u.rl || '', u.pi || '', TIPI[x.c.tipo] + (x.c.serv === 'plus' ? ' (Light Plus)' : ''), u.per || '', int(x.c.docs), eur(x.appl)] });
      }
    });
    presenti[k] = rows.length > 0;
    C.st.tabs[k] = { cols: TABCOLS.concat(k === 'light' ? ['Documenti/anno*', 'Stima annua'] : ['Documenti/anno', 'Compenso annuale']), rows };
  }
  const bozza = attive.some(x => x.c.serv === 'full' && (x.c.tipo === 'sem' || x.c.tipo === 'forf'));
  C.st.dsl = dslStudio(presenti, !!(a.cond || C.st.user.cond), bozza);
  C.st.file = 'Contratto Yuxme' + (nome ? ' - ' + nome : '');
  renderContract('st');
}

/* ---- eventi della tabella ---- */

$('#st-body').addEventListener('input', e => {
  const el = e.target, tr = el.closest('tr'); if (!tr || !el.dataset.f) return;
  const c = S.clients.find(x => x.id == tr.dataset.id), k = el.dataset.f;
  c[k] = ['docs', 'fv', 'fa', 'co'].includes(k) ? Math.max(0, num(el.value))
    : k === 'n' ? Math.min(MAX_CLIENTI_RIGA, Math.max(0, Math.round(num(el.value))))
    : k === 'ov' ? (el.value === '' ? null : num(el.value)) : el.value;
  if (c.rif != null) {            // riga di un singolo cliente
    c.docs = c.fv + c.fa + c.co;
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
['st-sc', 'st-pm', 'st-pp', 'st-nome', 'st-prep', 'st-mail', 'st-num', 'st-val'].forEach(id => $('#' + id).addEventListener('input', updateStudio));

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

// carica l'elenco incollato: riferimento, tipo, fatture di vendita, fatture di acquisto, corrispettivi
$('#st-cli-go').addEventListener('click', () => {
  const msg = $('#st-cli-msg'), serv = $('#st-cli-serv').value;
  let righe = $('#st-cli-paste').value.split(/\r?\n/).map(l => l.split(/\t|;/).map(v => v.trim())).filter(v => v.some(Boolean));
  // riga d'intestazione: nessun numero nelle colonne delle fatture
  if (righe.length && !/\d/.test((righe[0][2] || '') + (righe[0][3] || '')) && /[a-z]/i.test(righe[0].join(''))) righe = righe.slice(1);
  if (!righe.length) { msg.textContent = 'Incolla almeno una riga con i dati di un cliente.'; return; }
  const spazio = MAX_CLIENTI_RIGA - S.clients.length; let ignoti = 0;
  righe.slice(0, spazio).forEach(v => {
    const tipo = tipoDaTesto(v[1]); if (!tipo) ignoti++;
    S.clients.push(nuovoCliente(v[0] || '', tipo || 'op', serv, interoDa(v[2]), interoDa(v[3]), corrispettiviDa(v[4])));
  });
  msg.textContent = `Caricati ${Math.min(righe.length, spazio)} clienti.`
    + (ignoti ? ` Per ${ignoti} non ho riconosciuto il tipo di contabilità: li ho messi come ordinaria operativa, controllali.` : '')
    + (righe.length > spazio ? ` ${righe.length - spazio} non caricati: il limite è ${MAX_CLIENTI_RIGA} clienti.` : '');
  $('#st-cli-paste').value = '';
  renderClients();
});
$('#st-cli-add').addEventListener('click', () => {
  if (S.clients.length >= MAX_CLIENTI_RIGA) return;
  S.clients.push(nuovoCliente('', 'op', $('#st-cli-serv').value, 0, 0, 0)); renderClients();
  const campo = $(`#r${S.clients[S.clients.length - 1].id}-rif`); if (campo) campo.focus();
});
$('#st-cli-clear').addEventListener('click', () => { S.clients = []; $('#st-cli-msg').textContent = ''; renderClients(); });
