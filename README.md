# Interactive Developer Portfolio (Dark Theme & Dynamic Config)

A high-performance, dynamic developer portfolio built with **React 18**, **TypeScript**, **Framer Motion**, and **Vite**. Features an interactive force-directed skills graph, a 3D leaf-turn project sketchbook, real ink-reveal shaders, Web Audio acoustic chirps, GitHub activity sync, and a sleek **Dark Theme** default with full theme toggling.

---

## ⚡ How to Customize for Yourself or a Friend

All personal details, projects, education, experience, skills, articles, and theme preferences are located in **one single file**:

📁 **[`src/portfolio.config.ts`](file:///Users/prathis-21531/Development/PF/src/portfolio.config.ts)**

**No hardcoded strings exist in components!** Simply edit `portfolio.config.ts` to customize:

### 1. Identity & Hero
- `personal.name`: Your full name (e.g. `"Alex Morgan"`)
- `personal.shortName`: Informal name or moniker (e.g. `"Alex"`)
- `personal.role`: Job title (e.g. `"Full Stack Engineer"`)
- `personal.location`: City and country (e.g. `"San Francisco, CA"`)
- `personal.headline`: Large hero headline
- `personal.heroParagraphs`: Array of narrative paragraphs
- `personal.now`: Current status chip (e.g. `"⚡ Building AI Developer Tools"`)
- `personal.avatar`: Path to portrait image under `public/` (or external image URL)
- `personal.email`: Your contact email
- `personal.socialLinks`: Array of `{ id, label, href }` (supports GitHub, LinkedIn, Twitter/X, Email, Website)
- `personal.resume`: Résumé PDF path, label, and download file name

### 2. Theme (Dark Theme Default)
- `theme.defaultTheme`: `'dark'` (default) or `'light'`
- `theme.allowToggle`: Set to `true` to display the floating theme toggle button
- `theme.accent`: Primary brand neon accent color (`#3ddc84`)
- `theme.accentDeep`: Luminous secondary accent color (`#4ade80`)

### 3. Quick Stats Band
- `stats`: Array of numeric metrics `{ value, suffix, label }` shown between sections

### 4. Experience Timeline (01)
- `experience.entries`: Timeline records containing company, role, dates, achievements, and optional ink smudge portrait

### 5. Education (02)
- `education.degree`: Degree or certification
- `education.place`: University / Institute
- `education.period`: Years active
- `education.cgpa`: Grade / GPA
- `education.coursework`: Array of chip items
- `education.gallery`: Array of campus / project photographs

### 6. Interactive Skills Graph (03)
- `skills.groups`: Skill clusters (Languages, Web, Backend, Tools, etc.)
- Connects automatically to the physics-based SVG/Canvas force graph with drag, hover tracing, zoom, and audio chirps.

### 7. Projects & Interactive Sketchbook (04)
- `projects.items`: Personal projects featuring stack tags, live links, GitHub repos, and sketchbook page-turn cards

### 8. Writings / Articles (05)
- `writing.posts`: Articles with date, platform source (`Medium`, `LinkedIn`, `Substack`, etc.), summary, and tags

### 9. GitHub Activity Sync (06)
- `github.username`: Your GitHub handle (e.g. `"your-username"`). Live contributions are automatically queried and mapped to the portfolio's color ramp!

### 10. Recruiter Quick-View
- `recruiter.enabled`: Toggle the floating "Recruiter View" dialog
- `recruiter.fits`: Evidence chips and bullets for fast hiring evaluation

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Type check TypeScript
npm run typecheck

# 4. Build optimized production bundle
npm run build
```

---

## 🎨 Theme System

- **Default Theme**: Obsidian Dark (`#090a0f`) with high-contrast emerald neon accents (`#3ddc84`).
- **Theme Toggle**: Floating button at the bottom-left controls instant dark/light switching, backed by `localStorage` persistence and zero flash of light on page load.
- **Organic Film Grain**: Automatically computes light specks on dark mode and dark specks on light mode for rich paper tooth texture.
