# Portfolio Architecture & Engineering Guide

A comprehensive technical and customization overview of this dynamic, dark-mode developer portfolio.

---

## 📑 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture & Core Concepts](#architecture--core-concepts)
4. [Creative Engineering Highlights](#creative-engineering-highlights)
5. [The Dynamic Configuration System](#the-dynamic-configuration-system)
6. [Dark Theme & Style Engine](#dark-theme--style-engine)
7. [Step-by-Step Customization Guide](#step-by-step-customization-guide)
8. [Directory Structure](#directory-structure)
9. [Deployment Guide](#deployment-guide)
10. [CLI Scripts](#cli-scripts)

---

## 1. Project Overview

This project is an editorial, high-performance personal portfolio designed for engineers, creators, and developers. Built from the ground up to balance **visual excellence** with **minimal latency**, it avoids heavy 3D engine bundles (Three.js/WebGL) and instead leverages CSS 3D transforms, SVG vector math, canvas rasterization, and hardware-accelerated Framer Motion transitions.

### Key Capabilities:
- **Obsidian Dark Theme Default**: Deep obsidian background (`#090a0f`) with high-contrast emerald neon accents (`#3ddc84`), responsive ink shaders, and instant local storage persistence.
- **Zero Hardcoding**: All personal details, work experience, education, skills, projects, blog entries, GitHub username, and recruiter fit cards are configured in a single file: [`src/portfolio.config.ts`](file:///Users/prathis-21531/Development/PF/src/portfolio.config.ts).
- **Interactive Force-Directed Skills Graph**: Obsidian-style graph simulated in real time with physics (repulsion, springs, damping, gravity, and collision avoidance), drag interactions, camera zoom, and acoustic audio feedback.
- **3D Leaf-Turn Sketchbook**: A multi-strip CSS 3D transform simulation of paper bending, leaf curl, and specular gloss lighting.
- **Organic Photographed Ink Shaders**: Uses photographic 40-frame ink blots and torn-paper edge masks stepped through discrete frames to unveil images on scroll.
- **Web Audio API Acoustics**: Synthesizes tactile clicks, card pops, and paper rustles at runtime with zero external audio assets.
- **Live GitHub Contribution Calendar**: Automatically queries GitHub's contribution graph and maps activity levels into the site's color ramp.
- **Dynamic SEO & Schema.org**: Dynamically syncs document title, OpenGraph cards, Twitter cards, and Schema.org `Person` JSON-LD data.

---

## 2. Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | [React 18](https://react.dev/) | Component architecture, hooks, and Concurrent Mode |
| **Language** | [TypeScript 5.9](https://www.typescriptlang.org/) | Strict type safety, modular data schemas, and autocompletion |
| **Bundler & Dev Server** | [Vite 8](https://vite.dev/) | Instant HMR, sub-200ms production builds, and zero-config ES modules |
| **Animations** | [Framer Motion 11](https://www.framer.com/motion/) | Declarative physics, scroll-linked parallax, and staggered reveals |
| **Styling** | Vanilla CSS with Custom Properties | Zero runtime CSS-in-JS overhead; instantaneous token switching |
| **Audio** | Web Audio API | Pure synthesized sound; 0 kB bandwidth cost for audio files |
| **Code Quality** | ESLint 10 + TypeScript ESLint | Modern flat config, React Hooks rules, and strict linting |

---

## 3. Architecture & Core Concepts

```
┌────────────────────────────────────────────────────────┐
│               src/portfolio.config.ts                  │
│       Single Source of Truth for all Content           │
└──────────────────────────┬─────────────────────────────┘
                           │
       ┌───────────────────┼───────────────────┐
       ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  src/App.tsx │    │ src/ui/*.tsx │    │ src/data/*.ts│
│  Main Page   │    │ Components   │    │ Re-exports   │
└──────┬───────┘    └──────┬───────┘    └──────────────┘
       │                   │
       ▼                   ▼
┌──────────────────────────────────────────────────────┐
│              src/styles.css & theme.ts               │
│     Design Tokens (--bg, --ink, --surface, etc.)     │
└──────────────────────────────────────────────────────┘
```

1. **Configuration Layer**: All text, links, stats, and structures are defined in [`src/portfolio.config.ts`](file:///Users/prathis-21531/Development/PF/src/portfolio.config.ts).
2. **Component Layer**: UI components in `src/ui/` consume the configuration directly via typed imports.
3. **Design System**: Global CSS tokens in `src/styles.css` respond to the `[data-theme]` attribute on the `<html>` root, ensuring global color changes happen in a single paint cycle.

---

## 4. Creative Engineering Highlights

### A. Real-Time Force-Directed Skills Graph (`src/ui/skillsGraph.ts`)
- **Simulation Loop**: Operates on `requestAnimationFrame` using Coulomb repulsion ($F = k / d^2$) and Hooke's Law springs ($F = -k \cdot \Delta x$).
- **Decollision Algorithm**: Bounding-box overlap detection runs upon settle to ensure node labels never clip or overlap.
- **Dynamic Camera**: Smooth cubic easing centers and frames selected nodes or zoom targets.

### B. Sketchbook 3D Page Turn (`src/ui/Sketchbook.tsx`)
- Divides each page spread into **14 discrete vertical strips** hinged along shared edges.
- Each strip rotates along `rotateY` with calculated angle offsets to create an organic curved bend.
- Applies dynamic ambient lighting and specular highlights driven by strip surface normals ($|\cos(\theta)|$).

### C. Synthesized Web Audio (`src/ui/sound.ts`)
- **Tap Sound**: Micro-chirp synthesized via an exponential decay frequency sweep on an `OscillatorNode`.
- **Paper Rustle**: Filtered pink/white noise buffer modulated with quick envelope fades.
- Fully respects user consent and stays silent until armed by the user.

### D. Procedural Film Grain (`src/ui/NoiseOverlay.tsx`)
- Generates an in-memory `50x50px` pixelated noise canvas converted to a data URL.
- Detects the active theme to generate light specks on dark mode and dark specks on light mode.

---

## 5. The Dynamic Configuration System

To customize the portfolio, open [`src/portfolio.config.ts`](file:///Users/prathis-21531/Development/PF/src/portfolio.config.ts).

```ts
export const portfolioConfig: PortfolioConfig = {
  personal: {
    name: 'Your Name',
    shortName: 'NickName',
    role: 'Software Engineer',
    location: 'San Francisco, CA',
    headline: 'About Me',
    heroParagraphs: [
      'Your introductory narrative paragraph 1...',
      'Your background paragraph 2...',
    ],
    specialties: 'TypeScript · React · Node.js · Cloud Architecture',
    now: '⚡ Building scalable applications',
    avatar: 'experience/home.jpg',
    email: 'hello@example.com',
    socialLinks: [
      { id: 'github', label: 'GitHub', href: 'https://github.com/username' },
      { id: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com/in/username' },
      { id: 'email', label: 'Email', href: 'mailto:hello@example.com' },
    ],
    resume: {
      url: 'resume.pdf',
      downloadName: 'My-Resume.pdf',
      label: 'Download résumé',
      note: 'PDF · updated 2026',
    },
  },
  theme: {
    defaultTheme: 'dark', // 'dark' | 'light'
    allowToggle: true,
    accent: '#3ddc84',
    accentDeep: '#4ade80',
  },
  stats: [
    { value: 5, suffix: '+', label: 'years of engineering' },
    { value: 40, label: 'shipped production services' },
    { value: 120, label: 'public repositories' },
  ],
  // ... experience, education, skills, projects, writing, github, recruiter, seo
}
```

---

## 6. Dark Theme & Style Engine

The style system uses semantic CSS custom properties defined in [`src/styles.css`](file:///Users/prathis-21531/Development/PF/src/styles.css):

| CSS Token | Dark Theme Value | Light Theme Value |
|---|---|---|
| `--bg` | `#090a0f` | `#ffffff` |
| `--surface-plate` | `#11131c` | `#ffffff` |
| `--ink` | `#f0f3f6` | `#0a0a0b` |
| `--ink-2` | `rgba(240, 243, 246, 0.76)` | `rgba(10, 10, 11, 0.7)` |
| `--rule` | `rgba(255, 255, 255, 0.12)` | `rgba(10, 10, 11, 0.12)` |
| `--accent` | `#3ddc84` | `#3ddc84` |
| `--accent-deep` | `#4ade80` | `#0e9f55` |
| `--photo-blend` | `normal` | `multiply` |

### Pre-Paint Instant Theme Loading
An inline execution snippet in [`index.html`](file:///Users/prathis-21531/Development/PF/index.html) checks `localStorage` before DOM paint, preventing white flashes on dark mode reloads:
```html
<script>
  (function() {
    try {
      var saved = localStorage.getItem('pf_theme') || 'dark';
      document.documentElement.setAttribute('data-theme', saved);
    } catch (e) {}
  })();
</script>
```

---

## 7. Step-by-Step Customization Guide

### 1. Update Profile & Socials
Open `src/portfolio.config.ts` and edit `personal.name`, `personal.role`, `personal.socialLinks`, and `personal.email`.

### 2. Update Experience & Education
Edit `experience.entries` and `education` in `src/portfolio.config.ts`.
- Place college/event photos inside `public/education/` and list them under `education.gallery`.

### 3. Customize Your Skills Graph
Modify `skills.groups` in `src/portfolio.config.ts`. You can add clusters for Web, Mobile, Data, DevOps, or ML:
```ts
{
  id: 'cloud',
  label: 'Cloud & Infrastructure',
  kind: 'net',
  items: [
    ['AWS', 'net'],
    ['Kubernetes', 'tool'],
    ['Terraform', 'tool'],
  ],
}
```

### 4. Add Projects to the 3D Sketchbook
Add entries to `projects.items` in `src/portfolio.config.ts`:
```ts
{
  name: 'OmniDesk',
  year: '2026',
  blurb: 'Universal developer workspace',
  body: 'Built with Rust and Tauri to organize dev environments and background workers.',
  stack: ['Rust', 'Tauri', 'React', 'TypeScript'],
  link: 'https://github.com/your-username/omnidesk',
  live: { label: 'Website', url: 'https://omnidesk.dev' },
}
```

### 5. Sync Live GitHub Contributions
In `src/portfolio.config.ts`, set:
```ts
github: {
  username: 'your-github-username',
  showDetailStats: false, // set true for streaks & active day counts
}
```

### 6. Replace Profile Portrait & Résumé PDF
- Put your avatar at `public/experience/my-photo.jpg` and set `avatar: 'experience/my-photo.jpg'`.
- Put your résumé at `public/resume.pdf`.

---

## 8. Directory Structure

```
PF/
├── public/                 # Static assets served as-is
│   ├── education/          # Education gallery photographs
│   ├── experience/         # Avatars, ink sprites, and frame masks
│   ├── favicon.svg         # Site favicon
│   ├── resume.pdf          # Downloadable résumé PDF
│   └── site.webmanifest    # Web app manifest
├── src/
│   ├── data/
│   │   ├── projects.ts     # Re-exports projects from portfolioConfig
│   │   └── writing.ts      # Re-exports writings from portfolioConfig
│   ├── ui/
│   │   ├── Aurora.tsx      # Velocity-based ambient bottom glow
│   │   ├── Cursor.tsx      # Custom pointer cursor
│   │   ├── DevTools.tsx    # Ink reveal debugger (dev-only)
│   │   ├── Education.tsx   # Degree, coursework & cycling gallery
│   │   ├── Footer.tsx      # Social links, resume download & copyright
│   │   ├── Github.tsx      # Live contribution activity grid
│   │   ├── InkReveal.tsx   # Initial page load splash ink wipe
│   │   ├── NoiseOverlay.tsx# Procedural theme-aware film grain
│   │   ├── RecruiterCard.tsx# Fixed recruiter quick-view dialog
│   │   ├── Resume.tsx      # Work experience timeline
│   │   ├── Sketchbook.tsx  # Interactive 3D paper sketchbook
│   │   ├── Skills.tsx      # Interactive skills graph & accessible list
│   │   ├── skillsGraph.ts  # Force layout physics & node collision math
│   │   ├── SocialIcons.tsx # SVG vector icons for social platforms
│   │   ├── SoundToggle.tsx # Web Audio mute toggle
│   │   ├── sound.ts        # Pure Web Audio synthesis engine
│   │   ├── theme.ts        # Dark/light theme state manager
│   │   ├── ThemeToggle.tsx # Floating theme switch button
│   │   ├── useDynamicSEO.ts# Runtime metadata & Schema.org sync
│   │   ├── Works.tsx       # Projects plate book section
│   │   └── Writing.tsx     # Technical essays and publications
│   ├── App.tsx             # Root page layout & section orchestration
│   ├── main.tsx            # React application entry point
│   ├── portfolio.config.ts # ⭐ MASTER CONFIGURATION FILE
│   ├── styles.css          # Global design system & animations
│   └── vite-env.d.ts       # Vite client types
├── index.html              # Shell HTML with pre-paint theme script
├── package.json            # Project dependencies & scripts
├── tsconfig.app.json       # Strict TypeScript compiler options
└── vite.config.ts          # Vite configuration
```

---

## 9. Deployment Guide

### Deploying to Cloudflare Pages (Recommended)
1. Push your repository to GitHub.
2. In the [Cloudflare Dashboard](https://dash.cloudflare.com/), select **Workers & Pages** → **Create application** → **Pages**.
3. Select your repository.
4. Set Build Settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Click **Save and Deploy**.

### Deploying to Vercel
```bash
npm install -g vercel
vercel
```
Or connect your GitHub repository in the Vercel dashboard; it will automatically detect Vite and set `dist` as the output.

### Deploying to Netlify
- Build command: `npm run build`
- Publish directory: `dist`

---

## 10. CLI Scripts

| Command | Action |
|---|---|
| `npm run dev` | Launch local development server on `http://localhost:5173/` |
| `npm run build` | Compile TypeScript and bundle optimized production assets to `dist/` |
| `npm run preview` | Locally preview the production build |
| `npm run typecheck` | Run strict TypeScript validation without emitting files |
| `npm run lint` | Run ESLint checks across the entire codebase |
