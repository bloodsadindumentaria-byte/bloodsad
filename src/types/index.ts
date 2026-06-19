export interface Genre {
  id: string
  name: string
  slug: string
}

export interface SocialLinks {
  instagram?: string
  facebook?: string
  bandcamp?: string
  spotify?: string
  youtube?: string
  website?: string
}

export interface Artist {
  id: string
  name: string
  slug: string
  bio_es: string
  bio_en: string
  origin: string
  genres: string[]
  social_links: SocialLinks
  image_url: string | null
}

export type AlbumCondition = 'mint' | 'near_mint' | 'very_good_plus' | 'very_good' | 'good' | 'fair' | 'poor'
export type Currency = 'ARS' | 'USD' | 'EUR'
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'cancelled'

export interface Track {
  position: string
  title: string
  duration?: string
}

export interface AlbumImages {
  cover: string
  gallery: string[]
}

export interface Album {
  id: string
  slug: string
  title: string
  artist_id: string
  artist?: Artist
  year: number
  label: string
  description_es: string
  description_en: string
  tracklist: Track[]
  condition: AlbumCondition
  price: number
  currency: Currency
  sold: boolean
  images: AlbumImages | null
  genre_id: string
  genre?: Genre
  created_at: string
}

export interface MediaItem {
  id: string
  filename: string
  label: string | null
  url: string
  created_at: string
}

export interface Order {
  id: string
  album_id: string
  album?: Album
  buyer_email: string
  buyer_name: string
  payment_id: string | null
  status: OrderStatus
  created_at: string
}
