/**
 * app-hoeren.js — Entry-Point für hoeren.html
 *
 * Hören-Modul: Liest die aktuelle Story-Seite vor über die
 * Web Speech Synthesis API. Steuerung: Play/Pause/Resume/Stop,
 * Geschwindigkeit und Tonhöhe.
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

    // Story-Seiten laden und erste Seite anzeigen
    StoryEngine.loadPages(STORY_PAGES);
    StoryEngine.navigate('page_47');

    // Hören-Engine initialisieren
    const supported = HoerenEngine.init();
    if (!supported) {
        showToast('Sprachausgabe wird nicht unterstützt', 'fa-exclamation-triangle');
    }

    // UI-Elemente referenzieren
    const btnPlay = document.getElementById('btnPlay');
    const btnPause = document.getElementById('btnPause');
    const btnResume = document.getElementById('btnResume');
    const btnStop = document.getElementById('btnStop');
    const rateSlider = document.getElementById('rateSlider');
    const rateValue = document.getElementById('rateValue');
    const pitchSlider = document.getElementById('pitchSlider');
    const pitchValue = document.getElementById('pitchValue');
    const statusEl = document.getElementById('hoerenStatus');
    const textPreview = document.getElementById('textPreview');

    // Aktuelle Story aktualisieren
    function _refreshPreview() {
        const text = StoryEngine.renderText(new Set());
        if (textPreview) {
            // Plain-Text-Vorschau (HTML entfernen)
            textPreview.innerHTML = text;
        }
    }
    _refreshPreview();

    // Status-Anzeige aktualisieren
    HoerenEngine.on((event, data) => {
        if (statusEl) {
            if (event === 'speak:started') {
                statusEl.textContent = '▶ Liest vor...';
                statusEl.style.color = 'var(--accent)';
            } else if (event === 'speak:paused') {
                statusEl.textContent = '⏸ Pausiert';
                statusEl.style.color = 'var(--gold)';
            } else if (event === 'speak:resumed') {
                statusEl.textContent = '▶ Liest vor...';
                statusEl.style.color = 'var(--accent)';
            } else if (event === 'speak:ended') {
                statusEl.textContent = '■ Bereit';
                statusEl.style.color = 'var(--fg-muted)';
            } else if (event === 'speak:error') {
                statusEl.textContent = '⚠ Fehler';
                statusEl.style.color = 'var(--db-err)';
            }
        }
    });

    // Buttons verknüpfen
    if (btnPlay) {
        btnPlay.addEventListener('click', () => {
            const text = StoryEngine.renderText(new Set());
            HoerenEngine.speak(text);
        });
    }
    if (btnPause) btnPause.addEventListener('click', () => HoerenEngine.pause());
    if (btnResume) btnResume.addEventListener('click', () => HoerenEngine.resume());
    if (btnStop) btnStop.addEventListener('click', () => HoerenEngine.stop());

    // Slider
    if (rateSlider && rateValue) {
        rateSlider.addEventListener('input', () => {
            const v = parseFloat(rateSlider.value);
            HoerenEngine.setRate(v);
            rateValue.textContent = v.toFixed(1);
        });
    }
    if (pitchSlider && pitchValue) {
        pitchSlider.addEventListener('input', () => {
            const v = parseFloat(pitchSlider.value);
            HoerenEngine.setPitch(v);
            pitchValue.textContent = v.toFixed(2);
        });
    }

    // Navigation
    const btnBack = document.getElementById('btnBack');
    if (btnBack) btnBack.addEventListener('click', () => navigateTo('lesen.html'));
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHoeren);
} else {
    initHoeren();
}
