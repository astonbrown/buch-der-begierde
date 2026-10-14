# 📚 Buch der Begierde — Interaktives Leseerlebnis

Ein **literarisches Web-Artefakt** mit dynamischen Fragmenten, Resonanz-Visualisierung und persönlichem Gedächtnis-Engine.

---

## 🎯 Projekt-Übersicht

**Buch der Begierde** ist eine experimentelle Web-Anwendung, die Lesen neu interpretiert:

- **Fragment-basierte Navigation:** Wähle aus 7 Wortfragmenten (Samt, Kälte, Wärme, Licht, Schatten, Staub, Atem), um die Geschichte zu lenken
- **Echo-Engine:** Beobachte, wie deine Interaktionen als Resonanz-Visualisierung auf einem Canvas ausgegeben werden
- **Dynamisches Gedächtnis:** Alle Momente werden automatisch in einem Knoten-Graph gespeichert mit Verfall-Mechanic
- **Mehrsprachige Stimmen:** Höre die Geschichte mit Web Speech Synthesis API
- **Schreib-Integration:** Verfasse deine eigenen Zeilen mit Fragment-basierten Vorschlägen
- **Memory-Archiv:** Erkunde dein persönliches Gedächtnis als visuelle Graph-Struktur

---

## 🏗️ Projektstruktur

```
buch-der-begierde/
│
├── index.html              # Landing Page mit 3D-Buchdeckel
├── lesen.html              # Hauptleseschnittstelle (8-Panel-Grid)
├── hoeren.html             # Text-to-Speech Modul
├── schreiben.html          # Schreib-Engine mit Vorschlägen
├── archiv.html             # Memory-Archiv & Graph-Visualisierung
├── analyse.html            # Geräte-Diagnostik
│
├── js/                      # JavaScript-Module (19 Dateien)
│   ├── Core-Module:
│   │   ├── db.js            # Supabase Datenbank-Wrapper (Graceful Degradation)
│   │   ├── memory.js        # Gedächtnis-Engine (4 Knoten-Typen)
│   │   ├── story.js         # Story-Engine mit Branching
│   │   └── echo.js          # Canvas-Resonanz-Visualisierung
│   │
│   ├── Feature-Module:
│   │   ├── fragments.js     # 7 Fragment-Selektor (Resonanz-Profile)
│   │   ├── io.js            # Input-Panel Manager
│   │   ├── qr.js            # QR-Scanner (Simulation + Kamera)
│   │   ├── hoeren.js        # Web Speech Synthesis API
│   │   └── schreiben.js     # Schreib-Engine mit Resonanz-Analyse
│   │
│   ├── Utility-Module:
│   │   ├── atmosphere.js    # Particle-Effekte
│   │   ├── config.js        # Zentralisierte Konstanten
│   │   ├── navigation.js    # Navigation & DB-Status
│   │   └── toast.js         # Toast-Meldungen
│   │
│   ├── Entry-Points (6):
│   │   ├── app-landing.js   # index.html
│   │   ├── app-lesen.js     # lesen.html (Orchestrierung)
│   │   ├── app-hoeren.js    # hoeren.html
│   │   ├── app-schreiben.js # schreiben.html
│   │   ├── app-archiv.js    # archiv.html
│   │   └── app-analyse.js   # analyse.html
│   │
│   └── data/story-data.js   # Story mit Branching-Graph
│
├── css/                      # Modular CSS (8 Dateien, ~1300 LOC)
│   ├── variables.css        # CSS-Variablen (Farben, Fonts, Größen)
│   ├── base.css             # Reset, Typographie, Globale Stile
│   ├── atmosphere.css       # Hintergrund, Particle-Effekte
│   ├── animations.css       # @keyframes, Übergänge
│   ├── components.css       # Panel, Button, Fragment-Tag, Card
│   ├── layout.css           # Header, Navigation, Grid-Layout
│   ├── index.css            # Landing Page Spezifika
│   └── lesen.css            # Reading Page Grid
│
├── data/
│   └── story-data.js        # 312-Seiten Story mit Fragment-Branching
│
├── .git/                    # Git-Repository
└── README.md                # Diese Datei
```

---

## 🚀 Installation & Setup

### Voraussetzungen
- Modern Browser mit ES6-Module-Support (Chrome 60+, Firefox 67+, Safari 11+)
- Optional: Supabase-Verbindung (falls nicht vorhanden → Local Fallback)

### Lokalstart (kein Build nötig!)

```bash
# Option 1: Live Server in VS Code
# Installiere die "Live Server" Extension und starte mit Rechtsklick → "Open with Live Server"

# Option 2: Python HTTP Server
python -m http.server 8000
# Dann öffne http://localhost:8000

# Option 3: Node.js http-server
npm install -g http-server
http-server
```

---

## 🎮 Seiten-Übersicht

| Seite | Beschreibung | Entry-Point |
|-------|-------------|-------------|
| **index.html** | Landing Page mit 3D-Buchdeckel | app-landing.js |
| **lesen.html** | Hauptleseschnittstelle (8 Panels) | app-lesen.js |
| **hoeren.html** | Text-to-Speech mit Sprechparametern | app-hoeren.js |
| **schreiben.html** | Schreiben mit Fragment-Vorschlägen | app-schreiben.js |
| **archiv.html** | Memory-Archiv mit Graph-Visualisierung | app-archiv.js |
| **analyse.html** | Geräte-Diagnostik (Browser, APIs, Display) | app-analyse.js |

### Lesen-Seite (Hauptmodus) — 8-Panel-Grid

```
┌─ Fragment-Selektor ─┬─ Echo-Engine ──────────┐
│                     │ (Canvas-Resonanz)      │
├─ Geschichte ────────┼─ QR-Scanner ───────────┤
│ (Text-Rendering)    │ (Simulation)           │
├─ Memory-Knoten ─────┼─ Input-Panel ──────────┤
│ (Aktuell)           │ (Schreib-Feld)         │
└─────────────────────┴────────────────────────┘
```

---

## 🧠 Kern-Architektur

### Core-Module

#### **db.js** — Supabase Wrapper (Graceful Degradation)
- Speichert: Fragment-Auswahl, aktuelle Seite, Memory-State
- Fallback: Wenn Supabase offline → `LOCAL_<ID>` Fallback
- Fehler sind nicht fatal: Anwendung läuft weiter

#### **memory.js** — Gedächtnis-Engine
4 Knoten-Typen mit verschiedenen Verfall-Raten:

| Typ | Verfall | Base-Gewicht | Quelle |
|-----|---------|--------------|--------|
| **EPISODIC** | 0.002/h | 0.50 | Seiten-Besuche |
| **SENSORY** | 0.005/h | 0.30 | Die 7 Fragmente |
| **EMOTIONAL** | 0.003/h | 0.70 | Schreib-Einträge |
| **CONCEPTUAL** | 0.001/h | 0.40 | Abstrakte Konzepte |

- Bidirektionale Assoziationen zwischen Knoten
- Automatischer Verfall mit konfigurierbarem Timer
- Serialisierung für DB-Speicherung

#### **story.js** — Story Engine
- Fragment-bedingte Seiten-Navigation (Branching)
- Text-Generierung mit dynamischen Varianten
- 312-seitige Geschichte mit Annotations

#### **echo.js** — Canvas-Resonanz-Visualisierung
Trackt Interaktionen:
- Klicks pro Seite
- Scroll-Distanz
- Zeit auf Seite
- Fragment-Wechsel

Berechnet: **Resonanz**, **Tiefe**, **Drift** (Spring Physics auf Canvas)

### Feature-Module

#### **fragments.js** — 7-Fragment-Selektor
```
Samt (emotional)    · Kälte (sensory)   · Wärme (emotional)
Licht (conceptual)  · Schatten (conceptual) · Staub (sensory)
Atem (episodic)
```
- Max 3 gleichzeitig wählbar
- Jedes Fragment hat Resonanz-Profil (Memory-Integration)

#### **hoeren.js** — Web Speech Synthesis API
- Sprache: Deutsch (Standard)
- Steuerung: Play, Pause, Resume, Stop
- Parameter: Geschwindigkeit (0.1–10x), Tonhöhe (0.1–2.0)

#### **schreiben.js** — Schreib-Engine
- Fragment-basierte Text-Vorschläge
- Resonanz-Analyse: Welche Fragmente stecken im Text?
- Memory-Integration: Automatische Knoten-Erstellung

---

## 🐛 Bugs & Fixes

### ✅ Behoben (v0.5.1)
- story.js: `getTotalPages()` gibt jetzt `_pages.length` zurück
- echo.js: Event-Listener werden bei `destroy()` gelöscht → kein Memory Leak
- fragments.js: Fragment-Tag-Listener mit dedizierter `destroy()` Funktion
- io.js: Input-Event-Handler wird ordnungsgemäß gereinigt
- schreiben.js: Neue `destroy()` Funktion mit Event-Listener-Management

### ⚠️ MEDIUM Priority (später beheben)
- db.js: Race Condition bei LeserIn-Initialisierung
- memory.js: Decay-Timer kann bei Hot-Reload mehrfach laufen
- hoeren.js: HTML-Stripping mit Regex könnte Edge-Cases fehlschlag

### 🔵 LOW Priority
- Keine localStorage-Fallback, wenn Supabase offline wird
- Keine globale Error-Boundary für uncaught Exceptions

---

## 📊 Performance & Kompatibilität

### Browser-Support
- ✅ Chrome 60+, Firefox 67+, Safari 11+, Edge 79+
- ⚠️ IE11: Nicht unterstützt (ES6 Module erforderlich)

### Performance-Metriken
- **Bundle:** ~450 KB (unkomprimiert, keine Dependencies)
- **Memory:** ~5–15 MB (abhängig von Memory-Knoten)
- **Canvas FPS:** 60 FPS (Spring Physics Animation)
- **API-Calls:** Nur bei Änderungen (saveState, saveEingabe)

---

## 🔧 Entwicklung

### Datei-Konventionen

**Module:** Singleton Factory Pattern (ES6 IIFE)
```javascript
const ModuleName = (() => {
    let _state = {...};
    function init() { /* ... */ }
    function destroy() { /* cleanup */ }
    return Object.freeze({ init, destroy, ... });
})();
export default ModuleName;
```

**Entry-Points:** Initialisieren auf Document Ready
```javascript
import DB from './db.js';
import StoryEngine from './story.js';

window.addEventListener('DOMContentLoaded', () => {
    DB.init();
    StoryEngine.loadPages(STORY_DATA);
    // ...
});
```

### Build & Deployment

**Kein Build-Schritt erforderlich!**

```bash
# Lokaltest
python -m http.server 8000

# Deployment (z.B. GitHub Pages)
git push origin main
# → Live auf https://astonbrown.github.io/buch-der-begierde
```

---

## 📝 Story-Struktur

[data/story-data.js](data/story-data.js) — 312 Seiten mit Fragment-Branching

```javascript
{
    id: "page-47",
    number: 47,
    text: (fragments) => {
        if (fragments.has('samt')) return "Samtgewebe...";
        return "Baumwolle...";
    },
    branches: [
        { pageId: "page-48", conditions: ["licht", "wärme"] },
        { pageId: "page-50", conditions: [] } // Fallback
    ]
}
```

---

## 🎨 Design-System

### Farben (css/variables.css)
```css
--accent: rgb(196, 70, 58);       /* Rot */
--gold: rgb(184, 148, 62);        /* Gold */
--bg-deep: rgb(6, 4, 3);          /* Schwarz */
--fg: rgb(220, 210, 195);         /* Beige */
```

### Typographie
- **Serif:** Cormorant Garamond (Text)
- **Mono:** JetBrains Mono (Code, Labels)
- **Icons:** Font Awesome 6.5.1

---

## 📚 Ressourcen

- **GitHub:** https://github.com/astonbrown/buch-der-begierde
- **Supabase:** https://supabase.com/docs
- **Web Speech API:** https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- **Canvas API:** https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API

---

## 📄 Lizenz

Code: **MIT License**  
Texte/Story: © 2026 [Autor] — Alle Rechte vorbehalten

---

**Version:** 0.5.2  
**Letzte Aktualisierung:** 2026-06-26  
**Status:** Aktive Entwicklung 🚀

