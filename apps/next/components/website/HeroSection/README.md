# HeroSection Modular Components

This directory contains the modular, scalable, and developer-friendly implementation of the `HeroSection` for the website.

## Directory Structure

```
HeroSection/
├── HeroSection.tsx         # Main orchestrator, parallax logic, composes all subcomponents
├── HeroBackground.tsx      # Background gradients and animated parallax blobs
├── HeroHeadline.tsx        # Headline, subtitle, and call-to-action buttons
├── HeroStats.tsx           # 'Trusted by' stats section
├── HeroMapCard.tsx         # Map area and overlay cards
├── HeroParallaxCard.tsx    # Reusable parallax overlay card for map overlays
└── README.md               # This documentation file
```

## Usage

### Importing the Main HeroSection
You can import the main `HeroSection` as before:

```tsx
import { HeroSection } from "../components/website/hero-section";

// ...
<HeroSection />
```

This will use the new modular implementation automatically.

### Importing Subcomponents (Advanced Usage)
If you want to use or customize a specific part of the hero section, you can import any subcomponent directly:

```tsx
import { HeroHeadline } from "../components/website/HeroSection/HeroHeadline";
import { HeroMapCard } from "../components/website/HeroSection/HeroMapCard";
// etc.
```

## Component Responsibilities
- **HeroSection.tsx**: Main entry, handles parallax logic, composes all subcomponents.
- **HeroBackground.tsx**: Renders background gradients and animated blobs.
- **HeroHeadline.tsx**: Renders the headline, subtitle, and call-to-action buttons.
- **HeroStats.tsx**: Renders the 'Trusted by over 10,000 Ghanaians' section.
- **HeroMapCard.tsx**: Renders the map and its overlay cards.
- **HeroParallaxCard.tsx**: Reusable card for animated overlays on the map.

## Customization
Each subcomponent is self-contained and can be edited or extended independently for maximum flexibility and maintainability.

---