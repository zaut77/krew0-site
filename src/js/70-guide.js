/* ==========================================================================
 * 70 · GUIDA ANIMATA
 * Sei scene che mostrano il percorso PMI. Solo dimostrativa: non legge né
 * scrive dati reali. Rispetta "riduci animazioni" del sistema.
 * ========================================================================== */
const SCENES=[
 ['Scegli il canale','<div class="mk-row"><div class="mk-card hot">PMI</div><div class="mk-card">Commercialisti</div></div>'],
 ['Inserisci regime e fatture','<span class="mk-pill">Ordinaria</span><div class="mk-row"><label class="mk-f">Fatture attive all\'anno<i class="hot" data-type="320"></i></label><label class="mk-f">Fatture passive all\'anno<i class="hot" data-type="410" data-delay="900"></i></label></div>'],
 ['Leggi il conto','<span class="mk-pill">Ordinaria fino a 1.500 documenti</span><div class="mk-tot"><span>Totale annuo, IVA inclusa</span><b data-count="4026"></b></div>'],
 ['Alza il prezzo, se serve','<div class="mk-row"><label class="mk-f">Minimo di listino<i>3.300,00</i></label><label class="mk-f">Prezzo proposto, dal minimo in su<i class="hot" data-type="3.500,00"></i></label></div>'],
 ['Scarica il preventivo','<div class="mk-btn">Scarica il PDF</div><div class="mk-pdf">Preventivo Yuxme PMI - Rossi Srl.pdf</div>'],
 ['Completa il contratto e scaricalo','<div class="mk-row"><label class="mk-f">Canone mensile, già compilato<i>275,00</i></label><label class="mk-f">Il sottoscritto Sig.<i class="hot" data-type="Mario Rossi"></i></label></div><div class="mk-btn">Scarica il contratto in PDF</div>']];
let demoI=0, demoT=null, demoOn=!matchMedia('(prefers-reduced-motion: reduce)').matches;
$('#demo-dots').innerHTML=SCENES.map((x,i)=>`<button type="button" data-i="${i}" aria-label="Passaggio ${i+1}: ${x[0]}"></button>`).join('');
function demoShow(i){demoI=(i+SCENES.length)%SCENES.length; const st=$('#demo-stage');
  $('#demo-n').textContent=`Passaggio ${demoI+1} di ${SCENES.length}`; $('#demo-t').textContent=SCENES[demoI][0]; st.innerHTML=SCENES[demoI][1];
  $('#demo-dots').querySelectorAll('button').forEach((b,j)=>b.classList.toggle('on',j===demoI));
  st.querySelectorAll('[data-type]').forEach(el=>{const t=el.dataset.type; if(!demoOn){el.textContent=t;return}
    let n=0; setTimeout(function tick(){if(!el.isConnected)return; el.textContent=t.slice(0,++n); if(n<t.length)setTimeout(tick,90)},+(el.dataset.delay||300))});
  st.querySelectorAll('[data-count]').forEach(el=>{const to=+el.dataset.count; if(!demoOn){el.textContent=eur(to);return}
    const t0=performance.now(); (function f(now){if(!el.isConnected)return; const k=Math.min(1,(now-t0)/1100); el.textContent=eur(to*(1-Math.pow(1-k,3))); if(k<1)requestAnimationFrame(f)})(t0)});
  clearTimeout(demoT); if(demoOn)demoT=setTimeout(()=>demoShow(demoI+1),3600)}
$('#demo-dots').addEventListener('click',e=>{const b=e.target.closest('button'); if(b)demoShow(+b.dataset.i)});
$('#demo-pp').textContent=demoOn?'Pausa':'Riproduci';
$('#demo-pp').addEventListener('click',()=>{demoOn=!demoOn; $('#demo-pp').textContent=demoOn?'Pausa':'Riproduci'; demoShow(demoI)});
demoShow(0);

