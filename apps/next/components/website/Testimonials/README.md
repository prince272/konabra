# Testimonials Component Suite

This directory contains a modular and reusable implementation of the Testimonials section for the Konabra website. The components are separated by concern and designed for easy maintenance and extensibility.

## Structure

```
Testimonials/
  ├── TestimonialCard.tsx           # Renders a single testimonial card
  ├── TestimonialsNavigation.tsx    # Swiper navigation controls (prev/next)
  ├── TestimonialsSwiper.tsx        # Main Swiper logic, state, and composition
  ├── testimonialsData.ts           # Array of testimonial data objects
  └── index.ts                      # Barrel file for easy imports
```

## Components

### 1. `TestimonialCard`
- **Purpose:** Renders an individual testimonial, including avatar, name, role, and content.
- **Props:**
  - `testimonial`: Testimonial object (see `testimonialsData.ts` for structure)
  - `hovered`: Boolean for hover animation

### 2. `TestimonialsNavigation`
- **Purpose:** Renders navigation buttons for the Swiper (previous/next).
- **Props:**
  - `swiperRef`: Ref to the Swiper instance for programmatic navigation

### 3. `TestimonialsSwiper`
- **Purpose:** Composes the Swiper, manages hover state, and renders testimonial slides and navigation.
- **Usage:** Used as the main carousel in the parent section.

### 4. `testimonialsData`
- **Purpose:** Centralized array of testimonial objects. Easy to update, extend, or replace with dynamic data.

### 5. `index.ts`
- **Purpose:** Barrel file for simplified imports.

## Usage Example

In your section or page component:

```tsx
import { TestimonialsSwiper } from "./Testimonials";

export const TestimonialsSection = () => (
  <section>
    {/* ...other markup... */}
    <TestimonialsSwiper />
  </section>
);
```

## Extending/Customizing
- **Add/Edit Testimonials:** Update `testimonialsData.ts`.
- **Change Card Design:** Edit `TestimonialCard.tsx`.
- **Replace Swiper Logic:** Modify `TestimonialsSwiper.tsx`.
- **Add Features:** Create new subcomponents in this folder and export via `index.ts`.

## Best Practices
- Keep all testimonial-related logic and UI in this folder for maintainability.
- Use the barrel file (`index.ts`) for imports to simplify refactoring.
- Prefer composition and prop-driven design for reusability.

## Dependencies
- [Swiper](https://swiperjs.com/react) for carousel functionality
- [HeroUI](https://heroui.chat/) for UI primitives (Avatar, Button, Chip)
- [Lucide React](https://lucide.dev/) for icons

---
