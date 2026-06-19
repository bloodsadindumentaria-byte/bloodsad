import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { AlbumCondition, Currency } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, currency: Currency): string {
  const locales: Record<Currency, string> = {
    ARS: 'es-AR',
    USD: 'en-US',
    EUR: 'de-DE',
  }
  return new Intl.NumberFormat(locales[currency], {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price)
}

export function conditionLabel(condition: AlbumCondition, lang: 'es' | 'en' = 'es'): string {
  const labels: Record<AlbumCondition, string> = {
    mint: 'Mint',
    near_mint: 'Near Mint',
    very_good_plus: 'Very Good+',
    very_good: 'Very Good',
    good: 'Good',
    fair: 'Fair',
    poor: 'Poor',
  }
  void lang
  return labels[condition]
}

export function buildWhatsAppLink(albumTitle: string, phone: string): string {
  const msg = encodeURIComponent(`Hola, me interesa el disco: ${albumTitle}`)
  return `https://wa.me/${phone}?text=${msg}`
}

export function buildMailtoLink(albumTitle: string, email: string): string {
  const subject = encodeURIComponent(`Consulta: ${albumTitle}`)
  const body = encodeURIComponent(`Hola, me interesa el disco: ${albumTitle}`)
  return `mailto:${email}?subject=${subject}&body=${body}`
}
