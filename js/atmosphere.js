/**
 * atmosphere.js — Atmosphärische Effekte
 * Erzeugt Partikel und stellt sicher, dass Grain-Overlay und
 * Atmosphäre-Container im DOM existieren.
 */

import { CONFIG } from './config.js';

/**
 * Erzeugt schwebende Goldpartikel im angegebenen Container.
 * @param {string} containerId - ID des Partikel-Containers
 * @param {number} count - Anzahl der Partikel (default aus CONFIG)
 */
export function createParticles(containerId, count) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const num = count || CONFIG.PARTICLE_COUNT;

    for (let i = 0; i < num; i++) {
        const p = document.createElement('div');
        p.classList.add('particle');

        p.style.left = Math.random() * 100 + '%';
        p.style.animationDuration =
            (CONFIG.PARTICLE_MIN_DURATION + Math.random() * (CONFIG.PARTICLE_MAX_DURATION - CONFIG.PARTICLE_MIN_DURATION)) + 's';
        p.style.animationDelay = (Math.random() * CONFIG.PARTICLE_MAX_DELAY) + 's';

        const size = (1 + Math.random() * 2) + 'px';
        p.style.width = size;
        p.style.height = size;

        container.appendChild(p);
    }
}

/**
 * Initialisiert Fade-In-Animation für Elemente mit der Klasse .fade-in.
 * Verwendet IntersectionObserver für Scroll-Reveal.
 */
export function initFadeInObserver() {
    const fadeEls = document.querySelectorAll('.fade-in');
    if (fadeEls.length === 0) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, i * 120);
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1 }
    );

    fadeEls.forEach((el) => observer.observe(el));
}

/**
 * Initialisiert den Maus-Lichteffekt auf Panels.
 * Erzeugt einen radialen Gradient, der der Maus folgt.
 * @param {string} selector - CSS-Selector für die Panels
 */
export function initPanelGlow(selector) {
    const panels = document.querySelectorAll(selector);
    panels.forEach((panel) => {
        panel.addEventListener('mousemove', (e) => {
            const rect = panel.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            panel.style.background =
                `radial-gradient(circle 200px at ${x}px ${y}px, rgba(184,148,62,0.03), transparent), var(--card)`;
        });

        panel.addEventListener('mouseleave', () => {
            panel.style.background = 'var(--card)';
        });
    });
}
