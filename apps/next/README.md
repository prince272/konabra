# Next.js & HeroUI Template with Konabra Integration

This is a template for building modern applications using **Next.js 14** (App Router) and **HeroUI (v2)**, tailored for projects like **Konabra**, a community-powered road safety and transport platform for Ghana and similar regions.

[Try it on CodeSandbox](https://githubbox.com/heroui-inc/heroui/next-app-template)

---

## 🚀 Konabra: Move Toward Safer Roads

### 🌍 What is Konabra?

Konabra is a smart, community-driven platform designed to enhance road safety and traffic management in Ghana and beyond. Inspired by the Twi phrase **"ko na bra"** (meaning "go and come"), Konabra embodies the spirit of movement, action, and safe return, resonating deeply with Ghanaian culture and everyday journeys.

Konabra empowers drivers, passengers, and pedestrians to actively contribute to safer and more efficient roads through real-time reporting and data-driven insights.

### 📱 What Does the Konabra App Do?

Konabra is a mobile and web platform that offers the following features:

- **📍 Live Incident Reporting**: Report road incidents like accidents, police barriers, traffic jams, potholes, or broken streetlights in real time.
- **🗺️ Interactive Map Interface**: View current road conditions and incidents through an intuitive, user-friendly map.
- **🛠️ Real-Time Alerts**: Receive instant notifications about incidents, congestion, or hazards on your route.
- **📊 Smart Dashboards for Authorities**: Provide data analytics to help authorities identify trends, monitor hotspots, and improve response effectiveness.

### 💡 Vision

To revolutionize road safety and traffic management in Ghana by connecting communities, data, and authorities—one report at a time.

---

## Technologies Used

This project leverages modern tools and libraries to build robust, scalable applications like Konabra:

- **[Next.js 14](https://nextjs.org/docs/getting-started)**: A powerful React framework for server-side rendering and static site generation.
- **[HeroUI v2](https://heroui.com/)**: A modern UI component library for building accessible and responsive interfaces.
- **[Tailwind CSS](https://tailwindcss.com/)**: A utility-first CSS framework for rapid and customizable styling.
- **[Tailwind Variants](https://tailwind-variants.org)**: A library for managing component variants with Tailwind CSS.
- **[TypeScript](https://www.typescriptlang.org/)**: Adds static typing for enhanced developer experience and code reliability.
- **[Framer Motion](https://www.framer.com/motion/)**: A library for creating smooth animations and transitions.
- **[next-themes](https://github.com/pacocoursey/next-themes)**: Seamless theme switching for light and dark modes.

---

## Getting Started

### 1. Create a New Project

Use this template with `create-next-app` to kickstart your Konabra-inspired project:

```bash
npx create-next-app -e https://github.com/heroui-inc/next-app-template
```

### 2. Install Dependencies

Install the required dependencies using your preferred package manager (`npm`, `yarn`, `pnpm`, or `bun`). Example with `npm`:

```bash
npm install
```

### 3. Run the Development Server

Start the development server to see your app in action:

```bash
npm run dev
```

### 4. Optional: Configure `pnpm`

If using `pnpm`, add the following to your `.npmrc` file to ensure proper dependency hoisting:

```bash
public-hoist-pattern[]=*@heroui/*
```

Then, reinstall dependencies:

```bash
pnpm install
```

---

## License

This template is licensed under the [MIT License](https://github.com/heroui-inc/next-app-template/blob/main/LICENSE).

---
