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
    if (!lightbox || !lbImg) return;

    document.querySelectorAll('.gallery-item img').forEach(function(img) {
      img.addEventListener('click', function() {
        lbImg.src = img.src;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (lbClose) lbClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function(e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  // ===== RSVP FORM & MANAGEMENT =====
  function initRSVP() {
    var form = document.getElementById('rsvp-form');
    if (!form) return;

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

    // Attendance toggle interactions
    var radioInputs = form.querySelectorAll('input[name="attend"]');
    radioInputs.forEach(function(radio) {
      radio.addEventListener('change', function() {
        if (this.value === 'yes') {
          if (optionYes) optionYes.classList.add('selected');
          if (optionNo) optionNo.classList.remove('selected');
          if (guestsGroup) {
            guestsGroup.style.display = 'block';
          }
        } else {
          if (optionNo) optionNo.classList.add('selected');
          if (optionYes) optionYes.classList.remove('selected');
          if (guestsGroup) {
            guestsGroup.style.display = 'none';
          }
        }
      });
    });

    // Save to localStorage fallback
    function saveLocalRSVP(item) {
      try {
        var existing = JSON.parse(localStorage.getItem('wedding_rsvps') || '[]');
        existing.push(item);
        localStorage.setItem('wedding_rsvps', JSON.stringify(existing));
      } catch (e) {}
    }

    // Form submission
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
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>SENDING RSVP...</span>';
        submitBtn.disabled = true;
      }

      var rsvpData = {
        name: name,
        attend: attend,
        guests: guests,
        message: message,
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
              ' has been received with joy. We look forward to celebrating with you!';
          } else {
            successDesc.textContent =
              'Thank you, ' + name + '! We will miss you on our special day, but we deeply cherish your blessings and prayers.';
          }
        }

        if (submitBtn) {
          submitBtn.innerHTML = originalBtnHTML;
          submitBtn.disabled = false;
        }

        // Also if message is provided, save to wishes node as well so it appears on wishes wall
        if (message && database) {
          database.ref('wishes').push({
            name: name,
            message: message,
            timestamp: Date.now()
          });
        }
      }

      if (database) {
        database.ref('rsvps').push(rsvpData, function(error) {
          if (error) {
            console.error('Firebase RSVP error:', error);
            saveLocalRSVP(rsvpData);
          }
          finishSubmission();
        });
      } else {
        saveLocalRSVP(rsvpData);
        finishSubmission();
      }
    });

    // Reset button
    if (newResponseBtn) {
      newResponseBtn.addEventListener('click', function() {
        form.reset();
        if (optionYes) optionYes.classList.add('selected');
        if (optionNo) optionNo.classList.remove('selected');
        if (guestsGroup) guestsGroup.style.display = 'block';
        if (successCard) successCard.style.display = 'none';
        form.style.display = 'block';
        if (nameInput) nameInput.focus();
      });
    }
  }

  // ===== WISHES WALL WITH FIREBASE =====
  function initWishesWall() {
    var form = document.getElementById('wishesForm');
    var wishesDisplay = document.getElementById('wishesDisplay');
    var wishesList = document.getElementById('wishesList');
    var wishesCount = document.getElementById('wishesCount');

    // ── Admin / Owner mode ────────────────────────────────────
    // Only the owner with the password can see the wishes list
    var isAdmin = sessionStorage.getItem('wishesAdminAuthed') === 'true';
    var adminBadge = document.getElementById('wishesAdminBadge');
    var ownerLoginBtn = document.getElementById('ownerLoginBtn');

    function updateAdminUI() {
      if (adminBadge) adminBadge.style.display = isAdmin ? 'inline-flex' : 'none';
      if (ownerLoginBtn) {
        ownerLoginBtn.innerHTML = isAdmin
          ? '<i class="fas fa-lock-open"></i> Log out of Owner View'
          : '<i class="fas fa-lock"></i> Owner View';
      }
      displayWishes();
      loadRsvpsForOwner();
    }

    // Check ?admin=1 in URL
    (function checkAdminMode() {
      var params = new URLSearchParams(window.location.search);
      if (params.get('admin') === '1' && !isAdmin) {
        var configuredPassword = (window.WEDDING_CONFIG && window.WEDDING_CONFIG.admin && window.WEDDING_CONFIG.admin.password) || '123456';
        var entered = window.prompt('Enter Owner Password:');
        if (entered === configuredPassword) {
          sessionStorage.setItem('wishesAdminAuthed', 'true');
          isAdmin = true;
        } else if (entered !== null) {
          alert('Incorrect password.');
        }
      }
    })();

    if (ownerLoginBtn) {
      ownerLoginBtn.addEventListener('click', function() {
        if (isAdmin) {
          if (window.confirm('Log out of Owner View?')) {
            sessionStorage.removeItem('wishesAdminAuthed');
            isAdmin = false;
            updateAdminUI();
          }
          return;
        }
        var configuredPassword = (window.WEDDING_CONFIG && window.WEDDING_CONFIG.admin && window.WEDDING_CONFIG.admin.password) || '123456';
        var entered = window.prompt('Enter Owner Password:');
        if (entered === configuredPassword) {
          sessionStorage.setItem('wishesAdminAuthed', 'true');
          isAdmin = true;
          updateAdminUI();
          setTimeout(function() {
            wishesDisplay.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 200);
        } else if (entered !== null) {
          alert('Incorrect password.');
        }
      });
    }

    var viewMoreContainer = document.getElementById('viewMoreContainer');
    var viewMoreBtn = document.getElementById('viewMoreBtn');

    if (!form || !wishesDisplay || !wishesList) return;

    var displayLimit = 5;
    var allWishes = [];
    var showingAll = false;

    // Get avatar color based on name
    function getAvatarColor(name) {
      var colors = [
        'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
        'linear-gradient(135deg, #C8385C 0%, #7A1230 100%)',
        'linear-gradient(135deg, #D4A017 0%, #8F6608 100%)',
        'linear-gradient(135deg, #3D6B99 0%, #1F4468 100%)',
        'linear-gradient(135deg, #9C2F52 0%, #C9527A 100%)'
      ];
      var index = name.charCodeAt(0) % colors.length;
      return colors[index];
    }

    // Create wish HTML
    function createWishHTML(wish) {
      var initial = wish.name.charAt(0).toUpperCase();
      var avatarColor = getAvatarColor(wish.name);
      
      var div = document.createElement('div');
      div.className = 'wish-item';
      div.setAttribute('data-aos', 'fade-up');
      
      div.innerHTML = 
        '<div class="wish-avatar" style="background: ' + avatarColor + ';">' +
          '<span>' + initial + '</span>' +
        '</div>' +
        '<div class="wish-content">' +
          '<div class="wish-author">' + escapeHtml(wish.name) + '</div>' +
          '<div class="wish-message">' + escapeHtml(wish.message) + '</div>' +
          '<div class="wish-time">' + formatDate(wish.timestamp) + '</div>' +
        '</div>';

      if (isAdmin && wish.id) {
        var deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'wish-delete-btn';
        deleteBtn.setAttribute('aria-label', 'Delete this wish');
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteBtn.addEventListener('click', function() {
          if (window.confirm('Delete the wish from "' + wish.name + '"? This cannot be undone.')) {
            database.ref('wishes/' + wish.id).remove(function(error) {
              if (error) {
                alert('Could not delete: ' + error.message);
              }
            });
          }
        });
        div.appendChild(deleteBtn);
      }
      
      return div;
    }

    // Display wishes (Only shown to Owner in Admin mode)
    function displayWishes() {
      wishesList.innerHTML = '';
      
      if (!isAdmin) {
        wishesDisplay.style.display = 'none';
        return;
      }

      wishesDisplay.style.display = 'block';
      wishesCount.textContent = allWishes.length;

      if (allWishes.length === 0) {
        wishesList.innerHTML = '<p style="text-align:center; color:var(--text-light); font-style:italic; padding:16px;">No wishes submitted yet.</p>';
        if (viewMoreContainer) viewMoreContainer.style.display = 'none';
        return;
      }

      var displayCount = showingAll ? allWishes.length : Math.min(displayLimit, allWishes.length);
      var wishesToShow = allWishes.slice(0, displayCount);

      wishesToShow.forEach(function(wish) {
        var el = createWishHTML(wish);
        wishesList.appendChild(el);
        if (typeof window.observeAOS === 'function') {
          window.observeAOS(el);
        } else {
          el.classList.add('aos-animate');
        }
      });

      // Show/hide "View More" button
      if (allWishes.length > displayLimit && !showingAll) {
        viewMoreContainer.style.display = 'block';
      } else {
        viewMoreContainer.style.display = 'none';
      }
    }

    // Load RSVPs in Owner View
    function loadRsvpsForOwner() {
      var panel = document.getElementById('ownerRsvpPanel');
      var statTotal = document.getElementById('rsvpStatTotal');
      var statAttending = document.getElementById('rsvpStatAttending');
      var statDeclined = document.getElementById('rsvpStatDeclined');
      var adminList = document.getElementById('rsvpAdminList');

      if (!panel) return;

      if (!isAdmin) {
        panel.style.display = 'none';
        return;
      }

      panel.style.display = 'block';

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
          var badgeText = isAttending
            ? ('<i class="fas fa-check"></i> Attending (' + (item.guests || 1) + ' guest' + ((item.guests || 1) > 1 ? 's' : '') + ')')
            : '<i class="fas fa-times"></i> Cannot Attend';

          var html =
            '<div class="rsvp-admin-info">' +
              '<div class="rsvp-admin-header">' +
                '<span class="rsvp-admin-name">' + escapeHtml(item.name) + '</span>' +
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
            delBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
            delBtn.addEventListener('click', function() {
              if (window.confirm('Delete RSVP from "' + item.name + '"?')) {
                database.ref('rsvps/' + item.id).remove();
              }
            });
            card.appendChild(delBtn);
          }

          adminList.appendChild(card);
        });
      }

      if (!database) {
        var localRsvps = [];
        try {
          localRsvps = JSON.parse(localStorage.getItem('wedding_rsvps') || '[]');
        } catch (e) {}
        renderRsvps(localRsvps);
        return;
      }

      database.ref('rsvps').on('value', function(snapshot) {
        var data = snapshot.val();
        var rsvps = [];
        if (data) {
          Object.keys(data).forEach(function(key) {
            var item = data[key];
            item.id = key;
            rsvps.push(item);
          });
          rsvps.sort(function(a, b) {
            return (b.timestamp || 0) - (a.timestamp || 0);
          });
        }
        renderRsvps(rsvps);
      });
    }

    // Load wishes from Firebase
    function loadWishesFromFirebase() {
      if (!database) return;

      var wishesRef = database.ref('wishes');
      
      wishesRef.on('value', function(snapshot) {
        allWishes = [];
        var data = snapshot.val();
        
        if (data) {
          Object.keys(data).forEach(function(key) {
            var wish = data[key];
            wish.id = key;
            allWishes.push(wish);
          });
          
          // Sort by timestamp (newest first)
          allWishes.sort(function(a, b) {
            return b.timestamp - a.timestamp;
          });
        }
        
        displayWishes();
      });
    }

    // Save wish to Firebase
    function saveWishToFirebase(wish, callback) {
      if (!database) {
        callback(false);
        return;
      }

      var wishesRef = database.ref('wishes');
      var newWishRef = wishesRef.push();
      
      newWishRef.set(wish, function(error) {
        if (error) {
          console.error('Error saving wish:', error);
          callback(false);
        } else {
          callback(true);
        }
      });
    }

    // Handle form submission
    form.addEventListener('submit', function(e) {
      e.preventDefault();

      var nameInput = document.getElementById('wishesName');
      var messageInput = document.getElementById('wishesMessage');

      var name = nameInput.value.trim();
      var message = messageInput.value.trim();

      if (!name || !message) {
        alert('Please fill in both your name and message.');
        return;
      }

      if (message.length > 500) {
        alert('Message is too long. Please keep it under 500 characters.');
        return;
      }

      var wish = {
        name: name,
        message: message,
        timestamp: Date.now()
      };

      var btn = form.querySelector('.wishes-submit-btn');
      var originalText = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> SENDING...';
      btn.disabled = true;

      saveWishToFirebase(wish, function(success) {
        if (success) {
          // Clear form
          nameInput.value = '';
          messageInput.value = '';

          // Show success message
          btn.innerHTML = '<i class="fas fa-check"></i> WISH SENT!';

          var successMsg = document.getElementById('wishesSuccessMsg');
          if (successMsg) {
            successMsg.style.display = 'block';
          }

          setTimeout(function() {
            btn.innerHTML = originalText;
            btn.disabled = false;
          }, 3000);

          if (isAdmin) {
            // Scroll to wishes display only for owner
            setTimeout(function() {
              wishesDisplay.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 300);
          }
        } else {
          alert('Unable to save your wish. Please check your internet connection and try again.');
          btn.innerHTML = originalText;
          btn.disabled = false;
        }
      });
    });

    // View More button
    if (viewMoreBtn) {
      viewMoreBtn.addEventListener('click', function() {
        showingAll = true;
        displayWishes();
      });
    }

    // Initialize
    if (database) {
      loadWishesFromFirebase();
      loadRsvpsForOwner();
    } else {
      wishesDisplay.style.display = 'none';
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
    initWishesWall();
  });
})();