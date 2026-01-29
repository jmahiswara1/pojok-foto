# 🎨 PojokFoto - Neobrutalism Design

## Design System Overview

### Color Palette (Grayscale)
```
Black Void    : #000000 (Primary, Borders, Text)
Ash Gray      : #B8B8B8 (Secondary Text)
Misty Gray    : #C3C3C3 (Decorative)
Smoke Gray    : #DEDEDE (Backgrounds, Accents)
Whisper White : #FAFAFA (Main Background)
```

### Neobrutalism Characteristics

1. **Bold Black Borders**
   - 3px solid black borders on all components
   - 2px on mobile for better readability

2. **Hard Shadows**
   - Primary: `6px 6px 0px #000000`
   - Small: `4px 4px 0px #000000`
   - Large: `8px 8px 0px #000000`
   - No blur, pure offset shadows

3. **Typography**
   - Font Weight: 900 (Black) for headings
   - Font Weight: 700 (Bold) for buttons & labels
   - Uppercase tracking for labels

4. **Interactive States**
   - Hover: Lift effect (translate -2px, increase shadow)
   - Active: Push effect (translate +2px, decrease shadow)
   - No smooth gradients or glass effects

## Components Created

### UI Components
- ✅ **BrutalButton** - Neobrutalism button with 3 variants (white, black, ash)
- ✅ **BrutalCard** - Card with brutal shadow and hover effect
- ✅ **Modal** - Maintained for functionality

### Layout Components
- ✅ **Navbar** - Sticky navbar with logo, nav links, CTA button
- ✅ **Footer** - Full footer with brand, links, social icons

### Pages Updated
- ✅ **Homepage** - Complete neobrutalism redesign with:
  - Hero section with highlighted text
  - Mock browser window with floating camera icon
  - Quick links grid (4 cards)
  - Features section (3 cards)
  - Stats section (4 boxes)
  - CTA section (black box with white button)

## CSS Utilities

### Global Classes
```css
.brutal-border       → 3px solid black border
.brutal-shadow       → 6px 6px 0px black shadow
.brutal-shadow-sm    → 4px 4px 0px black shadow
.brutal-shadow-lg    → 8px 8px 0px black shadow
.brutal-card         → Complete card with border & shadow
.brutal-button       → Complete button styling
.hover-lift          → Lift effect on hover
```

### Container
```css
.brutal-container    → Max-width 1200px, auto margin
```

## Responsive Design

- Mobile breakpoint: 768px
- Reduced border width to 2px on mobile
- Reduced shadows on mobile
- Stack layouts vertically
- Hamburger menu for mobile navigation

## Design Philosophy

**Neobrutalism = Bold + Minimal + Functional**

- No gradients
- No rounded corners (or minimal)
- High contrast black & white
- Hard shadows instead of soft
- Thick borders
- Flat colors
- Grid-based layouts
- Lots of white space

---

## Next Steps

The following pages still need neobrutalism treatment:
- [ ] Camera page
- [ ] Editor page  
- [ ] Gallery page

Would you like me to update these pages with the neobrutalism design as well?
