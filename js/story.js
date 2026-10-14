/**
 * story.js — Story Engine mit Branching
 *
 * Die Geschichte wird als gerichteter Graph modelliert:
 *   Jede Seite hat:
 *     - id, number, text (Funktion der gewählten Fragmente)
 *     - branches: Array von { pageId, conditions }
 *     - annotations: markierte Wörter mit Notizen
 *
 * Der Engine verwaltet Navigation, Historie und Fragment-basierte
 * Textmodifikation.
 */

import { CONFIG } from './config.js';

const StoryEngine = (() => {
    let _pages = [];          // Alle Seiten
    let _currentPageId = null;
    let _history = [];        // Array von pageId-Strings
    let _listeners = [];

    function _findPage(id) {
        return _pages.find(p => p.id === id) || null;
    }

    function _emit(event, data) {
        _listeners.forEach(fn => {
            try { fn(event, data); } catch (e) { console.warn('[Story] Listener error:', e); }
        });
    }

    /* --- Seiten registrieren --------------------------------------- */

    /**
     * Lädt die Seiten-Daten in die Engine.
     * @param {object[]} pages - Array von Seiten-Objekten
     */
    function loadPages(pages) {
        _pages = pages;
    }

    /**
     * Fügt eine einzelne Seite hinzu.
     * @param {object} page - Seiten-Objekt
     */
    function addPage(page) {
        _pages.push(page);
    }

    /* --- Navigation ----------------------------------------------- */

    /**
     * Navigiert zu einer Seite (per ID).
     * @param {string} pageId
     * @returns {object|null} Die neue Seite
     */
    function navigate(pageId) {
        const page = _findPage(pageId);
        if (!page) {
            console.warn('[Story] Seite nicht gefunden:', pageId);
            return null;
        }

        if (_currentPageId) {
            _history.push(_currentPageId);
        }
        _currentPageId = pageId;
        _emit('page:changed', page);
        return page;
    }

    /**
     * Navigiert zur nächsten Seite basierend auf Branching.
     * Wählt den ersten verfügbaren Branch, der die Bedingungen erfüllt.
     * @param {Set<string>} selectedFragments - Aktuell gewählte Fragmente
     * @returns {object|null}
     */
    function nextBranch(selectedFragments) {
        const current = getCurrent();
        if (!current || !current.branches || current.branches.length === 0) {
            return null;
        }

        // Versuche primären Branch
        for (const branch of current.branches) {
            if (!branch.conditions || branch.conditions.length === 0) {
                return navigate(branch.pageId);
            }
            const meetsAll = branch.conditions.every(c => selectedFragments.has(c));
            if (meetsAll) return navigate(branch.pageId);
        }

        // Fallback: erster Branch ohne Bedingungen
        const fallback = current.branches.find(b => !b.conditions || b.conditions.length === 0);
        if (fallback) return navigate(fallback.pageId);

        return null;
    }

    /**
     * Geht zur vorherigen Seite in der Historie zurück.
     * @returns {object|null}
     */
    function back() {
        if (_history.length === 0) return null;
        const prevId = _history.pop();
        _currentPageId = prevId;
        const page = _findPage(prevId);
        _emit('page:changed', page);
        return page;
    }

    /* --- Text-Generierung ------------------------------------------ */

    /**
     * Generiert den HTML-Text der aktuellen Seite,
     * moduliert durch die gewählten Fragmente.
     * @param {Set<string>} selectedFragments
     * @returns {string} HTML-String
     */
    function renderText(selectedFragments) {
        const page = getCurrent();
        if (!page) return '';

        if (typeof page.text === 'function') {
            return page.text(selectedFragments);
        }
        return page.text || '';
    }

    /**
     * Gibt die Seitennummer für die Anzeige zurück.
     * @returns {number}
     */
    function getCurrentPageNumber() {
        const page = getCurrent();
        return page ? page.number : 0;
    }

    /* --- Branch-Abfrage -------------------------------------------- */

    /**
     * Gibt alle verfügbaren Branches der aktuellen Seite zurück.
     * @param {Set<string>} selectedFragments
     * @returns {object[]}
     */
    function getAvailableBranches(selectedFragments) {
        const current = getCurrent();
        if (!current || !current.branches) return [];

        return current.branches.map(b => ({
            pageId: b.pageId,
            label: b.label || _findPage(b.pageId)?.number || '?',
            available: !b.conditions || b.conditions.length === 0 ||
                       b.conditions.every(c => selectedFragments.has(c)),
            conditions: b.conditions || []
        }));
    }

    /* --- Historie -------------------------------------------------- */

    function getHistory() { return _history.slice(); }
    function clearHistory() { _history = []; }

    /* --- Events ---------------------------------------------------- */

    function on(fn) { _listeners.push(fn); }
    function off(fn) { _listeners = _listeners.filter(l => l !== fn); }

    /* --- Getter ---------------------------------------------------- */

    function getCurrent() { return _findPage(_currentPageId); }
    function getAllPages() { return _pages.slice(); }
    function getTotalPages() { return _pages.length; }

    return Object.freeze({
        loadPages, addPage,
        navigate, nextBranch, back,
        renderText, getCurrentPageNumber,
        getAvailableBranches,
        getHistory, clearHistory,
        on, off,
        getCurrent, getAllPages, getTotalPages
    });
})();

export default StoryEngine;
