// ===== SCROLL ANIMATIONS (Custom AOS-like) =====
(function() {
  'use strict';

  let observer;

  function initAOS() {
    const elements = document.querySelectorAll('[data-aos]');
    
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseInt(el.getAttribute('data-aos-delay') || 0);
          setTimeout(() => {
            el.classList.add('aos-animate');
          }, delay);
          observer.unobserve(el);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach(el => observer.observe(el));
  }

  // Expose a way for dynamically-added elements (e.g. wishes loaded from
  // Firebase after page load) to be picked up by the same fade-up animation.
  window.observeAOS = function(el) {
    if (observer && el) {
      observer.observe(el);
    } else if (el) {
      // Observer not ready yet; just show the element immediately.
      el.classList.add('aos-animate');
    }
  };

  // ===== NAV SCROLL EFFECT =====
  function initNav() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 80) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    });
  }

  // ===== SMOOTH SCROLL =====
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ===== COUNTDOWN FLIP ANIMATION STYLE =====
  function addCountdownStyle() {
    const style = document.createElement('style');
    style.textContent = `
      .countdown-number.flip {
        animation: countFlip 0.3s ease;
      }
      @keyframes countFlip {
        0% { transform: translateY(0); opacity: 1; }
        50% { transform: translateY(-8px); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  // ===== INIT ALL =====
  function init() {
    initAOS();
    initNav();
    initSmoothScroll();
    addCountdownStyle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
