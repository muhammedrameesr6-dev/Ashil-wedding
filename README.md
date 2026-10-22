# Wedding Invitation Website (Clone)

Cloned from [https://sajjad-ayesha.vercel.app/](https://sajjad-ayesha.vercel.app/).

A luxury, interactive wedding invitation website featuring an opening gate animation, background music player, countdown timer, event itineraries, RSVP modal, interactive wishes wall (Firebase Realtime Database), and mobile-responsive layout.

---

## 📁 Project Structure

```text
├── assets/
│   ├── images/
│   │   ├── couple.jpg               # Gate cover couple photo
│   │   ├── IMG_0015.jpg.jpeg        # Hero background photo
│   │   ├── IMG_0018.jpg.jpeg        # Couple framed photo
│   │   ├── IMG_0022.JPG.jpeg        # Our story photo
│   │   ├── groom.jpeg               # Groom profile photo
│   │   ├── bride.jpeg               # Bride profile photo
│   │   └── gallery-1.jpg..5.jpg     # Optional photo gallery
│   └── music.mp3                    # Background instrumental music
├── css/
│   ├── style.css                    # Main stylesheet (typography, layout, components)
│   ├── animations.css               # AOS scroll animations, keyframes, transitions
│   └── responsive.css               # Breakpoints for mobile, tablet, and desktop
├── js/
│   ├── config.js                    # Site configuration (names, dates, venues, etc.)
│   ├── countdown.js                 # Dynamic event countdown logic
│   ├── animations.js                # Custom AOS-like observer and RSVP handler
│   ├── firebase-config.js           # Firebase credentials for Wishes Wall
│   └── main.js                      # Gate opening, audio player, wishes wall, lightbox
├── index.html                       # Main HTML document
├── og-image.jpg                     # Social media preview thumbnail (WhatsApp, IG)
├── robots.txt                       # Search engine crawler rules
└── README.md
```

---

## 🚀 How to Run Locally

Because the site loads audio and modular assets, run it using a local HTTP server:

### Option 1: Python 3
```bash
python3 -m http.server 8000
```
Then open [http://localhost:8000](http://localhost:8000) in your browser.

### Option 2: Node.js (npx serve)
```bash
npx serve .
```

### Option 3: VS Code / IDE Live Server
Right-click `index.html` and click **"Open with Live Server"**.

---

## ⚙️ Customization Guide

### 1. Wedding Details & Names
- **`js/config.js`**: Update couple names, ceremony and reception dates, venues, Google Maps links, and countdown targets.
- **`index.html`**: Update the displayed invitation text, Quranic / prayer verses, quotes, family regards, and event locations.

### 2. Photos & Music
- Replace images in `assets/images/` with your own photos keeping the file names, or update the image `src` paths in `index.html` and `js/config.js`.
- Replace `assets/music.mp3` with your preferred background track.

### 3. Firebase Wishes Wall
- Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
- Enable **Realtime Database** with read/write permissions for wishes.
- Update `js/firebase-config.js` with your Firebase config credentials.
- Moderate wishes at `http://your-site/?admin=1` using the password defined in `js/config.js` (`admin.password`).

### 4. RSVP Google Sheets Integration
- In `js/config.js` or `js/animations.js`, set `sheetsUrl` to your Google Apps Script web app endpoint if you want RSVPs directly recorded in a Google Sheet.
