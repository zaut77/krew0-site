#!/usr/bin/env python3
"""Assembla la pagina dai sorgenti in src/.

Produce due file con lo stesso contenuto e due confezioni diverse:

  artifact.html    pagina per claude.ai (Artifact): senza <html>/<head>, font e
                   librerie caricati dai CDN ammessi dalla piattaforma.
  index.html       pagina autonoma per GitHub Pages o un qualsiasi server:
                   font e librerie incorporati e una Content-Security-Policy
                   che vieta le connessioni verso altri siti. È la garanzia
                   tecnica che i dati inseriti non possano lasciare il browser.

Uso:  python3 build.py
"""
import base64, glob, pathlib

ROOT = pathlib.Path(__file__).parent
read = lambda p: (ROOT / p).read_text(encoding='utf-8')
b64 = lambda p: base64.b64encode((ROOT / p).read_bytes()).decode()

TITLE = 'Preventivatore Yuxme'
css = read('src/style.css')
page = read('src/page.html')
js = '\n'.join(read(p) for p in sorted(str(pathlib.Path(f).relative_to(ROOT)) for f in glob.glob(str(ROOT / 'src/js/*.js'))))
# risorse incorporate: immagini come data URI, altri file in base64 semplice
import re
js = re.sub(r"'__ASSET:(.+?)__'", lambda m: "'data:image/png;base64," + b64(m.group(1)) + "'", js)
js = re.sub(r"'__B64:(.+?)__'", lambda m: "'" + b64(m.group(1)) + "'", js)
assert '__ASSET:' not in js and '__B64:' not in js

# --- claude.ai --------------------------------------------------------------
CDN = 'https://cdnjs.cloudflare.com/ajax/libs'
artifact = f'''<title>{TITLE}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manuale:wght@500;600;700&family=Montserrat:wght@400;500;600;700&display=swap">
<style>
{css}</style>

{page}
<script src="{CDN}/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="{CDN}/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js"></script>
<script>
{js}</script>
'''
(ROOT / 'artifact.html').write_text(artifact, encoding='utf-8')

# --- pagina autonoma ----------------------------------------------------------
faces = ''.join(
    f"@font-face{{font-family:'{fam}';font-weight:{w};font-style:normal;font-display:swap;"
    f"src:url(data:font/woff2;base64,{b64(f'vendor/fonts/{slug}-latin-{w}-normal.woff2')}) format('woff2')}}\n"
    for fam, slug, weights in (('Manuale', 'manuale', (500, 600, 700)), ('Montserrat', 'montserrat', (400, 500, 600, 700)))
    for w in weights)
# Niente rete: solo codice e risorse incorporati. 'unsafe-inline' è necessario
# perché script e stile sono nel file; non esistono sorgenti esterne ammesse.
# Eccezioni: lo stesso sito (elenco sportelli in data/) e, se configurato in
# 00-config.js, il servizio di invio email.
endpoint = re.search(r"const MAIL_ENDPOINT = '([^']*)'", js).group(1)
assert endpoint == '' or endpoint.startswith('https://script.google.com/macros/s/'), 'MAIL_ENDPOINT deve essere un servizio Apps Script'
connect = "'self'" + (" https://script.google.com https://script.googleusercontent.com" if endpoint else "")
CSP = ("default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; "
       f"img-src data:; font-src data:; connect-src {connect}; form-action 'none'; base-uri 'none'")
standalone = f'''<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="{CSP}">
<meta name="referrer" content="no-referrer">
<meta name="robots" content="noindex,nofollow">
<title>{TITLE}</title>
<style>
html,body{{margin:0}}img{{max-width:100%}}[hidden]{{display:none!important}}
{faces}{css}</style>
</head>
<body>
{page}
<script>{read('vendor/jspdf.umd.min.js')}</script>
<script>{read('vendor/jspdf.plugin.autotable.min.js')}</script>
<script>
{js}</script>
</body>
</html>
'''
(ROOT / 'index.html').write_text(standalone, encoding='utf-8')
print(f'artifact.html {len(artifact)//1024} KB · index.html {len(standalone)//1024} KB')
