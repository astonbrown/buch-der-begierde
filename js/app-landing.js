/**
 * app-landing.js — Entry-Point für index.html
 *
 * Initialisiert Atmosphäre, Partikel und die Menu-Buttons
 * (Lesen, Hören, Schreiben) mit Page-Transition-Navigation.
 */

import { createParticles, initFadeInObserver } from './atmosphere.js';
import { navigateTo } from './navigation.js';

function initLanding() {
    createParticles('particles');
    initFadeInObserver();

    // Menu-Buttons mit Page-Transition verknüpfen
    const btnLesen = document.getElementById('menuLesen');
    const btnHoeren = document.getElementById('menuHoeren');
    const btnSchreiben = document.getElementById('menuSchreiben');
    const btnArchiv = document.getElementById('menuArchiv');

    if (btnLesen) btnLesen.addEventListener('click', () => navigateTo('lesen.html'));
    if (btnHoeren) btnHoeren.addEventListener('click', () => navigateTo('hoeren.html'));
    if (btnSchreiben) btnSchreiben.addEventListener('click', () => navigateTo('schreiben.html'));
    if (btnArchiv) btnArchiv.addEventListener('click', () => navigateTo('archiv.html'));

    // Logo-Klick → zurück zur Landing
    const logo = document.getElementById('logoLink');
    if (logo) {
        logo.addEventListener('click', (e) => {
            e.preventDefault();
            // bereits auf der Landing — nur sanft nach oben scrollen
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanding);
} else {
    initLanding();
}
