/**
 * hoeren.js — Hören-Engine (Web Speech Synthesis API)
 *
 * Liest den Story-Text vor. Unterstützt Pause/Resume/Stop, Geschwindigkeits-
 * und Tonhöhenregelung sowie Auswahl einer passenden deutschen Stimme.
 *
 * Status-Callbacks erlauben der UI, Wiedergabe-Zustände zu reflektieren.
 *
 * Hinweis: Text-to-Speech ist asynchron und browserabhängig. Die Engine
 * kapselt alle Eigenheiten der speechSynthesis-API.
 */

import { showToast } from './toast.js';

const HoerenEngine = (() => {
    let _synth = null;
    let _utterance = null;
    let _voice = null;
    let _listeners = [];
    let _supported = false;

    /* Status-Objekt (für UI-Bindung) */
    const _status = {
        speaking: false,
        paused: false,
        text: '',
        rate: 0.9,        // 0.1 – 10
        pitch: 0.85,      // 0 – 2
        voiceName: null
    };

    function _emit(event, data) {
        _listeners.forEach(fn => {
            try { fn(event, data); } catch (e) { console.warn('[Hoeren] Listener error:', e); }
        });
    }

    /**
     * Wählt eine passende deutsche Stimme aus.
     * Bevorzugt weibliche Stimmen für das literarische Erlebnis.
     */
    function _selectVoice() {
        if (!_synth) return;
        const voices = _synth.getVoices();
        if (voices.length === 0) return;

        // 1. Versuch: deutsche Stimme
        const german = voices.filter(v => v.lang.startsWith('de'));
        if (german.length > 0) {
            // Bevorzuge nicht-locale (de-DE) und angenehm klingende Stimmen
            const preferred = german.find(v => v.name.includes('Google')) ||
                              german.find(v => v.lang === 'de-DE') ||
                              german[0];
            _voice = preferred;
            _status.voiceName = preferred.name;
            return;
        }

        // 2. Fallback: erste verfügbare Stimme
        _voice = voices[0];
        _status.voiceName = voices[0].name;
    }

    /**
     * Initialisiert die Engine. Muss vor Nutzung aufgerufen werden.
     * @returns {boolean} true wenn TTS unterstützt wird
     */
    function init() {
        if (!('speechSynthesis' in window)) {
            console.warn('[Hoeren] Web Speech API nicht unterstützt');
            _supported = false;
            return false;
        }

        _synth = window.speechSynthesis;
        _supported = true;

        // Stimmen laden (asynchron in manchen Browsern)
        _selectVoice();
        if (_synth.onvoiceschanged !== undefined) {
            _synth.onvoiceschanged = _selectVoice;
        }

        return true;
    }

    /**
     * Liest einen Text vor.
     * @param {string} text - Der vorzulesende Text (HTML wird entfernt)
     */
    function speak(text) {
        if (!_supported) {
            showToast('Sprachausgabe wird von deinem Browser nicht unterstützt', 'fa-exclamation-triangle');
            return false;
        }
        if (!text || text.trim().length === 0) {
            showToast('Kein Text zum Vorlesen vorhanden', 'fa-exclamation-circle');
            return false;
        }

        // Eventuelle laufende Wiedergabe stoppen
        stop();

        // HTML-Tags entfernen für reines Sprach-Output
        const cleanText = text
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        _utterance = new SpeechSynthesisUtterance(cleanText);
        _utterance.lang = 'de-DE';
        _utterance.rate = _status.rate;
        _utterance.pitch = _status.pitch;

        if (_voice) _utterance.voice = _voice;

        // Event-Handler
        _utterance.onstart = () => {
            _status.speaking = true;
            _status.paused = false;
            _status.text = cleanText;
            _emit('speak:started', { text: cleanText });
        };

        _utterance.onend = () => {
            _status.speaking = false;
            _status.paused = false;
            _emit('speak:ended', {});
        };

        _utterance.onerror = (e) => {
            console.warn('[Hoeren] Sprachausgabe-Fehler:', e.error);
            _status.speaking = false;
            _status.paused = false;
            _emit('speak:error', { error: e.error });
        };

        _utterance.onpause = () => {
            _status.paused = true;
            _emit('speak:paused', {});
        };

        _utterance.onresume = () => {
            _status.paused = false;
            _emit('speak:resumed', {});
        };

        _synth.speak(_utterance);
        return true;
    }

    /**
     * Pausiert die Wiedergabe.
     */
    function pause() {
        if (!_synth || !_status.speaking) return;
        _synth.pause();
    }

    /**
     * Setzt die Wiedergabe fort.
     */
    function resume() {
        if (!_synth || !_status.paused) return;
        _synth.resume();
    }

    /**
     * Stoppt die Wiedergabe vollständig.
     */
    function stop() {
        if (!_synth) return;
        _synth.cancel();
        _status.speaking = false;
        _status.paused = false;
    }

    /* --- Einstellungen -------------------------------------------- */

    /**
     * Setzt die Sprechgeschwindigkeit.
     * @param {number} rate - 0.1 bis 10 (default 0.9)
     */
    function setRate(rate) {
        _status.rate = Math.max(0.1, Math.min(10, rate));
        _emit('config:changed', { rate: _status.rate });
    }

    /**
     * Setzt die Tonhöhe.
     * @param {number} pitch - 0 bis 2 (default 0.85)
     */
    function setPitch(pitch) {
        _status.pitch = Math.max(0, Math.min(2, pitch));
        _emit('config:changed', { pitch: _status.pitch });
    }

    /* --- Query ---------------------------------------------------- */

    function isSpeaking() { return _status.speaking; }
    function isPaused() { return _status.paused; }
    function isSupported() { return _supported; }
    function getStatus() { return { ..._status }; }
    function getAvailableVoices() {
        if (!_synth) return [];
        return _synth.getVoices().filter(v => v.lang.startsWith('de'));
    }

    function on(fn) { _listeners.push(fn); }
    function off(fn) { _listeners = _listeners.filter(l => l !== fn); }

    return Object.freeze({
        init, speak, pause, resume, stop,
        setRate, setPitch,
        isSpeaking, isPaused, isSupported, getStatus, getAvailableVoices,
        on, off
    });
})();

export default HoerenEngine;
