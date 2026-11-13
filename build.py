#!/usr/bin/env python3
"""Assembla la pagina dai sorgenti in src/.

Produce due file con lo stesso contenuto e due confezioni diverse:

  artifact.html    pagina per claude.ai (Artifact): senza <html>/<head>, font e
                   librerie caricati dai CDN ammessi dalla piattaforma.
  index.html       pagina autonoma per GitHub Pages o un qualsiasi server:
                   font e librerie incorporati e una Content-Security-Policy
                   che vieta le connessioni verso altri siti. È la garanzia
                   tecnica che i dati inseriti non possano lasciare il browser.

Uso:  python3 build.py                                  (pagina in chiaro)
      PREVENTIVATORE_PASSWORD='…' python3 build.py     (pagina protetta)
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

# --- protezione con password --------------------------------------------------
# Con la variabile d'ambiente PREVENTIVATORE_PASSWORD la pagina autonoma viene
# cifrata (AES-256-GCM, chiave derivata con PBKDF2-SHA256) e index.html diventa
# una pagina d'ingresso che la decifra nel browser. Senza password il contenuto,
# listino compreso, non è leggibile. La password non va mai scritta in un file.
import gzip, os
password = os.environ.get('PREVENTIVATORE_PASSWORD', '')
if password:
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    import hashlib
    ITER = 600_000
    salt, iv = os.urandom(16), os.urandom(12)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, ITER, dklen=32)
    cifrato = AESGCM(key).encrypt(iv, gzip.compress(standalone.encode('utf-8'), 9), None)
    e64 = lambda b: base64.b64encode(b).decode()
    logo = 'data:image/png;base64,' + b64('assets/logo-yuxme.png')
    index = f'''<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="{CSP}">
<meta name="referrer" content="no-referrer">
<meta name="robots" content="noindex,nofollow">
<title>{TITLE}</title>
<style>
html,body{{height:100%;margin:0}}
body{{display:flex;align-items:center;justify-content:center;background:#FBFCF7;color:#3F403D;font:16px system-ui,-apple-system,"Segoe UI",sans-serif;padding:16px;box-sizing:border-box}}
form{{background:#fff;border:1px solid #E2E3DE;border-radius:20px;padding:28px;width:100%;max-width:380px;display:flex;flex-direction:column;gap:16px;box-sizing:border-box}}
img{{height:36px;width:auto;align-self:flex-start}}
h1{{font-size:22px;margin:0;color:#0D0D0C}}
label{{display:flex;flex-direction:column;gap:6px;font-size:14px;color:#6B6D66}}
input{{font:inherit;padding:11px 12px;border:1px solid #E2E3DE;border-radius:8px;background:#FBFCF7;color:#3F403D}}
button{{font:inherit;font-weight:600;padding:11px 18px;border-radius:999px;border:0;background:#36296E;color:#fff;cursor:pointer}}
button:disabled{{opacity:.5}}
input:focus-visible,button:focus-visible{{outline:2px solid #36296E;outline-offset:2px}}
p{{margin:0;font-size:14px;min-height:1.4em;color:#B3261E}}
</style>
</head>
<body>
<form id="f" autocomplete="off">
  <img src="{logo}" alt="Yuxme">
  <h1>Preventivatore</h1>
  <label>Password<input id="p" type="password" autocomplete="off" autofocus required></label>
  <button id="b" type="submit">Entra</button>
  <p id="m" role="alert"></p>
</form>
<script>
// Pagina d'ingresso: il contenuto vero è cifrato qui sotto e viene decifrato
// solo nel browser, con la password. La password non viene salvata né inviata.
const SALT="{e64(salt)}", IV="{e64(iv)}", ITER={ITER}, DATI="{e64(cifrato)}";
const bytes = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
document.getElementById("f").addEventListener("submit", async e => {{
  e.preventDefault();
  const m = document.getElementById("m"), b = document.getElementById("b");
  if (!window.crypto || !crypto.subtle) {{ m.textContent = "Apri la pagina con https e un browser aggiornato."; return; }}
  b.disabled = true; m.textContent = "";
  try {{
    const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(document.getElementById("p").value), "PBKDF2", false, ["deriveKey"]);
    const chiave = await crypto.subtle.deriveKey({{name: "PBKDF2", salt: bytes(SALT), iterations: ITER, hash: "SHA-256"}}, base, {{name: "AES-GCM", length: 256}}, false, ["decrypt"]);
    const chiaro = await crypto.subtle.decrypt({{name: "AES-GCM", iv: bytes(IV)}}, chiave, bytes(DATI));
    const html = await new Response(new Blob([chiaro]).stream().pipeThrough(new DecompressionStream("gzip"))).text();
    document.open(); document.write(html); document.close();
  }} catch (err) {{ b.disabled = false; m.textContent = "Password non corretta."; document.getElementById("p").select(); }}
}});
</script>
</body>
</html>
'''
    (ROOT / 'index.html').write_text(index, encoding='utf-8')
    print(f'artifact.html {len(artifact)//1024} KB · index.html {len(index)//1024} KB (protetto da password)')
else:
    (ROOT / 'index.html').write_text(standalone, encoding='utf-8')
    print(f'artifact.html {len(artifact)//1024} KB · index.html {len(standalone)//1024} KB (SENZA password)')
