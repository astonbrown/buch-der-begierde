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
        card.innerHTML = `
            <div class="archive-card-header">
                <span class="archive-dot ${stateClass}"></span>
                <span class="archive-type">${node.type.toUpperCase()}</span>
                <span class="archive-source">${node.source}</span>
            </div>
            <div class="archive-name">${node.name}</div>
            <div class="archive-meta">
                <span>Gewicht: ${node.weight.toFixed(2)}</span>
                <span>Zugriffe: ${node.accessCount}</span>
                <span>Erstellt: ${new Date(node.created).toLocaleString('de-DE')}</span>
            </div>
        `;
        container.appendChild(card);
    });
}

/* ------------------------------------------------------------------
   Renderer: Statistik-Summary
   ------------------------------------------------------------------ */
function _renderSummary(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const nodes = MemoryEngine.getNodes();
    const connections = MemoryEngine.getConnections();
    const avg = MemoryEngine.getAverageWeight();

    const byType = {};
    nodes.forEach(n => { byType[n.type] = (byType[n.type] || 0) + 1; });

    container.innerHTML = `
        <div class="summary-item">
            <div class="summary-value">${nodes.length}</div>
            <div class="summary-label">Knoten</div>
        </div>
        <div class="summary-item">
            <div class="summary-value">${connections.length}</div>
            <div class="summary-label">Verknüpfungen</div>
        </div>
        <div class="summary-item">
            <div class="summary-value">${avg.toFixed(2)}</div>
            <div class="summary-label">Ø Gewicht</div>
        </div>
        <div class="summary-item">
            <div class="summary-value">${byType.emotional || 0}</div>
            <div class="summary-label">Emotional</div>
        </div>
    `;
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

    _renderNodeList('archiveList');
    _renderSummary('archiveSummary');

    // Export-Button
    const btnExport = document.getElementById('btnExport');
    if (btnExport) btnExport.addEventListener('click', _exportState);

    // Reset-Button
    const btnReset = document.getElementById('btnReset');
    if (btnReset) btnReset.addEventListener('click', () => {
        MemoryEngine.reset();
        _renderNodeList('archiveList');
        _renderSummary('archiveSummary');
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
