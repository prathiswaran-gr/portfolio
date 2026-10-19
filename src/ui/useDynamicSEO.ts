import { useEffect } from 'react'
import { portfolioConfig } from '../portfolio.config'

function setMetaTag(name: string, content: string, isProperty = false) {
  const attr = isProperty ? 'property' : 'name'
  let element = document.querySelector(`meta[${attr}="${name}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attr, name)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

export function useDynamicSEO() {
  const { personal, seo } = portfolioConfig

  useEffect(() => {
    // Page Title
    const title = seo.title || `${personal.name} — ${personal.role}`
    document.title = title

    // Standard Meta
    setMetaTag('description', seo.description)
    setMetaTag('author', seo.author || personal.name)

    // OpenGraph
    setMetaTag('og:title', title, true)
    setMetaTag('og:description', seo.description, true)
    if (seo.url) setMetaTag('og:url', seo.url, true)
    if (seo.ogImage) setMetaTag('og:image', seo.ogImage, true)
    setMetaTag('og:site_name', personal.name, true)

    // Twitter Card
    setMetaTag('twitter:title', title)
    setMetaTag('twitter:description', seo.description)
    if (seo.ogImage) setMetaTag('twitter:image', seo.ogImage)
    if (seo.twitterCreator) setMetaTag('twitter:creator', seo.twitterCreator)

    // Schema.org Person LD+JSON
    let schemaScript = document.querySelector('script#portfolio-schema') as HTMLScriptElement | null
    if (!schemaScript) {
      schemaScript = document.createElement('script')
      schemaScript.id = 'portfolio-schema'
      schemaScript.type = 'application/ld+json'
      document.head.appendChild(schemaScript)
    }

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: personal.name,
      jobTitle: personal.role,
      address: {
        '@type': 'PostalAddress',
        addressLocality: personal.location,
      },
      email: personal.email,
      sameAs: personal.socialLinks.map((s) => s.href),
      knowsAbout: portfolioConfig.skills.groups.flatMap((g) => g.items.map(([item]) => item)),
    }

    schemaScript.text = JSON.stringify(jsonLd)
  }, [personal, seo])
}
