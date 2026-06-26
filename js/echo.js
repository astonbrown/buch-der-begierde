/**
 * echo.js — Echo-Engine (Canvas-basierte Resonanz-Visualisierung)
 *
 * Trackt Interaktionen der LeserIn (Klicks, Scroll, Zeit, Fragment-Änderungen)
 * und visualisiert sie als federphysik-animierte Bars auf einem Canvas.
 * Die Metriken (Resonanz, Tiefe, Drift) werden berechnet und
 * über einen Callback an den Entry-Point gemeldet.
 */

import { CONFIG } from './config.js';

const EchoEngine = (() => {
    let _canvas = null;
    let _ctx = null;
    let _bars = [];
    let _animId = null;
    let _metricsCallback = null;

    /* --- Interaktions-Tracker -------------------------------------- */

    const interactions = {
        clicks: 0,
        scrollDistance: 0,
        timeOnPage: 0,
        fragmentChanges: 0,
        _lastScroll: 0,
        _timeInterval: null
    };

    let _clickHandler = null;
    let _scrollHandler = null;
    let _metricsInterval = null;

    /* --- Helpers --------------------------------------------------- */

    function _initTracking() {
        // Klicks zählen
        _clickHandler = () => { interactions.clicks++; };
        document.addEventListener('click', _clickHandler);

        // Scroll-Distanz messen
        _scrollHandler = () => {
            const y = window.scrollY;
            interactions.scrollDistance += Math.abs(y - interactions._lastScroll);
            interactions._lastScroll = y;
        };
        window.addEventListener('scroll', _scrollHandler);

        // Zeit zählen (alle 1000ms)
        interactions._timeInterval = setInterval(() => {
            interactions.timeOnPage++;
        }, 1000);
    }

    function _stopTracking() {
        // Entferne Event-Listener
        if (_clickHandler) {
            document.removeEventListener('click', _clickHandler);
            _clickHandler = null;
        }
        if (_scrollHandler) {
            window.removeEventListener('scroll', _scrollHandler);
            _scrollHandler = null;
        }
        // Stoppe Timer
        if (interactions._timeInterval) {
            clearInterval(interactions._timeInterval);
            interactions._timeInterval = null;
        }
    }

    /* --- Canvas Setup ---------------------------------------------- */

    function _setupCanvas(canvasId) {
        _canvas = document.getElementById(canvasId);
        if (!_canvas) {
            console.warn('[Echo] Canvas nicht gefunden:', canvasId);
            return false;
        }

        _ctx = _canvas.getContext('2d');

        // Retina-Support
        const dpr = window.devicePixelRatio || 1;
        const rect = _canvas.getBoundingClientRect();
        _canvas.width = rect.width * dpr;
        _canvas.height = rect.height * dpr;
        _ctx.scale(dpr, dpr);

        // Bars initialisieren
        _bars = [];
        for (let i = 0; i < CONFIG.ECHO_BAR_COUNT; i++) {
            _bars.push({
                height: 5,
                target: 5,
                velocity: 0
            });
        }

        return true;
    }

    /* --- Render-Schleife ------------------------------------------- */

    function _updateTargets() {
        // Intensitäts-Berechnung aus Interaktionen
        const clickIntensity = Math.min(interactions.clicks * 0.05, 1.0);
        const scrollIntensity = Math.min(interactions.scrollDistance * 0.0001, 0.5);
        const fragmentIntensity = Math.min(interactions.fragmentChanges * 0.2, 1.0);
        const timeIntensity = Math.min(interactions.timeOnPage * 0.002, 0.3);

        const totalIntensity = clickIntensity + scrollIntensity + fragmentIntensity + timeIntensity;
        const normalised = Math.min(totalIntensity / 2.5, 1.0);

        _bars.forEach((bar, i) => {
            // Sinuswelle für organische Bewegung
            const wave = 0.5 + 0.5 * Math.sin(i * 0.3 + Date.now() * 0.002);
            bar.target = 5 + normalised * 55 * wave + Math.random() * 3;
        });
    }

    function _calculateMetrics() {
        const fragmentCount = interactions.fragmentChanges;
        const clickCount = interactions.clicks;
        const scrollAmount = interactions.scrollDistance;

        const resonanz = Math.min(1.0, 0.3 + fragmentCount * 0.12 + clickCount * 0.02 +
                                  Math.min(scrollAmount * 0.00005, 0.2));
        const tiefe = Math.min(1.0, 0.1 + fragmentCount * 0.08 +
                               Math.min(clickCount * 0.01, 0.15) +
                               Math.min(interactions.timeOnPage * 0.001, 0.1));
        const drift = Math.min(1.0, 0.05 + Math.random() * 0.15 +
                                Math.min(scrollAmount * 0.00002, 0.15));

        if (_metricsCallback) {
            _metricsCallback({
                resonanz: resonanz.toFixed(2),
                tiefe: tiefe.toFixed(2),
                drift: drift.toFixed(2)
            });
        }
    }

    function _render() {
        if (!_ctx || !_canvas) return;

        const w = _canvas.getBoundingClientRect().width;
        const h = _canvas.getBoundingClientRect().height;

        _ctx.clearRect(0, 0, w, h);

        const barWidth = Math.max(1, (w - _bars.length * 2) / _bars.length);

        _bars.forEach((bar, i) => {
            // Federphysik: sanfte Annäherung ans Target
            const spring = (bar.target - bar.height) * 0.08;
            bar.velocity = (bar.velocity + spring) * 0.85;  // Dämpfung
            bar.height = Math.max(3, bar.height + bar.velocity);

            // Farbgradient von accent (oben) nach gold-dim (unten)
            const gradient = _ctx.createLinearGradient(
                0, h - bar.height, 0, h
            );
            gradient.addColorStop(0, 'rgba(196, 70, 58, 0.9)');
            gradient.addColorStop(0.6, 'rgba(184, 148, 62, 0.6)');
            gradient.addColorStop(1, 'rgba(184, 148, 62, 0.3)');

            _ctx.fillStyle = gradient;
            _ctx.fillRect(
                i * (barWidth + 2),
                h - bar.height,
                barWidth,
                bar.height
            );
        });

        _updateTargets();
        _animId = requestAnimationFrame(_render);
    }

    /* --- Öffentliche API ------------------------------------------- */

    /**
     * Initialisiert die Echo-Engine.
     * @param {string} canvasId - ID des Canvas-Elements
     * @param {Function} metricsCallback - Callback für Metriken-Update
     * @returns {boolean}
     */
    function init(canvasId, metricsCallback) {
        _metricsCallback = metricsCallback || null;
        const ok = _setupCanvas(canvasId);
        if (!ok) return false;

        _initTracking();
        _animId = requestAnimationFrame(_render);

        // Metriken alle 600ms berechnen
        _metricsInterval = setInterval(_calculateMetrics, 600);

        return true;
    }

    /**
     * Wird aufgerufen wenn ein Fragment hinzugefügt/entfernt wird.
     */
    function onFragmentChange() {
        interactions.fragmentChanges++;
    }

    /**
     * Beendet die Echo-Engine.
     */
    function destroy() {
        if (_animId) cancelAnimationFrame(_animId);
        _animId = null;
        _stopTracking();
        if (_metricsInterval) {
            clearInterval(_metricsInterval);
            _metricsInterval = null;
        }
        _bars = [];
        _ctx = null;
        _canvas = null;
    }

    /**
     * Gibt die aktuellen Interaktionsdaten zurück.
     * @returns {object}
     */
    function getInteractions() {
        return { ...interactions, _lastScroll: undefined, _timeInterval: undefined };
    }

    return Object.freeze({
        init, onFragmentChange, destroy, getInteractions
    });
})();

export default EchoEngine;
