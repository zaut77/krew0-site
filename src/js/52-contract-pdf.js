/* ==========================================================================
 * 52 · PDF DEL CONTRATTO
 * Riproduce l'impaginazione dei contratti originali (misure rilevate dai file
 * in Drive, in millimetri): A4, margini di 6 mm, logo in alto a sinistra sulla
 * prima pagina, titolo centrato, corpo su due colonne giustificate, pagina
 * privacy con banda azzurra, mandato SEPA a tabelle. Nessun piè di pagina,
 * come negli originali.
 *
 * Font: Carlito (metricamente uguale a Calibri) dove l'originale usa Calibri;
 * Times e Courier standard del PDF per Times New Roman e Courier New; Helvetica
 * per Arial e Trebuchet. Limite noto: la suddivisione in pagine del contratto studi è
 * approssimata perché l'originale Word non ha interruzioni di pagina.
 *
 * Struttura:
 *   para()  scrive un paragrafo andando a capo, cambiando colonna e pagina;
 *           disegna le caselle da spuntare al posto dei segnaposto BOX/BOXON
 *   sepa()  disegna il mandato SEPA con coordinate fisse
 *   ciclo finale: un blocco del testo alla volta, con lo stile del contesto
 * ========================================================================== */
function makeContractPdf(c){
  const {jsPDF}=window.jspdf, doc=new jsPDF({unit:'mm',format:'a4'});
  const ST=c==='st', CAL='carlito', BODY=ST?'times':CAL, L=6.1, R=204.2, CW=93.8, C2=111.9, BOT=289, BLK=[0,0,0], BLUE=[28,95,146];
  let mode='single', style='main', col=0, y=40.5, colTop=10, skip=false, privTitle=0;
  // font Carlito al posto di Calibri; logo dei contratti originali
  for(const [stile,nome] of [['Regular','normal'],['Bold','bold'],['Italic','italic']]){doc.addFileToVFS(`Carlito-${stile}.ttf`,PDF_FONTS[stile]);doc.addFont(`Carlito-${stile}.ttf`,CAL,nome)}
  doc.addImage(BRAND.logoContratto,'PNG',6.6,17.8,50.3,13.8);
  const X=()=>style==='privacy'?19.9:mode==='cols'&&col?C2:L;
  const Wd=()=>style==='privacy'?170.8:mode==='cols'?CW:R-L;
  const next=()=>{if(mode==='cols'&&col===0){col=1;y=colTop}else{doc.addPage();col=0;y=colTop=12}};
  const room=h=>{if(y+h>BOT)next()};
  const BOX='\u0001', BOXON='\u0002', ww=w=>w===BOX||w===BOXON?3.2:doc.getTextWidth(w);
  const fill=x=>pdfTxt(x.replace(FLD,(_,q,k)=>q?' '+(cval(c,k)?BOXON:BOX)+' ':(cval(c,k)||'______________')));
  function para(txt,o){
    const set=()=>{doc.setFont(o.font||BODY,o.style||'normal');doc.setFontSize(o.size);doc.setTextColor(...(o.col||BLK))}; set();
    const ind=o.ind||0, sp=doc.getTextWidth(' '), max=Wd()-ind, lines=[]; let cur=[], cw=0;
    for(const w of txt.split(/\s+/).filter(Boolean)){const wl=ww(w); if(cur.length&&cw+sp+wl>max){lines.push(cur);cur=[w];cw=wl}else{cw+=(cur.length?sp:0)+wl;cur.push(w)}}
    if(cur.length)lines.push(cur);
    if(o.before)y+=o.before; if(o.keep)room(o.pitch*3);
    lines.forEach((ws,i)=>{room(o.pitch); set(); const x0=X()+ind, W=Wd()-ind, tw=ws.reduce((a,w)=>a+ww(w),0); let gap=sp, x=x0;
      if(o.align==='center')x=x0+(W-tw-sp*(ws.length-1))/2;
      else if(o.align==='justify'&&i<lines.length-1&&ws.length>1)gap=Math.min((W-tw)/(ws.length-1),sp*4);
      if(o.bullet&&!i)doc.text(o.bullet,X()+(o.bx||0),y);
      for(const w of ws){if(w===BOX||w===BOXON){doc.setDrawColor(0);doc.setLineWidth(.25);doc.rect(x+.3,y-2.4,2.5,2.5); if(w===BOXON){doc.line(x+.3,y-2.4,x+2.8,y+.1);doc.line(x+2.8,y-2.4,x+.3,y+.1)}}else doc.text(w,x,y); x+=ww(w)+gap}
      y+=o.pitch});
    y+=o.gap||0;
  }
  function sepa(){
    const F='helvetica', t=(s,x,yy,o={})=>{doc.setFont(o.f||F,o.s||'normal');doc.setFontSize(o.z||10);doc.setTextColor(...BLK);doc.text(pdfTxt(s),x,yy,o.a?{align:o.a}:{})};
    const box=(x,yy,w,h,v)=>{doc.setDrawColor(150);doc.setLineWidth(.2);doc.rect(x,yy,w,h); if(v){doc.setFont(F,'normal');doc.setFontSize(9.5);doc.setTextColor(...BLK);doc.text(doc.splitTextToSize(pdfTxt(v),w-3).slice(0,2),x+1.5,yy+(h>6?3.9:3.5))}};
    doc.setDrawColor(91,154,212);doc.setLineWidth(.35);doc.rect(11.1,22.2,187.3,91);doc.line(92.6,22.2,92.6,113.2);doc.line(11.1,35.1,198.4,35.1);doc.line(92.6,73.2,198.4,73.2);doc.line(92.6,78.5,198.4,78.5);
    t('AZIENDA CREDITRICE',51.8,30,{s:'italic',z:11,a:'center'});t('BANCA DEL DEBITORE',145.5,30,{s:'italic',z:11,a:'center'});
    doc.addImage(BRAND.sepaSimbolo,'PNG',43.6,43.2,32,23.5);doc.addImage(BRAND.sepaFreccia,'PNG',119.5,243.1,14.3,10.8);
    t('YUXME S.R.L.',51.8,93.1,{f:'times',z:16,a:'center'});t('P.IVA IT10819810960',51.8,99.5,{a:'center'});t('Via San Gregorio n. 55 - 20124 Milano (MI)',51.8,104.5,{a:'center'});
    t('BANCA',95.5,41.3,{z:11});box(95.5,43.5,100,6,cval(c,'sBanca'));t('AGENZIA',95.5,58.5,{z:11});box(95.5,60.7,100,6,cval(c,'sAgenzia'));
    t('COORDINATE BANCARIE DEL CONTO DA ADDEBITARE',145.5,77,{s:'italic',a:'center'});t('IBAN:',95.5,86.7,{s:'italic'});box(95.5,89.5,100,6.5,cval(c,'sIban'));
    t('MANDATO PER ADDEBITO DIRETTO SEPA',105,118.7,{z:15,a:'center'});t('DATI RELATIVI AL DEBITORE',105,128.2,{z:15,a:'center'});
    doc.setDrawColor(0);doc.setLineWidth(.35);doc.rect(11.1,132.5,187.3,69.5);doc.line(11.1,137.6,198.4,137.6);doc.line(105,132.5,105,202);
    t('SOTTOSCRITTORE DEL MODULO',58,136.3,{s:'italic',z:11,a:'center'});t('INTESTAZIONE DEL CONTO',151.7,136.3,{s:'italic',z:11,a:'center'});
    t('Cognome e Nome:',13.4,144.8);box(13.4,146.8,88,8.7,cval(c,'sNome'));t('Indirizzo:',13.4,163);box(13.4,165,88,8.7,cval(c,'sInd'));t('Codice Fiscale:',13.4,181.5);box(13.4,183.5,88,6,cval(c,'sCf'));
    t('Ragione Sociale o Nome e Cognome (Ditta individuale)',107.1,144.8);box(107.1,146.8,88,8.7,cval(c,'soc'));t('Codice Fiscale o Partita IVA:',107.1,163);box(107.1,165,88,8.7,cval(c,'sPiva'));
    doc.setDrawColor(0);doc.setLineWidth(.35);doc.rect(11.1,209.7,187.7,75.5);doc.line(18.9,209.7,18.9,285.2);doc.line(11.1,258.8,198.8,258.8);
    [...'ADESIONE'].forEach((ch,i)=>t(ch,15,219+i*4.1,{a:'center'}));[...'REVOCA'].forEach((ch,i)=>t(ch,15,262.5+i*3.6,{a:'center'}));
    const small=(s,yy)=>{doc.setFont(F,'normal');doc.setFontSize(7);doc.setTextColor(...BLK);const ls=doc.splitTextToSize(pdfTxt(s),175);doc.text(ls,21.1,yy);return yy+ls.length*2.9};
    let yy=small(`La sottoscrizione del presente mandato comporta (A) l’autorizzazione a Yuxme S.r.l. a richiedere alla banca del debitore l’addebito del suo conto e (B) l’autorizzazione alla banca del debitore di procedere a tale addebito conformemente alle disposizioni impartite da Yuxme S.r.l.`,213.5);
    yy=small('Le parti hanno facoltà di recedere in ogni momento dal presente accordo, con un preavviso pari a quello previsto nel contratto di conto corrente per il recesso da quest’ultimo rapporto, da darsi mediante comunicazione scritta. Il sottoscrittore prende atto che sono applicate le condizioni già indicate nel contratto di conto corrente, in precedenza sottoscritto fra le parti, o comunque rese pubbliche presso gli sportelli della banca e tempo per tempo vigenti. Per quanto non espressamente previsto dalle presenti disposizioni, sono applicabili le “Norme che regolano i conti correnti di corrispondenza e servizi connessi” a suo tempo sottoscritte dalle parti, che formano parte integrante del presente contratto.',yy+1.2);
    small('L’addebito in conto corrente può richiedere un massimo di 5 giorni lavorativi per essere processato.',yy+1.2);
    const ld=[cval(c,'luogo'),cval(c,'data')].filter(Boolean).join(', ');
    t('Luogo e data '+(ld||'...................................'),21.1,255.5);t('Firma del sottoscrittore.........................................',98.4,255.5);
    small('Il sottoscrittore revoca l’autorizzazione permanente di addebito in c/c in oggetto, aperto presso di Voi, degli ordini di incasso elettronici inviati dall’Azienda e contrassegnati con le coordinate dell’Azienda creditrice surriportate o aggiornate d’iniziativa dall’Azienda.',262.5);
    t('Luogo e data ...................................',21.1,282.5);t('Firma del sottoscrittore.........................................',98.4,282.5);
    doc.setFont(F,'normal');doc.setFontSize(7);doc.text(doc.splitTextToSize('AVVERTENZE Il sottoscrittore del modulo deve essere sempre persona fisica. Nel caso di c/c intestato a persona giuridica coincide con il soggetto delegato ad operare sul conto. Nel caso di c/c intestato a persona fisica coincide con il titolare medesimo ovvero con il soggetto delegato ad operare sullo stesso.',188),10,288.5);
  }
  const PT=ST?4.1:4.3;
  for(const b of parseDsl(C[c].dsl)){
    if(skip){if(b.t==='sepaend')skip=false;continue}
    const x=b.x?fill(b.x):'', fld=b.x&&/\[\[|___|\.\.\.\./.test(b.x);
    if(b.t==='br'){doc.addPage();mode='single';col=0;y=colTop=16}
    else if(b.t==='cols'){mode='cols';col=0;colTop=y}
    else if(b.t==='single'){mode='single';col=0}
    else if(b.t==='style'){style=b.x; if(style==='privacy'){y=8.1;privTitle=0}}
    else if(b.t==='sepastart'){sepa();skip=true}
    else if(b.t==='tab'){const t=C[c].tabs[b.x];
      doc.autoTable({startY:y,margin:{left:L,right:210-R,bottom:12,top:14},head:[t.cols],body:t.rows.map(r=>r.cells.map(pdfTxt)),
        styles:{font:'helvetica',fontSize:9,cellPadding:1.8,textColor:BLK,lineColor:[120,120,120],lineWidth:.15},
        headStyles:{fillColor:[235,235,235],textColor:BLK,fontStyle:'bold',fontSize:9},theme:'grid',columnStyles:{5:{halign:'right'},6:{halign:'right'}}});
      y=doc.lastAutoTable.finalY+7}
    else if(style==='privacy'){
      if(b.t==='h1'&&!privTitle++){doc.setFillColor(18,129,171);doc.rect(19.4,2.8,171.2,6.7,'F');doc.setFont(CAL,'normal');doc.setFontSize(15.5);doc.setTextColor(255,255,255);doc.text(x,105,8.1,{align:'center'});y=14.2}
      else if(b.t==='h1'){doc.setDrawColor(0);doc.setLineWidth(.2);doc.line(19.3,y+1,190.2,y+1);para(x,{font:CAL,style:'bold',size:8,col:BLUE,align:'center',pitch:3.8,before:6})}
      else if(b.t==='c')para(x,{font:CAL,style:'bold',size:8,align:'center',pitch:3.8,gap:2.5})
      else if(b.t==='h2')para(x,{font:CAL,style:'bold',size:8,col:BLUE,pitch:3.6,before:2,gap:.4,keep:1})
      else para(x,{font:CAL,size:8,align:fld?'left':'justify',pitch:3.6,gap:fld?3:.9})}
    else if(style==='modulo'){
      if(b.t==='h1')para(x,{font:'helvetica',style:'bold',size:ST&&x.length>26?21:25,pitch:10.5,gap:3})
      else if(b.t==='h2')para(x,{font:'helvetica',size:12,pitch:5.3,before:2,gap:2.5,keep:1})
      else para(x,{font:'helvetica',size:b.x.startsWith('*')?10:12,style:/^(PRICING|BOZZA)/.test(b.x)?'bold':'normal',align:fld?'left':'justify',pitch:5.3,gap:2.2})}
    else if(b.t==='h1')para(x,{font:ST?CAL:'courier',size:11,align:'center',pitch:4.6,gap:8})
    else if(b.t==='c')para(x,mode==='cols'?{size:10,style:ST?'bold':'normal',align:'center',pitch:PT,gap:3}:{font:'courier',size:11,align:'center',pitch:5,before:3,gap:4.5})
    else if(b.t==='h2')para(x,{style:'bold',size:10,pitch:PT,before:3.4,gap:.4,keep:1})
    else if(b.t==='li')para(x,{size:10,align:'justify',pitch:PT,ind:4.5,bullet:ST?'-':'•',bx:.6,gap:.5})
    else if(b.t==='dash')para(x,{size:10,pitch:4.8,ind:3,bullet:'-',bx:.4})
    else if(mode==='single')para(x,fld?{font:CAL,size:ST?12:11.5,align:ST?'justify':'left',pitch:ST?5.85:5.3,gap:3}:{font:CAL,size:11,align:'justify',pitch:4.75,gap:3})
    else if(/^Ai sensi degli articoli 1341/.test(b.x))para(x,{font:'helvetica',style:'italic',size:ST?8:10,align:'justify',pitch:ST?3.3:4.05,before:5,gap:4})
    else if(/^\[\[\?/.test(b.x))para(x,{size:9.5,pitch:4.3,gap:.9}) // riga con casella: prestazioni extra, pagamento SEPA
    else para(x,{size:10,align:fld?'left':'justify',pitch:fld?PT+1.2:PT,gap:fld?2.2:1.3})}
  return doc;
}
