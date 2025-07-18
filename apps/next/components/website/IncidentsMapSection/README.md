# IncidentsMapSection Modular Components

This directory contains the modular, scalable, and developer-friendly implementation of the `IncidentsMapSection` for the website.

## Directory Structure

```
IncidentsMapSection/
├── IncidentsMapSection.tsx      # Main orchestrator, composes all subcomponents
├── IncidentsMapBackground.tsx   # Background gradients and blobs
├── IncidentsMapHeadline.tsx     # Headline, subtitle, and chip
├── IncidentsMapFeatures.tsx     # Feature list and CTA button
├── IncidentsMapCard.tsx         # Map card with overlays
└── README.md                    # This documentation file
```

## Usage

### Importing the Main IncidentsMapSection
You can import the main `IncidentsMapSection` as before:

```tsx
import { IncidentsMapSection } from "../components/website/incidents-map-section";

// ...
<IncidentsMapSection />
```

This will use the new modular implementation automatically.

### Importing Subcomponents (Advanced Usage)
If you want to use or customize a specific part of the section, you can import any subcomponent directly:

```tsx
import { IncidentsMapFeatures } from "../components/website/IncidentsMapSection/IncidentsMapFeatures";
// etc.
```

## Component Responsibilities
- **IncidentsMapSection.tsx**: Main entry, composes all subcomponents.
- **IncidentsMapBackground.tsx**: Renders background gradients and blobs.
- **IncidentsMapHeadline.tsx**: Renders the headline, subtitle, and chip.
- **IncidentsMapFeatures.tsx**: Renders the feature list and CTA button.
- **IncidentsMapCard.tsx**: Renders the map card and overlays.

## Customization
Each subcomponent is self-contained and can be edited or extended independently for maximum flexibility and maintainability. 