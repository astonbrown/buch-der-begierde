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
        header.appendChild(dot);

        const typeSpan = document.createElement('span');
        typeSpan.classList.add('archive-type');
        typeSpan.textContent = node.type.toUpperCase();
        header.appendChild(typeSpan);

        const sourceSpan = document.createElement('span');
        sourceSpan.classList.add('archive-source');
        sourceSpan.textContent = node.source;
        header.appendChild(sourceSpan);

        card.appendChild(header);

        const nameDiv = document.createElement('div');
        nameDiv.classList.add('archive-name');
        nameDiv.textContent = node.name;
        card.appendChild(nameDiv);

        const meta = document.createElement('div');
        meta.classList.add('archive-meta');

        const metaWeight = document.createElement('span');
        metaWeight.textContent = 'Gewicht: ' + node.weight.toFixed(2);
        meta.appendChild(metaWeight);

        const metaAccess = document.createElement('span');
        metaAccess.textContent = 'Zugriffe: ' + node.accessCount;
        meta.appendChild(metaAccess);

        const metaCreated = document.createElement('span');
        metaCreated.textContent = 'Erstellt: ' + new Date(node.created).toLocaleString('de-DE');
        meta.appendChild(metaCreated);

        card.appendChild(meta);
        container.appendChild(card);
    });
}

/* ------------------------------------------------------------------
   Renderer: Statistik-Summary
   ------------------------------------------------------------------ */
function _renderSummary() {
    const nodes = MemoryEngine.getNodes();
    const connections = MemoryEngine.getConnections();
    const avg = MemoryEngine.getAverageWeight();

    const byType = {};
    nodes.forEach(n => { byType[n.type] = (byType[n.type] || 0) + 1; });

    const elNodeCount = document.getElementById('archivNodeCount');
    const elConnCount = document.getElementById('archivConnectionCount');
    const elAvgWeight = document.getElementById('archivAverageWeight');
    const elStorageSize = document.getElementById('archivStorageSize');

    if (elNodeCount) elNodeCount.textContent = nodes.length;
    if (elConnCount) elConnCount.textContent = connections.length;
    if (elAvgWeight) elAvgWeight.textContent = avg.toFixed(2);
    if (elStorageSize) {
        const jsonSize = JSON.stringify(MemoryEngine.serialize()).length;
        elStorageSize.textContent = jsonSize > 1024 ? (jsonSize / 1024).toFixed(1) + ' KB' : jsonSize + ' B';
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

    // Export-Button
    const btnExport = document.getElementById('btnArchivExport');
    if (btnExport) btnExport.addEventListener('click', _exportState);

    // Reset-Button (wenn vorhanden)
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
