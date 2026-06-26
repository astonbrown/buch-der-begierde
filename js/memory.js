/**
 * memory.js — Dynamische Gedächtnis-Engine
 *
 * Knoten-Typen:
 *   EPISODIC    — Geschichtsereignisse, Seitenbesuche
 *   SENSORY     — Sinneswahrnehmungen (Samt, Kälte, Licht…)
 *   EMOTIONAL   — Gefühlslagen, Atmosphäre
 *   CONCEPTUAL  — Abstrakte Konzepte, Metaphern
 *
 * Jeder Knoten hat:
 *   id, name, type, source, weight (0.0–1.0),
 *   decay (Rate pro Stunde), created, lastAccessed,
 *   accessCount, state ('empty'|'partial'|'filled'|'decayed')
 *
 * Assoziationen: bidirektionale Verbindungen zwischen Knoten (strength 0.0–1.0)
 */

import { CONFIG } from './config.js';

/* ------------------------------------------------------------------
   NODE_TYPES — Profil für jeden Knoten-Typ
   ------------------------------------------------------------------ */
const NODE_TYPES = Object.freeze({
    EPISODIC:    { key: 'episodic',    decay: 0.002, baseWeight: 0.50, cssClass: 'filled',  label: 'Episodisch' },
    SENSORY:     { key: 'sensory',     decay: 0.005, baseWeight: 0.30, cssClass: 'partial', label: 'Sensorisch' },
    EMOTIONAL:   { key: 'emotional',   decay: 0.003, baseWeight: 0.70, cssClass: 'filled',  label: 'Emotional' },
    CONCEPTUAL:  { key: 'conceptual',  decay: 0.001, baseWeight: 0.40, cssClass: 'partial', label: 'Konzeptionell' }
});

/* ------------------------------------------------------------------
   MemoryEngine — Singleton
   ------------------------------------------------------------------ */
const MemoryEngine = (() => {
    let _nodes = [];
    let _connections = [];
    let _listeners = [];
    let _decayTimer = null;

    /* --- Helpers -------------------------------------------------- */

    function _generateId() {
        return 'mem_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
    }

    function _findNode(id) {
        return _nodes.find(n => n.id === id) || null;
    }

    function _calcState(weight) {
        if (weight <= CONFIG.MEMORY_FORGET_THRESHOLD) return 'empty';
        if (weight < 0.15) return 'decayed';
        if (weight < 0.50) return 'partial';
        return 'filled';
    }

    function _emit(event, data) {
        _listeners.forEach(fn => {
            try { fn(event, data); } catch (e) { console.warn('[Memory] Listener error:', e); }
        });
    }

    /* --- Öffentliche API ------------------------------------------ */

    /**
     * Erstellt einen neuen Erinnerungsknoten.
     * @param {string} name - Anzeigename
     * @param {string} typeKey - Schlüssel aus NODE_TYPES (default: 'sensory')
     * @param {string} source - Ursprung: 'fragment'|'eingabe'|'qr'|'page'|'hoeren'
     * @returns {object} Der neue Knoten
     */
    function createNode(name, typeKey, source) {
        const profile = NODE_TYPES[typeKey] || NODE_TYPES.SENSORY;
        const node = {
            id: _generateId(),
            name: name,
            type: profile.key,
            source: source || 'fragment',
            weight: profile.baseWeight,
            maxWeight: 1.0,
            decay: profile.decay,
            created: Date.now(),
            lastAccessed: Date.now(),
            accessCount: 1,
            state: _calcState(profile.baseWeight)
        };
        _nodes.push(node);
        _emit('node:created', node);
        return node;
    }

    /**
     * Sucht einen Knoten anhand seines Namens (Groß-/Kleinschreibung ignorierend).
     * @param {string} name
     * @returns {object|null}
     */
    function findByName(name) {
        return _nodes.find(n => n.name.toLowerCase() === name.toLowerCase()) || null;
    }

    /**
     * Findet oder erstellt einen Knoten. Gibt den bestehenden zurück, falls vorhanden.
     * @param {string} name
     * @param {string} typeKey
     * @param {string} source
     * @returns {object}
     */
    function getOrCreate(name, typeKey, source) {
        const existing = findByName(name);
        if (existing) return existing;
        return createNode(name, typeKey, source);
    }

    /**
     * Verstärkt einen Knoten (erhöht Gewicht).
     * @param {string} nodeId
     * @param {number} amount - Zuschlag (default aus CONFIG)
     * @returns {object|null} Der aktualisierte Knoten
     */
    function reinforce(nodeId, amount) {
        const node = _findNode(nodeId);
        if (!node) return null;

        const boost = amount || CONFIG.MEMORY_REINFORCE_RATE;
        node.weight = Math.min(node.maxWeight, node.weight + boost);
        node.lastAccessed = Date.now();
        node.accessCount++;
        node.state = _calcState(node.weight);

        _emit('node:reinforced', node);
        return node;
    }

    /**
     * Führt den Verfall für alle Knoten aus.
     * Wird automatisch alle MEMORY_DECAY_INTERVAL ms aufgerufen.
     */
    function decay() {
        const now = Date.now();
        let changed = false;

        _nodes.forEach(node => {
            const hoursSinceAccess = (now - node.lastAccessed) / 3600000;
            const decayAmount = node.decay * hoursSinceAccess;

            if (decayAmount > 0) {
                const oldWeight = node.weight;
                node.weight = Math.max(0, node.weight - decayAmount);
                node.state = _calcState(node.weight);
                if (oldWeight !== node.weight) changed = true;
            }
        });

        if (changed) _emit('memory:decayed', _nodes);
    }

    /**
     * Erstellt eine Assoziation zwischen zwei Knoten.
     * @param {string} nodeAId
     * @param {string} nodeBId
     * @param {number} strength - Stärke 0.0–1.0
     */
    function connect(nodeAId, nodeBId, strength) {
        strength = strength || 0.3;

        const existing = _connections.find(c =>
            (c.from === nodeAId && c.to === nodeBId) ||
            (c.from === nodeBId && c.to === nodeAId)
        );

        if (existing) {
            existing.strength = Math.min(1.0, existing.strength + strength);
        } else {
            _connections.push({ from: nodeAId, to: nodeBId, strength });
        }

        _emit('connection:created', { from: nodeAId, to: nodeBId, strength });
    }

    /**
     * Registriert einen Event-Listener.
     * @param {Function} fn - Callback(event, data)
     */
    function on(fn) {
        _listeners.push(fn);
    }

    /**
     * Entfernt einen Event-Listener.
     * @param {Function} fn
     */
    function off(fn) {
        _listeners = _listeners.filter(l => l !== fn);
    }

    /**
     * Startet den automatischen Verfall-Timer.
     */
    function startDecay() {
        if (_decayTimer) return;
        _decayTimer = setInterval(decay, CONFIG.MEMORY_DECAY_INTERVAL);
    }

    /**
     * Stoppt den automatischen Verfall-Timer.
     */
    function stopDecay() {
        if (_decayTimer) {
            clearInterval(_decayTimer);
            _decayTimer = null;
        }
    }

    /**
     * Gibt den Durchschnittsgewicht aller Knoten zurück.
     * @returns {number} 0.0–1.0
     */
    function getAverageWeight() {
        if (_nodes.length === 0) return 0;
        const sum = _nodes.reduce((acc, n) => acc + n.weight, 0);
        return sum / _nodes.length;
    }

    /**
     * Gibt alle Knoten eines bestimmten Quell-Typs zurück.
     * @param {string} source - 'fragment'|'eingabe'|'qr'|'page'|'hoeren'
     * @returns {object[]}
     */
    function getBySource(source) {
        return _nodes.filter(n => n.source === source);
    }

    /**
     * Gibt alle aktiven (nicht leeren) Knoten zurück.
     * @returns {object[]}
     */
    function getActive() {
        return _nodes.filter(n => n.state !== 'empty');
    }

    /**
     * Serialisiert den aktuellen Zustand für DB-Speicherung.
     * @returns {object}
     */
    function serialize() {
        return {
            nodes: _nodes.map(n => ({
                id: n.id, name: n.name, type: n.type, source: n.source,
                weight: n.weight, state: n.state,
                created: n.created, lastAccessed: n.lastAccessed, accessCount: n.accessCount
            })),
            connections: _connections.map(c => ({
                from: c.from, to: c.to, strength: c.strength
            }))
        };
    }

    /**
     * Stellt einen serialisierten Zustand wieder her.
     * @param {object} data - Daten von serialize()
     */
    function deserialize(data) {
        if (data.nodes) {
            data.nodes.forEach(n => {
                _nodes.push({
                    ...n,
                    decay: (NODE_TYPES[n.type] || NODE_TYPES.SENSORY).decay,
                    maxWeight: 1.0
                });
            });
        }
        if (data.connections) {
            _connections = data.connections;
        }
        _emit('memory:restored', _nodes);
    }

    /**
     * Setzt alle Knoten auf die Default-Werte zurück.
     */
    function reset() {
        _nodes = [];
        _connections = [];
        _emit('memory:reset', []);
    }

    /* --- Getter --------------------------------------------------- */
    function getNodes() { return _nodes.slice(); }
    function getConnections() { return _connections.slice(); }
    function getNodeTypes() { return NODE_TYPES; }

    return Object.freeze({
        createNode, findByName, getOrCreate, reinforce, decay, connect,
        on, off, startDecay, stopDecay,
        getAverageWeight, getBySource, getActive,
        serialize, deserialize, reset,
        getNodes, getConnections, getNodeTypes
    });
})();

export default MemoryEngine;
