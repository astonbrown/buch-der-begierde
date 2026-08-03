/**
 * app-landing.js — Entry-Point für index.html
 * Video-Einstieg + Buch-Animation
 */

import { createParticles } from './atmosphere.js';

function initLanding() {
  // Partikel-Hintergrund
  createParticles('particles');

  // Buch-Szene: Nach Video-Überspringen oder Ende einblenden
  const video = document.getElementById('introVideo');
  const videoIntro = document.getElementById('videoIntro');
  const bookScene = document.getElementById('bookScene');

  if (video && videoIntro) {
    video.addEventListener('ended', () => {
      videoIntro.classList.add('hidden');
      bookScene.style.animation = 'fadeInScale 1.2s ease-out forwards';
    });
    // Fallback nach 6s
    setTimeout(() => {
      if (video.currentTime < 1) skipVideo();
    }, 6000);
  }

  // Menu-Animation
  const menu = document.getElementById('introMenu');
  if (menu) {
    menu.style.opacity = '0';
    setTimeout(() => {
      menu.style.animation = 'fadeInUp 1s ease-out forwards';
    }, 4500);
  }
}

window.skipVideo = function() {
  const videoIntro = document.getElementById('videoIntro');
  const bookScene = document.getElementById('bookScene');
  if (videoIntro) videoIntro.classList.add('hidden');
  if (bookScene) bookScene.style.animation = 'fadeInScale 1.2s ease-out forwards';
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLanding);
} else {
  initLanding();
}