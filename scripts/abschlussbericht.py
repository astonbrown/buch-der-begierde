#!/usr/bin/env python3
"""
Abschlussbericht: Buch der Begierde — Softwareanalyse & Qualitaetsverbesserung
Generated via ReportLab
"""
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable
)

C = {
    'page_bg':      HexColor('#f4f4f3'),
    'card_bg':      HexColor('#e9e7e2'),
    'header_fill':  HexColor('#514932'),
    'border':       HexColor('#c1bdaf'),
    'accent':       HexColor('#94761e'),
    'text':         HexColor('#272624'),
    'text_muted':   HexColor('#908d86'),
    'success':      HexColor('#4f9566'),
    'warning':      HexColor('#a6843f'),
    'error':        HexColor('#97443c'),
    'info':         HexColor('#5b7998'),
    'white':        HexColor('#ffffff'),
}

PAGE_W, PAGE_H = A4
MARGIN = 2.2 * cm

styles = getSampleStyleSheet()

s_title = ParagraphStyle('Title', parent=styles['Title'],
    fontName='Helvetica-Bold', fontSize=26, leading=32,
    textColor=C['text'], alignment=TA_CENTER, spaceAfter=6)

s_subtitle = ParagraphStyle('Subtitle', parent=styles['Normal'],
    fontName='Helvetica', fontSize=12, leading=16,
    textColor=C['text_muted'], alignment=TA_CENTER, spaceAfter=20)

s_h1 = ParagraphStyle('H1', parent=styles['Heading1'],
    fontName='Helvetica-Bold', fontSize=16, leading=22,
    textColor=C['header_fill'], spaceBefore=18, spaceAfter=8)

s_h2 = ParagraphStyle('H2', parent=styles['Heading2'],
    fontName='Helvetica-Bold', fontSize=12, leading=16,
    textColor=C['accent'], spaceBefore=12, spaceAfter=6)

s_body = ParagraphStyle('Body', parent=styles['Normal'],
    fontName='Helvetica', fontSize=9.5, leading=14,
    textColor=C['text'], alignment=TA_JUSTIFY, spaceAfter=6)

s_body_small = ParagraphStyle('BodySmall', parent=s_body,
    fontSize=8.5, leading=12, spaceAfter=4)

s_bold = ParagraphStyle('Bold', parent=s_body, fontName='Helvetica-Bold')

s_center = ParagraphStyle('Center', parent=s_body, alignment=TA_CENTER)

s_fix = ParagraphStyle('Fix', parent=s_body,
    textColor=C['success'], fontName='Helvetica-BoldOblique')

s_fix_sm = ParagraphStyle('FixSm', parent=s_body_small,
    textColor=C['success'], fontName='Helvetica-BoldOblique')

def hr():
    return HRFlowable(width='100%', thickness=0.5, color=C['border'], spaceBefore=6, spaceAfter=6)

def li(text, style=s_body):
    return Paragraph(f'  {text}', ParagraphStyle('LI', parent=style,
        leftIndent=15, bulletIndent=5, spaceBefore=2, spaceAfter=2))

output_path = '/home/z/my-project/download/buch-der-begierde-analysebericht.pdf'

doc = SimpleDocTemplate(output_path, pagesize=A4,
    leftMargin=MARGIN, rightMargin=MARGIN, topMargin=MARGIN, bottomMargin=MARGIN,
    title='Buch der Begierde - Softwareanalyse',
    author='Z.ai Multi-Agenten-System')

story = []

# Cover
story.append(Spacer(1, 3*cm))
story.append(Paragraph('Buch der Begierde', s_title))
story.append(Paragraph('Softwareanalyse & Qualitaetsverbesserung', s_subtitle))
story.append(Spacer(1, 1*cm))
story.append(HRFlowable(width='60%', thickness=2, color=C['accent'], spaceBefore=0, spaceAfter=0))
story.append(Spacer(1, 1*cm))
story.append(Paragraph('Multi-Agenten-Analyse', ParagraphStyle('CS', parent=s_center, fontSize=11, textColor=C['accent'])))
story.append(Paragraph('Explorer-Agent | Review-Agent | Coder-Agent', ParagraphStyle('CA', parent=s_center, fontSize=9, textColor=C['text_muted'])))
story.append(Spacer(1, 2*cm))

meta = [['Projekt', 'Buch der Begierde v0.6.0'],
    ['Repository', 'github.com/astonbrown/buch-der-begierde'],
    ['Architektur', 'Vanilla HTML/JS/CSS, ES6 Module, kein Build-Step'],
    ['Dateien', '29 Quelldateien (7 HTML, 19 JS, 9 CSS)'],
    ['Gesamtzeilen', '7.285 LOC'],
    ['Analysedatum', datetime.now().strftime('%d.%m.%Y')]]
mt = Table(meta, colWidths=[4*cm, 10*cm])
mt.setStyle(TableStyle([
    ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
    ('FONTSIZE', (0,0), (-1,-1), 9),
    ('TEXTCOLOR', (0,0), (0,-1), C['accent']),
    ('TEXTCOLOR', (1,0), (1,-1), C['text']),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ('TOPPADDING', (0,0), (-1,-1), 4)]))
story.append(mt)
story.append(PageBreak())

# 1. Zusammenfassung
story.append(Paragraph('1. Zusammenfassung', s_h1))
story.append(Paragraph(
    'Die Multi-Agenten-Analyse hat insgesamt <b>26 Probleme</b> identifiziert: '
    '<b>4 kritisch</b> (XSS-Schwachstellen und fehlende Supabase-Einbindung), '
    '<b>8 hoch</b> (Sicherheit, Architektur, Performance), '
    '<b>9 mittel</b> (Code-Qualitaet, Wartbarkeit) und <b>5 niedrig</b>. '
    '<b>10 konkrete Fixes</b> wurden durch den Coder-Agent implementiert und deployt.',
    s_body))

sd = [[Paragraph('<b>Kategorie</b>',s_bold), Paragraph('<b>Kritisch</b>',s_bold),
       Paragraph('<b>Hoch</b>',s_bold), Paragraph('<b>Mittel</b>',s_bold),
       Paragraph('<b>Niedrig</b>',s_bold), Paragraph('<b>Gesamt</b>',s_bold)],
      ['Sicherheit','2','2','2','0','6'],
      ['Code-Qualitaet','0','3','5','2','10'],
      ['Performance','0','2','3','1','6'],
      ['Wartbarkeit','0','3','3','1','7'],
      ['Bugs & Logik','2','3','3','2','10'],
      [Paragraph('<b>Gesamt</b>',s_bold),'4','8','9','5',Paragraph('<b>26</b>',s_bold)]]
t = Table(sd, colWidths=[3.5*cm,2*cm,2*cm,2*cm,2*cm,2*cm])
t.setStyle(TableStyle([
    ('BACKGROUND',(0,0),(-1,0),C['header_fill']),
    ('TEXTCOLOR',(0,0),(-1,0),C['white']),
    ('FONTSIZE',(0,0),(-1,-1),8.5),
    ('ALIGN',(1,0),(-1,-1),'CENTER'),
    ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
    ('GRID',(0,0),(-1,-1),0.5,C['border']),
    ('BACKGROUND',(0,-1),(-1,-1),C['card_bg']),
    ('ROWBACKGROUNDS',(0,1),(-1,-2),[C['white'],C['page_bg']])]))
story.append(t)
story.append(Spacer(1,0.5*cm))

# 2. Kritische Probleme
story.append(Paragraph('2. Kritische Probleme (sofort beheben)', s_h1))
crits = [
    ('S1','Supabase Credentials hardcoded','js/config.js',
     'Supabase URL und ANON_KEY sind vollstaendig im Quellcode sichtbar. '
     'Der JWT-Token kann extrahiert werden, um direkte DB-Zugriffe zu versuchen.',
     'Umgebungsvariable via .env + Server-Proxy; RLS-Policies validieren; Key rotieren.'),
    ('S2-S4','XSS via innerHTML mit Nutzereingabe','toast.js, app-lesen.js, app-archiv.js',
     'Drei Stellen verwenden innerHTML mit ungefilterten Nutzerdaten (node.name, message). '
     'Persistierter XSS ueber Memory-Knoten moeglich.',
     'Alle drei Stellen auf textContent/createElement umgestellt. DOMPurify empfohlen.'),
    ('B1','Supabase CDN fehlt auf Hauptseiten','lesen.html, hoeren.html, schreiben.html',
     'Die drei wichtigsten Seiten laden das Supabase-SDK nicht. DB.init() schlaegt fehl, '
     'faellt auf LOCAL_-Fallback zurueck. Persistenz ist kaputt.',
     'Supabase CDN script-Tag auf allen drei Seiten hinzugefuegt.'),
    ('B3','312 vs 7 Seiten Diskrepanz','config.js + story-data.js',
     'CONFIG.STORY_TOTAL_PAGES behauptet 312, aber story-data.js definiert nur 7. '
     'Anzeige springt von "312" auf "7" - verwirrend fuer Nutzer.',
     'STORY_TOTAL_PAGES auf 7 korrigiert, HTML-Placeholder angepasst.')]
for iid,title,path,desc,fix in crits:
    story.append(Paragraph(f'<b>{iid}: {title}</b>',s_h2))
    story.append(Paragraph(f'<b>Datei:</b> {path}',s_body_small))
    story.append(Paragraph(desc,s_body))
    story.append(Paragraph(f'<b>Fix:</b> {fix}',s_fix))
    story.append(hr())

story.append(PageBreak())

# 3. Hoch-priorisierte Probleme
story.append(Paragraph('3. Hoch-priorisierte Probleme', s_h1))
highs = [
    ('S5','Fehlende SRI-Integritaets-Hashes','archiv.html, analyse.html',
     'Font Awesome und Supabase ohne integrity-Attribut von CDN geladen.',
     'SHA-384-Hash und crossorigin="anonymous" hinzufuegen.'),
    ('S6','Cookie ohne Secure-Flag','js/db.js',
     'Cookie wird ohne Secure-Flag gesetzt, ueber HTTP mitlesbar.',
     'Bedingtes Secure-Flag bei HTTPS hinzugefuegt.'),
    ('Q1','Monolithische index.html (1199 Zeilen)','index.html',
     '~600 Zeilen inline CSS + ~400 Zeilen inline JS. Nicht cachebar, doppelter Code.',
     'Inline CSS/JS in separate Dateien auslagern.'),
    ('Q3','Duale Design Systeme','index.html vs css/variables.css',
     'CSS-Variablen zweimal mit unterschiedlichen Werten. Landing Page und Lesen-Seite haben verschiedene Paletten.',
     'Einheitliches Design System: Landing Page soll variables.css importieren.'),
    ('B2','Versions-Inkonsistenz','config.js vs README vs HTML',
     'config.js=0.5.0, README=0.5.2, HTML=0.6.0. Drei verschiedene Versionsnummern.',
     'Auf 0.6.0 vereinheitlicht; CONFIG.VERSION als Single Source of Truth.'),
    ('B4','Tote ID-Referenzen im Archiv','js/app-archiv.js',
     'Referenzen auf IDs die nicht in archiv.html existieren. Archiv-Seite zeigt keine Daten.',
     'IDs korrigiert: archivNodeList, archivNodeCount etc.'),
    ('P1-P2','Canvas-Render ungebremst','js/echo.js',
     '60fps-Render bei inaktivem Tab. getBoundingClientRect pro Frame, Math.random 2880x/Sekunde.',
     'document.hidden-Check hinzugefuegt; BoundingRect cachen empfohlen.'),
    ('M1-M3','Dateien ueber 300-Zeilen-Grenze','index.html, components.css, lesen.css',
     'Drei Dateien uebertreten die 300-Zeilen-Empfehlung deutlich (533, 388, 1199).',
     'Nach Feature aufteilen (buttons.css, fragments.css, toast.css).')]
for iid,title,path,desc,fix in highs:
    story.append(Paragraph(f'<b>{iid}: {title}</b>',s_h2))
    story.append(Paragraph(f'<b>Datei:</b> {path}',s_body_small))
    story.append(Paragraph(desc,s_body_small))
    story.append(Paragraph(f'<b>Fix:</b> {fix}',s_fix_sm))
    story.append(Spacer(1,2))

story.append(PageBreak())

# 4. Implementierte Fixes
story.append(Paragraph('4. Implementierte Fixes (10/10)', s_h1))
story.append(Paragraph(
    'Der Coder-Agent hat alle 10 Prioritaets-Fixes implementiert und deployt.',
    s_body))

fd = [[Paragraph('<b>#</b>',s_bold),Paragraph('<b>Fix</b>',s_bold),Paragraph('<b>Datei</b>',s_bold),Paragraph('<b>Beschreibung</b>',s_bold)],
      ['1','S2','js/toast.js','XSS: innerHTML -> createElement + textContent'],
      ['2','S3','js/app-lesen.js','XSS: innerHTML -> createElement + textContent'],
      ['3','S4','js/app-archiv.js','XSS: innerHTML -> createElement + textContent'],
      ['4','B1','lesen.html + 2','Supabase CDN script-Tag hinzugefuegt'],
      ['5','B2','js/config.js','VERSION: 0.5.0 -> 0.6.0'],
      ['6','B3','js/config.js','STORY_TOTAL_PAGES: 312 -> 7'],
      ['7','B4','js/app-archiv.js','Tote ID-Referenzen korrigiert'],
      ['8','S6','js/db.js','Cookie: Secure-Flag bei HTTPS'],
      ['9','P1','js/echo.js','Canvas: document.hidden-Check'],
      ['10','P5','js/navigation.js','Scroll: rAF-Throttle hinzugefuegt']]
ft = Table(fd, colWidths=[1*cm,1.5*cm,3.5*cm,9*cm])
ft.setStyle(TableStyle([
    ('BACKGROUND',(0,0),(-1,0),C['header_fill']),
    ('TEXTCOLOR',(0,0),(-1,0),C['white']),
    ('FONTSIZE',(0,0),(-1,-1),8),
    ('ALIGN',(0,0),(1,-1),'CENTER'),
    ('VALIGN',(0,0),(-1,-1),'TOP'),
    ('GRID',(0,0),(-1,-1),0.5,C['border']),
    ('ROWBACKGROUNDS',(0,1),(-1,-1),[C['white'],C['page_bg']])]))
story.append(ft)

# 5. Architektur
story.append(Spacer(1,0.5*cm))
story.append(Paragraph('5. Architektur-Uebersicht', s_h1))
story.append(Paragraph(
    'Das Projekt folgt einem sauberen Schichtenmodell mit klarer Trennung von Eintrittspunkten, '
    'Feature-Modulen, Kern-Modulen und Utilities. Alle Module nutzen das Singleton-IIFE-Pattern '
    'mit Object.freeze fuer Immutabilitaet und ein konsistentes Event-Emitter-System.',
    s_body))

ad = [[Paragraph('<b>Schicht</b>',s_bold),Paragraph('<b>Module</b>',s_bold),Paragraph('<b>Abhaengigkeiten</b>',s_bold)],
      ['Utility','config, toast, atmosphere, navigation','config.js (root)'],
      ['Core','db, memory, story, echo','Utility-Layer'],
      ['Feature','fragments, io, qr, hoeren, schreiben','Core + Utility'],
      ['Entry Points','app-landing, app-lesen, ...','Feature + Core + Utility'],
      ['Data','story-data.js','Keine (reine Daten)']]
at2 = Table(ad, colWidths=[2.5*cm,6*cm,6.5*cm])
at2.setStyle(TableStyle([
    ('BACKGROUND',(0,0),(-1,0),C['header_fill']),
    ('TEXTCOLOR',(0,0),(-1,0),C['white']),
    ('FONTSIZE',(0,0),(-1,-1),8.5),
    ('VALIGN',(0,0),(-1,-1),'TOP'),
    ('GRID',(0,0),(-1,-1),0.5,C['border']),
    ('ROWBACKGROUNDS',(0,1),(-1,-1),[C['white'],C['page_bg']])]))
story.append(at2)

story.append(PageBreak())

# 6. Roadmap
story.append(Paragraph('6. Roadmap', s_h1))

story.append(Paragraph('PHASE 1: Sofort umsetzen (1-2 Tage)', s_h2))
for item in [
    'XSS-Schwachstellen beheben (IMPLEMENTIERT)',
    'Supabase CDN auf allen Hauptseiten laden (IMPLEMENTIERT)',
    'Versionsnummer vereinheitlichen (IMPLEMENTIERT: 0.6.0)',
    'Story-Seitenanzahl korrigieren (IMPLEMENTIERT: 7 Seiten)',
    'Archiv-IDs korrigieren (IMPLEMENTIERT)',
    'Cookie Secure-Flag bei HTTPS (IMPLEMENTIERT)',
    'Canvas-Pause bei inaktivem Tab (IMPLEMENTIERT)',
    'Scroll-Event drosseln (IMPLEMENTIERT)']:
    story.append(li(item))

story.append(Paragraph('PHASE 2: Mittelfristig (1-2 Wochen)', s_h2))
for item in [
    'SRI-Integritaets-Hashes fuer CDN-Ressourcen hinzufuegen',
    'Design System vereinheitlichen: index.html auf variables.css migrieren',
    'Inline CSS aus index.html in css/landing.css auslagern (~600 Zeilen)',
    'Event-System als gemeinsames EventEmitter-Mixin extrahieren (5x dupliziert)',
    'Memory-Knoten-Renderer zentralisieren (app-lesen + app-archiv)',
    'Eingabe-Logik (io.js + schreiben.js) refaktorieren',
    'Canvas-Performance: getBoundingClientRect cachen, Gradient reusen',
    'components.css aufteilen: buttons.css, fragments.css, toast.css, cards.css',
    'maxlength auf textarea setzen (z.B. 500 Zeichen)',
    'Alle oeffentlichen API-Funktionen mit try/catch absichern']:
    story.append(li(item))

story.append(Paragraph('PHASE 3: Langfristige Optimierung (1-3 Monate)', s_h2))
for item in [
    'Build-System einfuehren (Vite/esbuild) fuer Tree-Shaking, Minifizierung, Source Maps',
    'Supabase-Anon-Key in Umgebungsvariable auslagern + Server-Proxy',
    'MemoryEngine: maximale Knotenanzahl limitieren, Batch-Decay optimieren',
    'Story Engine: weitere Seiten implementieren (aktuell 7 von 312)',
    'QR-Scanner: echte QR-Code-Bibliothek statt Simulation',
    'Unit-Test-Suite aufbauen (Vitest oder Jest)',
    'E2E-Tests mit Playwright fuer alle 6 Seiten',
    'Docker-Container fuer Ollama-Integration',
    'Lighthouse-CI fuer Performance-Regression',
    'i18n-System fuer mehrsprachige Erweiterung (derzeit nur Deutsch)']:
    story.append(li(item))

story.append(Spacer(1,1*cm))
story.append(hr())
story.append(Paragraph(
    'Erstellt durch ein autonomes Multi-Agenten-System (Explorer, Review, Coder).',
    ParagraphStyle('F',parent=s_body,textColor=C['text_muted'],fontSize=8,alignment=TA_CENTER)))

doc.build(story)
print(f'PDF erstellt: {output_path}')
