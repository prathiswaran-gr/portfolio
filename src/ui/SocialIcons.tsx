import type { SVGProps } from 'react'

export function GithubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12 1.5a10.5 10.5 0 0 0-3.32 20.47c.53.1.72-.23.72-.5v-1.95c-2.92.63-3.54-1.25-3.54-1.25-.48-1.22-1.17-1.54-1.17-1.54-.95-.65.07-.64.07-.64 1.06.07 1.61 1.09 1.61 1.09.94 1.6 2.47 1.14 3.07.87.1-.68.37-1.14.67-1.4-2.33-.27-4.79-1.17-4.79-5.2 0-1.15.42-2.09 1.09-2.83-.11-.27-.47-1.34.1-2.8 0 0 .89-.28 2.91 1.08a10.1 10.1 0 0 1 5.3 0c2.02-1.36 2.9-1.08 2.9-1.08.58 1.46.22 2.53.11 2.8.68.74 1.09 1.68 1.09 2.83 0 4.04-2.47 4.93-4.82 5.19.38.33.72.97.72 1.96v2.9c0 .28.19.61.73.5A10.5 10.5 0 0 0 12 1.5z" />
    </svg>
  )
}

export function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4v11H3v-11zm6.5 0h3.83v1.5h.05c.53-.95 1.83-1.96 3.77-1.96 4.03 0 4.78 2.5 4.78 5.76v5.7h-4v-5.05c0-1.2-.02-2.75-1.75-2.75-1.75 0-2.02 1.31-2.02 2.66v5.14h-4v-11z" />
    </svg>
  )
}

export function MailIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
      <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
    </svg>
  )
}

export function TwitterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

export function GlobeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="12" cy="12" r="9.5" />
      <path d="M3.6 9h16.8M3.6 15h16.8" />
      <path d="M12 2.5a14 14 0 0 1 3.5 9.5 14 14 0 0 1-3.5 9.5 14 14 0 0 1-3.5-9.5 14 14 0 0 1 3.5-9.5z" />
    </svg>
  )
}

export function ExternalLinkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const SOCIAL_ICONS: Record<string, (props: SVGProps<SVGSVGElement>) => JSX.Element> = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  email: MailIcon,
  mail: MailIcon,
  twitter: TwitterIcon,
  x: TwitterIcon,
  website: GlobeIcon,
  web: GlobeIcon,
  globe: GlobeIcon,
  link: ExternalLinkIcon,
}

// eslint-disable-next-line react-refresh/only-export-components
export function getSocialIcon(id: string) {
  const normalized = id.toLowerCase().trim()
  return SOCIAL_ICONS[normalized] || ExternalLinkIcon
}
