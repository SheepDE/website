# Sheep Services - Minecraft Account Tools

Professional tools for managing your Minecraft accounts with a clean, minimal design.

## Features

- 🔐 **Microsoft TOTP Generator** - Auto-generating time-based codes
- 🌙 **Dark Mode Design** - Modern, minimalist interface
- ✨ **Smooth Animations** - Clean transitions and effects
- 📱 **Fully Responsive** - Works on all devices
- ⚡ **Real-time Updates** - Code refreshes every second
- 📋 **One-click Copy** - Click code or button to copy

## Deployment to Netlify

### Quick Setup:
1. Download these 3 files:
   - `index-v2.html` (rename to `index.html`)
   - `styles-v2.css` (rename to `styles.css`)
   - `script-v2.js` (rename to `script.js`)

2. Create a folder on your computer (e.g., "sheep-services")

3. Put all 3 files in this folder (with renamed filenames)

4. Go to [netlify.com](https://netlify.com) and sign in

5. Drag & drop the folder into the "Drop here" area

6. Done! Your site is live 🚀

### Custom Domain Setup

1. In Netlify: `Domain Settings` → `Add custom domain`
2. Enter `sheep.services`
3. Follow the DNS configuration instructions

### DNS Settings at your Domain Provider:

**A Record:**
```
Type: A
Name: @
Value: 75.2.60.5
```

**CNAME Record:**
```
Type: CNAME
Name: www
Value: your-site-name.netlify.app
```

## File Structure

```
sheep-services/
├── index.html       # Main page
├── styles.css       # Complete styling
└── script.js        # TOTP generator logic
```

## Technology Stack

- **Pure HTML/CSS/JavaScript** - No dependencies
- **TOTP Algorithm** - RFC 6238 compliant
- **HMAC-SHA1** - Custom implementation
- **Base32 Decoding** - For secret keys

## Browser Support

- Chrome/Edge ✅
- Firefox ✅
- Safari ✅
- Opera ✅

## Security

⚠️ **Important:** Your secret key is processed entirely in your browser. No data is sent to external servers.

## Design Philosophy

- **Minimal** - Clean interface with no clutter
- **Fast** - Instant generation, real-time updates
- **Smooth** - Subtle animations, no distractions
- **Professional** - Modern design language

---

Made for Minecraft Account Management
