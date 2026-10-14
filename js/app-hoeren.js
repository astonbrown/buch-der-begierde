/**
 * app-hoeren.js — Entry-Point für hoeren.html (Video-Redesign)
 */

import { createParticles, initFadeInObserver } from './atmosphere.js';
import { showToast } from './toast.js';
import { navigateTo } from './navigation.js';
import HoerenEngine from './hoeren.js';
import StoryEngine from './story.js';
import { STORY_PAGES } from '../data/story-data.js';

function initHoeren() {
  createParticles('particles');
  initFadeInObserver();

  StoryEngine.loadPages(STORY_PAGES);
  StoryEngine.navigate('page_47');

  const supported = HoerenEngine.init();
  if (!supported) showToast('Sprachausgabe nicht unterstützt', 'warning');

  const textPreview = document.getElementById('textPreview');
  const statusEl = document.getElementById('hoerenStatus');

  function _refreshPreview() {
    if (textPreview) textPreview.innerHTML = StoryEngine.renderText(new Set());
  }
  _refreshPreview();

  HoerenEngine.on((event) => {
    if (!statusEl) return;
    const map = {
      'speak:started': ['▶ Liest vor...', 'var(--accent)'],
      'speak:paused': ['⏸ Pausiert', 'var(--gold)'],
      'speak:resumed': ['▶ Liest vor...', 'var(--accent)'],
      'speak:ended': ['■ Bereit', 'var(--ink-muted)'],
      'speak:error': ['⚠ Fehler', 'var(--db-err)']
    };
    if (map[event]) { statusEl.textContent = map[event][0]; statusEl.style.color = map[event][1]; }
  });

  document.getElementById('btnPlay')?.addEventListener('click', () => HoerenEngine.speak(StoryEngine.renderText(new Set())));
  document.getElementById('btnPause')?.addEventListener('click', () => HoerenEngine.pause());
  document.getElementById('btnResume')?.addEventListener('click', () => HoerenEngine.resume());
  document.getElementById('btnStop')?.addEventListener('click', () => HoerenEngine.stop());

  const rateSlider = document.getElementById('rateSlider');
  const rateValue = document.getElementById('rateValue');
  if (rateSlider && rateValue) {
    rateSlider.addEventListener('input', () => {
      HoerenEngine.setRate(parseFloat(rateSlider.value));
      rateValue.textContent = parseFloat(rateSlider.value).toFixed(1) + 'x';
    });
  }

  const pitchSlider = document.getElementById('pitchSlider');
  const pitchValue = document.getElementById('pitchValue');
  if (pitchSlider && pitchValue) {
    pitchSlider.addEventListener('input', () => {
      HoerenEngine.setPitch(parseFloat(pitchSlider.value));
      pitchValue.textContent = parseFloat(pitchSlider.value).toFixed(1);
    });
  }

  document.getElementById('btnBack')?.addEventListener('click', () => navigateTo('lesen.html'));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHoeren);
} else {
  initHoeren();
}