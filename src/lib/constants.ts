import type { ProductType } from '@/types'

export const SITE_NAME = 'Roman Wrest Distro'

export const PRODUCT_TYPES: ProductType[] = ['music', 'anime_dvd']

export const PRODUCT_TYPE_META: Record<ProductType, { label: { es: string; en: string } }> = {
  music: { label: { es: 'Disco', en: 'Record' } },
  anime_dvd: { label: { es: 'Anime DVD', en: 'Anime DVD' } },
}

interface Country {
  name: string
  code: string
  aliases?: string[]
}

export const COUNTRIES: Country[] = [
  { name: 'Argentina', code: 'AR' },
  { name: 'Brasil', code: 'BR', aliases: ['brazil'] },
  { name: 'Chile', code: 'CL' },
  { name: 'Uruguay', code: 'UY' },
  { name: 'Paraguay', code: 'PY' },
  { name: 'Bolivia', code: 'BO' },
  { name: 'Perú', code: 'PE', aliases: ['peru'] },
  { name: 'Colombia', code: 'CO' },
  { name: 'Venezuela', code: 'VE' },
  { name: 'Ecuador', code: 'EC' },
  { name: 'México', code: 'MX', aliases: ['mexico'] },
  { name: 'Estados Unidos', code: 'US', aliases: ['usa', 'eeuu', 'united states', 'estados unidos de america'] },
  { name: 'Canadá', code: 'CA', aliases: ['canada'] },
  { name: 'Reino Unido', code: 'GB', aliases: ['uk', 'inglaterra', 'england', 'united kingdom'] },
  { name: 'Irlanda', code: 'IE', aliases: ['ireland'] },
  { name: 'Alemania', code: 'DE', aliases: ['germany'] },
  { name: 'Francia', code: 'FR', aliases: ['france'] },
  { name: 'España', code: 'ES', aliases: ['spain'] },
  { name: 'Italia', code: 'IT', aliases: ['italy'] },
  { name: 'Portugal', code: 'PT' },
  { name: 'Países Bajos', code: 'NL', aliases: ['holanda', 'netherlands'] },
  { name: 'Bélgica', code: 'BE', aliases: ['belgica', 'belgium'] },
  { name: 'Suecia', code: 'SE', aliases: ['sweden'] },
  { name: 'Noruega', code: 'NO', aliases: ['norway'] },
  { name: 'Finlandia', code: 'FI', aliases: ['finland'] },
  { name: 'Dinamarca', code: 'DK', aliases: ['denmark'] },
  { name: 'Islandia', code: 'IS', aliases: ['iceland'] },
  { name: 'Polonia', code: 'PL', aliases: ['poland'] },
  { name: 'República Checa', code: 'CZ', aliases: ['czech republic', 'chequia'] },
  { name: 'Austria', code: 'AT' },
  { name: 'Suiza', code: 'CH', aliases: ['switzerland'] },
  { name: 'Grecia', code: 'GR', aliases: ['greece'] },
  { name: 'Rusia', code: 'RU', aliases: ['russia'] },
  { name: 'Ucrania', code: 'UA', aliases: ['ukraine'] },
  { name: 'Hungría', code: 'HU', aliases: ['hungary'] },
  { name: 'Rumania', code: 'RO', aliases: ['romania'] },
  { name: 'Japón', code: 'JP', aliases: ['japan'] },
  { name: 'Corea del Sur', code: 'KR', aliases: ['south korea'] },
  { name: 'China', code: 'CN' },
  { name: 'Australia', code: 'AU' },
  { name: 'Nueva Zelanda', code: 'NZ', aliases: ['new zealand'] },
  { name: 'Sudáfrica', code: 'ZA', aliases: ['south africa'] },
]

export function countryCode(name?: string | null): string {
  if (!name) return ''
  const normalized = name.trim().toLowerCase()
  if (!normalized) return ''
  const match = COUNTRIES.find(
    (c) => c.name.toLowerCase() === normalized || c.aliases?.some((a) => a === normalized)
  )
  return match ? match.code.toLowerCase() : ''
}

// Emoji de bandera (🇦🇷) no se renderiza en Windows/algunos navegadores —
// se usan imágenes reales de flagcdn.com en su lugar (ver <CountryFlag>).
export function countryFlagUrl(name?: string | null, width: 20 | 40 | 80 = 40): string {
  const code = countryCode(name)
  return code ? `https://flagcdn.com/w${width}/${code}.png` : ''
}
