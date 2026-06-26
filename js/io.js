/**
 * io.js — Eingabe-Panel ("Eingabe — Panel")
 *
 * Verwaltet die Texteingabe der LeserIn, verknüpft Eingaben mit
 * Memory-Knoten und integriert die Zeichen-/Zeit-/LeserIn-Anzeige.
 *
 * Eine bestätigte Eingabe erzeugt einen neuen EMOTIONAL-Memory-Knoten
 * und wird in der Datenbank gespeichert.
 */

import { CONFIG } from './config.js';
import { showToast } from './toast.js';
import MemoryEngine from './memory.js';
import DB from './db.js';

const IOManager = (() => {
    let _textareaEl = null;
    let _charCountEl = null;
    let _timeStampEl = null;
    let _readerIdEl = null;
    let _timeInterval = null;
    let _listeners = [];
    let _pendingText = '';

    function _emit(event, data) {
        _listeners.forEach(fn => {
            try { fn(event, data); } catch (e) { console.warn('[IO] Listener error:', e); }
        });
    }

    /**
     * Aktualisiert die Zeit-Anzeige im Format DD.MM.YYYY — HH:MM:SS.
     */
    function _updateTime() {
        if (!_timeStampEl) return;
        const now = new Date();
        const tag = String(now.getDate()).padStart(2, '0');
        const monat = String(now.getMonth() + 1).padStart(2, '0');
        const jahr = now.getFullYear();
        const uhr = now.toTimeString().split(' ')[0];
        _timeStampEl.textContent = `${tag}.${monat}.${jahr} — ${uhr}`;
    }

    /**
     * Setzt die LeserIn-ID in der Anzeige.
     * @param {string} id
     */
    function setReaderId(id) {
        if (!_readerIdEl || !id) return;
        // Lokale IDs direkt anzeigen, DB-IDs auf 8 Zeichen kürzen
        if (id.startsWith('LOCAL_')) {
            _readerIdEl.textContent = id.replace('LOCAL_', '');
        } else {
            _readerIdEl.textContent = id.substring(0, 8).toUpperCase();
        }
    }

    /**
     * Initialisiert das Eingabe-Panel.
     * @param {object} els - { textareaId, charCountId, timeStampId, readerIdId }
     */
    function init(els) {
        _textareaEl = document.getElementById(els.textareaId);
        _charCountEl = document.getElementById(els.charCountId);
        _timeStampEl = document.getElementById(els.timeStampId);
        _readerIdEl = document.getElementById(els.readerIdId);

        if (_textareaEl && _charCountEl) {
            _textareaEl.addEventListener('input', () => {
                _charCountEl.textContent = _textareaEl.value.length;
            });
        }

        _updateTime();
        _timeInterval = setInterval(_updateTime, 1000);
    }

    /**
     * Validiert und bestätigt die aktuelle Eingabe.
     * Erzeugt einen Memory-Knoten und speichert in DB.
     * @returns {boolean} true bei Erfolg
     */
    function submit() {
        if (!_textareaEl) return false;
        const text = _textareaEl.value.trim();

        if (!text) {
            showToast('Schreibe zuerst etwas, bevor du bestätigst', 'fa-exclamation-circle');
            return false;
        }
        if (text.length < CONFIG.MIN_EINGABE_LENGTH) {
            showToast(`Mindestens ${CONFIG.MIN_EINGABE_LENGTH} Zeichen erforderlich`, 'fa-exclamation-circle');
            return false;
        }

        // Memory-Knoten aus Eingabe erzeugen (EMOTIONAL)
        const truncatedName = text.substring(0, 35) + (text.length > 35 ? '...' : '');
        const node = MemoryEngine.createNode(truncatedName, 'emotional', 'eingabe');
        _emit('eingabe:submitted', { text, nodeId: node.id, name: truncatedName });

        showToast('Deine Zeile wurde ins Gedächtnis aufgenommen', 'fa-feather');
        DB.saveEingabe(text);

        // Feld leeren
        _pendingText = '';
        _textareaEl.value = '';
        if (_charCountEl) _charCountEl.textContent = '0';

        return true;
    }

    /**
     * "Fortsetzen": Bestätigt Eingabe und navigiert weiter.
     * @param {Function} onContinue - Callback nach Bestätigung
     */
    function fortsetzen(onContinue) {
        if (!_textareaEl) return false;
        const text = _textareaEl.value.trim();
        if (!text) {
            if (onContinue) onContinue();
            return true;
        }
        if (submit()) {
            setTimeout(() => { if (onContinue) onContinue(); }, 500);
            return true;
        }
        return false;
    }

    /**
     * Leert das Eingabefeld.
     */
    function clearInput() {
        if (!_textareaEl) return;
        _textareaEl.value = '';
        if (_charCountEl) _charCountEl.textContent = '0';
        showToast('Eingabe gelöscht', 'fa-eraser');
    }

    function on(fn) { _listeners.push(fn); }
    function off(fn) { _listeners = _listeners.filter(l => l !== fn); }

    /**
     * Zerstört das IOManager (Timer stoppen).
     */
    function destroy() {
        if (_timeInterval) clearInterval(_timeInterval);
    }

    return Object.freeze({
        init, submit, fortsetzen, clearInput,
        setReaderId, on, off, destroy
    });
})();

export default IOManager;
