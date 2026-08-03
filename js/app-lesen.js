/**
 * app-lesen.js — Entry-Point für lesen.html (Video-Redesign)
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

function _renderMemoryNodes(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const nodes = MemoryEngine.getNodes();
  container.innerHTML = '';
  if (nodes.length === 0) {
    container.innerHTML = '<div class="memory-node"><span class="node-indicator empty"></span><div class="node-info"><div class="node-name">Noch keine Erinnerungen verankert</div></div></div>';
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
    info.innerHTML = `<div class="node-name">${node.name}</div><div class="node-detail">${node.type.toUpperCase()} · ${node.source}</div>`;
    const weight = document.createElement('span');
    weight.classList.add('node-weight');
    weight.textContent = node.weight.toFixed(2);
    el.appendChild(indicator);
    el.appendChild(info);
    el.appendChild(weight);
    container.appendChild(el);
  });
}

function _renderStoryText(textEl, indicatorEl) {
  if (!textEl) return;
  const fragments = FragmentSelector.getSelected();
  textEl.style.opacity = '0';
  textEl.style.transform = 'translateY(6px)';
  setTimeout(() => {
    textEl.innerHTML = StoryEngine.renderText(fragments);
    textEl.style.opacity = '1';
    textEl.style.transform = 'translateY(0)';
    if (indicatorEl) {
      indicatorEl.textContent = `Seite ${StoryEngine.getCurrentPageNumber()} / ${StoryEngine.getTotalPages()}`;
    }
  }, 300);
}

async function initLesen() {
  createParticles('particles');
  initFadeInObserver();
  initPanelGlow('.panel');

  StoryEngine.loadPages(STORY_PAGES);
  StoryEngine.navigate('page_47');

  const storyTextEl = document.getElementById('geschichtsText');
  const pageIndicator = document.getElementById('pageIndicator');
  _renderStoryText(storyTextEl, pageIndicator);

  MemoryEngine.startDecay();
  const memoryContainerId = 'memoryNodes';
  MemoryEngine.on((event) => {
    if (['node:created','node:reinforced','memory:decayed','memory:restored'].includes(event)) {
      _renderMemoryNodes(memoryContainerId);
    }
  });
  _renderMemoryNodes(memoryContainerId);

  EchoEngine.init('echoCanvas', (metrics) => {
    const r = document.getElementById('metricResonanz');
    const t = document.getElementById('metricTiefe');
    const d = document.getElementById('metricDrift');
    if (r) r.textContent = metrics.resonanz;
    if (t) t.textContent = metrics.tiefe;
    if (d) d.textContent = metrics.drift;
  });

  FragmentSelector.init('.fragment-tag', 'intensitySlider', 'intensityValue');
  FragmentSelector.on((event) => {
    if (event === 'fragment:selected' || event === 'fragment:deselected') {
      _renderStoryText(storyTextEl, pageIndicator);
    }
  });

  IOManager.init({ textareaId: 'eingabeText', charCountId: 'charCount', timeStampId: 'timeStamp', readerIdId: 'readerId' });
  IOManager.on(() => _renderMemoryNodes(memoryContainerId));

  QRScanner.init({ viewportId: 'qrViewport', patternId: 'qrPattern', scanLineId: 'qrScanLine', statusId: 'qrStatus' });

  document.getElementById('btnNext')?.addEventListener('click', () => {
    const page = StoryEngine.nextBranch(FragmentSelector.getSelected());
    if (page) { _renderStoryText(storyTextEl, pageIndicator); showToast('Seite ' + page.number, 'book'); }
    else { showToast('Ende des Kapitels', 'flag'); }
  });
  document.getElementById('btnPrev')?.addEventListener('click', () => {
    const page = StoryEngine.back();
    if (page) _renderStoryText(storyTextEl, pageIndicator);
    else showToast('Bereits am Anfang', 'info');
  });
  document.getElementById('btnSubmit')?.addEventListener('click', () => { IOManager.submit(); _renderMemoryNodes(memoryContainerId); });
  document.getElementById('btnClear')?.addEventListener('click', () => IOManager.clearInput());
  document.getElementById('btnFortsetzen')?.addEventListener('click', () => {
    IOManager.fortsetzen(() => {
      const page = StoryEngine.nextBranch(FragmentSelector.getSelected());
      if (page) { _renderStoryText(storyTextEl, pageIndicator); showToast('Seite ' + page.number, 'book'); }
    });
  });

  document.getElementById('navHoeren')?.addEventListener('click', (e) => { e.preventDefault(); navigateTo('hoeren.html'); });
  document.getElementById('navSchreiben')?.addEventListener('click', (e) => { e.preventDefault(); navigateTo('schreiben.html'); });
  document.getElementById('navArchiv')?.addEventListener('click', (e) => { e.preventDefault(); navigateTo('archiv.html'); });

  DB.init();
  const leserinId = await DB.initLeserin();
  IOManager.setReaderId(leserinId);
  if (DB.isConnected()) showToast('Willkommen zurück', 'bookmark');
  else showToast('Offline-Modus', 'wifi');

  window.addEventListener('beforeunload', () => {
    DB.saveState(FragmentSelector.getSelectedArray(), StoryEngine.getCurrentPageNumber(), MemoryEngine.serialize());
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLesen);
} else {
  initLesen();
}