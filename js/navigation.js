/**
 * navigation.js — Navigations-Utilities
 * Scroll-Spy, Page-Transition, Smooth-Scroll
 */

import { CONFIG } from './config.js';

/**
 * Führt einen page-transition-basierten Seitenwechsel durch.
 * Blendet das gesamte Bild aus, navigiert dann zur Ziel-URL.
 * @param {string} url - Ziel-URL
 */
export function navigateTo(url) {
    const transition = document.getElementById('pageTransition');
    if (transition) {
        transition.classList.add('active');
        setTimeout(() => {
            window.location.href = url;
        }, 800);
    } else {
        window.location.href = url;
    }
}

/**
 * Initialisiert den Scroll-Spy für die interne Navigation.
 * Markiert den aktiven Nav-Link basierend auf der Scroll-Position.
 * @param {string[]} sectionIds - IDs der Sektionen, die überwacht werden sollen
 */
export function initScrollSpy(sectionIds) {
    const navLinks = document.querySelectorAll('nav a');
    if (navLinks.length === 0 || sectionIds.length === 0) return;

    window.addEventListener('scroll', () => {
        let current = '';

        sectionIds.forEach((id) => {
            const el = document.getElementById(id);
            if (el && el.getBoundingClientRect().top < 200) {
                current = id;
            }
        });

        navLinks.forEach((link) => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
}

/**
 * Registriert Click-Handler auf Nav-Links für smooth scrolling.
 * @param {string} navSelector - CSS-Selector der Navigation
 * @param {string} linkSelector - CSS-Selector der Links innerhalb der Nav
 */
export function initSmoothScroll(navSelector, linkSelector) {
    const nav = document.querySelector(navSelector);
    if (!nav) return;

    nav.querySelectorAll(linkSelector || 'a').forEach((link) => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });
}

/**
 * Setzt die DB-Status-Anzeige im Header.
 * @param {boolean} ok - true = verbunden
 */
export function setDbStatus(ok) {
    const dot = document.getElementById('dbDot');
    const label = document.getElementById('dbLabel');
    if (!dot || !label) return;

    if (ok) {
        dot.classList.add('connected');
        label.textContent = 'VERBUNDEN';
        label.style.color = 'var(--db-ok)';
    } else {
        dot.classList.remove('connected');
        label.textContent = 'OFFLINE';
        label.style.color = 'var(--fg-muted)';
    }
}
