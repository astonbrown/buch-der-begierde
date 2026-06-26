/**
 * config.js — Zentrale Konfiguration
 * Enthält alle Konstanten, API-Keys und Schwellenwerte.
 * Wird von allen anderen Modulen importiert.
 */

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

    /* --- Analyse --- */
    DB_MAX_RETRIES: 3,
    DB_RETRY_DELAY: 1500
});
