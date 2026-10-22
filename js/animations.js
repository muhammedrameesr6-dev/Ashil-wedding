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

  // ===== RSVP FORM =====
  function initRSVP() {
    var form = document.getElementById('rsvp-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var btn = form.querySelector('.rsvp-btn');
      var originalHTML = btn.innerHTML;
      var cfg = (window.WEDDING_CONFIG || {});

      // Collect form data
      var data = {
        name:    form.querySelector('[name="name"]')    ? form.querySelector('[name="name"]').value    : '',
        phone:   form.querySelector('[name="phone"]')   ? form.querySelector('[name="phone"]').value   : '',
        guests:  form.querySelector('[name="guests"]')  ? form.querySelector('[name="guests"]').value  : '',
        event:   form.querySelector('[name="event"]')   ? form.querySelector('[name="event"]').value   : '',
        message: form.querySelector('[name="message"]') ? form.querySelector('[name="message"]').value : '',
        attend:  form.querySelector('[name="attend"]:checked') ? form.querySelector('[name="attend"]:checked').value : '',
      };

      // Loading state
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Sending…</span>';
      btn.disabled = true;

      // Post to Google Sheets (if URL provided in config, else simulate)
      var sheetsUrl = cfg.sheetsUrl || '';
      var doPost = sheetsUrl
        ? fetch(sheetsUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })
        : Promise.resolve();

      doPost
        .then(function() {
          btn.innerHTML = '<span style="color:#fff">✓ Jazakallah Khair!</span>';
          btn.style.background = 'linear-gradient(135deg,#6a9f6a,#3d7a3d)';
          setTimeout(function() {
            btn.innerHTML = originalHTML;
            btn.style.background = '';
            btn.disabled = false;
            form.reset();
          }, 3500);
        })
        .catch(function() {
          btn.innerHTML = '<span>Please try again</span>';
          btn.disabled = false;
          setTimeout(function() { btn.innerHTML = originalHTML; }, 2000);
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
    initRSVP();
    addCountdownStyle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
