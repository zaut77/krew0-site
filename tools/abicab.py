#!/usr/bin/env python3
"""Rigenera l'elenco di banche e sportelli usato per leggere l'IBAN.

Fonte: https://abicab.nicogis.it/abi_cab.json (progetto github.com/nicogis/abicab).
NON è un elenco ufficiale e l'ultimo aggiornamento noto è di gennaio 2024:
contiene anche banche nel frattempo fuse o rinominate. Va sostituito con
l'archivio ABI-CAB ufficiale appena disponibile; il formato prodotto qui è:

  src/js/05-abi.js   ABI → nome della banca (incorporato nella pagina)
  data/abicab.txt.gz una riga per banca: ABI <tab> CAB=Città (PR);CAB=…
                     (caricato solo quando serve, dallo stesso sito)

Uso:  python3 tools/abicab.py percorso/abi_cab.json
"""
import collections, gzip, json, pathlib, re, sys

ROOT = pathlib.Path(__file__).parent.parent
testo = pathlib.Path(sys.argv[1]).read_text(encoding='utf-8-sig')
# Il file d'origine non è JSON valido ovunque: si leggono i singoli record.
RX = re.compile(r'\{"ABI":"(\d{5})","CAB":"(\d{5})","Istituto":"((?:[^"\\]|\\.)*)","Sportello":"((?:[^"\\]|\\.)*)",'
                r'"Indirizzo":"(?:[^"\\]|\\.)*","Citta":"((?:[^"\\]|\\.)*)","CAP":"(?:[^"\\]|\\.)*","Provincia":"((?:[^"\\]|\\.)*)"\}')
pulisci = lambda s: re.sub(r'\s+', ' ', re.sub(r'\\(.)', r'\1', s)).strip()

banche, sportelli = {}, collections.defaultdict(dict)
for abi, cab, istituto, sportello, citta, prov in RX.findall(testo):
    banche.setdefault(abi, pulisci(istituto).title())
    if pulisci(sportello).upper().startswith('BONIFICI DA FILIALE'):
        continue
    sportelli[abi][cab] = pulisci(citta).title() + (f' ({prov})' if prov else '')

(ROOT / 'src/js/05-abi.js').write_text(
    "/* ==========================================================================\n"
    " * 05 · BANCHE PER CODICE ABI — file generato da tools/abicab.py, non modificare.\n"
    " * Fonte non ufficiale (abicab.nicogis.it, dati di gennaio 2024): può contenere\n"
    " * nomi superati. Serve solo a suggerire banca e sportello a partire dall'IBAN.\n"
    " * ========================================================================== */\n"
    "const ABI = " + json.dumps(banche, ensure_ascii=False, separators=(',', ':'), sort_keys=True) + ";\n", encoding='utf-8')
righe = '\n'.join(abi + '\t' + ';'.join(f'{c}={v}' for c, v in sorted(sportelli[abi].items())) for abi in sorted(banche))
(ROOT / 'data').mkdir(exist_ok=True)
(ROOT / 'data/abicab.txt.gz').write_bytes(gzip.compress(righe.encode('utf-8'), 9, mtime=0))
print(f'{len(banche)} banche, {sum(len(v) for v in sportelli.values())} sportelli')
