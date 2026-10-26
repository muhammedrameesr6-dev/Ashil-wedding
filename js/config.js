/**
 * ============================================================
 *  WEDDING CONFIGURATION — ASHIL JOHNSON & DR. ATHIRA ELSA JOSE
 *  Edit this file to update all wedding details across the site
 * ============================================================
 */
window.WEDDING_CONFIG = {

  /* ── SEO & METADATA ─────────────────────────────────────── */
  seo: {
    title:             'Ashil Johnson & Dr. Athira Elsa Jose | Wedding Invitation',
    description:       '“They are no longer two, but one” (Matthew 19:6). Join us in celebrating the holy matrimony of Ashil Johnson & Dr. Athira Elsa Jose on Sunday, 31 January 2027 at Mar Ignation Orthodox Syrian Church, Kattakampal, followed by Lunch at Cathedral Hall, Pazhanji.',
    ogTitle:           'Ashil Johnson & Dr. Athira Elsa Jose | Wedding Invitation',
    ogDescription:     'You are warmly invited to the wedding of Ashil Johnson & Dr. Athira Elsa Jose — Sunday, 31 January 2027.',
    ogImage:           'og-image.jpg',
    canonicalUrl:      'https://ashil-athira.wedding/',
    themeColor:        '#C8A96A',
  },

  /* ── COUPLE ─────────────────────────────────────────────── */
  groom: {
    firstName:         'Ashil',
    fullName:          'Ashil Johnson',
    role:              'The Groom',
    parentLabel:       'Beloved Son of',
    parents: [
      { name: 'Mr. P.V. Johnson', prefix: '' },
      { name: 'Mrs. Rajani Johnson (Late)', prefix: '&' },
    ],
    address:           'Pulikkottil House, Pleasant Villa Karikkad, Thrissur Dt., Pin: 680519',
    phone:             '+91 99611 22059',
    brother:           'Ansil Johnson',
  },

  bride: {
    firstName:         'Athira',
    fullName:          'Dr. Athira Elsa Jose',
    role:              'The Bride',
    parentLabel:       'Beloved Daughter of',
    parents: [
      { name: 'Mr. Jose M Daniel', prefix: '' },
      { name: 'Mrs. Jiji Jose', prefix: '&' },
    ],
    address:           'Nedumtharayil House, Athirabhavan, V Kottayam, Pathanamthitta Dt.',
    brother:           'Ajo Daniel Jose',
  },

  /* ── HOSTING FAMILY ─────────────────────────────────────── */
  host: {
    familyName:        'JOHNSON FAMILY',
    hostName:          'Mr. P.V. Johnson & Mrs. Rajani Johnson (Late)',
    hostTitle:         'cordially invite your esteemed presence with family',
    inviteIntro:       'on the auspicious occasion of the marriage of our son',
    navLogo:           'A & A',
  },

  /* ── DATES ───────────────────────────────────────────────── */
  dates: {
    displayRange:      'Sunday, 31 January 2027',
    displayDot:        '31 · 01 · 2027',
  },

  /* ── COUNTDOWN ───────────────────────────────────────────── */
  countdown: {
    nikkah: {
      label:   'Marriage Ceremony',
      target:  '2027-01-31T10:30:00',
    },
    reception: {
      label:   'Lunch & Reception',
      target:  '2027-01-31T12:30:00',
    },
  },

  /* ── EVENTS ──────────────────────────────────────────────── */
  events: [
    {
      id:        'ceremony',
      type:      'Sacred Matrimony',
      title:     'Marriage Ceremony',
      icon:      'fas fa-church',
      dayName:   'Sunday',
      date:      '31 January 2027',
      time:      '10:30 AM',
      venue: {
        name:    'MAR IGNATION ORTHODOX SYRIAN CHURCH',
        address: 'Kattakampal, Thrissur',
      },
      mapsUrl:   'https://www.google.com/maps/search/?api=1&query=Mar+Ignation+Orthodox+Syrian+Church%2C+Kattakampal',
      mapsLabel: 'Open Google Maps',
    },
    {
      id:        'reception',
      type:      'Celebration & Fellowship',
      title:     'Lunch & Reception',
      icon:      'fas fa-glass-cheers',
      dayName:   'Sunday',
      date:      '31 January 2027',
      time:      'Following the Ceremony (12:30 PM)',
      venue: {
        name:    'CATHEDRAL HALL',
        address: 'Pazhanji, Thrissur',
      },
      mapsUrl:   'https://maps.app.goo.gl/Ly4dnR2w5ts1pYzM9',
      mapsLabel: 'Open Google Maps',
    },
  ],

  /* ── GALLERY IMAGES ──────────────────────────────────────── */
  gallery: [
    { src: 'assets/images/couple.jpg', alt: 'Ashil & Athira Elsa — Photo 1' },
    { src: 'assets/images/IMG_0015.jpg.jpeg', alt: 'Ashil & Athira Elsa — Photo 2' },
    { src: 'assets/images/IMG_0018.jpg.jpeg', alt: 'Ashil & Athira Elsa — Photo 3' },
    { src: 'assets/images/IMG_0022.JPG.jpeg', alt: 'Ashil & Athira Elsa — Photo 4' },
  ],

  /* ── MUSIC ───────────────────────────────────────────────── */
  music: {
    src:    'assets/music.mp3',
    volume: 0.45,
  },

  /* ── REGARDS SECTION ─────────────────────────────────────── */
  regards: {
    heading: 'WITH BEST COMPLIMENTS',
    compliments: 'Adlyn, Genesis',
    columns: [
      {
        role:   "Groom's Family",
        names:  [
          'Mr. P.V. Johnson & Mrs. Rajani Johnson (Late)',
          'Pulikkottil House, Pleasant Villa Karikkad, Thrissur Dt., Pin: 680519',
          'Mob: 9961122059',
        ],
      },
      {
        role:   "Bride's Family",
        names:  [
          'Mr. Jose M Daniel & Mrs. Jiji Jose',
          'Nedumtharayil House, Athirabhavan, V Kottayam, Pathanamthitta Dt.',
        ],
      },
    ],
  },

  /* ── FOOTER ──────────────────────────────────────────────── */
  footer: {
    message:     'We look forward to celebrating this sacred day with you.',
    tagline:     'With best compliments: Adlyn, Genesis',
  },

  /* ── ADMIN (Wishes Wall moderation) ───────────────────────── */
  admin: {
    password: '123456',
  },

};
