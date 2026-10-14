/**
 * db.js — Supabase Datenbank-Wrapper
 * Abstrahiert alle DB-Operationen mit Graceful-Degradation.
 * Wenn Supabase nicht ladbar ist, fallen Funktionen auf Local fallback zurück.
 */

import { CONFIG } from './config.js';
import { setDbStatus } from './navigation.js';

const DB = (() => {
    let _client = null;
    let _connected = false;
    let _leserinId = null;

    function init() {
        try {
            if (typeof supabase !== 'undefined' && supabase.createClient) {
                _client = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
                return true;
            }
        } catch (e) {
            console.warn('[DB] Supabase-Laden fehlgeschlagen:', e);
        }
        return false;
    }

    function isConnected() { return _connected; }
    function getLeserinId() { return _leserinId; }

    function getOrCreateCookie() {
        const name = CONFIG.COOKIE_NAME;
        const cookies = document.cookie.split(';');
        for (const raw of cookies) {
            const c = raw.trim();
            if (c.startsWith(name + '=')) return c.substring(name.length + 1);
        }
        const id = 'L_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
        const expiry = new Date();
        expiry.setFullYear(expiry.getFullYear() + CONFIG.COOKIE_EXPIRY_YEARS);
        document.cookie = name + '=' + id + ';expires=' + expiry.toUTCString() + ';path=/;SameSite=Lax';
        return id;
    }

    async function initLeserin() {
        const cookieId = getOrCreateCookie();

        if (!_client) {
            _connected = false;
            _leserinId = 'LOCAL_' + (1000 + Math.floor(Math.random() * 9000));
            return _leserinId;
        }

        try {
            const { data: vorhanden, error: suchFehler } = await _client
                .from('leserinnen')
                .select('*')
                .eq('cookie_id', cookieId)
                .single();

            if (!suchFehler && vorhanden) {
                await _client.from('leserinnen')
                    .update({ last_active: new Date().toISOString() })
                    .eq('cookie_id', cookieId);
                _leserinId = vorhanden.id;
                _connected = true;
                setDbStatus(true);
                return _leserinId;
            }

            const { data: neu, error: insertFehler } = await _client
                .from('leserinnen')
                .insert({ cookie_id: cookieId })
                .select()
                .single();

            if (!insertFehler && neu) {
                _leserinId = neu.id;
                _connected = true;
                setDbStatus(true);
                return _leserinId;
            }
            throw insertFehler;
        } catch (e) {
            console.warn('[DB] Fehler bei initLeserin:', e);
            _connected = false;
            _leserinId = 'LOCAL_' + (1000 + Math.floor(Math.random() * 9000));
            setDbStatus(false);
            return _leserinId;
        }
    }

    async function saveState(fragments, page, memoryState) {
        if (!_connected || !_leserinId) return;
        try {
            await _client.from('leserinnen').update({
                fragmente: fragments,
                aktuelle_seite: page,
                memory_state: memoryState,
                last_active: new Date().toISOString()
            }).eq('id', _leserinId);
        } catch (e) {
            console.warn('[DB] Speichern fehlgeschlagen:', e);
        }
    }

    async function saveEingabe(text) {
        if (!_connected || !_leserinId) return;
        try {
            const { data } = await _client.from('leserinnen')
                .select('eingaben').eq('id', _leserinId).single();
            const eingaben = (data && data.eingaben) ? data.eingaben.slice() : [];
            const zeit = new Date().toLocaleString('de-DE');
            eingaben.push(zeit + ' | ' + text);
            if (eingaben.length > CONFIG.MAX_EINGABEN) {
                eingaben.splice(0, eingaben.length - CONFIG.MAX_EINGABEN);
            }
            await _client.from('leserinnen').update({ eingaben: eingaben }).eq('id', _leserinId);
        } catch (e) {
            console.warn('[DB] Eingabe speichern fehlgeschlagen:', e);
        }
    }

    async function loadState() {
        if (!_connected || !_leserinId) return null;
        try {
            const { data, error } = await _client.from('leserinnen')
                .select('*').eq('id', _leserinId).single();
            if (!error && data) return data;
        } catch (e) {
            console.warn('[DB] Laden fehlgeschlagen:', e);
        }
        return null;
    }

    return Object.freeze({
        init, isConnected, getLeserinId,
        initLeserin, saveState, saveEingabe, loadState, getOrCreateCookie
    });
})();

export default DB;
