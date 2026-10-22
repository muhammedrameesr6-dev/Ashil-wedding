// ===== COUNTDOWN TIMER =====
// Reads dates from window.WEDDING_CONFIG (js/config.js)
(function() {
  'use strict';

  var cfg        = (window.WEDDING_CONFIG || {}).countdown || {};
  var NIKKAH     = new Date(cfg.nikkah    && cfg.nikkah.target    || '2026-08-08T18:45:00');
  var RECEPTION  = new Date(cfg.reception && cfg.reception.target || '2026-08-09T12:00:00');

  function pad(num) {
    return String(num).padStart(2, '0');
  }

  /* Determine which event to count down to */
  function getTarget() {
    var now = new Date();
    if (now < NIKKAH) {
      return { date: NIKKAH,    label: (cfg.nikkah    && cfg.nikkah.label)    || 'Nikkah Ceremony' };
    }
    if (now < RECEPTION) {
      return { date: RECEPTION, label: (cfg.reception && cfg.reception.label) || 'Reception' };
    }
    return null; // Both events have passed
  }

  /* Update the small event-label text below countdown */
  function updateEventLabel(label) {
    var el = document.getElementById('cd-event-label');
    if (el && el.textContent !== label) el.textContent = label;
  }

  function updateCountdown() {
    var target = getTarget();
    var now    = new Date();

    if (!target) {
      // Both events passed — show celebration message
      ['cd-days','cd-hours','cd-minutes','cd-seconds'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.textContent = '00';
      });
      updateEventLabel('Alhamdulillah — Celebrations Complete');
      return;
    }

    updateEventLabel(target.label);

    var diff = target.date - now;
    if (diff <= 0) {
      ['cd-days','cd-hours','cd-minutes','cd-seconds'].forEach(function(id) {
        setCountdownValue(id, '00');
      });
      return;
    }

    var days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    var hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((diff % (1000 * 60 * 60))      / (1000 * 60));
    var seconds = Math.floor((diff % (1000 * 60))            / 1000);

    setCountdownValue('cd-days',    pad(days));
    setCountdownValue('cd-hours',   pad(hours));
    setCountdownValue('cd-minutes', pad(minutes));
    setCountdownValue('cd-seconds', pad(seconds));
  }

  function setCountdownValue(id, newVal) {
    var el = document.getElementById(id);
    if (!el) return;
    if (el.textContent !== newVal) {
      el.classList.add('flip');
      setTimeout(function() { el.classList.remove('flip'); }, 300);
      el.textContent = newVal;
    }
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
})();
