/**
 * app-schreiben.js — Entry-Point für schreiben.html
 *
 * Schreib-Modul: Erweitertes Eingabepanel mit Fragment-basierten
 * Textvorschlägen und Resonanz-Analyse. Verknüpft Eingaben mit
 * Memory-Knoten.
 */

import { createParticles, initFadeInObserver, initPanelGlow } from './atmosphere.js';
import { showToast } from './toast.js';
import { navigateTo } from './navigation.js';
import SchreibenEngine from './schreiben.js';
import FragmentSelector, { FRAGMENT_DEFINITIONS } from './fragments.js';
import MemoryEngine from './memory.js';

function _renderFragmentChooser(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    Object.entries(FRAGMENT_DEFINITIONS).forEach(([type, def]) => {
        const tag = document.createElement('button');
        tag.classList.add('fragment-tag');
        tag.dataset.type = type;
        tag.textContent = def.label;
        tag.setAttribute('role', 'button');
        tag.setAttribute('tabindex', '0');

        const select = () => {
            container.querySelectorAll('.fragment-tag').forEach(t => t.classList.remove('selected'));
            tag.classList.add('selected');
            SchreibenEngine.setActiveFragment(type);
        };

        tag.addEventListener('click', select);
        tag.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                select();
            }
        });

        container.appendChild(tag);
    });
}

function initSchreiben() {
    createParticles('particles');
    initFadeInObserver();
    initPanelGlow('.panel');

    // Memory-Verfall starten
    MemoryEngine.startDecay();

    // Schreib-Engine initialisieren
    SchreibenEngine.init({
        textareaId: 'eingabeText',
        charCountId: 'charCount',
        suggestionsId: 'suggestionsList'
    });

    // Fragment-Wähler rendern
    _renderFragmentChooser('fragmentChooser');

    // Buttons
    const btnSubmit = document.getElementById('btnSubmit');
    const btnClear = document.getElementById('btnClear');
    if (btnSubmit) btnSubmit.addEventListener('click', () => SchreibenEngine.submit());
    if (btnClear) btnClear.addEventListener('click', () => SchreibenEngine.clearInput());

    // Feedback bei Submit
    SchreibenEngine.on((event, data) => {
        if (event === 'schreiben:submitted') {
            showToast(`Erinnerung verankert — ${data.resonances.length} Resonanzen`, 'fa-link');
        }
    });

    // Navigation
    const btnBack = document.getElementById('btnBack');
    if (btnBack) btnBack.addEventListener('click', () => navigateTo('lesen.html'));

    showToast('Wähle ein Fragment für Anregungen', 'fa-lightbulb');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSchreiben);
} else {
    initSchreiben();
}
