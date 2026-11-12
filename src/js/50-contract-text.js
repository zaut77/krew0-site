/* ==========================================================================
 * 50 · TESTI DEI CONTRATTI
 * Testo dei contratti Yuxme (PMI del 26/03/2026 e "Light + Full" per gli studi),
 * dell'informativa privacy e del mandato SEPA.
 *
 * Mini-linguaggio, una riga = un blocco (vedi parseDsl in 51-contract.js):
 *   "# "  titolo            "## " titoletto        "= "  riga centrata
 *   "- "  voce d'elenco     "~ "  voce con trattino
 *   [[chiave|suggerimento]]  campo compilabile     [[?chiave]]  casella da spuntare
 *   @br nuova pagina · @cols / @single due colonne / una colonna (solo PDF)
 *   @style:nome stile di impaginazione · @tab:nome tabella clienti
 *   @sepastart … @sepaend  nel PDF il mandato SEPA è disegnato a tabelle
 *
 * ATTENZIONE: è testo contrattuale. Si modifica solo su indicazione di chi
 * gestisce i contratti; i refusi dell'originale sono stati lasciati apposta.
 * ========================================================================== */
const PRIVACY=`@br
@style:privacy
# INFORMATIVA TRATTAMENTO DATI PERSONALI
= ART. 13 REGOLAMENTO UE 2016/679 (GDPR)
Ai sensi dell’articolo 13 del Regolamento UE 679/2016 in materia di protezione dei dati personali (GDPR) La informiamo che i dati personali da Lei forniti potranno essere oggetto di trattamento nel rispetto di quanto segue.
## TITOLARE DEL TRATTAMENTO
Yuxme srl con sede legale In: Milano, via San Gregorio n. 55 CAP: 20124 partita IVA 10819810960 PEC yuxme@legal.email.it
## FINALITÀ DEL TRATTAMENTO E BASE GIURIDICA
1. I dati personali da Lei forniti verranno trattati per le attività connesse all’espletamento della prestazione richiesta e per la successiva gestione del rapporto da questa derivante; per gli obblighi di natura contabile fiscale e per obblighi derivanti da Leggi, Norme e Regolamenti Comunitari e Nazionali; per attività informativa connessa al rapporto (art. 6 comma 1 lettera B GDPR).
2. Previa acquisizione del Suo espresso consenso (art. 6 comma 1 lettere A GDPR), i Suoi dati personali potranno essere utilizzati allo scopo di inviarle materiale informativo e commerciale, illustrativo dei servizi di Yuxme , per ricerche di mercato e per la comunicazione dei Suoi dati personali alle altre società del nostro gruppo per fini di marketing.
3. I Suoi dati personali, inoltre, potrebbero essere utilizzati, esclusivamente previo suo libero, facoltativo, apposito ed esplicito consenso (art. 6 comma 1 lettere A GDPR), anche per individuare e definire le abitudini commerciali (cosiddetta “profilazione”). L’elaborazione dei suoi dati personali, compresi dati relativi alla sua situazione finanziaria e di utile delle aziende, abitudini di acquisto ed interessi specifici di imprenditori e professionisti, saranno elaborati con modalità interamente o parzialmente automatizzate al fine di individuare ed offrire servizi o attività più appropriate alla Sua Persona;
## COMUNICAZIONE DATI A SOGGETTI DIVERSI DAL TITOLARE
Nei limiti pertinenti alle finalità di trattamento indicate, i dati personali potranno essere comunicati agli Incaricati al trattamento e ai Responsabili del trattamento.
I dati identificativi (nome e cognome), il telefono e l’indirizzo mail potranno essere comunicati alle altre società del gruppo, che potranno utilizzarli per fini commerciali. Gli eventuali Responsabili del trattamento designati saranno vincolati alla riservatezza e sicurezza dei dati, attraverso un contratto e l’elenco aggiornato dei Responsabili al Trattamento potrà sempre essere richiesto al Titolare del Trattamento.
## TRASFERIMENTO DATI A PAESI TERZI
Yuxme, di norma tratta i Suoi dati personali all’interno del territorio dell’Unione Europea. Tuttavia, i Suoi dati personali potrebbero essere trasferiti anche in paesi non appartenenti allo Spazio Economico Europeo ( c.d. Paesi Terzi) o ad un'organizzazione internazionale. Resta in ogni caso inteso che il Titolare, ove si rendesse necessario, avrà facoltà di spostare i server anche extra-UE, in tal caso, il Titolare assicura sin d’ora che il trasferimento dei dati extra-UE avverrà in conformità alle disposizioni di legge applicabili, previa stipula delle clausole contrattuali standard previste dalla Commissione Europea.
## TEMPI DI CONSERVAZIONE DEI DATI
1. I dati forniti verranno conservati per il tempo necessario allo svolgimento del contratto sottoscritto, compresa la regolarizzazione della Sua posizione contrattuale, e per le formalità o obblighi di legge allo stesso connesse (10 anni ai fini civilistici e 6 anni ai fini fiscali).
2. I dati personali acquisiti ai fini dell’invio di materiale informativo e commerciale e per ricerche di mercato verranno conservati fino a sua richiesta di non voler più usufruire del servizio e comunque per un periodo non superiore ai 24 mesi dall’acquisizione del Suo consenso.
3. I dati personali trattati ai fini di profilazione saranno conservati per 12 mesi dalla registrazione dei dati, ovvero sino alla revoca del suo consenso.
## NATURA DELLA COMUNICAZIONE DEI SUOI DATI PERSONALI
Per l’esecuzione delle finalità di cui al punto 1., la comunicazione dei suoi dati personali costituisce un requisito necessario per la conclusione di un contratto, diversamente il Titolare sarà impossibilitato alla stipula.
## DIRITTI DELL’INTERESSATO
Per far valere i Suoi diritti, così come previsti dall'articolo 15 del GDPR e seguenti, si potrà rivolgere al Titolare del trattamento contattabile tramite i recapiti sopra indicati, identificandosi e specificando la natura della richiesta o del problema evidenziato. Potrà esercitare sui propri dati i diritti di accesso, rettifica, cancellazione, limitazione, opposizione al trattamento e portabilità dei dati. L’interessato ha la facoltà di procedere, in ogni momento, alla revoca dei consensi al trattamento dei propri dati personali, contattando il Titolare ai dati di contatto sopra indicati. Ai sensi dell’art. 7 del Regolamento UE, la revoca del consenso non comporta pregiudizio sulla liceità del trattamento basata sul consenso effettuato prima dell’avvenuta revoca.
Lei ha, altresì, il diritto di proporre reclamo all’autorità di controllo competente, identificata nel Garante della Privacy, con sede in Piazza Venezia 11 - 00186 Roma – Tel. 06.696771 - Mail: protocollo@gpdp.it
# CONSENSO AL TRATTAMENTO DATI PERSONALI
= ART. 7 REGOLAMENTO UE 2016/679
Io sottoscritto [[prNome|nome e cognome]] nato a [[prNato|luogo]] il [[prIl|data]] letta e compresa l’informativa ai sensi dell’articolo 13 del Regolamento Europeo 2016/679:
[[?prMk]] acconsento al trattamento dei miei dati personali per finalità di marketing (anche telefonico) e di invio di comunicazioni commerciali di Yuxme .
[[?prPf]] acconsento al trattamento dei miei dati personali per profilazione, compresi dati relativi alla sua situazione finanziaria e di utile delle aziende, abitudini di acquisto ed interessi specifici di imprenditori e professionisti, saranno elaborati con modalità interamente o parzialmente automatizzate al fine di individuare ed offrire servizi o attività più appropriate alla Sua persona;
[[?prRm]] acconsento al trattamento dei miei dati personali per finalità ricerche di mercato da parte di Yuxme .
Data [[data|data]] Firma ______________________________`;
const SEPA=who=>`@br
@style:main
@sepastart
# MANDATO PER ADDEBITO DIRETTO SEPA
## AZIENDA CREDITRICE
YUXME S.R.L. P.IVA IT10819810960 Via San Gregorio n. 55 - 20124 Milano (MI)
## BANCA DEL DEBITORE
BANCA [[sBanca|banca]] AGENZIA [[sAgenzia|agenzia]]
COORDINATE BANCARIE DEL CONTO DA ADDEBITARE IBAN: [[sIban|IBAN]]
## DATI RELATIVI AL DEBITORE
SOTTOSCRITTORE DEL MODULO Cognome e Nome: [[sNome|cognome e nome]] Indirizzo: [[sInd|indirizzo]] Codice Fiscale: [[sCf|codice fiscale]]
INTESTAZIONE DEL CONTO Ragione Sociale o Nome e Cognome (Ditta individuale) [[soc|ragione sociale]] Codice Fiscale o Partita IVA: [[sPiva|codice fiscale o partita IVA]]
## A D E S I O N E
La sottoscrizione del presente mandato comporta (A) l’autorizzazione a Yuxme S.r.l. a richiedere alla banca del debitore l’addebito del suo conto e (B) l’autorizzazione alla banca del debitore di procedere a tale addebito conformemente alle disposizioni impartite da ${who}.
Le parti hanno facoltà di recedere in ogni momento dal presente accordo, con un preavviso pari a quello previsto nel contratto di conto corrente per il recesso da quest’ultimo rapporto, da darsi mediante comunicazione scritta. Il sottoscrittore prende atto che sono applicate le condizioni già indicate nel contratto di conto corrente, in precedenza sottoscritto fra le parti, o comunque rese pubbliche presso gli sportelli della banca e tempo per tempo vigenti. Per quanto non espressamente previsto dalle presenti disposizioni, sono applicabili le “Norme che regolano i conti correnti di corrispondenza e servizi connessi” a suo tempo sottoscritte dalle parti, che formano parte integrante del presente contratto.
L’addebito in conto corrente può richiedere un massimo di 5 giorni lavorativi per essere processato.
Luogo e data [[luogo|luogo]], [[data|data]] Firma del sottoscrittore ______________________________
## R E V O C A
Il sottoscrittore revoca l’autorizzazione permanente di addebito in c/c in oggetto, aperto presso di Voi, degli ordini di incasso elettronici inviati dall’Azienda e contrassegnati con le coordinate dell’Azienda creditrice surriportate o aggiornate d’iniziativa dall’Azienda.
Luogo e data ................................... Firma del sottoscrittore .........................................
AVVERTENZE Il sottoscrittore del modulo deve essere sempre persona fisica. Nel caso di c/c intestato a persona giuridica coincide con il soggetto delegato ad operare sul conto. Nel caso di c/c intestato a persona fisica coincide con il titolare medesimo ovvero con il soggetto delegato ad operare sullo stesso.
@sepaend`;
const PREMESSE=`- promozione e pubblicità dell'attività di consulenza fiscale in conformità delle norme deontologiche;
- attività di advertising, anche con post social e newsletter;
- produzione di una serie di contenuti utili in ottica SEO;
- organizzazione di convegni, workshop e seminari per gli operatori del settore;
- pubblicazione di riviste divulgative e/o professionali scientifiche in materia fiscale, incluso l'invio di newsletter informative;
- svolgimento di mera attività ausiliaria all'esercizio delle professioni riservate, con esclusione in ogni caso di attività professionale a componente intellettuale;
- formazione e rilascio crediti formativi in qualità di soggetto abilitato dal Consiglio Nazionale dell’Ordine dei Dottori Commercialisti e degli Esperti Contabili;`;
const PREMESSE2=`- attività di customer care e verifica della customer satisfaction;
- ricerca, selezione e formazione del personale di assistenza;
- fornitura ai Dottori Commercialisti, Ragionieri Commercialisti o Esperti contabili dei sistemi informatici e tecnologici più avanzati, per il supporto alla loro attività professionale;
- messa a disposizione di appositi spazi riservati presso le sedi della Società di servizi, dotati di tutta la strumentazione necessaria, per gli incontri di persona tra Cliente e Professionista incaricato;
- attività di front office e segreteria nei confronti dei Clienti, inclusa attività di data entry ed assistenza telefonica;`;

const DSL_PMI=`# CONTRATTO DI SERVIZI ED ELABORAZIONE MATERIALE DATI TUTTO INCLUSO E MANDATO A PROFESSIONISTA ABILITATO PER LE MATERIE RISERVATE
Il sottoscritto Sig. [[sig|nome e cognome]] Nato a [[natoA|luogo]] ([[natoPr|prov.]]), il [[natoIl|data]] residente a [[resA|comune]] ([[resPr|prov.]]), in via [[resVia|via]] n. [[resN|n.]] ([[resCap|CAP]]), C.F. persona fisica [[cf|codice fiscale]], in qualità di rappresentate legale della società [[soc|ragione sociale]], con sede in [[sede|comune]] via [[sedeVia|via]] n. [[sedeN|n.]], provincia [[sedePr|prov.]], CAP [[sedeCap|CAP]], P.I. Azienda [[piva|partita IVA]] C.F. Azienda [[cfAz|codice fiscale]] P.E.C. [[pec|PEC]], SDI [[sdi|codice SDI]] successivamente denominato “Cliente”,
= CONFERISCE A
YUXME SRL (divisione fiscale del gruppo Allcore S.p.A.) con sede in Milano, via San Gregorio, 55, 20124, Milano, partita I.V.A. 10819810960, PEC: yuxme@legal.email.it, “Società di servizi”, così successivamente denominata, anche attraverso il ricorso a collaboratori, piattaforme web, subfornitori, risorse umane dislocate all’interno dell’Unione Europea, e ricorrendo esclusivamente a professionisti abilitati nelle materie riservate, anche connesse o strumentali
@cols
= P R E M E S S E
La Società di Servizi, anche attraverso il ricorso a collaboratori piattaforme web, subfornitori, offre i seguenti servizi tutto compreso in materia fiscale ai soggetti interessati:
${PREMESSE}
- raccolta e trattamento, anche su base automatizzata ed utilizzando l'intelligenza artificiale e fornitori terzi, di dati relativi a professionisti che abbiano conseguito l'abilitazione all'esercizio della professione ex D.Lgs.n. 139/2005 e successive modifiche ed integrazioni, per lo svolgimento delle attività riservate per legge a Dottori Commercialisti, Ragionieri Commercialisti o Esperti contabili o STP. Tali dati sono conservati in data-base e strutturati sulla base di titoli e specializzazioni conseguite, pubblicazioni, esperienza, competenze, capacità, collocazione geografica, disponibilità e misura del compenso, incrociando anche i dati in modo da prefigurare il migliore Pool di professionisti per aree di competenza, anche iscritti ad altri Albi professionali; selezione di idoneo/i Professionista/i, tra quelli sopra individuati, (Professionista incaricato) che si occupi/no, per conto dei Clienti finali, della tenuta della contabilità, della consulenza fiscale e/o di operazioni societarie, inclusa la risoluzione delle problematiche legali connesse;
${PREMESSE2}
- supporto compilazione informative privacy;
- ricerche AML e adeguata verifica della clientela tramite piattaforme informatiche;
## 1. Attività e relative compenso
Con il presente contratto il Cliente conferisce apposito mandato alla Società di Servizi di selezionare idoneo/i Professionista/i, tra quelli indicati in premessa, affinché questo/i proceda/no a:
- Elaborazione dati
- Assistenza consulenze materia di Imposta sul Valore Aggiunto ed imposte sui redditi
- Liquidazione Iva mensile e trimestrale
- Presentazione e Invio della dichiarazione IVA
- Presentazione e Invio delle comunicazioni dati IVA
- Predisposizione e Invio dichiarazione Irap
- Predisposizione e Invio modello Unico
- Predisposizione e Invio Modello 770
- Predisposizione e deposito bilancio d’esercizio
- Assistenza e consulenza continuativa in materia contabile;
- N. 4 colloqui di consulenza fiscale e tributaria con Professionista abilitato (Accounting Manager) da svolgersi durante l'anno solare.
## COMPENSO
~ Contributo attivazione una tantum: [[attiv|importo]] € + IVA
~ Canone mensile: € [[canone|importo]] + IVA
(oltre spese vive sostenute per lo svolgimento dell'incarico)
~ Data decorrenza canone mensile: [[decor|data]]
~ Oltre [[soglia|numero]] registrazioni / anno: € 1,50 +IVA / reg.
## PRESTAZIONI EXTRA
[[?x1]] PREDISPOSIZIONE INTRASTAT €50,00+IVA
[[?x2]] INVIO DATI DICH. REDDITI ALLA CASSA PROF. €50,00+IVA
[[?x3]] AUTOLIQUIDAZIONI INAIL €50,00+IVA
[[?x4]] INVIO MODELLO EAS (SOC. E ASS. SPORT.) €50,00+IVA
[[?x5]] CALCOLO ACCONTO IMU € 20,00+IVA
[[?x6]] CALCOLO SALDO IMU €20,00+IVA
[[?x7]] CALCOLO RAVVEDIMENTO OPEROSO E F24 €20,00+IVA
[[?x8]] CERTIF. UNICHE RITENUTE EFFETTUATE €20,00+IVA
[[?x9]] [[xAltro|altra prestazione]]
## 2. Modalità di invio dei flussi dei dati
Le parti concordano che, se non diversamente indicato, l'invio dei documenti relativi necessari all'espletamento dell'incarico, e richiesti dal Professionista incaricato di cui al §5, debba avvenire secondo le seguenti modalità:
- Formato file: PDF o JPG;
- Dimensione massima del singolo file: 10MB;
- Risoluzione scansione: tra 100 e 200 DPI scala grigi;
- Caricamento attraverso il portale yuxme.it nell’apposita Area Riservata del Cliente.
## 3. Tempistica invio dei flussi dei dati da parte del Cliente
Le parti concordano espressamente la seguente tempistica per la messa a disposizione o l'invio dei flussi dei dati al Professionista incaricato di cui al §5 secondo le modalità indicate al precedente §2: - Documenti rilevanti ai fini IVA con periodicità mensile: entro il 9° giorno del mese successivo a quello di riferimento delle fatture attive e passive; - Documenti rilevanti ai fini IVA con periodicità trimestrale: entro il 10° giorno del mese successivo a quello di riferimento delle fatture attive e passive (anche per le periodicità IVA trimestrali i documenti verranno quindi consegnati con cadenza mensile, anche allo scopo di garantire la fattibilità degli altri adempimenti fiscali legati alla contabilità, ad esempio versamento ritenute); - Altri documenti: entro il 30° giorno dalla data di riferimento del documento e comunque in tempi compatibili per l'espletamento dell'incarico. Il Cliente ha l’obbligo di far pervenire tempestivamente al Professionista incaricato di cui al § 5, secondo le modalità indicate al precedente §2, la documentazione necessaria all’espletamento dell’incarico. A tal fine, il Cliente prende atto che la legge prevede termini e scadenze obbligatori per gli adempimenti connessi alla prestazione professionale indicata in oggetto. L'invio della documentazione occorrente non sarà oggetto di sollecito da parte della Società di Servizi che, pertanto, declina ogni responsabilità per la mancata o tardiva esecuzione dell’incarico dovuta al ritardo, incuria o inerzia da parte del Cliente. Il Cliente ha altresì l'obbligo di informare la Società di Servizi, tempestivamente e per iscritto, in ordine a qualsivoglia variazione inerente all'incarico; ciò affinché possa essere informato lo stesso Professionista incaricato che assumerà le determinazioni in merito.
## 4. Tempistica di elaborazione dei dati
Il Professionista incaricato dalla Società di servizi di cui al §5 rispetterà la seguente tempistica per il trattamento dei dati di cui ai precedenti §§: - Elabor. dei documenti relativi alla liq. IVA mensile: entro 6 giorni lavorativi dalla ricezione del documento elettronico; - Elabor. dei documenti relativi alla liq. IVA trimestrale: entro 20 giorni lavorativi dalla ricezione del documento elettronico; - Elabor. dei documenti relativi alla contabilità generale: entro 30 giorni lavorativi dalla ricezione del documento elettronico; - Elebor. altri documenti: nei tempi previsti a pena di decadenza per l'espletamento dell'incarico. Successivamente alla acquisizione diretta con collegamento al SDI e/o al Cassetto Fiscale o al caricamento dei documenti dematerializzati sul portale WEB di cui al §2., sarà segnalata al Cliente l’avvenuta acquisizione dei documenti. La Società di Servizi classificherà e dividerà il file in tanti file quanti sono i documenti acquisiti, ordinandoli anche per tipologia e data. Il Professionista incaricato di cui al §5 provvederà ad effettuare gli opportuni controlli sulle registrazioni contabili ed a curare gli incombenti consequenziali secondo la normativa civilistica e fiscale.
## 5. Materie riservate. Gestione dei rapporti con Commercialisti ed Esperti Contabili (Accounting Manager). Pagamento del Professionista incaricato
Più specificatamente il Cliente conferisce alla Società di Servizi apposito mandato volto: (i) a individuare e proporre un Professionista abilitato di comprovata esperienza (Professionista incaricato), c.d. Accounting Manager per l'assistenza contabile, fiscale e tributaria ordinaria; (ii) a gestire per proprio conto ogni rapporto con i Professionisti così individuati relativamente allo svolgimento delle attività professionali ex D.Lgs.n. 139/2005, anche connesse o strumentali, riservate per legge a Commercialisti ed esperti contabili. Tutti i colloqui con il Professionista incaricato potranno essere svolti in video-conferenza. Il Professionista incaricato non assumerà alcun incarico direttamente verso il Cliente finale, neanche congiunto con la Società di Servizi. Il Cliente si impegna a sottoscrivere le procure di cui il Professionista incaricato dovesse aver bisogno per dimostrare i propri poteri rappresentativi di fronte all'Amministrazione Tributaria. Entro 7 giorni dalla decorrenza del presente accordo Yuxme s.r.l. comunicherà al Cliente, presso l'indirizzo PEC sopra indicato, le seguenti generalità del Dottore o del Ragioniere scelto da Yuxme s.r.l. : Nome, Cognome, titolo, data di nascita, luogo di residenza, C.F., P.I., sede dello Studio, Ordine Professionale di appartenenza, relativa sezione, estremi dell'Assicurazione del Professionista, composizione della Società di professionisti o dello Studio Associato di appartenenza. Il Cliente esonera la Società di servizi da qualsiasi responsabilità derivante da modifiche apportate dal Professionista alle scritture contabili predisposte da Società di servizi e/o da successive integrazioni connesse con il completamento degli adempimenti contabili e fiscali. Il compenso del Professionista incaricato, per l'attività riservata prestata a favore del Cliente, è interamente ad esclusivo carico dalla Società di Servizi, che conferisce al Professionista abilitato il relativo incarico. Con promessa del fatto del terzo ex art. 1381 c.c. Yuxme s.r.l. dichiara che il Professionista incaricato eseguirà integralmente e tempestivamente quanto previsto nel presente contratto di sua competenza e rinuncerà, senza riserva alcuna, ad ogni diritto, a qualsivoglia titolo, contrattuale e/o extracontrattuale, verso il Cliente finale verso il quale non avrà nulla a pretendere.
## 6. Tenuta delle scritture contabili
La Società di Servizi provvederà alla conservazione digitale delle scritture contabili ai sensi del Codice dell'Amministrazione Digitale e delle vigenti Linee Guida AgID. La Società di Servizi è l’unico soggetto depositario delle scritture contabili del Cliente e pertanto il Professionista incaricato Accounting Manager non è tenuto alla conservazione dell’originale cartaceo ed alla protocollazione dei documenti IVA. Ciò in ottemperanza al DPR 633/72. Presso lo studio Professionista incaricato Accounting Manager o presso la sede sociale del Cliente rimarranno conservati i libri obbligatori ai fini civilistici nel rispetto di tutte le comunicazioni e formalità necessarie; la Società di servizi non si assume alcuna responsabilità per ogni danno, perdita, costo o conseguenza pregiudizievole.
## 7. Decorrenza e durata dell’incarico
Ad esclusione delle Prestazioni extra, il presente accordo costituisce contratto di durata o periodico ai sensi dell'art. 1458 c.c. e decorre dalla sua sottoscrizione fino al 31 Dicembre del 3° anno successivo alla sottoscrizione stessa, con rinnovo tacito annuale dopo tale prima scadenza. Il Cliente può escludere il rinnovo tacito comunicando all’altra parte la propria volontà a mezzo lettera raccomandata, con avviso di ricevimento, da inviarsi entro il 30 settembre di ogni anno. Si porta a conoscenza del Cliente che può revocare unilateralmente, con raccomandata da inviarsi 3 mesi prima, la procura al Professionista incaricato. In tale ipotesi è impedito a quest'ultimo l'ulteriore svolgimento dell'attività a lui riservata. E' altresì esclusa anche la rappresentanza del Cliente di fronte all'Amministrazione Tributaria. In tale evenienza il presente contratto si risolve per mutuo consenso ex art. 1353 c.c., restando fermi e dovuti i corrispettivi già corrisposti a Yuxme s.r.l. e quelli da corrispondere per l'attività già espletata.
## 8. Pagamento Compenso
Per lo svolgimento delle prestazioni oggetto del presente incarico, il Cliente si impegna a corrispondere alla Società di Servizi i corrispettivi indicati al § 1 in via anticipata, entro il giorno 5 di ogni mese, mediante:
[[?sepa]] PAGAMENTO SEPA
In fattura saranno evidenziati i costi vivi anticipati dalla Società di Servizi (es. imposta di bollo e registro, spese postali, spese di deposito di atti, marche da bollo). Il Cliente si impegna a rimborsarli. Nel caso di prestazione continuativa ultrannuale i compensi saranno adeguati sulla base della variazione annuale dell’indice ISTAT. Per le eventuali prestazioni specifiche, diverse da quelle indicate nel presente contratto, i corrispondenti compensi saranno determinati sulla base di un ulteriore accordo fra il Cliente e la Società di servizi, previa interlocuzione con il Professionista Incaricato.
## 9. Antiriciclaggio
In attuazione di quanto stabilito dal d.lgs. n. 231/2007, dal momento della sottoscrizione della presente lettera di incarico, la Società di Servizi adempie gli obblighi concernenti la normativa antiriciclaggio ed assolve gli obblighi di adeguata verifica della clientela, anche in favore del Professionista Incaricato al quale rilascerà opportuna attestazione.
## 10. Protezione dei dati personali
Ai sensi del Regolamento UE 2016/679 (Regolamento Generale sulla Protezione dei Dati, RGPD) e del d.lgs. 30 giugno 2003, n. 196 (Codice Privacy), il Cliente autorizza Yuxme Srl. s.a.s., in qualità di Titolare del trattamento (i cui dati contatto sono in intestazione riportati), al Trattamento dei dati personali secondo l'Allegato “Informativa trattamento dati personali”.
## 11. Foro esclusivo
Per qualsiasi controversia inerente la validità, l’esecuzione e/o l’interpretazione del presente atto, sarà competente il Tribunale di Perugia, che tutte le parti firmatarie del presente accordo eleggono quale foro esclusivo.
[[luogo|luogo]], il [[data|data]]
il Cliente X ______________________________
La Società di servizi ______________________________
Ai sensi degli articoli 1341 e 1342 c.c. Si approvano espressamente i seguenti articoli: 2. Modalità di invio dei flussi dei dati, 3. Tempistica di elaborazione dei dati – 5. Materie riservate. Gestione dei rapporti con Commercialisti ed Esperti Contabili (Accounting Manager). Pagamento del Professionista incaricato - 7. Decorrenza e durata dell'incarico - 11. Foro Esclusivo.
[[luogo|luogo]], il [[data|data]]
il Cliente X ______________________________
La Società di servizi ______________________________
@single
${PRIVACY}
${SEPA('Yuxme S.r.l.')}`;

const ST_INTRO=`Il Servizio consiste nella fornitura di un'infrastruttura tecnologica integrata (Gestionale, Web App e AI) finalizzata all'automazione del data entry contabile e al servizio di consulenza in ambito contabile e dichiarativi fiscali.
Con il servizio full viene concesso, per ogni utente del Cliente, l’accesso alla piattaforma integrata con IA per l’emissione, la ricezione e il caricamento dei documenti, la consultazione quotidiana di dashboard con i principali dati contabili aggiornati, la tenuta della contabilità ed elaborazione adempimenti fiscali, il supporto di un Cont Controller dedicato, che registrerà e supervisionerà la contabilità e curerà l’elaborazione dei dichiarativi routinari, Accounting Manager che svolgerà l’attività di consulenza periodica oltre che chisura delle situazioni annuali con calcolo imposte, elaborazione dichiarativi e deposito di Bilanci.`;
const dslStudio=(has,cond,bozza)=>`# CONTRATTO DI SERVIZI LICENZA D'USO PIATTAFORMA, SUPPORTO CONTABILE, FULL ASSISTANCE (PARTNER/PROFESSIONISTA)
La società [[soc|denominazione dello studio]] con sede in [[sede|sede]] codice fiscale e partita iva [[piva|codice fiscale e partita IVA]] nella persona del suo legale rappresentante Dott. [[sig|nome e cognome]] , nato a [[natoA|luogo]] ([[natoPr|prov.]] ) il [[natoIl|data]] codice fiscale [[cf|codice fiscale]] , domiciliato in [[dom|domicilio]] Iscritto all'Ordine dei Dottori Commercialisti e degli Esperti Contabili di [[ordine|sede dell'Ordine]] al n. [[ordN|numero]] sez. [[ordSez|sezione]] , di seguito “Professionista” .
= E
YUXME SRL (divisione software del gruppo Allcore S.p.A.) con sede in Milano, Via San Gregorio n. 55 - 20124 Milano partita I.V.A. 10819810960, PEC: yuxme@legal.email.it, in persona del legale rappresentante Andrea Agnoli, PEC: yuxme@legal.email.it, di seguito anche “Yuxme” o “Società di Servizi” che opera anche attraverso il ricorso a collaboratori, piattaforme web, subfornitori, risorse umane dislocate all’interno dell’Unione Europea, ricorrendo esclusivamente a professionisti abilitati nelle materie riservate, anche connesse o strumentali
@cols
= PREMESSO CHE
La Società di Servizi, anche attraverso il ricorso a collaboratori, piattaforme web, subfornitori, offre i seguenti servizi tutto compreso in materia fiscale ai soggetti interessati:
${PREMESSE}
- sviluppo e gestione di piattaforme "AI Driven" per l'automazione del data entry contabile;
- servizi di Cloud Hosting e Cloud Data Management per l'elaborazione dei dati contabili;
- servizi di conservazione digitale a norma;
- raccolta e trattamento, anche su base automatizzata ed utilizzando l'intelligenza artificiale, di dati relativi a professionisti che abbiano conseguito l'abilitazione all'esercizio della professione ex D.Lgs. n. 139/2005 e successive modifiche ed integrazioni, per lo svolgimento delle attività riservate per legge a Dottori Commercialisti, Ragionieri Commercialisti o Esperti contabili o STP. Tali dati sono conservati in database e strutturati sulla base di titoli e specializzazioni conseguite, pubblicazioni, esperienza, competenze, capacità, collocazione geografica, disponibilità e misura del compenso, incrociando anche i dati in modo da prefigurare il migliore Pool di professionisti per aree di competenza, anche iscritti ad altri Albi professionali;
- selezione di idoneo/i Professionista/i, tra quelli sopra individuati, (Partner) che si occupi/no, per conto dei Clienti finali o di altri Professionisti, della tenuta della contabilità, della consulenza fiscale e/o di operazioni societarie, inclusa la risoluzione delle problematiche legali connesse;
${PREMESSE2}
- supporto compilazione informativa privacy;
- ricerche AML e adeguata verifica della clientela tramite piattaforme informatiche;
- il Professionista intende avvalersi della tecnologia e del supporto operativo di Yuxme, mantenendo in capo a sé la titolarità del rapporto professionale e gli adempimenti riservati per legge
## 1. Oggetto dell'incarico. Gestione contabile.
Il presente contratto ha per oggetto l'acquisto da parte del Professionista del diritto di utilizzazione del SERVIZIO YUXME "AI DRIVEN PLATFORM" per i propri Clienti finali.
Yuxme si obbliga a:
- fornire l'accesso alla piattaforma Yuxme per la gestione dei flussi di fatturazione elettronica (attiva/passiva) e caricamento documenti contabili per ogni Cliente finale;
- rielaborare tramite AI la proposta di registrazione contabile dei documenti caricati dall’UTENTE in piattaforma. Qualora l’Intelligenza Artificiale rilevi un basso indice di confidenza, il processo prevede in automatico l'intervento di un operatore Yuxme specializzato (Human-in-the-loop);
- in caso di dati mancanti nel documento originale, il processo verrà sospeso e sarà inviata segnalazione al Professionista per l'integrazione, necessaria allo sblocco della registrazione;
- garantire al Professionista accesso alle piattaforme di Intelligenza Artificiale e strumenti software dal quale lo studio commercialista potrà monitorare, analizzare e modificare le registrazioni contabili validate, e svolgere tutti gli adempimenti previsti dalla normativa;
- provvedere alla conservazione digitale a norma delle fatture elettroniche.
## 1.2. Modalità di fruizione del servizio e Flussi Dati
L’attivazione dei Clienti finali dovrà avvenire con le seguenti modalità:
- Acquisizione dei dati dell’UTENTE da parte del Professionista (Ragione Sociale completa, P. Iva, visura societaria, documento di identità del legale rappresentante/titolare, Regime Contabile, Periodicità IVA, Cod. Attività Ateco) previo svolgimento dell’adeguata verifica da parte del Professionista stesso ai fini della normativa antiriciclaggio;
- Comunicazione a Yuxme, da parte del Professionista della lista, degli utenti attivati, corredata dai dati di cui al precedente comma e di una di una scheda anagrafica per ogni utente attivato, contenente: Ragione Sociale, Tipologia di attività, Libro cespiti, Registri IVA, Banche Attive, Lista Finanziamenti, Leasing, C. Anticipi e Automezzi
- Invio all’UTENTE, a cura del Professionista, del link personalizzato di accesso all’APPLICAZIONE previamente messo a disposizione da Yuxme a conclusione dell'attività indicata ai commi precedenti.
- Primo accesso all’APPLICAZIONE da parte dell’UTENTE, con creazione di user ID e Password e accettazione telematica delle CONDIZIONI GENERALI (UTENTE) come da allegati al presente accordo;
- Il codice destinatario univoco dell’APPLICAZIONE per ricevere le fatture elettroniche è KGVVJ2H e potrà essere in futuro variato ad insindacabile giudizio di Yuxme, salvo preavviso di almeno 30gg.
Yuxme predisporrà la contabilità sul proprio piano dei conti, garantendo la correttezza dei dati inseriti. Il Professionista si assume l’obbligo e la responsabilità di verificare la corretta registrazione contabile ai fini fiscali, segnalando eventuali discrasie o errori, e sarà l’unico soggetto tenuto ad eseguire le attività professionali che sono riservate per legge a Commercialisti ed Esperti Contabili.
Yuxme non potrà essere ritenuta responsabile per la mancata registrazione contabile di documenti che non siano stati forniti dall’UTENTE entro i termini stabiliti. Il Servizio di Registrazione Contabile consente tutti gli adempimenti fiscali a cura del Professionista, che ne resta l’unico responsabile nei confronti dell’UTENTE (es. per dichiarativi, bilanci e consulenza).
Al fine di controllare la corretta registrazione contabile ed adempiere alle attività professionali di cui al punto precedente, Yuxme concede al Professionista piattaforme di Intelligenza Artificiale e strumenti software dai quali lo studio commercialista potrà monitorare le registrazioni contabili di tutti gli UTENTI ad egli collegati, modificare le imputazioni contabili operate da Yuxme e svolgere tutti gli adempimenti previsti dalla normativa.
L’utilizzo del Servizio Yuxme e comunque ogni rapporto tra le parti è regolato dalle condizioni generali di servizio che dovranno essere espressamente accettate.
## 2. Modalità Full Assistance. Attività riservata
Qualora sia selezionata questa modalità, il Professionista conferisce apposito mandato alla Società di Servizi anche di selezionare altro idoneo/i Professionista/i Partner iscritto/i all'Albo professionale, tra quelli indicati in premessa, affinché questo/i procedano a predisporre, in riferimento ad uno o più Clienti Finali indicati al punto 1.2. una bozza di:
- Elaborazione dati;
- Liquidazione Iva mensile e trimestrale;
- Presentazione e Invio della dichiarazione IVA;
- Presentazione e Invio delle comunicazioni dati IVA;
- Predisposizione e Invio dichiarazione Irap;
- Predisposizione e Invio modello Unico;
- Predisposizione e Invio Modello 770;
- Predisposizione e deposito bilancio d'esercizio;
- Integrativi;
Il Professionista Partner fornisce un mero supporto altamente specializzato al Professionista ed è sempre a disposizione di quest'ultimo per emendare incongruenze, discrasie, errori e meri errata corrige.
Il Professionista è l'unico autore e responsabile dei dichiarativi ed integrativi di cui sopra che sono a lui unicamente, giuridicamente e deontologicamente attribuibili.
Il Professionista è pertanto sempre tenuto ad effettuare gli opportuni controlli ed a curare gli incombenti consequenziali secondo la normativa civilistica e fiscale.
## 2.2. Modalità di invio dei flussi dei dati
Per lo svolgimento dell'attività indicata al §2 i dati saranno acquisiti dal Professionista Partner con le stesse modalità e obbligazioni previste al § 1.2. e nelle condizioni generali di servizio.
## 2.3. Tempistica messa a disposizione dei dati da parte del Professionista partner
A partire dal settimo giorno antecedente alla relativa scadenza fiscale il Professionista Partner caricherà le bozze degli elaborati dei dichiarativi di cui §2 nel portale pmi.yuxme.it dove saranno a disposizione del Professionista per i successivi incombenti, secondo la normativa civilistica e fiscale, che restano di esclusiva compentenza di quest'ultimo.
## 2.4. Gestione dei rapporti con Professionista Partner
Il Professionista conferisce alla Società di Servizi apposito mandato volto a gestire per proprio conto ogni rapporto con il Professionisti Partner nello svolgimento delle attività professionali ex D.Lgs. n. 139/2005, anche connesse o strumentali, riservate per legge a Commercialisti ed esperti contabili.
Il compenso del Professionista Partner, per l'attività riservata prestata a favore del Professionista, è interamente ad esclusivo carico dalla Società di Servizi, che conferisce al Professionista Partner il relativo incarico.
Con promessa del fatto del terzo ex art. 1381 c.c. Yuxme s.r.l. dichiara che il Professionista Partner adempierà integralmente e tempestivamente quanto previsto nel presente contratto per quanto di sua competenza e rinuncerà, senza riserva alcuna, ad ogni diritto, a qualsivoglia titolo, contrattuale e/o extracontrattuale, verso il Professionista e verso il Cliente finale di quest'ultimo verso il quali non avrà nulla a pretendere.
## 3. Tenuta delle scritture contabili
La Società di Servizi provvederà alla conservazione digitale delle scritture contabili ai sensi del Codice dell'Amministrazione Digitale e delle vigenti Linee Guida AgID. La Società di Servizi è l’unico soggetto depositario delle scritture contabili del Cliente e pertanto nè il Professionista nè il Professionista Partner sono tenuti alla conservazione dell’originale cartaceo ed alla protocollazione dei documenti IVA. Ciò in ottemperanza al DPR 633/72.
Presso lo studio Professionista o presso la sede sociale del Cliente finale rimarranno conservati i libri obbligatori ai fini civilistici nel rispetto di tutte le comunicazioni e formalità necessari.
La Società di servizi non si assume alcuna responsabilità per ogni danno, perdita, costo o conseguenza pregiudizievole.
## 4. Compensi e Pagamenti
Per le prestazioni di cui al § 1. (Gestione contabile) il Professionista corrisponderà a Yuxme:
COSTO FISSO: [[lFisso|importo]]€ + iva annui (pari a [[lMese|importo]]€ +iva mensili) per ogni cliente attivato
COSTO VARIABILE: [[lRiga|importo]]€ + iva per ogni riga contabilizzata
Qualora appositamente selezionata, per le prestazioni di cui al § 2. (Modalità Full Assistance) il Professionista corrisponderà a Yuxme:
COSTO FISSO: [[fOp|importo]] + iva annui (pari a € [[fOpM|importo]] +iva mensili) per ogni cliente finale non holding con n.[[fDoc|numero]] documenti contabili compresi nel prezzo;
COSTO FISSO: [[fHold|importo]] + iva annui (pari a € [[fHoldM|importo]] +iva mensili) per ogni cliente finale holding con n.[[fDoc|numero]] documenti contabili compresi nel prezzo;
COSTO VARIABILE: [[fEcc|importo]]€ + iva per ogni documento eccedente contabilizzato
${cond?'CONDIZIONI PARTICOLARI: [[cond|condizioni particolari]]':''}
Mese Decorrenza: il corrispettivo fisso e/o variabile del servizio di gestioni contabile e/o modalità full assistance per singolo cliente decorre dal mese di attivazione per intero.
Il pagamento avverrà in via anticipata entro il giorno 5 di ogni mese tramite addebito SEPA. Yuxme si riserva la facoltà di sospendere o interrompere il servizio di registrazione contabile ex art. 1460 c.c. qualora il Professionista non dovesse corrispondere a Yuxme gli importi tra di essi concordati relativi alla registrazione contabile dei documenti caricati dall’UTENTE.
In nessun caso la Società di Servizi risponderà delle conseguenze pregiudizievoli (danni, sanzioni, interessi o altro) che l’UTENTE o lo studio commercialista dovessero subire in conseguenza dell’interruzione del SERVIZIO, determinata dal mancato pagamento.
In fattura saranno evidenziate eventuali costi vivi anticipati da Yuxme (es. imposta di bollo e registro, spese postali, spese di deposito di atti, marche da bollo). Il Professionista si impegna a rimborsarli. Nel caso di prestazione continuativa ultrannuale i compensi saranno adeguati sulla base della variazione annuale dell’indice ISTAT.
Per le eventuali prestazioni specifiche, diverse da quelle indicate nel presente contratto, i corrispondenti compensi saranno determinati sulla base di un ulteriore accordo fra il Professionista e Yuxme .
## 5. Decorrenza e durata dell’incarico
Ad esclusione di eventuali Prestazioni extra, il presente accordo ha durata annuale con rinnovo tacito alla scadenza. Restano fermi e dovuti i corrispettivi già corrisposti a Yuxme s.r.l. e quelli da corrispondere per l'attività già espletata.
È facoltà del Professionista recedere dal contratto unilateralmente con PEC da inviarsi 3 mesi prima della scadenza da valere per l'anno contabile successivo.
Qualora il contratto si risolva per qualsivoglia motivo, Yuxme si obbliga a mantenere l’accesso attivo all’APPLICAZIONE per ulteriori 90 gg.
## 6. Patto di non concorrenza
Salvo espressa autorizzazione scritta del Professionista, e fino ad un periodo di tre anni anni dalla conclusione per qualsivoglia motivo del presente contratto, è fatto divieto a Yuxme ed ad altre società del Gruppo Allcore, inclusi i Professionisti Partner, di offrire i servizi di cui ai §§ 1 e 2, dovendo altrimenti rispondere dei relativi danni,.
## 7. Foro esclusivo
Per qualsiasi controversia inerente la validità, l’esecuzione e/o l’interpretazione del presente atto, sarà competente il Tribunale di Perugia, che tutte le parti firmatarie del presente accordo eleggono quale foro esclusivo.
[[luogo|luogo]], il [[data|data]]
Il Professionista X ______________________________
Yuxme Srl ______________________________
Ai sensi degli articoli 1341 e 1342 c.c. Si approvano espressamente i seguenti articoli: 1.2. Modalità di fruizione del servizio e Flussi Dati; 2. Modalità Full Assistance. Attività riservata; 2.4. Gestione dei rapporti con Professionista Partner; 4. Compensi e Pagamenti; 5. Decorrenza e durata dell’incarico; 6. Patto di non concorrenza; 7. Foro esclusivo
[[luogo|luogo]], il [[data|data]]
Il Professionista X ______________________________
Yuxme Srl ______________________________
@single
${has.light?`@br
@style:modulo
# MODULO D’ORDINE LIGHT
Il Servizio consiste nella fornitura di un'infrastruttura tecnologica integrata (Gestionale, Web App e AI) finalizzata all'automazione del data entry contabile.
Flusso Operativo: Il sistema elabora proposte di registrazione automatica dei documenti caricati. Qualora l’Intelligenza Artificiale rilevi un basso indice di confidenza, il processo prevede l'intervento di un operatore Yuxme specializzato interno all'Azienda (Human-in-the-loop), senza oneri comunicativi per lo Studio.
Validazione (Bulk Approval): Lo Studio mantiene l’esclusiva responsabilità della convalida finale delle scritture, potendo usufruire di una funzionalità di approvazione massiva (e correzione qualora necessaria) basata sui livelli di affidabilità garantiti dal sistema.
Limitazioni: In caso di dati strutturalmente mancanti nel documento originale, il processo verrà sospeso e segnalato allo Studio per l'integrazione, necessaria allo sblocco della pratica.
## ALLEGATO 1 – MODULO D’ORDINE (UTENTE)
@tab:light
PRICING:
COSTO FISSO: [[lFisso|importo]]€ + iva annui (pari a [[lMese|importo]]€ +iva mensili) per cliente attivato
COSTO VARIABILE: [[lRiga|importo]]€ + iva per ogni riga contabilizzata
DECORRENZA: il corrispettivo fisso e variabile del servizio di elaborazione dati per singolo cliente attivato decorre dal mese di attivazione per intero.
*Indicare una stima del numero di documenti da registrare in un anno. Il costo sarà determinato dal numero di righe effettivamente registrato.`:''}
${has.fullnh?`@br
@style:modulo
# MODULO D’ORDINE FULL NON HOLDING
${ST_INTRO}
## ALLEGATO 1 – MODULO D’ORDINE (UTENTE)
${bozza?'BOZZA IN REVISIONE: i clienti in regime semplificato e forfettario sono riportati in questo modulo con il compenso annuale indicato in tabella.':''}
@tab:fullnh
PRICING:
COMPENSO ANNUALE : indicato in tabella per ciascun cliente attivato, + iva
NUMERO DI DOCUMENTI DA CONTABILIZZARE COMPRESO NEL COMPENSO ANNUALE: [[fDoc|numero]]
COMPENSO PER DOCUMENTI EXTRA: [[fEcc|importo]] € a documento
DECORRENZA: il corrispettivo del servizio per singolo cliente attivato decorre dal mese di attivazione per intero.`:''}
${has.fullh?`@br
@style:modulo
# MODULO D’ORDINE FULL HOLDING
${ST_INTRO}
## ALLEGATO 1 – MODULO D’ORDINE (UTENTE)
@tab:fullh
PRICING:
COMPENSO ANNUALE: indicato in tabella per ciascun cliente attivato, + iva
NUMERO DI DOCUMENTI DA CONTABILIZZARE COMPRESO NEL COMPENSO ANNUALE: [[fDoc|numero]]
COMPENSO PER DOCUMENTI EXTRA: [[fEcc|importo]] € a documento
DECORRENZA: il corrispettivo del servizio per singolo cliente attivato decorre dal mese di attivazione per intero.`:''}
${SEPA('Yuxme S.r.l.')}
${PRIVACY}`;

