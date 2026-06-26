/**
 * app-lesen.js — Entry-Point für lesen.html
 *
 * Die Hauptseite. Orchestriert ALLE Module:
 *   - Atmosphäre, Partikel, Toast, Navigation
 *   - DB (LeserIn initialisieren)
 *   - Story Engine (Seiten laden + Text rendern)
 *   - Fragment Selector (Auswahl + Intensität)
 *   - Echo Engine (Canvas-Visualisierung)
 *   - Memory Engine (DOM-Sync der Knoten)
 *   - IO Manager (Eingabe-Panel)
 *   - QR Scanner (Simulation)
 *
 * Zustandsspeicherung: Wenn die LeserIn die Seite verlässt, wird
 * der gesamte State (Fragmente, Seite, Memory) via DB.saveState() gespeichert.
 */

import { createParticles, initFadeInObserver, initPanelGlow } from './atmosphere.js';
import { showToast } from './toast.js';
import { navigateTo, setDbStatus } from './navigation.js';
import DB from './db.js';
import MemoryEngine from './memory.js';
import StoryEngine from './story.js';
import EchoEngine from './echo.js';
import FragmentSelector from './fragments.js';
import IOManager from './io.js';
import QRScanner from './qr.js';
import { STORY_PAGES } from '../data/story-data.js';

/* ------------------------------------------------------------------
   DOM-Synchronisation: Memory → UI
   Rendert die Memory-Knoten in das Panel-Element.
   ------------------------------------------------------------------ */
function _renderMemoryNodes(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const nodes = MemoryEngine.getNodes();
    container.innerHTML = '';

    if (nodes.length === 0) {
        container.innerHTML =
            '<div class="memory-node"><span class="node-detail">Noch keine Erinnerungen verankert.</span></div>';
        return;
    }

    nodes.forEach(node => {
        const el = document.createElement('div');
        el.classList.add('memory-node');
        if (node.state === 'filled' || node.state === 'partial') el.classList.add('active');

        const indicator = document.createElement('span');
        indicator.classList.add('node-indicator', node.state);

        const info = document.createElement('div');
        info.classList.add('node-info');
        info.innerHTML = `
            <div class="node-name">${node.name}</div>
            <div class="node-detail">${node.type.toUpperCase()} · ${node.source}</div>`;

        const weight = document.createElement('span');
        weight.classList.add('node-weight');
        weight.textContent = node.weight.toFixed(2);

        el.appendChild(indicator);
        el.appendChild(info);
        el.appendChild(weight);
        container.appendChild(el);
    });
}

/* ------------------------------------------------------------------
   Story-Text aktualisieren mit Fade-Transition
   ------------------------------------------------------------------ */
function _renderStoryText(textEl, indicatorEl) {
    if (!textEl) return;
    const fragments = FragmentSelector.getSelected();

    textEl.style.opacity = '0';
    textEl.style.transform = 'translateY(8px)';

    setTimeout(() => {
        textEl.innerHTML = StoryEngine.renderText(fragments);
        textEl.style.opacity = '1';
        textEl.style.transform = 'translateY(0)';

        // Seiten-Indikator aktualisieren
        if (indicatorEl) {
            const num = StoryEngine.getCurrentPageNumber();
            const total = StoryEngine.getTotalPages();
            indicatorEl.textContent = `Seite ${num} / ${total}`;
        }
    }, 300);
}

/* ------------------------------------------------------------------
   Init
   ------------------------------------------------------------------ */
async function initLesen() {
    // 1. Atmosphäre & Effekte
    createParticles('particles');
    initFadeInObserver();
    initPanelGlow('.panel');

    // 2. Story laden + Startseite
    StoryEngine.loadPages(STORY_PAGES);
    StoryEngine.navigate('page_47');

    const storyTextEl = document.getElementById('geschichtsText');
    const pageIndicator = document.getElementById('pageIndicator');
    _renderStoryText(storyTextEl, pageIndicator);

    // 3. Memory Engine starten + Listener
    MemoryEngine.startDecay();
    const memoryContainerId = 'memoryNodes';
    MemoryEngine.on((event) => {
        if (event === 'node:created' || event === 'node:reinforced' ||
            event === 'memory:decayed' || event === 'memory:restored') {
            _renderMemoryNodes(memoryContainerId);
        }
    });
    _renderMemoryNodes(memoryContainerId);

    // 4. Echo Engine initialisieren
    EchoEngine.init('echoCanvas', (metrics) => {
        const r = document.getElementById('metricResonanz');
        const t = document.getElementById('metricTiefe');
        const d = document.getElementById('metricDrift');
        if (r) r.textContent = metrics.resonanz;
        if (t) t.textContent = metrics.tiefe;
        if (d) d.textContent = metrics.drift;
    });

    // 5. Fragment Selector
    FragmentSelector.init('.fragment-tag', 'intensitySlider', 'intensityValue');
    FragmentSelector.on((event, type) => {
        if (event === 'fragment:selected' || event === 'fragment:deselected') {
            _renderStoryText(storyTextEl, pageIndicator);
        }
    });

    // 6. IO Manager
    IOManager.init({
        textareaId: 'eingabeText',
        charCountId: 'charCount',
        timeStampId: 'timeStamp',
        readerIdId: 'readerId'
    });
    IOManager.on(() => _renderMemoryNodes(memoryContainerId));

    // 7. QR Scanner
    QRScanner.init({
        viewportId: 'qrViewport',
        patternId: 'qrPattern',
        scanLineId: 'qrScanLine',
        statusId: 'qrStatus'
    });

    // 8. Story Navigation Buttons
    const btnNext = document.getElementById('btnNext');
    const btnPrev = document.getElementById('btnPrev');
    if (btnNext) {
        btnNext.addEventListener('click', () => {
            const fragments = FragmentSelector.getSelected();
            const page = StoryEngine.nextBranch(fragments);
            if (page) {
                _renderStoryText(storyTextEl, pageIndicator);
                showToast('Seite ' + page.number, 'fa-book-open');
            } else {
                showToast('Ende des Kapitels erreicht', 'fa-flag-checkered');
            }
        });
    }
    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            const page = StoryEngine.back();
            if (page) {
                _renderStoryText(storyTextEl, pageIndicator);
            } else {
                showToast('Bereits am Anfang', 'fa-info-circle');
            }
        });
    }

    // 9. Eingabe-Buttons
    const btnSubmit = document.getElementById('btnSubmit');
    const btnClear = document.getElementById('btnClear');
    const btnFortsetzen = document.getElementById('btnFortsetzen');
    if (btnSubmit) btnSubmit.addEventListener('click', () => {
        IOManager.submit();
        _renderMemoryNodes(memoryContainerId);
    });
    if (btnClear) btnClear.addEventListener('click', () => IOManager.clearInput());
    if (btnFortsetzen) btnFortsetzen.addEventListener('click', () => {
        IOManager.fortsetzen(() => {
            const fragments = FragmentSelector.getSelected();
            const page = StoryEngine.nextBranch(fragments);
            if (page) {
                _renderStoryText(storyTextEl, pageIndicator);
                showToast('Seite ' + page.number, 'fa-book-open');
            }
        });
    });

    // 10. Navigation
    const navLesen = document.getElementById('navLesen');
    const navHoeren = document.getElementById('navHoeren');
    const navSchreiben = document.getElementById('navSchreiben');
    const navArchiv = document.getElementById('navArchiv');
    const navAnalyse = document.getElementById('navAnalyse');
    if (navLesen) navLesen.classList.add('active');
    if (navHoeren) navHoeren.addEventListener('click', () => navigateTo('hoeren.html'));
    if (navSchreiben) navSchreiben.addEventListener('click', () => navigateTo('schreiben.html'));
    if (navArchiv) navArchiv.addEventListener('click', () => navigateTo('archiv.html'));
    if (navAnalyse) navAnalyse.addEventListener('click', () => navigateTo('analyse.html'));

    // 11. DB initialisieren
    DB.init();
    const leserinId = await DB.initLeserin();
    IOManager.setReaderId(leserinId);
    if (DB.isConnected()) {
        showToast('Willkommen zurück — deine Spur wurde fortgesetzt', 'fa-bookmark');
    } else {
        showToast('Offline-Modus — Erinnerungen bleiben lokal', 'fa-wifi');
    }

    // 12. Zustand beim Verlassen speichern
    window.addEventListener('beforeunload', () => {
        const fragments = FragmentSelector.getSelectedArray();
        const page = StoryEngine.getCurrentPageNumber();
        const memoryState = MemoryEngine.serialize();
        DB.saveState(fragments, page, memoryState);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLesen);
} else {
    initLesen();
}
