/**
 * app-analyse.js — Entry-Point für analyse.html
 *
 * Geräteanalyse-Seite. Sammelt Browser-, Display-, Performance- und
 * Verbindungsdaten und zeigt sie in Karten an.
 */

import { createParticles, initFadeInObserver } from './atmosphere.js';
import { showToast } from './toast.js';
import { setDbStatus } from './navigation.js';
import DB from './db.js';
import { createOllamaConfig, testOllamaConnection } from './config.js';

/* ------------------------------------------------------------------
   Analyse-Funktionen — sammeln Geräte-Informationen
   ------------------------------------------------------------------ */

function _analyzeBrowser() {
    const ua = navigator.userAgent;
    let browser = 'Unbekannt';
    if (/Edg/.test(ua)) browser = 'Microsoft Edge';
    else if (/Chrome/.test(ua)) browser = 'Google Chrome';
    else if (/Firefox/.test(ua)) browser = 'Mozilla Firefox';
    else if (/Safari/.test(ua)) browser = 'Apple Safari';

    let os = 'Unbekannt';
    if (/Windows/.test(ua)) os = 'Windows';
    else if (/Mac/.test(ua)) os = 'macOS';
    else if (/Linux/.test(ua)) os = 'Linux';
    else if (/Android/.test(ua)) os = 'Android';
    else if (/iPhone|iPad/.test(ua)) os = 'iOS';

    return {
        browser,
        os,
        language: navigator.language || '—',
        cookieEnabled: navigator.cookieEnabled ? 'Ja' : 'Nein',
        online: navigator.onLine ? 'Online' : 'Offline'
    };
}

function _analyzeDisplay() {
    return {
        resolution: `${window.screen.width} × ${window.screen.height}`,
        viewport: `${window.innerWidth} × ${window.innerHeight}`,
        colorDepth: `${window.screen.colorDepth} Bit`,
        pixelRatio: (window.devicePixelRatio || 1).toFixed(2),
        orientation: window.matchMedia('(orientation: portrait)').matches ? 'Hochformat' : 'Querformat'
    };
}

function _analyzePerformance() {
    const cores = navigator.hardwareConcurrency || '—';
    const memory = navigator.deviceMemory ? navigator.deviceMemory + ' GB' : 'n.v.';
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    return {
        cores: cores.toString(),
        memory,
        connectionType: connection ? (connection.effectiveType || '—').toUpperCase() : 'n.v.',
        downlink: connection ? (connection.downlink || '—') + ' Mbps' : 'n.v.'
    };
}

function _analyzeFeatures() {
    return {
        webgl: (() => { try { return !!window.WebGLRenderingContext; } catch { return false; } })() ? 'Verfügbar' : 'Nicht verfügbar',
        webSpeech: 'speechSynthesis' in window ? 'Verfügbar' : 'Nicht verfügbar',
        mediaDevices: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) ? 'Verfügbar' : 'Nicht verfügbar',
        serviceWorker: 'serviceWorker' in navigator ? 'Verfügbar' : 'Nicht verfügbar',
        localStorage: (() => { try { return !!window.localStorage; } catch { return false; } })() ? 'Verfügbar' : 'Nicht verfügbar'
    };
}

/* ------------------------------------------------------------------
   Renderer — schreibt Werte in die DOM-Elemente
   ------------------------------------------------------------------ */

function _setValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function _renderBrowser(d) {
    _setValue('anaBrowser', d.browser);
    _setValue('anaOs', d.os);
    _setValue('anaLanguage', d.language);
    _setValue('anaCookie', d.cookieEnabled);
    _setValue('anaOnline', d.online);
    _setValue('sumBrowser', d.browser);
}

function _renderDisplay(d) {
    _setValue('anaResolution', d.resolution);
    _setValue('anaViewport', d.viewport);
    _setValue('anaColorDepth', d.colorDepth);
    _setValue('anaPixelRatio', d.pixelRatio);
    _setValue('anaOrientation', d.orientation);
    _setValue('sumResolution', d.resolution);
}

function _renderPerformance(d) {
    _setValue('anaCores', d.cores);
    _setValue('anaMemory', d.memory);
    _setValue('anaConnType', d.connectionType);
    _setValue('anaDownlink', d.downlink);
}

function _renderFeatures(d) {
    _setValue('anaWebgl', d.webgl);
    _setValue('anaWebSpeech', d.webSpeech);
    _setValue('anaMediaDevices', d.mediaDevices);
    _setValue('anaServiceWorker', d.serviceWorker);
    _setValue('anaLocalStorage', d.localStorage);
    
    // Count available features for summary
    const featureCount = Object.values(d).filter(f => f === 'Verfügbar').length;
    _setValue('sumFeatures', featureCount + '/5');
}

function _setOllamaStatus(message, ok) {
    const el = document.getElementById('ollamaStatus');
    if (!el) return;
    el.textContent = message;
    el.style.color = ok ? 'var(--accent, #8f6b3f)' : 'var(--accent-danger, #b33a3a)';
}

/* ------------------------------------------------------------------
   Init
   ------------------------------------------------------------------ */

async function initAnalyse() {
    createParticles('particles');
    initFadeInObserver();

    // Daten sammeln & rendern
    _renderBrowser(_analyzeBrowser());
    _renderDisplay(_analyzeDisplay());
    _renderPerformance(_analyzePerformance());
    _renderFeatures(_analyzeFeatures());

    // DB-Status testen
    const dbTest = document.getElementById('dbTestBtn');
    if (dbTest) {
        dbTest.addEventListener('click', async () => {
            dbTest.textContent = 'Teste...';
            DB.init();
            const id = await DB.initLeserin();
            if (DB.isConnected()) {
                showToast('Verbindung erfolgreich — ID ' + id.substring(0, 8), 'fa-check-circle');
            } else {
                showToast('Offline-Modus aktiv — lokale Speicherung', 'fa-exclamation-triangle');
            }
            dbTest.textContent = 'Erneut testen';
        });
    }

    // Ollama-Konfiguration testen
    const ollamaBtn = document.getElementById('ollamaTestBtn');
    const ollamaEndpoint = document.getElementById('ollamaEndpoint');
    const ollamaModel = document.getElementById('ollamaModel');
    const ollamaConfig = createOllamaConfig();

    if (ollamaEndpoint) ollamaEndpoint.value = ollamaConfig.endpoint;
    if (ollamaModel) ollamaModel.value = ollamaConfig.model;

    if (ollamaBtn) {
        ollamaBtn.addEventListener('click', async () => {
            const endpoint = ollamaEndpoint?.value?.trim() || '';
            const model = ollamaModel?.value?.trim() || '';

            if (endpoint) {
                try {
                    window.localStorage.setItem('bdb_ollama_endpoint', endpoint);
                } catch {}
            }
            if (model) {
                try {
                    window.localStorage.setItem('bdb_ollama_model', model);
                } catch {}
            }

            ollamaBtn.disabled = true;
            ollamaBtn.innerHTML = '<span><i class="fas fa-spinner fa-spin"></i> Teste...</span>';
            const result = await testOllamaConnection({ endpoint, model });
            _setOllamaStatus(result.message, result.ok);
            showToast(result.message, result.ok ? 'fa-check-circle' : 'fa-exclamation-triangle');
            ollamaBtn.disabled = false;
            ollamaBtn.innerHTML = '<span><i class="fas fa-plug"></i> Verbindung testen</span>';
        });
    }

    _setOllamaStatus('Noch nicht getestet.', false);
    showToast('Analyse abgeschlossen', 'fa-stethoscope');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnalyse);
} else {
    initAnalyse();
}
