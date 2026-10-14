/**
 * toast.js — Toast-Benachrichtigungssystem
 * Zeigt temporäre Benachrichtigungen oben rechts an.
 */

import { CONFIG } from './config.js';

/**
 * Zeigt eine Toast-Benachrichtigung an.
 * @param {string} message - Anzeigetext
 * @param {string} icon - Font Awesome Icon-Klasse (default: 'fa-check')
 * @param {string} containerId - ID des Toast-Containers (default: 'toastContainer')
 */
export function showToast(message, icon, containerId) {
    icon = icon || 'fa-check';
    const containerIdFinal = containerId || 'toastContainer';
    const container = document.getElementById(containerIdFinal);
    if (!container) return;

    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;

    container.appendChild(toast);

    // Doppelter rAF für reliable Transition
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, CONFIG.TOAST_DURATION);
}
