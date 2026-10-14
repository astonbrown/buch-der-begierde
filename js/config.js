/**
 * config.js — Zentrale Konfiguration
 * Enthält alle Konstanten, API-Keys und Schwellenwerte.
 * Wird von allen anderen Modulen importiert.
 */

function _readStoredValue(key, fallback) {
    if (typeof window === 'undefined' || !window.localStorage) return fallback;
    try {
        const stored = window.localStorage.getItem(key);
        return stored === null ? fallback : stored;
    } catch {
        return fallback;
    }
}

export const CONFIG = Object.freeze({
    /* --- Supabase --- */
    SUPABASE_URL: 'https://mntjworywbkfpwvakieq.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1udGp3b3J5d2JrZnB3dmFraWVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzMTczMjAsImV4cCI6MjA5MDg5MzMyMH0.4LTwi6IY6WoiQTQfy0612j-8xi1C1Ly1zjMQJ5bOps0',

    /* --- Version --- */
    VERSION: '0.5.0',

    /* --- Fragment-Selektor --- */
    MAX_FRAGMENTS: 3,

    /* --- Eingabe --- */
    MIN_EINGABE_LENGTH: 5,
    MAX_EINGABEN: 50,

    /* --- Cookie --- */
    COOKIE_NAME: 'bdb_cid',
    COOKIE_EXPIRY_YEARS: 2,

    /* --- Toast --- */
    TOAST_DURATION: 3000,

    /* --- Memory Engine --- */
    MEMORY_DECAY_RATE: 0.001,       // pro Stunde
    MEMORY_REINFORCE_RATE: 0.15,    // pro Interaktion
    MEMORY_DECAY_INTERVAL: 60000,   // ms — Verfall alle 60 Sekunden prüfen
    MEMORY_FORGET_THRESHOLD: 0.0,   // unterhalb wird Knoten als 'empty' markiert

    /* --- Echo Engine --- */
    ECHO_BAR_COUNT: 48,
    ECHO_UPDATE_FPS: 60,

    /* --- Partikel --- */
    PARTICLE_COUNT: 25,
    PARTICLE_MIN_DURATION: 15,     // Sekunden
    PARTICLE_MAX_DURATION: 40,
    PARTICLE_MAX_DELAY: 20,

    /* --- Story --- */
    STORY_FADE_DURATION: 300,      // ms — Textübergang
    STORY_TOTAL_PAGES: 312,        // fiktive Gesamtzahl

    /* --- QR Scanner --- */
    QR_SCAN_DURATION: 6000,        // ms bis Simulationsergebnis

    /* --- Ollama --- */
    OLLAMA_ENDPOINT: 'http://localhost:11434',
    OLLAMA_MODEL: 'llama3.1',
    OLLAMA_TIMEOUT: 4000,
    OLLAMA_ENABLED: true,

    /* --- Analyse --- */
    DB_MAX_RETRIES: 3,
    DB_RETRY_DELAY: 1500
});

export function createOllamaConfig(overrides = {}) {
    const endpoint = (overrides.endpoint ?? _readStoredValue('bdb_ollama_endpoint', CONFIG.OLLAMA_ENDPOINT)).toString().trim();
    const model = (overrides.model ?? _readStoredValue('bdb_ollama_model', CONFIG.OLLAMA_MODEL)).toString().trim();
    const enabled = overrides.enabled ?? (_readStoredValue('bdb_ollama_enabled', String(CONFIG.OLLAMA_ENABLED)) !== 'false');
    const timeout = Number.isFinite(overrides.timeout)
        ? overrides.timeout
        : Number(_readStoredValue('bdb_ollama_timeout', String(CONFIG.OLLAMA_TIMEOUT))) || CONFIG.OLLAMA_TIMEOUT;

    return Object.freeze({ endpoint, model, enabled, timeout });
}

function _buildOllamaProbeUrls(endpoint) {
    const normalized = (endpoint ?? '').toString().trim();
    const baseCandidates = [];

    if (normalized) {
        baseCandidates.push(normalized);
    }

    const fallbackCandidates = [];
    const defaultBase = CONFIG.OLLAMA_ENDPOINT;

    if (normalized !== defaultBase) {
        fallbackCandidates.push(defaultBase);
    }

    if (!normalized.includes('127.0.0.1') && !normalized.includes('localhost')) {
        fallbackCandidates.push('http://127.0.0.1:11434');
    }

    if (!normalized.includes('localhost') && !normalized.includes('127.0.0.1')) {
        fallbackCandidates.push('http://localhost:11434');
    }

    const seen = new Set();
    const urls = [];

    for (const candidate of [...baseCandidates, ...fallbackCandidates]) {
        const clean = candidate.replace(/\/$/, '');
        if (!clean) continue;
        if (!seen.has(clean)) {
            seen.add(clean);
            urls.push(`${clean}/api/tags`);
        }
    }

    return urls;
}

export async function testOllamaConnection(options = {}) {
    const config = createOllamaConfig(options);

    if (!config.enabled) {
        return { ok: false, message: 'Ollama ist deaktiviert.', endpoint: config.endpoint, model: config.model };
    }

    const probeUrls = _buildOllamaProbeUrls(config.endpoint);
    let lastError = null;
    let lastStatus = null;

    for (const url of probeUrls) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), config.timeout);
            const response = await fetch(url, {
                signal: controller.signal,
                headers: { Accept: 'application/json' }
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                lastStatus = response.status;
                lastError = new Error(`HTTP ${response.status}`);
                continue;
            }

            const data = await response.json().catch(() => null);
            const models = Array.isArray(data?.models)
                ? data.models.map((item) => item.name ?? item.model).filter(Boolean)
                : [];

            const endpoint = new URL(url);
            const endpointUrl = `${endpoint.protocol}//${endpoint.host}`;

            return {
                ok: true,
                message: models.length
                    ? `Verbindung zu Ollama erfolgreich (${models[0]})`
                    : 'Verbindung zu Ollama erfolgreich, aber keine Modelle gefunden.',
                endpoint: endpointUrl,
                model: config.model,
                models
            };
        } catch (error) {
            lastError = error;
        }
    }

    const message = lastError?.name === 'AbortError'
        ? `Zeitüberschreitung nach ${config.timeout} ms. Prüfe, ob Ollama unter ${config.endpoint} läuft.`
        : `Keine Verbindung zu Ollama: ${lastError?.message || 'Unbekannter Fehler'}`;

    return {
        ok: false,
        message,
        endpoint: config.endpoint,
        model: config.model,
        status: lastStatus
    };
}
