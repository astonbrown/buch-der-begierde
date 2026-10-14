/**
 * app-archiv.js — Entry-Point für archiv.html
 *
 * Gedächtnis-Archiv: Visualisiert alle Memory-Knoten als Liste und
 * als Graph (Knoten + Verbindungen). Erlaubt Export des State als JSON.
 *
 * Da das Archiv nur den Memory-Zustand der aktuellen Session anzeigt,
 * initialisiert es Memory nicht neu, sondern liest den bestehenden Stand.
 * Für Persistenz über Sessions muss der State via DB geladen werden.
 */

import { createParticles, initFadeInObserver } from './atmosphere.js';
import { showToast } from './toast.js';
import { navigateTo } from './navigation.js';
import MemoryEngine from './memory.js';
import DB from './db.js';

/* ------------------------------------------------------------------
   Renderer: Liste aller Knoten
   ------------------------------------------------------------------ */
function _renderNodeList(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const nodes = MemoryEngine.getNodes();
    container.innerHTML = '';

    if (nodes.length === 0) {
        container.innerHTML =
            '<p class="archive-empty">Noch keine Erinnerungen in diesem Gedächtnis.</p>';
        return;
    }

    nodes.forEach(node => {
        const card = document.createElement('div');
        card.classList.add('archive-card');

        // Zustands-Klasse für Farbcodierung
        const stateClass = node.state;

        const header = document.createElement('div');
        header.classList.add('archive-card-header');

        const dot = document.createElement('span');
        dot.classList.add('archive-dot', stateClass);

        const typeEl = document.createElement('span');
        typeEl.classList.add('archive-type');
        typeEl.textContent = node.type.toUpperCase();

        const sourceEl = document.createElement('span');
        sourceEl.classList.add('archive-source');
        sourceEl.textContent = node.source;

        header.appendChild(dot);
        header.appendChild(typeEl);
        header.appendChild(sourceEl);

        const nameEl = document.createElement('div');
        nameEl.classList.add('archive-name');
        nameEl.textContent = node.name; // textContent → XSS-Schutz

        const meta = document.createElement('div');
        meta.classList.add('archive-meta');

        const weightSpan = document.createElement('span');
        weightSpan.textContent = `Gewicht: ${node.weight.toFixed(2)}`;

        const accessSpan = document.createElement('span');
        accessSpan.textContent = `Zugriffe: ${node.accessCount}`;

        const createdSpan = document.createElement('span');
        createdSpan.textContent = `Erstellt: ${new Date(node.created).toLocaleString('de-DE')}`;

        meta.appendChild(weightSpan);
        meta.appendChild(accessSpan);
        meta.appendChild(createdSpan);

        card.appendChild(header);
        card.appendChild(nameEl);
        card.appendChild(meta);
        container.appendChild(card);
    });
}

/* ------------------------------------------------------------------
   Renderer: Statistik-Summary (IDs aus archiv.html)
   ------------------------------------------------------------------ */
function _renderSummary() {
    const nodes = MemoryEngine.getNodes();
    const connections = MemoryEngine.getConnections();
    const avg = MemoryEngine.getAverageWeight();

    const nodeCountEl = document.getElementById('archivNodeCount');
    if (nodeCountEl) nodeCountEl.textContent = String(nodes.length);

    const connCountEl = document.getElementById('archivConnectionCount');
    if (connCountEl) connCountEl.textContent = String(connections.length);

    const avgEl = document.getElementById('archivAverageWeight');
    if (avgEl) avgEl.textContent = avg.toFixed(2);

    // Speichergröße (approximiert)
    const storageEl = document.getElementById('archivStorageSize');
    if (storageEl) {
        try {
            const serialized = JSON.stringify(MemoryEngine.serialize());
            const bytes = new Blob([serialized]).size;
            storageEl.textContent = bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
        } catch {
            storageEl.textContent = '—';
        }
    }
}

/* ------------------------------------------------------------------
   Export als JSON
   ------------------------------------------------------------------ */
function _exportState() {
    const state = MemoryEngine.serialize();
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'gedaechtnis-export-' + new Date().toISOString().split('T')[0] + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Gedächtnis exportiert', 'fa-download');
}

/* ------------------------------------------------------------------
   Init
   ------------------------------------------------------------------ */
async function initArchiv() {
    createParticles('particles');
    initFadeInObserver();

    // Versuche gespeicherten State aus DB zu laden
    DB.init();
    await DB.initLeserin();

    const saved = await DB.loadState();
    if (saved && saved.memory_state && saved.memory_state.nodes) {
        MemoryEngine.deserialize(saved.memory_state);
        showToast('Gespeichertes Gedächtnis geladen', 'fa-archive');
    } else {
        showToast('Kein gespeichertes Gedächtnis gefunden', 'fa-info-circle');
    }

    _renderNodeList('archivNodeList');
    _renderSummary();

    // Export-Button (ID korrigiert laut HTML)
    const btnExport = document.getElementById('btnArchivExport');
    if (btnExport) btnExport.addEventListener('click', _exportState);

    // Reset-Button
    const btnReset = document.getElementById('btnReset');
    if (btnReset) btnReset.addEventListener('click', () => {
        MemoryEngine.reset();
        _renderNodeList('archivNodeList');
        _renderSummary();
        showToast('Gedächtnis zurückgesetzt', 'fa-trash-alt');
    });

    // Navigation
    const btnBack = document.getElementById('btnBack');
    if (btnBack) btnBack.addEventListener('click', () => navigateTo('lesen.html'));
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initArchiv);
} else {
    initArchiv();
}
