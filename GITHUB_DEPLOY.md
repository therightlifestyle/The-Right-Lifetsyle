# 🚀 TRL Service Engine V2 — GitHub Deploy Instructions

**Paste this entire file into a fresh chat with a GitHub plugin / AI coding agent.**

---

## ✅ What this is
The complete, production-ready **TRL Service Engine V2** (single-page app):
- 3-tier pricing (Starter / Growth OS / Premium Scale)
- **USD ⇄ PKR currency toggle** (rate: 280, Pakistan-first pricing)
- Full order modal with delivery ETAs
- WhatsApp order flow (pre-filled 50% deposit message)
- **Copy summary** button
- **ESC key** closes modal + mobile menu
- Mobile hamburger menu
- **Admin Dashboard** (unlock with PIN `9231`)
  - Today's orders KPI
  - Request payment → opens WhatsApp
- Results strip + "The TRL Standard" section
- Fully responsive + dark premium design

**Live preview ready:** Just open `index.html`

---

## 📦 Files to deploy (the 7 core files)

```
index.html
style.css
script.js
admin.html
WEEK1-2_EXECUTION_PACK.md
GITHUB_DEPLOY.md
README.md
```

---

## 🛠️ EXACT STEPS (copy-paste ready)

1. **Create new repo** named: `TRL-SERVICE-ENGINE`

2. **Upload / push these files** (the plugin will handle it):
   - `index.html`
   - `style.css`
   - `script.js`
   - (optional) `GITHUB_DEPLOY.md` + this README

3. **Enable GitHub Pages**:
   - Go to repo → Settings → Pages
   - Source: `Deploy from a branch` → `main` → `/ (root)`
   - Save

4. **Your live URL will be**:
   ```
   https://YOUR-USERNAME.github.io/TRL-SERVICE-ENGINE/
   ```

---

## 🔑 IMPORTANT CONFIG (change these)

### In `script.js`:
```js
const EXCHANGE_RATE = 280;   // ← Update if rate changes
const ADMIN_PIN = '9231';    // ← Change this to your secret PIN
```

### In `index.html` (footer + links):
- WhatsApp number: `923190091457` → replace with real number
- Founder email

### In the modal:
- Deposit flow is hardcoded to 50%

---

## 🧪 Quick Test After Deploy

1. Open the live site
2. Click **PKR** toggle → all prices instantly switch
3. Click any **Order** button → modal opens with correct ETA
4. Fill form → **Copy Summary** or **Send via WhatsApp**
5. Scroll to bottom → **Admin Dashboard**
   - Enter PIN: `9231`
   - See demo orders + "Request Payment" buttons
6. Press **ESC** while modal is open → closes
7. On mobile: hamburger menu works

---

## 📁 Full Package Contents (for ZIP)

If you want to ship the complete offline package:

```
TRL-SERVICE-ENGINE/
├── index.html
├── style.css
├── script.js
├── GITHUB_DEPLOY.md
├── README.md
└── (future) privacy.html, etc.
```

---

## 🎯 Bonus: One-liner for the GitHub plugin

```
Create a new public GitHub repo called TRL-SERVICE-ENGINE.
Upload these exact files: index.html, style.css, script.js.
Enable GitHub Pages on the main branch (root).
Change the admin PIN in script.js to something private.
Report back the live URL.
```

---

**Ready to ship.**  
Everything is self-contained. No build step. Pure HTML/CSS/JS.

**TRL Standard:** Human-reviewed • Free revisions • On-time guarantee

— Generated for The Right Lifestyle (2026-08-10)