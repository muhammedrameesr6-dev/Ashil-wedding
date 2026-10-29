// ===== MAIN JS =====
(function() {
  'use strict';

  var CFG = window.WEDDING_CONFIG || {};

  // ===== FIREBASE & SHARED HELPERS =====
  var database = null;
  try {
    if (typeof firebase !== 'undefined' && firebase.database) {
      database = firebase.database();
    }
  } catch (e) {
    console.warn('Firebase init fallback:', e);
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  }

  function formatDate(timestamp) {
    var date = new Date(timestamp);
    var months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    var day = date.getDate();
    var month = months[date.getMonth()];
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return day + ' ' + month + ' AT ' + hours + ':' + minutes + ' ' + ampm;
  }

  // ===== REAL VIEWPORT HEIGHT FIX (iOS Safari address-bar bug) =====
  // iOS Safari's 100vh/100dvh doesn't reliably match the true visible
  // viewport on some iPhones, leaving a white gap below fixed elements
  // like the gate. We measure the real height with JS and expose it as
  // a CSS variable that the gate/body use instead.
  function setRealViewportHeight() {
    var vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', vh + 'px');
  }
  setRealViewportHeight();
  window.addEventListener('resize', setRealViewportHeight);
  window.addEventListener('orientationchange', setRealViewportHeight);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', setRealViewportHeight);
  }

  // ===== BACKGROUND MUSIC =====
  // Exposed on the outer scope so initGate() can call it directly from
  // the "Open Invitation" tap handler. Android Chrome is strict about
  // audio.play() needing to run inside the actual user-gesture call
  // stack — relying only on a bubbled document-level listener isn't
  // always reliable there, so we call this straight from the button too.
  var startMusicOnInteraction = function(){};

  function initMusic() {
    var audio     = document.getElementById('bg-music');
    var muteBtn   = document.getElementById('mute-btn');
    var iconSound = document.getElementById('icon-sound');
    var iconMuted = document.getElementById('icon-muted');
    if (!audio || !muteBtn) return;

    var musicCfg = CFG.music || {};
    audio.volume = musicCfg.volume != null ? musicCfg.volume : 0.45;
    var started = false;

    function setMutedState(muted) {
      if (muted) {
        audio.pause();
        iconSound.style.display = 'none';
        iconMuted.style.display = '';
        muteBtn.classList.add('muted');
        muteBtn.setAttribute('aria-label', 'Unmute music');
      } else {
        audio.play().catch(function(){});
        iconSound.style.display = '';
        iconMuted.style.display = 'none';
        muteBtn.classList.remove('muted');
        muteBtn.setAttribute('aria-label', 'Mute music');
      }
    }

    // Try immediate autoplay
    window.addEventListener('load', function() {
      audio.play()
        .then(function() { started = true; })
        .catch(function(){});
    });

    function startOnInteraction() {
      if (!started) {
        started = true;
        var playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function() {
            // Autoplay was blocked even on this gesture; allow a later
            // gesture to retry instead of staying stuck as "started".
            started = false;
          });
        }
      }
    }
    startMusicOnInteraction = startOnInteraction;

    document.addEventListener('click',      startOnInteraction, { once: true });
    document.addEventListener('scroll',     startOnInteraction, { once: true });
    document.addEventListener('touchstart', startOnInteraction, { once: true });

    muteBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      startOnInteraction();
      setMutedState(!audio.paused);
    });
  }

  // ===== MOBILE NAV TOGGLE =====
  function initMobileNav() {
    var burger   = document.querySelector('.nav-burger');
    var navLinks = document.querySelector('.nav-links');
    if (!burger || !navLinks) return;

    burger.addEventListener('click', function() {
      navLinks.classList.toggle('open');
      burger.classList.toggle('active');
    });
  }

  // ===== INTERSECTION OBSERVER FOR SECTION TRACKING =====
  function initSectionTracking() {
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    if (!navLinks.length) return;

    var sectionObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          navLinks.forEach(function(link) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { threshold: 0.4 });

    sections.forEach(function(s) { sectionObserver.observe(s); });
  }

  // ===== LIGHTBOX (gallery) =====
  function initLightbox() {
    var lightbox = document.getElementById('lightbox');
    var lbImg    = document.getElementById('lightbox-img');
    var lbClose  = document.getElementById('lightbox-close');
    var lbPrev   = document.getElementById('lightbox-prev');
    var lbNext   = document.getElementById('lightbox-next');
    if (!lightbox || !lbImg) return;

    var galleryImgs = Array.prototype.slice.call(document.querySelectorAll('.gallery-item img'));
    var currentIndex = 0;

    function showImage(index) {
      if (!galleryImgs.length) {
        galleryImgs = Array.prototype.slice.call(document.querySelectorAll('.gallery-item img'));
      }
      if (!galleryImgs.length) return;
      if (index < 0) index = galleryImgs.length - 1;
      if (index >= galleryImgs.length) index = 0;
      currentIndex = index;
      lbImg.src = galleryImgs[currentIndex].src;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    // Expose globally so inline onclick / touch can invoke it with 100% reliability
    window.openMemory = showImage;

    document.querySelectorAll('.gallery-item').forEach(function(item, idx) {
      item.addEventListener('click', function(e) {
        e.preventDefault();
        showImage(idx);
      });
      item.addEventListener('touchend', function(e) {
        e.preventDefault();
        showImage(idx);
      }, { passive: false });
    });

    function closeLightbox(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (lbClose) {
      lbClose.addEventListener('click', closeLightbox);
      lbClose.addEventListener('touchend', closeLightbox, { passive: false });
    }
    if (lbPrev) {
      lbPrev.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        showImage(currentIndex - 1);
      });
      lbPrev.addEventListener('touchend', function(e) {
        e.preventDefault();
        e.stopPropagation();
        showImage(currentIndex - 1);
      }, { passive: false });
    }
    if (lbNext) {
      lbNext.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        showImage(currentIndex + 1);
      });
      lbNext.addEventListener('touchend', function(e) {
        e.preventDefault();
        e.stopPropagation();
        showImage(currentIndex + 1);
      }, { passive: false });
    }

    lightbox.addEventListener('click', function(e) {
      if (e.target === lightbox) closeLightbox(e);
    });

    document.addEventListener('keydown', function(e) {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox(e);
      if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
      if (e.key === 'ArrowRight') showImage(currentIndex + 1);
    });
  }

  // ===== RSVP SYSTEM & OWNER DASHBOARD =====
  function initRSVP() {
    var form = document.getElementById('rsvp-form');
    var nameInput = document.getElementById('rsvpName');
    var optionYes = document.getElementById('rsvpOptionYes');
    var optionNo = document.getElementById('rsvpOptionNo');
    var guestsGroup = document.getElementById('rsvpGuestsGroup');
    var guestsSelect = document.getElementById('rsvpGuests');
    var messageInput = document.getElementById('rsvpMessage');
    var submitBtn = document.getElementById('rsvpSubmitBtn');
    var successCard = document.getElementById('rsvpSuccessMsg');
    var successDesc = document.getElementById('rsvpSuccessDesc');
    var newResponseBtn = document.getElementById('rsvpNewResponseBtn');
    var waBtn = document.getElementById('rsvpWhatsAppBtn');

    // Admin / Owner elements
    var wishesDisplay = document.getElementById('wishesDisplay');
    var statTotal = document.getElementById('rsvpStatTotal');
    var statAttending = document.getElementById('rsvpStatAttending');
    var statDeclined = document.getElementById('rsvpStatDeclined');
    var adminList = document.getElementById('rsvpAdminList');
    var wishesList = document.getElementById('wishesList');
    var wishesCount = document.getElementById('wishesCount');
    var adminBadge = document.getElementById('wishesAdminBadge');
    var ownerLoginBtn = document.getElementById('ownerLoginBtn');
    var viewMoreContainer = document.getElementById('viewMoreContainer');
    var viewMoreBtn = document.getElementById('viewMoreBtn');
    var exportBtn = document.getElementById('rsvpExportBtn');

    try {
      localStorage.removeItem('wedding_owner_authed');
      sessionStorage.removeItem('wishesAdminAuthed');
    } catch (e) {}
    var isAdmin = false;
    var cachedRsvps = [];
    var cachedWishes = [];
    var displayLimit = 6;
    var showingAll = false;

    // Attendance toggle interactions
    if (form) {
      var radioInputs = form.querySelectorAll('input[name="attend"]');
      radioInputs.forEach(function(radio) {
        radio.addEventListener('change', function() {
          if (this.value === 'yes') {
            if (optionYes) optionYes.classList.add('selected');
            if (optionNo) optionNo.classList.remove('selected');
            if (guestsGroup) guestsGroup.style.display = 'block';
          } else {
            if (optionNo) optionNo.classList.add('selected');
            if (optionYes) optionYes.classList.remove('selected');
            if (guestsGroup) guestsGroup.style.display = 'none';
          }
        });
      });
    }

    // Local Storage helpers
    function saveLocalRSVP(item) {
      try {
        var existing = JSON.parse(localStorage.getItem('wedding_rsvps') || '[]');
        existing.push(item);
        localStorage.setItem('wedding_rsvps', JSON.stringify(existing));
      } catch (e) {}
    }

    function getLocalRSVPs() {
      try {
        return JSON.parse(localStorage.getItem('wedding_rsvps') || '[]');
      } catch (e) {
        return [];
      }
    }

    // Avatar color generator
    function getAvatarColor(name) {
      var colors = [
        'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
        'linear-gradient(135deg, #C8385C 0%, #7A1230 100%)',
        'linear-gradient(135deg, #D4A017 0%, #8F6608 100%)',
        'linear-gradient(135deg, #3D6B99 0%, #1F4468 100%)',
        'linear-gradient(135deg, #9C2F52 0%, #C9527A 100%)'
      ];
      var index = (name && name.length) ? name.charCodeAt(0) % colors.length : 0;
      return colors[index];
    }

    // Render RSVP list & stats for Owner
    function renderRsvps(rsvps) {
      var totalAttendingGuests = 0;
      var totalDeclined = 0;

      rsvps.forEach(function(r) {
        if (r.attend === 'yes') {
          totalAttendingGuests += (parseInt(r.guests, 10) || 1);
        } else {
          totalDeclined++;
        }
      });

      if (statTotal) statTotal.textContent = rsvps.length;
      if (statAttending) statAttending.textContent = totalAttendingGuests;
      if (statDeclined) statDeclined.textContent = totalDeclined;

      if (!adminList) return;
      adminList.innerHTML = '';

      if (rsvps.length === 0) {
        adminList.innerHTML = '<p style="text-align:center; color:var(--text-light); font-style:italic; padding:18px;">No RSVPs received yet.</p>';
        return;
      }

      rsvps.forEach(function(item) {
        var card = document.createElement('div');
        card.className = 'rsvp-admin-item';

        var isAttending = item.attend === 'yes';
        var badgeClass = isAttending ? 'attending' : 'declined';
        var guestNum = parseInt(item.guests, 10) || 1;
        var badgeText = isAttending
          ? ('<i class="fas fa-check"></i> Attending (' + guestNum + ' guest' + (guestNum > 1 ? 's' : '') + ')')
          : '<i class="fas fa-times"></i> Cannot Attend';

        var html =
          '<div class="rsvp-admin-info">' +
            '<div class="rsvp-admin-header">' +
              '<span class="rsvp-admin-name">' + escapeHtml(item.name || 'Anonymous') + '</span>' +
              '<span class="rsvp-badge ' + badgeClass + '">' + badgeText + '</span>' +
            '</div>';

        if (item.message) {
          html += '<div class="rsvp-admin-msg">“' + escapeHtml(item.message) + '”</div>';
        }

        if (item.timestamp) {
          html += '<div class="rsvp-admin-time"><i class="far fa-clock"></i> ' + formatDate(item.timestamp) + '</div>';
        }

        html += '</div>';
        card.innerHTML = html;

        if (isAdmin && item.id && database) {
          var delBtn = document.createElement('button');
          delBtn.type = 'button';
          delBtn.className = 'rsvp-delete-btn';
          delBtn.setAttribute('aria-label', 'Delete RSVP');
          delBtn.title = 'Delete response';
          delBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
          delBtn.addEventListener('click', function() {
            if (window.confirm('Delete RSVP from "' + item.name + '"?')) {
              database.ref('wishes/' + item.id).remove();
            }
          });
          card.appendChild(delBtn);
        }

        adminList.appendChild(card);
      });
    }

    // Render wishes wall list
    function displayWishes(wishes) {
      if (!wishesList || !wishesDisplay) return;
      wishesList.innerHTML = '';

      if (!isAdmin) {
        wishesDisplay.style.display = 'none';
        return;
      }

      wishesDisplay.style.display = 'block';
      if (wishesCount) wishesCount.textContent = wishes.length;

      if (wishes.length === 0) {
        wishesList.innerHTML = '<p style="text-align:center; color:var(--text-light); font-style:italic; padding:16px;">No wishes submitted yet.</p>';
        if (viewMoreContainer) viewMoreContainer.style.display = 'none';
        return;
      }

      var displayCount = showingAll ? wishes.length : Math.min(displayLimit, wishes.length);
      var wishesToShow = wishes.slice(0, displayCount);

      wishesToShow.forEach(function(wish) {
        var initial = (wish.name || 'A').charAt(0).toUpperCase();
        var avatarColor = getAvatarColor(wish.name || '');

        var isAttending = wish.attend !== 'no';
        var guestNum = parseInt(wish.guests, 10) || 1;
        var badgeHtml = isAttending
          ? '<span class="rsvp-badge attending" style="font-size: 11px; padding: 2px 8px; border-radius: 6px;"><i class="fas fa-check"></i> ' + guestNum + ' Guest' + (guestNum > 1 ? 's' : '') + '</span>'
          : '<span class="rsvp-badge declined" style="font-size: 11px; padding: 2px 8px; border-radius: 6px;"><i class="fas fa-times"></i> Cannot Attend</span>';

        var div = document.createElement('div');
        div.className = 'wish-item';
        div.setAttribute('data-aos', 'fade-up');

        div.innerHTML =
          '<div class="wish-avatar" style="background: ' + avatarColor + ';">' +
            '<span>' + initial + '</span>' +
          '</div>' +
          '<div class="wish-content">' +
            '<div class="wish-header" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px; margin-bottom: 4px;">' +
              '<span class="wish-author">' + escapeHtml(wish.name || 'Well-wisher') + '</span>' +
              badgeHtml +
            '</div>' +
            '<div class="wish-message">' + escapeHtml(wish.message || '') + '</div>' +
            '<div class="wish-time">' + formatDate(wish.timestamp) + '</div>' +
          '</div>';

        if (isAdmin && wish.id && database) {
          var deleteBtn = document.createElement('button');
          deleteBtn.type = 'button';
          deleteBtn.className = 'wish-delete-btn';
          deleteBtn.setAttribute('aria-label', 'Delete this wish');
          deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
          deleteBtn.addEventListener('click', function() {
            if (window.confirm('Delete the wish from "' + wish.name + '"?')) {
              database.ref('wishes/' + wish.id).remove();
            }
          });
          var contentWrap = div.querySelector('.wish-content');
          if (contentWrap) contentWrap.appendChild(deleteBtn);
        }

        wishesList.appendChild(div);
        if (typeof window.observeAOS === 'function') {
          window.observeAOS(div);
        } else {
          div.classList.add('aos-animate');
        }
      });

      if (wishes.length > displayLimit && !showingAll) {
        if (viewMoreContainer) viewMoreContainer.style.display = 'block';
      } else {
        if (viewMoreContainer) viewMoreContainer.style.display = 'none';
      }
    }

    // Update Admin UI state (Owner View)
    function updateAdminUI() {
      if (adminBadge) adminBadge.style.display = isAdmin ? 'inline-flex' : 'none';
      if (ownerLoginBtn) {
        ownerLoginBtn.innerHTML = isAdmin
          ? '<i class="fas fa-lock-open"></i> Lock & Hide Owner View'
          : '<i class="fas fa-lock"></i> Owner View';
      }
      if (wishesDisplay) {
        if (isAdmin) {
          wishesDisplay.style.removeProperty('display');
          wishesDisplay.style.display = 'block';
        } else {
          wishesDisplay.style.setProperty('display', 'none', 'important');
        }
      }
      renderRsvps(cachedRsvps);
      displayWishes(cachedWishes);
    }

    // Check ?admin=1 in URL
    (function checkAdminMode() {
      var params = new URLSearchParams(window.location.search);
      if (params.get('admin') === '1' && !isAdmin) {
        var configuredPassword = (window.WEDDING_CONFIG && window.WEDDING_CONFIG.admin && window.WEDDING_CONFIG.admin.password) || '123456';
        var entered = window.prompt('Enter Owner Password:');
        if (entered === configuredPassword) {
          isAdmin = true;
          updateAdminUI();
        } else if (entered !== null) {
          alert('Incorrect password.');
        }
      }
    })();

    // Owner Login button
    if (ownerLoginBtn) {
      ownerLoginBtn.addEventListener('click', function() {
        if (isAdmin) {
          isAdmin = false;
          updateAdminUI();
          return;
        }
        var configuredPassword = (window.WEDDING_CONFIG && window.WEDDING_CONFIG.admin && window.WEDDING_CONFIG.admin.password) || '123456';
        var entered = window.prompt('Enter Owner Password:');
        if (entered === configuredPassword) {
          isAdmin = true;
          updateAdminUI();
          setTimeout(function() {
            if (wishesDisplay) {
              wishesDisplay.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }, 200);
        } else if (entered !== null) {
          alert('Incorrect password.');
        }
      });
    }

    // View More Wishes button
    if (viewMoreBtn) {
      viewMoreBtn.addEventListener('click', function() {
        showingAll = true;
        displayWishes(cachedWishes);
      });
    }

    // Export CSV of RSVPs
    if (exportBtn) {
      exportBtn.addEventListener('click', function() {
        if (!cachedRsvps.length) {
          alert('No RSVP responses to export yet.');
          return;
        }
        var csvRows = [
          ['Name', 'Will Attend', 'Guest Count', 'Message / Wish', 'Date Submitted'].map(function(h) { return '"' + h + '"'; }).join(',')
        ];
        cachedRsvps.forEach(function(r) {
          var dateStr = r.timestamp ? new Date(r.timestamp).toLocaleString() : '';
          var row = [
            r.name || '',
            r.attend === 'yes' ? 'Yes' : 'No',
            (r.attend === 'yes' ? (r.guests || 1) : 0),
            (r.message || '').replace(/"/g, '""'),
            dateStr
          ];
          csvRows.push(row.map(function(val) { return '"' + val + '"'; }).join(','));
        });
        var blob = new Blob([csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'Ashil_Athira_Wedding_RSVPs.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }

    // Realtime Database Listener (loads both RSVPs and Wishes)
    if (database) {
      database.ref('wishes').on('value', function(snapshot) {
        var data = snapshot.val();
        var rsvps = [];
        var wishes = [];

        if (data) {
          Object.keys(data).forEach(function(key) {
            var item = data[key];
            if (!item || typeof item !== 'object') return;
            item.id = key;

            // Only include entries for Ashil & Athira's wedding (Oct 22, 2026 onwards)
            var ts = item.timestamp || 0;
            if (ts < 1792000000000) return;

            // Ensure valid attend & guest count defaults
            if (!item.attend) {
              item.attend = 'yes';
            }
            if (typeof item.guests === 'undefined' || item.guests === null) {
              item.guests = 1;
            } else {
              item.guests = parseInt(item.guests, 10) || 1;
            }

            rsvps.push(item);
            if (item.message) {
              wishes.push(item);
            }
          });

          rsvps.sort(function(a, b) { return (b.timestamp || 0) - (a.timestamp || 0); });
          wishes.sort(function(a, b) { return (b.timestamp || 0) - (a.timestamp || 0); });
        }

        cachedRsvps = rsvps;
        cachedWishes = wishes;

        updateAdminUI();
      }, function(error) {
        console.warn('Firebase sync warning:', error);
        cachedRsvps = getLocalRSVPs();
        updateAdminUI();
      });
    } else {
      cachedRsvps = getLocalRSVPs();
      updateAdminUI();
    }

    // Form submission
    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();

        var name = nameInput ? nameInput.value.trim() : '';
        var checkedRadio = form.querySelector('input[name="attend"]:checked');
        var attend = checkedRadio ? checkedRadio.value : 'yes';
        var guests = (attend === 'yes') ? (parseInt(guestsSelect ? guestsSelect.value : 1, 10) || 1) : 0;
        var message = messageInput ? messageInput.value.trim() : '';

        if (!name) {
          alert('Please enter your full name.');
          if (nameInput) nameInput.focus();
          return;
        }

        var originalBtnHTML = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
          submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>RECORDING RSVP...</span>';
          submitBtn.disabled = true;
        }

        // Firebase rule requires name and message (length > 0)
        var finalMessage = message || (attend === 'yes'
          ? ('Joyfully accepting with ' + (guests === 1 ? '1 guest' : guests + ' guests') + '! Looking forward to celebrating! 🎉')
          : 'Sending our warmest prayers and congratulations to Ashil & Athira Elsa! 🤍');

        var rsvpPayload = {
          name: name,
          attend: attend,
          guests: guests,
          message: finalMessage,
          isRsvp: true,
          timestamp: Date.now()
        };

        function finishSubmission() {
          form.style.display = 'none';
          if (successCard) {
            successCard.style.display = 'block';
          }
          if (successDesc) {
            if (attend === 'yes') {
              successDesc.textContent =
                'Thank you, ' + name + '! Your RSVP for ' +
                (guests === 1 ? '1 guest' : guests + ' guests') +
                ' has been successfully recorded. We look forward to celebrating with you!';
            } else {
              successDesc.textContent =
                'Thank you, ' + name + '! We will miss you on our special day, but we deeply cherish your blessings and prayers.';
            }
          }

          // Setup WhatsApp Confirmation link to Groom's Family (+91 99611 22059)
          if (waBtn) {
            var waAttendance = (attend === 'yes')
              ? ('Yes, Joyfully Accept (' + guests + (guests === 1 ? ' Guest' : ' Guests') + ')')
              : 'Regretfully Decline (Cannot Attend)';
            var waText =
              '💍 *Wedding RSVP — Ashil & Athira Elsa*\n\n' +
              '• *Name*: ' + name + '\n' +
              '• *Attendance*: ' + waAttendance + '\n' +
              (message ? ('• *Wishes*: ' + message + '\n') : '') +
              '\n_Sent via Wedding Invitation Website_';

            waBtn.href = 'https://wa.me/919961122059?text=' + encodeURIComponent(waText);
            waBtn.style.display = 'inline-flex';
          }

          if (submitBtn) {
            submitBtn.innerHTML = originalBtnHTML;
            submitBtn.disabled = false;
          }
        }

        // Save locally immediately
        saveLocalRSVP(rsvpPayload);

        // Save to Firebase RTDB under 'wishes' (which is open for write)
        if (database) {
          database.ref('wishes').push(rsvpPayload, function(error) {
            if (error) {
              console.error('Firebase save error:', error);
            }
            finishSubmission();
          });
        } else {
          finishSubmission();
        }
      });
    }

    // Reset button
    if (newResponseBtn) {
      newResponseBtn.addEventListener('click', function() {
        if (form) {
          form.reset();
          if (optionYes) optionYes.classList.add('selected');
          if (optionNo) optionNo.classList.remove('selected');
          if (guestsGroup) guestsGroup.style.display = 'block';
          form.style.display = 'block';
        }
        if (successCard) successCard.style.display = 'none';
        if (waBtn) waBtn.style.display = 'none';
        if (nameInput) nameInput.focus();
      });
    }
  }

  // ===== INIT =====
  document.addEventListener('DOMContentLoaded', function() {
    document.body.classList.add('page-loaded');
    initMusic();
    initMobileNav();
    initSectionTracking();
    initLightbox();
    initRSVP();
  });
})();
