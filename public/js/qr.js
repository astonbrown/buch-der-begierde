/**
 * qr.js — QR-Scanner (Simulation + optional echte Kamera)
 *
 * Simuliert die Muster-Erkennung eines QR-Codes mit Scan-Animation.
 * Bietet einen Fallback auf echte Kamera-Integration über getUserMedia
 * (falls vom Browser unterstützt und vom Benutzer gewünscht).
 *
 * Modus-Strategie:
 *   - 'simulated' (default): Animiertes 7×7 Grid + Scan-Linie
 *   - 'camera' (optional):   Echte getUserMedia-Kamera-Erkennung
 */

import { CONFIG } from './config.js';
import { showToast } from './toast.js';

const QRScanner = (() => {
    let _viewportEl = null;
    let _patternEl = null;
    let _scanLineEl = null;
    let _statusEl = null;
    let _videoEl = null;
    let _stream = null;
    let _listeners = [];
    let _mode = 'simulated';
    let _timeoutId = null;

    // Fiktives 7x7 QR-Muster (1 = filled, 0 = empty)
    const _SIMULATED_PATTERN = [
        1,1,1,0,1,1,1,
        1,0,1,0,1,0,1,
        1,1,1,0,1,1,1,
        0,0,0,0,0,0,0,
        1,0,1,1,0,1,0,
        1,1,0,0,1,1,1,
        0,1,1,1,0,0,1
    ];

    function _emit(event, data) {
        _listeners.forEach(fn => {
            try { fn(event, data); } catch (e) { console.warn('[QR] Listener error:', e); }
        });
    }

    /**
     * Rendert das simulierte 7×7 Pattern in den Viewport.
     */
    function _renderSimulatedPattern() {
        if (!_patternEl) return;
        _patternEl.innerHTML = '';

        _SIMULATED_PATTERN.forEach(v => {
            const cell = document.createElement('div');
            cell.classList.add('qr-cell');
            if (v === 0) cell.classList.add('empty');
            _patternEl.appendChild(cell);
        });
    }

    /**
     * Führt die simulierte Scan-Sequenz aus.
     */
    function _runSimulatedScan() {
        // Status: Scanning
        if (_statusEl) {
            _statusEl.innerHTML =
                '<span class="scanning"><i class="fas fa-circle-notch fa-spin"></i></span> Warte auf Scan...';
            _statusEl.style.color = '';
        }

        // Scan-Linie aktivieren
        if (_scanLineEl) {
            _scanLineEl.style.animationPlayState = 'running';
            _scanLineEl.style.opacity = '1';
        }

        // Nach QR_SCAN_DURATION: Erfolg simulieren
        _timeoutId = setTimeout(() => {
            if (_scanLineEl) {
                _scanLineEl.style.animationPlayState = 'paused';
                _scanLineEl.style.opacity = '0';
            }
            if (_statusEl) {
                _statusEl.innerHTML =
                    '<i class="fas fa-check-circle" style="color: var(--gold);"></i> Muster erkannt — Verknüpfung aktiv';
                _statusEl.style.color = 'var(--gold)';
            }
            showToast('QR-Muster verknüpft', 'fa-qrcode');
            _emit('qr:detected', { mode: 'simulated', pattern: _SIMULATED_PATTERN });
        }, CONFIG.QR_SCAN_DURATION);
    }

    /**
     * Versucht echten Kamera-Zugriff via getUserMedia.
     * @returns {Promise<boolean>}
     */
    async function _tryCamera() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            return false;
        }

        try {
            _stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });

            // Video-Element erstellen falls noch nicht vorhanden
            if (!_videoEl) {
                _videoEl = document.createElement('video');
                _videoEl.setAttribute('playsinline', '');
                _videoEl.style.width = '100%';
                _videoEl.style.height = '100%';
                _videoEl.style.objectFit = 'cover';
                if (_viewportEl) _viewportEl.appendChild(_videoEl);
            }

            _videoEl.srcObject = _stream;
            await _videoEl.play();
            return true;
        } catch (e) {
            console.warn('[QR] Kamera-Zugriff fehlgeschlagen:', e);
            _stream = null;
            return false;
        }
    }

    /**
     * Beendet einen laufenden Kamera-Stream.
     */
    function _stopCameraStream() {
        if (_stream) {
            _stream.getTracks().forEach(t => t.stop());
            _stream = null;
        }
        if (_videoEl) {
            _videoEl.pause();
            _videoEl.remove();
            _videoEl = null;
        }
    }

    /* --- Öffentliche API ------------------------------------------- */

    /**
     * Initialisiert den QR-Scanner.
     * @param {object} els - { viewportId, patternId, scanLineId, statusId }
     * @param {string} mode - 'simulated' | 'camera' (default: 'simulated')
     */
    function init(els, mode) {
        _viewportEl = document.getElementById(els.viewportId);
        _patternEl = document.getElementById(els.patternId);
        _scanLineEl = document.getElementById(els.scanLineId);
        _statusEl = document.getElementById(els.statusId);
        _mode = mode || 'simulated';

        if (_mode === 'simulated') {
            _renderSimulatedPattern();
            _runSimulatedScan();
        }
        // Kamera-Modus wird nur auf ausdrücklichen Request gestartet
    }

    /**
     * Versucht, in den Kamera-Modus zu wechseln.
     * Fällt auf Simulation zurück, falls Kamera nicht verfügbar.
     */
    async function requestCamera() {
        const ok = await _tryCamera();
        if (ok) {
            _mode = 'camera';
            if (_patternEl) _patternEl.style.display = 'none';
            if (_scanLineEl) _scanLineEl.style.display = 'none';
            showToast('Kamera aktiviert — halte den Code ins Bild', 'fa-camera');
            _emit('qr:camera_started', {});
        } else {
            showToast('Kamera nicht verfügbar — verwende Simulation', 'fa-exclamation-triangle');
            if (_mode !== 'simulated') {
                _mode = 'simulated';
                _renderSimulatedPattern();
                _runSimulatedScan();
            }
        }
        return ok;
    }

    /**
     * Startet den Scan neu.
     */
    function rescan() {
        if (_timeoutId) clearTimeout(_timeoutId);
        if (_mode === 'simulated') {
            _runSimulatedScan();
        }
    }

    function on(fn) { _listeners.push(fn); }
    function off(fn) { _listeners = _listeners.filter(l => l !== fn); }

    /**
     * Zerstört den Scanner und gibt Ressourcen frei.
     */
    function destroy() {
        if (_timeoutId) clearTimeout(_timeoutId);
        _stopCameraStream();
    }

    /** @returns {string} */
    function getMode() { return _mode; }

    return Object.freeze({
        init, requestCamera, rescan,
        on, off, destroy, getMode
    });
})();

export default QRScanner;
