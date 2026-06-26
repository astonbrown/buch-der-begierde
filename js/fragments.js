/**
 * fragments.js — Wortfragment-Selektor
 *
 * Verwaltet die Auswahl der 7 Fragment-Typen (Samt, Kälte, Wärme, Licht,
 * Schatten, Staub, Atem), die Intensität und deren Kopplung an die
 * Memory Engine und die Echo Engine.
 *
 * Fragment-Typen haben各自 Resonanz-Profile, die bestimmen,
 * welchen Memory-Knoten sie aktivieren.
 */

import { CONFIG } from './config.js';
import { showToast } from './toast.js';
import MemoryEngine from './memory.js';
import EchoEngine from './echo.js';

/* ------------------------------------------------------------------
   FRAGMENT_DEFINITIONS — Resonanz-Profile der 7 Fragment-Typen
   ------------------------------------------------------------------ */
export const FRAGMENT_DEFINITIONS = Object.freeze({
    samt: {
        label: 'Samt',
        memoryType: 'emotional',
        memoryName: 'Der Samt der Stille',
        intensityMultiplier: 1.0
    },
    kälte: {
        label: 'Kälte',
        memoryType: 'sensory',
        memoryName: 'Kälte im Spiegel',
        intensityMultiplier: 0.9
    },
    wärme: {
        label: 'Wärme',
        memoryType: 'emotional',
        memoryName: 'Aschewärme der Erinnerung',
        intensityMultiplier: 1.0
    },
    licht: {
        label: 'Licht',
        memoryType: 'conceptual',
        memoryName: 'Durchscheinendes Licht',
        intensityMultiplier: 0.8
    },
    schatten: {
        label: 'Schatten',
        memoryType: 'conceptual',
        memoryName: 'Schatten der Wahrnehmung',
        intensityMultiplier: 1.1
    },
    staub: {
        label: 'Staub',
        memoryType: 'sensory',
        memoryName: 'Staub des Vergangenen',
        intensityMultiplier: 0.7
    },
    atem: {
        label: 'Atem',
        memoryType: 'episodic',
        memoryName: 'Atem unter der Tür',
        intensityMultiplier: 1.2
    }
});

/* ------------------------------------------------------------------
   FragmentSelector — Singleton
   ------------------------------------------------------------------ */
const FragmentSelector = (() => {
    let _selected = new Set();
    let _intensity = 5;
    let _listeners = [];
    let _tagElements = [];
    let _sliderEl = null;
    let _valueEl = null;

    function _emit(event, data) {
        _listeners.forEach(fn => {
            try { fn(event, data); } catch (e) { console.warn('[Fragments] Listener error:', e); }
        });
    }

    /**
     * Aktiviert die Memory-Kopplung für einen Fragment-Typ.
     */
    function _activateMemory(type) {
        const def = FRAGMENT_DEFINITIONS[type];
        if (!def) return;

        const node = MemoryEngine.getOrCreate(def.memoryName, def.memoryType, 'fragment');
        MemoryEngine.reinforce(node.id, _intensity * 0.01 * def.intensityMultiplier);
    }

    /**
     * Initialisiert den Selektor und bindet die DOM-Events.
     * @param {string} tagSelector - CSS-Selector für Fragment-Tags
     * @param {string} sliderId - ID des Intensitäts-Sliders
     * @param {string} valueId - ID des Intensitäts-Wert-Displays
     */
    function init(tagSelector, sliderId, valueId) {
        _tagElements = Array.from(document.querySelectorAll(tagSelector));
        _sliderEl = document.getElementById(sliderId);
        _valueEl = document.getElementById(valueId);

        _tagElements.forEach(tag => {
            tag.addEventListener('click', () => {
                const type = tag.dataset.type;
                if (_selected.has(type)) {
                    // Abwählen
                    _selected.delete(type);
                    tag.classList.remove('selected');
                    _emit('fragment:deselected', type);
                } else {
                    // Auswählen — Limit prüfen
                    if (_selected.size >= CONFIG.MAX_FRAGMENTS) {
                        showToast(`Maximal ${CONFIG.MAX_FRAGMENTS} Fragmente gleichzeitig`, 'fa-exclamation-triangle');
                        return;
                    }
                    _selected.add(type);
                    tag.classList.add('selected');
                    _activateMemory(type);
                    EchoEngine.onFragmentChange();
                    _emit('fragment:selected', type);
                }
            });
        });

        // Intensitäts-Slider
        if (_sliderEl && _valueEl) {
            _sliderEl.addEventListener('input', () => {
                _intensity = parseInt(_sliderEl.value);
                _valueEl.textContent = _intensity;
                EchoEngine.onFragmentChange();
                _emit('intensity:changed', _intensity);
            });
        }
    }

    function on(fn) { _listeners.push(fn); }
    function off(fn) { _listeners = _listeners.filter(l => l !== fn); }

    /** @returns {Set<string>} */
    function getSelected() { return new Set(_selected); }

    /** @returns {string[]} */
    function getSelectedArray() { return Array.from(_selected); }

    /** @returns {number} */
    function getIntensity() { return _intensity; }

    /**
     * Stellt eine gespeicherte Auswahl wieder her.
     * @param {string[]} types
     */
    function restore(types) {
        if (!Array.isArray(types)) return;
        types.forEach(type => {
            if (FRAGMENT_DEFINITIONS[type] && !_selected.has(type)) {
                _selected.add(type);
                const tag = _tagElements.find(t => t.dataset.type === type);
                if (tag) tag.classList.add('selected');
                _activateMemory(type);
            }
        });
        _emit('fragments:restored', Array.from(_selected));
    }

    /**
     * Setzt alle Fragmente zurück.
     */
    function clear() {
        _selected.clear();
        _tagElements.forEach(tag => tag.classList.remove('selected'));
        _emit('fragments:cleared', []);
    }

    return Object.freeze({
        init, on, off,
        getSelected, getSelectedArray, getIntensity,
        restore, clear
    });
})();

export default FragmentSelector;
