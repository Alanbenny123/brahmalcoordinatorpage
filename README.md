# BRAHMA 26 - Coming Soon

A stunning, high-performance coming soon page with advanced animations and interactive effects.

![BRAHMA 26](https://img.shields.io/badge/Status-Coming%20Soon-orange?style=for-the-badge)
![Launch](https://img.shields.io/badge/Launch-2026-blue?style=for-the-badge)

## ✨ Features

### 🎨 Visual Effects
- **Animated Particle System** - 100+ floating particles with mouse interaction
- **3D Particle Network** - Dynamic connections between nearby particles
- **Custom Cursor** - Smooth following cursor with expansion on hover
- **Gradient Backgrounds** - Animated radial gradients with pulse effects
- **Noise Overlay** - Subtle texture for added depth
- **Glitch Text Effect** - Interactive text scramble on hover

### ⏱️ Countdown Timer
- **Live Countdown** - Real-time countdown to launch date
- **Smooth Animations** - Elegant number transitions
- **Gradient Numbers** - Stylized countdown display

### 📧 Email Notifications
- **Subscribe Form** - Collect emails for launch notifications
- **Email Validation** - Client-side validation
- **Success Feedback** - Animated submission confirmation
- **LocalStorage** - Prevents duplicate subscriptions

### 🎭 Animations & Interactions
- **Parallax Scrolling** - Hero section with depth effect
- **Text Reveal** - Staggered word animations on load
- **Magnetic Buttons** - Buttons that follow cursor
- **3D Hover Effects** - Cards tilt on mouse movement
- **Smooth Transitions** - Professional cubic-bezier easing

### 📱 Responsive Design
- **Mobile Optimized** - Fully responsive layout
- **Touch Friendly** - Adapted interactions for touch devices
- **Performance** - Optimized for all screen sizes

## 🚀 Quick Start

Simply open `index.html` in a web browser. No build process required!

```bash
# Open directly
open index.html

# Or serve with a local server
python -m http.server 8000
# Visit http://localhost:8000
```

## ⚙️ Configuration

### Change Launch Date

Edit `script.js` line ~560:

```javascript
const launchDate = new Date('2026-01-01T00:00:00').getTime();
```

### Update Brand Colors

Edit CSS custom properties in `styles.css`:

```css
:root {
    --primary-bg: #000000;
    --secondary-bg: #0a0a0a;
    --text-primary: #ffffff;
    --text-secondary: #888888;
}
```

### Modify Particle Count

Edit `script.js` particle initialization:

```javascript
const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
```

## 📂 File Structure

```
brahma-26/
├── index.html          # Main HTML structure
├── styles.css          # All styling and animations
├── script.js           # Interactive functionality
└── README.md           # This file
```

## 🎯 Key Sections

1. **Hero Section**
   - Animated particle canvas background
   - Large "BRAHMA 26" title with glitch effect
   - Coming soon badge with pulse animation
   - Countdown timer

2. **Notify Section**
   - Email subscription form
   - Magnetic button effects
   - Success/error messaging

3. **About Section**
   - Three feature cards (Innovation, Excellence, Impact)
   - Hover effects with shine animation
   - Icon animations

4. **Footer**
   - Social links
   - Copyright information

## 🎨 Animation Details

### Canvas Particles
- Randomly generated particles
- Mouse repulsion effect
- Dynamic line connections
- Smooth 60fps animation

### Text Effects
- Slide-up reveal on load
- Glitch scramble on hover
- Gradient highlights
- Shadow glows

### Interactive Elements
- Cursor follows with easing
- Magnetic pull on buttons
- 3D tilt on cards
- Smooth color transitions

## 🔧 Technologies

- **HTML5 Canvas** - Particle system
- **CSS3** - Animations, gradients, transforms
- **Vanilla JavaScript** - No dependencies
- **Intersection Observer** - Scroll animations
- **RequestAnimationFrame** - Smooth 60fps

## 📊 Performance

- Hardware-accelerated transforms
- Debounced scroll handlers
- Optimized particle count
- Lazy loading animations
- Reduced motion support

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## 📱 Responsive Breakpoints

- Desktop: 1024px+
- Tablet: 768px - 1023px
- Mobile: < 768px

## 🎪 Customization Tips

1. **Change particle colors**: Edit the particle `fillStyle` in `script.js`
2. **Adjust animation speed**: Modify `animation-delay` values in CSS
3. **Update social links**: Edit footer links in `index.html`
4. **Add more features**: Add cards in the about section

## 🚀 Backend Integration

To save emails to a backend:

```javascript
// Replace setTimeout in notifyForm submit handler with:
fetch('/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email })
})
.then(response => response.json())
.then(data => {
    // Handle success
})
.catch(error => {
    // Handle error
});
```

## 📧 Email Collection

Currently stores emails in localStorage. For production:

1. Set up a backend API endpoint
2. Add email validation and sanitization
3. Store in database (PostgreSQL, MongoDB, etc.)
4. Send confirmation emails
5. Add unsubscribe functionality
6. GDPR compliance

## 🎉 Launch Checklist

- [ ] Update launch date in script.js
- [ ] Configure backend email collection
- [ ] Add real social media links
- [ ] Test on all devices
- [ ] Optimize images (if added)
- [ ] Add analytics (Google Analytics, Plausible)
- [ ] Set up email automation
- [ ] Add meta tags for SEO
- [ ] Add Open Graph tags
- [ ] Test form submissions
- [ ] Add privacy policy link
- [ ] Configure HTTPS

## 📄 License

Free to use for personal and commercial projects.

## 🙏 Credits

Inspired by modern, high-end coming soon pages with advanced animations and particle effects.

---

**BRAHMA 26** - Something Extraordinary Is On The Way

*Launching 2026*
