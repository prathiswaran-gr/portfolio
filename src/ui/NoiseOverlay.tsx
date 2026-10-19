import { useEffect, useState } from 'react'
import { getInitialTheme, onThemeChange, type Theme } from './theme'

const GRAIN = {
  tile: 50,
  density: 0.38,
  intensity: 0.14,
}

function buildTile(theme: Theme): string {
  const { tile, density, intensity } = GRAIN
  const canvas = document.createElement('canvas')
  canvas.width = tile
  canvas.height = tile
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  const img = ctx.createImageData(tile, tile)
  const d = img.data

  const isDark = theme === 'dark'
  const color = isDark ? 255 : 0
  const adjustedIntensity = isDark ? intensity * 0.75 : intensity

  for (let i = 0; i < d.length; i += 4) {
    d[i] = color
    d[i + 1] = color
    d[i + 2] = color
    d[i + 3] = Math.random() < density ? Math.random() * adjustedIntensity * 255 : 0
  }

  ctx.putImageData(img, 0, 0)
  return canvas.toDataURL('image/png')
}

export default function NoiseOverlay() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [url, setUrl] = useState<string>('')

  useEffect(() => {
    return onThemeChange((nextTheme) => setTheme(nextTheme))
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return
    setUrl(buildTile(theme))
  }, [theme])

  if (!url) return null

  return (
    <div
      className="grain"
      aria-hidden="true"
      style={{ backgroundImage: `url(${url})`, backgroundSize: `${GRAIN.tile}px ${GRAIN.tile}px` }}
    />
  )
}
