/**
 * ============================================================
 *  WEDDING CONFIGURATION — SAJJAD ALI & AYESHA SIDDIQUA
 *  Edit this file to update all wedding details across the site
 * ============================================================
 */
window.WEDDING_CONFIG = {

  /* ── SEO & METADATA ─────────────────────────────────────── */
  seo: {
    title:             'Sajjad Ali & Ayesha Siddiqua | Wedding Invitation',
    description:       'With the blessings of Allah, join us in celebrating the wedding of Sajjad Ali & Ayesha Siddiqua — Nikah on 17 September 2026 at Nandagokula Convention Centre, Hassan, and Reception on 20 September 2026 at Wind Valley Resort, Cherkala.',
    ogTitle:           'Sajjad Ali & Ayesha Siddiqua | Wedding Invitation',
    ogDescription:     'You are warmly invited to the wedding of Sajjad Ali & Ayesha Siddiqua — 17 & 20 September 2026.',
    ogImage:           'og-image.jpg',
    canonicalUrl:      'https://sajjad-ayesha.wedding/',
    themeColor:        '#C8A96A',
  },

  /* ── COUPLE ─────────────────────────────────────────────── */
  groom: {
    firstName:         'Sajjad',
    fullName:          'Sajjad Ali',
    role:              'The Groom',
    parentLabel:       'Beloved Son of',
    parents: [
      { name: 'Mr. SK Abbas Ali',    prefix: '' },
      { name: 'Mrs. Zuhara Abbas Ali', prefix: '&' },
    ],
  },

  bride: {
    firstName:         'Ayesha',
    fullName:          'Ayesha Siddiqua',
    role:              'The Bride',
    parentLabel:       'Beloved Daughter of',
    parents: [
      { name: 'Mr. Muneer Ahmed',      prefix: '' },
      { name: 'Mrs. Nishath Fathima',  prefix: '&' },
    ],
  },

  /* ── HOSTING FAMILY ─────────────────────────────────────── */
  host: {
    familyName:        'ALI FAMILY',
    hostName:          'Mr. SK Abbas Ali & Mrs. Zuhara Abbas Ali',
    hostTitle:         'solicit your esteemed presence with your family',
    inviteIntro:       'on the occasion of the wedding ceremony of our son',
    navLogo:           'S & A',
  },

  /* ── DATES ───────────────────────────────────────────────── */
  dates: {
    displayRange:      '17 & 20 September 2026',
    displayDot:        '17 · 20 · 2026',
  },

  /* ── COUNTDOWN ───────────────────────────────────────────── */
  countdown: {
    nikkah: {
      label:   'Nikah Ceremony',
      target:  '2026-09-17T12:30:00',
    },
    reception: {
      label:   'Reception',
      target:  '2026-09-20T16:00:00',
    },
  },

  /* ── EVENTS ──────────────────────────────────────────────── */
  events: [
    {
      id:        'nikah',
      type:      'Sacred Ceremony',
      title:     'Nikah',
      icon:      'fas fa-mosque',
      dayName:   'Thursday',
      date:      '17 September 2026',
      hijriDate: '1448, Rabi al-Akhir 6',
      time:      '12:30 PM',
      venue: {
        name:    'NANDAGOKULA CONVENTION CENTRE',
        address: 'Hassan',
      },
      mapsUrl:   'https://www.google.com/maps/search/?api=1&query=Nandagokula+Convention+Centre%2C+Hassan',
      mapsLabel: 'Open Google Maps',
    },
    {
      id:        'reception',
      type:      'Celebration',
      title:     'Reception',
      icon:      'fas fa-star',
      dayName:   'Sunday',
      date:      '20 September 2026',
      hijriDate: '1448, Rabi al-Akhir 9',
      time:      '4:00 PM Onwards',
      venue: {
        name:    'WIND VALLEY RESORT',
        address: 'Cherkala',
      },
      mapsUrl:   'https://www.google.com/maps/search/?api=1&query=Wind+Valley+Resort%2C+Cherkala',
      mapsLabel: 'Open Google Maps',
    },
  ],

  /* ── GALLERY IMAGES ──────────────────────────────────────── */
  gallery: [
    { src: 'assets/images/gallery-1.jpg', alt: 'Sajjad & Ayesha — Photo 1' },
    { src: 'assets/images/gallery-2.jpg', alt: 'Sajjad & Ayesha — Photo 2' },
    { src: 'assets/images/gallery-3.jpg', alt: 'Sajjad & Ayesha — Photo 3' },
    { src: 'assets/images/gallery-4.jpg', alt: 'Sajjad & Ayesha — Photo 4' },
    { src: 'assets/images/gallery-5.jpg', alt: 'Sajjad & Ayesha — Photo 5' },
  ],

  /* ── MUSIC ───────────────────────────────────────────────── */
  music: {
    src:    'assets/music.mp3',
    volume: 0.45,
  },

  /* ── REGARDS SECTION ─────────────────────────────────────── */
  regards: {
    heading: 'WITH LOVE FROM',
    columns: [
      {
        role:   "Groom's Family",
        names:  ['Mr. SK Abbas Ali & Mrs. Zuhara Abbas Ali', 'Ameen Manzil, Chalakkunnu, Vidya Nagar, Kasaragod'],
      },
      {
        role:   "Bride's Family",
        names:  ['Mr. Muneer Ahmed & Mrs. Nishath Fathima', 'Sahara Kitchenware, Hassan, Karnataka'],
      },
    ],
  },

  /* ── FOOTER ──────────────────────────────────────────────── */
  footer: {
    message:     'We look forward to celebrating this special day with you.',
    tagline:     'Best Compliments from Dear and Near Ones',
  },

  /* ── ADMIN (Wishes Wall moderation) ─────────────────────────
     Visit the site with ?admin=1 added to the URL, e.g.:
       https://your-site.com/?admin=1
     You'll be asked for this password once per browser session.
     CHANGE THIS to something only you know before sharing the link. */
  admin: {
    password: 'SajjadAyesha2026',
  },

};
