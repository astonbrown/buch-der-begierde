/**
 * schreiben.js — Schreib-Engine ("Schreiben"-Modul)
 *
 * Erweitertes Eingabe-Panel mit:
 *   - Text-Vorschlägen basierend auf den gewählten Fragmenten
 *   - Memory-Verknüpfung (jede Eingabe wird zu einem EMOTIONAL-Knoten)
 *   - Wort-Resonanz-Analyse (welche Fragmente in der Eingabe auftauchen)
 *
 * Das Modul orchestriert zwischen FragmentSelector, MemoryEngine und der UI.
 * Es ist die erweiterte Variante des Basis-Eingabe-Panels aus io.js.
 */

import { CONFIG } from './config.js';
import { showToast } from './toast.js';
import MemoryEngine from './memory.js';
import DB from './db.js';
import { FRAGMENT_DEFINITIONS } from './fragments.js';

/* ------------------------------------------------------------------
   VORSCHLAGS-BIBLIOTHEK
   Jede Vorlage ist mit einem Fragment-Typ assoziiert und dient als
   Inspiration, sobald ein LeserIn das entsprechende Fragment wählt.
   ------------------------------------------------------------------ */
const SUGGESTIONS = Object.freeze({
    samt: [
        'Auf ihrem Haut lag die Stille wie Samt.',
        'Die Nacht war ein Gewebe aus weichen Schatten.',
        'Alles wurde gedämpft — selbst mein eigener Atem.'
    ],
    kälte: [
        'Die Kälte kroch durch die Ritzen der Erinnerung.',
        'Im Spiegel sah ich Winter, der nie gekommen war.',
        'Frost auf Glas, wie eine Sprache, die ich nicht las.'
    ],
    wärme: [
        'Verbrannter Amber hing in der Luft, süß und schwer.',
        'Die Wärme kam nicht vom Feuer, sondern von etwas anderem.',
        'Asche, noch immer warm — ein Brief ohne Worte.'
    ],
    licht: [
        'Sie hatte Licht statt Tinte verwendet.',
        'Die Lampe flackerte, als würde sie atmen.',
        'Durchscheinend war alles an diesem Abend.'
    ],
    schatten: [
        'Im Schatten bewegte sich etwas, das keinen Namen hatte.',
        'Die Dunkelheit war dichter als gewöhnlich.',
        'Ein Schatten löste sich und folgte mir.'
    ],
    staub: [
        'Staub tanzte im letzten Licht des Tages.',
        'Unter dem losen Brett lag eine andere Zeit.',
        'Alles, was blieb, war Staub und ein Flüstern.'
    ],
    atem: [
        'Sein Atem stand zwischen uns wie eine Wand.',
        'Ich hörte Atmen, obwohl niemand im Raum war.',
        'Der Atem der Laternen war das einzige Geräusch.'
    ]
});

const SchreibenEngine = (() => {
    let _textareaEl = null;
    let _charCountEl = null;
    let _suggestionsEl = null;
    let _listeners = [];
    let _activeFragmentType = null;

    function _emit(event, data) {
        _listeners.forEach(fn => {
            try { fn(event, data); } catch (e) { console.warn('[Schreiben] Listener error:', e); }
        });
    }

    /**
     * Aktualisiert die Vorschlags-Liste basierend auf Fragment-Typ.
     * @param {string} fragmentType - Schlüssel aus FRAGMENT_DEFINITIONS
     */
    function _updateSuggestions(fragmentType) {
        if (!_suggestionsEl) return;
        _suggestionsEl.innerHTML = '';

        const list = SUGGESTIONS[fragmentType] || [];
        if (list.length === 0) {
            _suggestionsEl.innerHTML =
                '<p class="suggestion-empty">Wähle ein Fragment, um Anregungen zu erhalten.</p>';
            return;
        }

        list.forEach(text => {
            const item = document.createElement('div');
            item.classList.add('suggestion-item');
            item.textContent = text;
            item.setAttribute('role', 'button');
            item.setAttribute('tabindex', '0');

            const apply = () => {
                if (_textareaEl) {
                    _textareaEl.value = text;
                    if (_charCountEl) _charCountEl.textContent = text.length;
                    _textareaEl.focus();
                    _emit('suggestion:used', { text });
                    showToast('Vorschlag übernommen — forme ihn zu deinem', 'fa-quote-right');
                }
            };

            item.addEventListener('click', apply);
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    apply();
                }
            });

            _suggestionsEl.appendChild(item);
        });
    }

    /**
     * Analysiert einen Text auf enthaltene Fragment-Schlüsselwörter.
     * @param {string} text
     * @returns {string[]} Array von Fragment-Typen
     */
    function _analyzeTextForFragments(text) {
        const lower = text.toLowerCase();
        const keywords = {
            samt:   ['samt', 'weich', 'samten', 'stille'],
            kälte:  ['kälte', 'kalt', 'frost', 'eis', 'winter'],
            wärme:  ['wärme', 'warm', 'asche', 'amber', 'feuer'],
            licht:  ['licht', 'lampe', 'glanz', 'schein', 'durchscheinend'],
            schatten: ['schatten', 'dunkel', 'dunkelheit', 'finsternis'],
            staub:  ['staub', 'vergangen', 'alt', 'bröckel'],
            atem:   ['atem', 'atmen', 'hauch', 'atemzug', 'lüftchen']
        };

        const found = [];
        for (const [type, words] of Object.entries(keywords)) {
            if (words.some(w => lower.includes(w))) found.push(type);
        }
        return found;
    }

    /* --- Öffentliche API ------------------------------------------- */

    /**
     * Initialisiert die Schreib-Engine.
     * @param {object} els - { textareaId, charCountId, suggestionsId }
     */
    function init(els) {
        _textareaEl = document.getElementById(els.textareaId);
        _charCountEl = document.getElementById(els.charCountId);
        _suggestionsEl = document.getElementById(els.suggestionsId);

        if (_textareaEl && _charCountEl) {
            _textareaEl.addEventListener('input', () => {
                _charCountEl.textContent = _textareaEl.value.length;
            });
        }

        _updateSuggestions(null);
    }

    /**
     * Setzt den aktiven Fragment-Typ und aktualisiert Vorschläge.
     * @param {string} fragmentType
     */
    function setActiveFragment(fragmentType) {
        _activeFragmentType = fragmentType;
        _updateSuggestions(fragmentType);
        _emit('fragment:active', { type: fragmentType });
    }

    /**
     * Bestätigt die Eingabe: erzeugt Memory-Knoten + speichert in DB.
     * Analysiert zusätzlich den Text auf Fragment-Resonanzen.
     * @returns {object|null} Ergebnis-Objekt mit Knoten + Resonanzen
     */
    function submit() {
        if (!_textareaEl) return null;
        const text = _textareaEl.value.trim();

        if (!text) {
            showToast('Schreibe zuerst etwas', 'fa-exclamation-circle');
            return null;
        }
        if (text.length < CONFIG.MIN_EINGABE_LENGTH) {
            showToast(`Mindestens ${CONFIG.MIN_EINGABE_LENGTH} Zeichen erforderlich`, 'fa-exclamation-circle');
            return null;
        }

        // Hauptknoten: Eingabe als EMOTIONAL
        const truncatedName = text.substring(0, 35) + (text.length > 35 ? '...' : '');
        const mainNode = MemoryEngine.createNode(truncatedName, 'emotional', 'eingabe');

        // Resonanz-Analyse: Welche Fragmente sind im Text?
        const resonances = _analyzeTextForFragments(text);

        // Sekundäre Knoten: für jedes gefundene Fragment ein SENSORY-Knoten
        const secondaryNodes = [];
        resonances.forEach(type => {
            const def = FRAGMENT_DEFINITIONS[type];
            if (def) {
                const node = MemoryEngine.getOrCreate(def.memoryName, def.memoryType, 'eingabe');
                MemoryEngine.reinforce(node.id, 0.1);
                secondaryNodes.push(node);
                // Verknüpfe Hauptknoten mit Sekundärknoten
                MemoryEngine.connect(mainNode.id, node.id, 0.4);
            }
        });

        const result = {
            text, nodeId: mainNode.id, name: truncatedName,
            resonances, mainNode, secondaryNodes
        };

        DB.saveEingabe(text);
        showToast('Deine Zeile wurde ins Gedächtnis aufgenommen', 'fa-feather');
        _emit('schreiben:submitted', result);

        // Feld leeren
        _textareaEl.value = '';
        if (_charCountEl) _charCountEl.textContent = '0';

        return result;
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

    /** @returns {string[]} alle Vorschlagstypen */
    function getSuggestionTypes() { return Object.keys(SUGGESTIONS); }

    return Object.freeze({
        init, setActiveFragment, submit, clearInput,
        on, off, getSuggestionTypes
    });
})();

export default SchreibenEngine;
