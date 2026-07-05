import type { ProductType } from '@/types'

export const SITE_NAME = 'Roman Wrest Distro'

export const PRODUCT_TYPES: ProductType[] = ['music', 'anime_dvd']

export const PRODUCT_TYPE_META: Record<ProductType, { label: { es: string; en: string } }> = {
  music: { label: { es: 'Disco', en: 'Record' } },
  anime_dvd: { label: { es: 'Anime DVD', en: 'Anime DVD' } },
}
