#!/usr/bin/env python3
"""Genera assets/modulo-clienti.xlsx: il modulo che lo studio compila con i dati
dei suoi clienti. Il preventivatore lo legge con "Carica il modulo compilato".

L'ordine delle colonne è lo stesso di caricaClienti (src/js/61-studio.js):
riferimento, tipo, fatture di vendita, fatture di acquisto, righe di libro
giornale, corrispettivi, prospetto del personale. Se lo cambi, cambia anche lì.

Uso: python3 tools/modulo.py   (richiede openpyxl)
"""
import pathlib
from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.worksheet.datavalidation import DataValidation

OUT = pathlib.Path(__file__).parent.parent / 'assets' / 'modulo-clienti.xlsx'
RIGHE = 500                     # righe con i menu a tendina (= MAX_CLIENTI_RIGA)
BLU = '1F3A7A'

wb = Workbook()
ws = wb.active
ws.title = 'Clienti'
COLONNE = [
    ('Riferimento cliente', 30, 'Nome o codice del cliente.'),
    ('Tipo di contabilità', 20, 'Ordinaria, Semplificata, Forfettaria o Holding.'),
    ('Fatture di vendita (anno)', 16, 'Numero di fatture emesse in un anno.'),
    ('Fatture di acquisto (anno)', 16, 'Numero di fatture ricevute in un anno.'),
    ('Righe libro giornale (anno)', 18, 'Facoltativo. Se lo indicate, le fatture non servono.'),
    ('Corrispettivi (anno)', 14, 'Numero di corrispettivi in un anno, se ci sono.'),
    ('Personale dipendente', 14, 'Sì se il cliente ha personale dipendente.'),
]
for i, (titolo, larghezza, _) in enumerate(COLONNE, start=1):
    c = ws.cell(row=1, column=i, value=titolo)
    c.font = Font(bold=True, color='FFFFFF')
    c.fill = PatternFill('solid', fgColor=BLU)
    c.alignment = Alignment(wrap_text=True, vertical='center')
    ws.column_dimensions[c.column_letter].width = larghezza
ws.row_dimensions[1].height = 34
ws.freeze_panes = 'A2'

def regola(dv, col, msg):
    dv.promptTitle, dv.prompt = COLONNE[col][0], msg
    dv.errorTitle, dv.error = 'Valore non valido', msg
    dv.showInputMessage = dv.showErrorMessage = True
    ws.add_data_validation(dv)
    dv.add(f'{"ABCDEFG"[col]}2:{"ABCDEFG"[col]}{RIGHE + 1}')

regola(DataValidation(type='list', formula1='"Ordinaria,Semplificata,Forfettaria,Holding"'), 1, COLONNE[1][2])
for col in (2, 3, 4, 5):
    regola(DataValidation(type='whole', operator='greaterThanOrEqual', formula1='0'), col, COLONNE[col][2] + ' Solo numeri interi.')
regola(DataValidation(type='list', formula1='"Sì,No"'), 6, COLONNE[6][2])

ist = wb.create_sheet('Istruzioni')
ist.column_dimensions['A'].width = 110
TESTO = [
    ('Come compilare il modulo', True),
    ('Una riga per ogni cliente dello studio, nel foglio "Clienti". Non cambiate l\'ordine delle colonne e non aggiungete righe sopra l\'intestazione.', False),
    ('', False),
    ('Riferimento cliente: nome o codice, come preferite.', False),
    ('Tipo di contabilità: si sceglie dal menu (Ordinaria, Semplificata, Forfettaria, Holding).', False),
    ('Fatture di vendita e di acquisto: numero di fatture in un anno.', False),
    ('Righe libro giornale: facoltativo. Se avete il numero di righe dell\'anno, indicatelo: in quel caso le fatture non servono.', False),
    ('Corrispettivi: numero di corrispettivi in un anno, se il cliente li ha (per esempio 12 se sono mensili).', False),
    ('Personale dipendente: Sì se il cliente ha dipendenti (serve per il prospetto del personale).', False),
    ('', False),
    ('Esempio', True),
    ('Rossi Srl | Ordinaria | 320 | 410 | (vuoto) | 12 | Sì', False),
    ('Bianchi Sas | Semplificata | (vuoto) | (vuoto) | 1.800 | 0 | No', False),
]
for r, (testo, grassetto) in enumerate(TESTO, start=1):
    c = ist.cell(row=r, column=1, value=testo)
    c.font = Font(bold=grassetto, size=13 if grassetto else 11, color=BLU if grassetto else '3F403D')
    c.alignment = Alignment(wrap_text=True)

wb.save(OUT)
print('Scritto', OUT)
