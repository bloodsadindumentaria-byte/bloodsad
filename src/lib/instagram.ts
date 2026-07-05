export function toEmbedUrl(instagramUrl: string): string {
  const clean = instagramUrl.trim().split('?')[0].replace(/\/+$/, '')
  return `${clean}/embed/`
}

export function formatCount(n?: number | null): string {
  if (n == null) return ''
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  return String(n)
}
