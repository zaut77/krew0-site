/* ==========================================================================
 * 90 · NAVIGAZIONE E AVVIO
 * Le viste sono sezioni della stessa pagina, scelte dall'ancora nell'indirizzo
 * (#pmi, #commercialisti, …). Nell'ancora non finisce mai alcun dato.
 * ========================================================================== */

$('#brandmark').innerHTML = `<img src="${BRAND.logo}" alt="Yuxme">`;

/* ---- listino in sola lettura ---- */
(function renderListino() {
  const L = LISTINO, REGOLA = ['Regola', 'Prezzi minimi: si può salire, mai scendere'];
  const tabella = (id, righe) => { $('#' + id).innerHTML = righe.map(r => `<span>${esc(r[0])}</span><span>${esc(r[1])}</span>`).join(''); };
  tabella('l-pmi', [
    [`Ordinaria fino a ${int(L.pmi.ord1Max)} documenti`, eur(L.pmi.ord1)], [`Ordinaria fino a ${int(L.pmi.ord2Max)} documenti`, eur(L.pmi.ord2)],
    [`Semplificata fino a ${int(L.pmi.semMax)} documenti`, eur(L.pmi.sem)], ['Documento oltre soglia, a consuntivo', eur(L.pmi.ecc)],
    ['Corrispettivi', `${L.pmi.corr} documenti l'anno`], REGOLA]);
  tabella('l-full', [
    ['Ordinaria operativa', eur(L.full.op)], ['Ordinaria holding', eur(L.full.hold)],
    ['Semplificata (bozza, in revisione)', eur(L.full.sem)], ['Forfettaria (bozza, in revisione)', eur(L.full.forf)],
    ['Documenti inclusi per cliente', int(L.full.inclusi)], ['Documento oltre soglia, a consuntivo', eur(L.full.ecc)], REGOLA]);
  tabella('l-light', [
    ['Canone fisso per ditta', eur(L.light.fisso)], ['Prezzo base per riga', eur(L.light.riga)],
    ['Righe per documento, ordinarie', '× ' + L.light.mOrd], ['Righe per documento, semplificate', '× ' + L.light.mSem],
    ['Righe per documento, forfettarie', '× ' + L.light.mForf],
    ['Light Plus', 'Come il Light, con sconto % e 1–3 mesi al 50% o gratuiti'], REGOLA]);
  let da = 1;
  tabella('l-fasce', L.light.fasce.map(([fino, sconto]) => {
    const lab = fino == null ? `Oltre ${da - 1} licenze` : `Da ${da} a ${fino} licenze`; if (fino != null) da = fino + 1;
    return [lab, `${dec(L.light.riga * (1 - sconto / 100))} € per riga (−${sconto}%)`];
  }));
})();

/* ---- viste ---- */
const VIEWS = ['home', 'pmi', 'commercialisti', 'guida', 'listino'];
function route() {
  const v = VIEWS.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'home';
  VIEWS.forEach(x => { $('#v-' + x).hidden = x !== v; });
  document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('on', a.dataset.v === v));
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);

/* ---- avvio ---- */
renderPmi();
genera();
route();
riarmaInattivita();
