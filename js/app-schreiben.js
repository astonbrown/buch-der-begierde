/**
 * app-schreiben.js — Entry-Point für schreiben.html (Video-Redesign)
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
    const select = () => {
      container.querySelectorAll('.fragment-tag').forEach(t => t.classList.remove('selected'));
      tag.classList.add('selected');
      SchreibenEngine.setActiveFragment(type);
    };
    tag.addEventListener('click', select);
    tag.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(); } });
    container.appendChild(tag);
  });
}

function initSchreiben() {
  createParticles('particles');
  initFadeInObserver();
  initPanelGlow('.panel');

  MemoryEngine.startDecay();
  SchreibenEngine.init({ textareaId: 'eingabeText', charCountId: 'charCount', suggestionsId: 'suggestionsList' });
  _renderFragmentChooser('fragmentChooser');

  document.getElementById('btnSubmit')?.addEventListener('click', () => SchreibenEngine.submit());
  document.getElementById('btnClear')?.addEventListener('click', () => SchreibenEngine.clearInput());

  SchreibenEngine.on((event, data) => {
    if (event === 'schreiben:submitted') {
      showToast(`Erinnerung verankert — ${data.resonances.length} Resonanzen`, 'link');
    }
  });

  document.getElementById('btnBack')?.addEventListener('click', () => navigateTo('lesen.html'));
  showToast('Wähle ein Fragment für Anregungen', 'lightbulb');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSchreiben);
} else {
  initSchreiben();
}