// ============================================================================
// PORTFOLIO CONFIGURATION
// ============================================================================
// This single file powers the entire portfolio.
// To personalize this portfolio for yourself or a friend:
// Simply update the values below! Everything in the UI, animations,
// interactive skills graph, projects sketchbook, and SEO tags updates automatically.
// ============================================================================

export interface SocialLink {
  id: 'github' | 'linkedin' | 'email' | 'twitter' | 'website' | string
  label: string
  href: string
}

export interface StatItem {
  value: number
  suffix?: string
  label: string
}

export interface ResumeGroup {
  heading?: string
  logoImg?: string
  sub?: string
  link?: string
  items?: string[]
  links?: SocialLink[]
}

export interface ResumeEntry {
  period: string
  place: string
  role?: string
  logo?: { src: string; alt: string }
  points?: string[]
  groups?: ResumeGroup[]
  /** Path relative to public/ for the revealed ink smudge photograph (optional) */
  ink?: string
}

export interface EducationData {
  sectionNo: string
  title: string
  tagline: string
  degree: string
  place: string
  period: string
  cgpa: string
  cgpaMax?: string
  coursework: string[]
  notes: string[]
  gallery: string[]
}

export type SkillKind =
  | 'lang'
  | 'ui'
  | 'arch'
  | 'async'
  | 'data'
  | 'net'
  | 'di'
  | 'test'
  | 'perf'
  | 'tool'
  | 'lock'
  | 'search'

export interface SkillGroup {
  id: string
  label: string
  kind: SkillKind
  /** The one primary group that carries the accent color in the graph */
  core?: boolean
  items: [string, SkillKind][]
}

export interface Project {
  name: string
  /** Display year or span, e.g. '2026' */
  year: string
  /** One line: what the thing actually is */
  blurb: string
  /** Two or three sentences: what it does and why it exists */
  body: string
  /** Tech stack, most defining first */
  stack: string[]
  link?: string
  visibility?: 'public' | 'private'
  live?: { label: string; url: string }
  award?: string
  /** Optional screenshot path under public/, e.g. 'works/pulse.jpg' */
  shot?: string
}

export interface Post {
  title: string
  date: string
  summary: string
  tags?: string[]
  source?: 'Medium' | 'LinkedIn' | 'Dev.to' | 'Substack' | string
  href?: string
  slug?: string
}

export interface RecruiterFit {
  id: string
  label: string
  points: string[]
}

export interface PortfolioConfig {
  personal: {
    name: string
    shortName: string
    role: string
    location: string
    headline: string
    heroParagraphs: string[]
    specialties: string
    now: string
    avatar: string
    heroMarks: { tl: string; tr: string; bl: string; br: string }
    heroMeta: {
      leftName: string
      leftRole: string
      bottomLeft: string
      bottomRight: string
    }
    email: string
    socialLinks: SocialLink[]
    resume: {
      url: string
      downloadName: string
      label: string
      note: string
    }
  }
  theme: {
    defaultTheme: 'dark' | 'light'
    allowToggle: boolean
    accent: string
    accentDeep: string
  }
  stats: StatItem[]
  experience: {
    sectionNo: string
    title: string
    tagline: string
    entries: ResumeEntry[]
  }
  education: EducationData
  skills: {
    sectionNo: string
    title: string
    tagline: string
    sub: string
    groups: SkillGroup[]
  }
  projects: {
    sectionNo: string
    title: string
    tagline: string
    sub: string
    items: Project[]
  }
  writing: {
    sectionNo: string
    title: string
    tagline: string
    sub: string
    posts: Post[]
  }
  github: {
    sectionNo: string
    title: string
    username: string
    showDetailStats: boolean
    sub: string
  }
  recruiter: {
    enabled: boolean
    fits: RecruiterFit[]
  }
  footer: {
    closingNote: string
    copyrightYear: string | number
  }
  seo: {
    title: string
    description: string
    author: string
    url: string
    ogImage: string
    twitterCreator?: string
  }
}

export const portfolioConfig: PortfolioConfig = {
  // --------------------------------------------------------------------------
  // 1. Personal Identity & Hero Information
  // --------------------------------------------------------------------------
  personal: {
    name: 'Mohammed Thalha MA',
    shortName: 'Thalha',
    role: 'Android Engineer',
    location: 'Chennai, India',
    headline: 'About Thalha',
    heroParagraphs: [
      "I'm an Android developer at Zoho Corporation, working on Arattai Messenger: a messaging app with 20M+ downloads that reached #1 on Google Play in India. I joined early as a trainee and now own Android work across encryption, performance and shared product libraries.",
      'Before Zoho, I worked on Java payment systems at Worldline, a production website at Raptee Energy, and college projects that mixed web, Android and IoT. That mix still helps when an Android issue turns out to be a backend, storage or profiling problem.',
    ],
    specialties:
      'Android performance · Baseline Profiles · Jetpack Compose · Kotlin Coroutines · App startup optimization · Rendering/Jank profiling · Kotlin Multiplatform · E2EE · on-device search',
    now: '⚡ Powering Arattai Messenger',
    avatar: 'experience/home.jpg',
    heroMarks: { tl: '+', tr: '+', bl: '+', br: '+' },
    heroMeta: {
      leftName: 'Mohammed Thalha MA',
      leftRole: 'Android Engineer',
      bottomLeft: 'Kotlin · Compose · Performance',
      bottomRight: 'Based in Chennai, India',
    },
    email: 'mohammedthalhama@gmail.com',
    socialLinks: [
      {
        id: 'github',
        label: 'GitHub',
        href: 'https://github.com/MohammedThalha2002',
      },
      {
        id: 'linkedin',
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/in/mohammed-thalha-ma/',
      },
      {
        id: 'email',
        label: 'Email',
        href: 'mailto:mohammedthalhama@gmail.com',
      },
    ],
    resume: {
      url: 'resume.pdf',
      downloadName: 'Mohammed-Thalha-MA-Resume.pdf',
      label: 'Download résumé',
      note: 'PDF · updated 2026',
    },
  },

  // --------------------------------------------------------------------------
  // 2. Theme Configuration (Dark theme by default)
  // --------------------------------------------------------------------------
  theme: {
    defaultTheme: 'dark', // 'dark' | 'light'
    allowToggle: true,
    accent: '#3ddc84', // Primary vibrant accent (Android Emerald Green)
    accentDeep: '#4ade80', // Lighter / vibrant contrast for text on dark backgrounds
  },

  // --------------------------------------------------------------------------
  // 3. Stats Band (At a glance)
  // --------------------------------------------------------------------------
  stats: [
    { value: 20, suffix: 'M+', label: 'downloads on the app I engineer' },
    { value: 4, label: 'libraries other teams depend on' },
    { value: 93, label: 'public repositories' },
    { value: 4, label: 'Android internals essays' },
  ],

  // --------------------------------------------------------------------------
  // 4. Experience / Résumé Section (01)
  // --------------------------------------------------------------------------
  experience: {
    sectionNo: '01',
    title: 'Experience',
    tagline: 'Chennai, India · 2022 to now',
    entries: [
      {
        period: '2024 – Now',
        ink: 'experience/zoho.jpg',
        place: 'Zoho Corporation · Chennai',
        role: 'Member Technical Staff · Android',
        points: [
          'End-to-end encryption with the Signal protocol: multi-device sessions, encrypted Google Drive backup and device-to-device transfer',
          'On-device full-text search over E2EE chats, built on Android AppSearch',
          'Cut cold-start time with Baseline Profiles and Macrobenchmark; eliminated ANRs and memory leaks',
          'Built shared Android libraries for media editing, PDF viewing and Markdown rendering, now used across 15+ Zoho products',
        ],
      },
      {
        period: '2023 – 2024',
        ink: 'experience/worldline.jpg',
        place: 'Worldline Global Services · Chennai',
        role: 'Java Developer Intern',
        points: [
          'Worked inside a large Java payments backend',
          'Independently diagnosed and shipped fixes across transaction and integration modules',
        ],
      },
      {
        period: '2022 – 2023',
        ink: 'experience/raptee.jpg',
        place: 'Raptee Energy · Chennai',
        role: 'Full Stack Developer Intern',
        points: [
          "Built and deployed the company's official marketing site, from development through production",
        ],
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 5. Education Section (02)
  // --------------------------------------------------------------------------
  education: {
    sectionNo: '02',
    title: 'Education',
    tagline: 'Chennai, India',
    degree: 'B.E. Electronics & Communication',
    place: 'Chennai Institute of Technology',
    period: '2020 to 2024',
    cgpa: '8.64',
    cgpaMax: '10',
    coursework: [
      'Data Structures & Algorithms',
      'Computer Networks',
      'Communication Systems',
      'Embedded Systems',
    ],
    notes: [
      "Full-stack development team lead for Vidyutrenz '22, Vidyutrenz '23 and the LUMOS '23 magazine",
      'IoT mentor for workshops that connected ESP32 boards and sensors to Android and web clients, charted readings over APIs and fed actions back to the hardware',
    ],
    gallery: [
      'education/1.jpg',
      'education/2.jpg',
      'education/3.jpg',
      'education/4.jpg',
    ],
  },

  // --------------------------------------------------------------------------
  // 6. Skills Section & Interactive Force Graph (03)
  // --------------------------------------------------------------------------
  skills: {
    sectionNo: '03',
    title: 'Skills',
    tagline: 'What I reach for',
    sub: 'Android is where most of my work sits now. The graph keeps the rest visible: backend, web and tooling still show up when I debug real product problems.',
    groups: [
      {
        id: 'lang',
        label: 'Languages',
        kind: 'lang',
        items: [
          ['Kotlin', 'lang'],
          ['Java', 'lang'],
          ['JavaScript', 'lang'],
          ['TypeScript', 'lang'],
          ['SQL', 'data'],
        ],
      },
      {
        id: 'android',
        label: 'Android',
        kind: 'ui',
        core: true,
        items: [
          ['Android', 'ui'],
          ['Jetpack Compose', 'ui'],
          ['Kotlin Multiplatform', 'arch'],
          ['MVVM & Clean Architecture', 'arch'],
          ['Coroutines & Flow', 'async'],
          ['Canvas API', 'ui'],
          ['SQLDelight', 'data'],
          ['Room', 'data'],
          ['SQLCipher', 'lock'],
          ['AppSearch', 'search'],
          ['WorkManager', 'async'],
          ['Retrofit', 'net'],
          ['OkHttp', 'net'],
          ['Dagger', 'di'],
          ['Hilt', 'di'],
          ['Koin', 'di'],
          ['JUnit', 'test'],
        ],
      },
      {
        id: 'web',
        label: 'Web',
        kind: 'ui',
        items: [
          ['React.js', 'ui'],
          ['Next.js', 'ui'],
          ['Tailwind CSS', 'ui'],
        ],
      },
      {
        id: 'backend',
        label: 'Backend & Databases',
        kind: 'net',
        items: [
          ['Node.js', 'net'],
          ['Express.js', 'net'],
          ['Spring Boot', 'net'],
          ['MySQL', 'data'],
          ['PostgreSQL', 'data'],
          ['MongoDB', 'data'],
        ],
      },
      {
        id: 'tools',
        label: 'Developer Tools & Core',
        kind: 'tool',
        items: [
          ['Git', 'tool'],
          ['Docker', 'tool'],
          ['Linux', 'tool'],
          ['Android Studio', 'tool'],
          ['Perfetto', 'perf'],
          ['LeakCanary', 'perf'],
          ['Postman', 'net'],
          ['Firebase', 'net'],
        ],
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 7. Projects Section & Interactive Sketchbook (04)
  // --------------------------------------------------------------------------
  projects: {
    sectionNo: '04',
    title: 'Projects',
    tagline: 'Built on my own time',
    sub: 'Side projects, tools and experiments I built because I wanted the thing to exist.',
    items: [
      {
        name: 'Pulse SDK',
        year: '2026',
        blurb: 'Crash & performance monitoring, built end to end',
        body: 'Monitoring is usually something you buy, so I built the pipeline myself: capture, transport, storage and triage. The Android SDK records crashes, ANRs through a watchdog thread, memory pressure and cold starts; Ktor handles HMAC-signed ingest; React shows the dashboard; an MCP server lets AI tools query the diagnostics.',
        stack: ['Kotlin Multiplatform', 'Ktor', 'React', 'MCP', 'PostgreSQL'],
        link: 'https://github.com/MohammedThalha2002/Pulse-SDK',
      },
      {
        name: 'Tazkiyah',
        year: '2026',
        blurb: 'An Islamic habit tracker, on the Play Store',
        body: 'Tracks Salah, Quran, dhikr and other habits with reminders, streaks and a weekly read on how the week went. I built it for myself, then published it; it has passed 200 installs. Consistency is the point, so the app stays quiet and does one thing.',
        stack: ['Kotlin', 'Android'],
        visibility: 'private',
        live: {
          label: 'Google Play',
          url: 'https://play.google.com/store/apps/details?id=com.tazkiyah.habittracker',
        },
      },
      {
        name: 'Take Break',
        year: '2026',
        blurb: 'Interrupts the reflexive app-open',
        body: 'You unlock your phone and your thumb has already opened the feed before your brain gets a vote. This intercepts the app launch and makes you pause first. It is deliberately tiny: one problem, solved for myself.',
        stack: ['Kotlin', 'Android'],
        link: 'https://github.com/MohammedThalha2002/take-break',
      },
      {
        name: 'Predictive Maintenance IoT',
        year: '2024',
        blurb: 'Predicting motor failure from live sensor data',
        body: 'Instruments a motor with current, voltage, temperature, humidity and vibration sensors on an Arduino, then streams the readings through a Node backend and Firebase. A random-forest classifier trained on the collected feed flags a motor heading for failure, served behind a small Flask app, with a Unity scene visualising the rig.',
        stack: ['Arduino / C', 'Python', 'scikit-learn', 'Flask', 'Node', 'Unity'],
        link: 'https://github.com/MohammedThalha2002/Predictive-Maintenance-IOT',
      },
      {
        name: 'Amazon Price Tracker for Zoho Cliq',
        year: '2023',
        blurb: 'Name your price on an Amazon listing, get pinged in Cliq when it drops',
        body: "Paste an Amazon URL into the Cliq extension, set the price you are willing to pay, and forget about it. A Node scraper pulls the listing, a scheduled job checks it again, and the bot messages you in Cliq when the price crosses your threshold. I built it as a full Cliq extension with a slash command, bot, widgets, schedulers and webhooks for Zoho's all-India hackathon.",
        stack: ['Zoho Cliq', 'Deluge', 'Node', 'Express', 'MongoDB', 'Catalyst'],
        link: 'https://github.com/MohammedThalha2002/zoho-cliq-extension',
        award: 'Top 15 finalist · Zoho Cliqtrix',
      },
      {
        name: 'Certificate Generator',
        year: '2023',
        blurb: 'Bulk certificates from a spreadsheet',
        body: 'Upload an Excel sheet of recipients and get every certificate back as a PDF. Handlebars templates render through Puppeteer, the files are stored on Cloudinary, and the app mails them out. Each certificate carries a hidden image watermark so it can be checked later.',
        stack: ['React', 'Redux Toolkit', 'Express', 'MongoDB', 'Puppeteer', 'Cloudinary'],
        link: 'https://github.com/MohammedThalha2002/certificate-generator',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 8. Writings / Articles Section (05)
  // --------------------------------------------------------------------------
  writing: {
    sectionNo: '05',
    title: 'Writings',
    tagline: 'Android internals',
    sub: 'Android internals I hit while building and debugging real apps.',
    posts: [
      {
        title:
          'How Android launches an app in a fraction of a second, before you even lift your thumb',
        date: '5 Jul 2026',
        summary:
          'Before an app paints a single pixel, Android needs the ART runtime ready, thousands of framework classes loaded and resources in memory. This traces how Zygote, fork() and copy-on-write make startup feel cheap.',
        tags: ['startup', 'Zygote', 'internals'],
        source: 'LinkedIn',
        href: 'https://www.linkedin.com/pulse/how-android-launches-app-fraction-second-before-you-even-m-a-lculc/',
      },
      {
        title: "From CPU cores to coroutines: understanding Kotlin's concurrency model",
        date: '29 Jun 2026',
        summary:
          'If a CPU core runs one thread at a time, how does an Android app launch thousands of coroutines at once? I follow that question through the kernel scheduler, context-switch cost, continuations and dispatchers.',
        tags: ['coroutines', 'concurrency', 'Kotlin'],
        source: 'LinkedIn',
        href: 'https://www.linkedin.com/pulse/from-cpu-cores-coroutines-understanding-kotlins-concurrency-m-a-vrbvc/',
      },
      {
        title: 'Reading a LeakCanary trace: how I found an 18 MB Android memory leak',
        date: '19 Jun 2026',
        summary:
          'A filter bottom sheet worked in testing, passed review, shipped, and then LeakCanary started firing. This is the trace that led me to the one line holding 18 MB in memory.',
        tags: ['memory', 'LeakCanary', 'debugging'],
        source: 'Medium',
        href: 'https://medium.com/@mohammedalithalha2002/reading-a-leakcanary-trace-how-i-found-an-18-mb-android-memory-leak-2b41ab587635',
      },
      {
        title: 'How Android turns your code into pixels: the rendering pipeline, frame by frame',
        date: '3 Jun 2026',
        summary:
          '"The feed feels laggy on cheaper phones." Same code, same build, but a flipbook on a low-end device. This follows the frame from VSYNC to SurfaceFlinger.',
        tags: ['rendering', 'performance', 'internals'],
        source: 'Medium',
        href: 'https://medium.com/@mohammedalithalha2002/how-android-turns-your-code-into-pixels-the-rendering-pipeline-frame-by-frame-26977b2ef840',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 9. GitHub Activity Section (06)
  // --------------------------------------------------------------------------
  github: {
    sectionNo: '06',
    title: 'Activity',
    username: 'MohammedThalha2002',
    showDetailStats: false,
    sub: 'Public contributions over the last year. Most day-job code sits in private repositories, so this graph only shows the open-source side.',
  },

  // --------------------------------------------------------------------------
  // 10. Recruiter Quick-View Card
  // --------------------------------------------------------------------------
  recruiter: {
    enabled: true,
    fits: [
      {
        id: 'android',
        label: 'Android / Kotlin',
        points: [
          'Android engineer on Arattai: 20M+ downloads, #1 on Google Play India',
          'Kotlin · Jetpack Compose · Coroutines/Flow · MVVM & Clean Architecture',
        ],
      },
      {
        id: 'performance',
        label: 'Performance',
        points: [
          'Cold-start and rendering optimization on a top-ranked messaging app',
          'Perfetto tracing, Baseline Profiles, Macrobenchmark and LeakCanary',
        ],
      },
      {
        id: 'security',
        label: 'Security / E2EE',
        points: [
          'End-to-end encryption with the Signal protocol; multi-device sessions',
          'Encrypted backup, device-to-device transfer, on-device encrypted search',
        ],
      },
      {
        id: 'beyond',
        label: 'Beyond the app',
        points: [
          'Pulse SDK: crash and performance monitoring with Kotlin Multiplatform, Ktor, React and MCP',
          'Full-stack background (TypeScript / React / Node / Spring) and IoT tinkering',
        ],
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 11. Footer Notes
  // --------------------------------------------------------------------------
  footer: {
    closingNote: 'Built by hand, copy included.',
    copyrightYear: '2026',
  },

  // --------------------------------------------------------------------------
  // 12. SEO Metadata & Social Sharing Cards
  // --------------------------------------------------------------------------
  seo: {
    title: 'Mohammed Thalha MA, Android Engineer',
    description:
      'Mohammed Thalha MA, Android engineer at Zoho working on Arattai. Performance, encryption, on-device search, projects, writing and résumé.',
    author: 'Mohammed Thalha MA',
    url: 'https://mabuilds.in/',
    ogImage: 'https://mabuilds.in/experience/home.jpg',
    twitterCreator: '@thalha_07',
  },
}
