import { useTranslation } from 'react-i18next'
import { ProductCard } from './ProductCard'
import type { Album } from '@/types'

interface Props {
  albums: Album[]
}

export function CatalogGrid({ albums }: Props) {
  const { t } = useTranslation()

  if (albums.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-16">{t('catalog.no_results')}</p>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {albums.map((album) => (
        <ProductCard key={album.id} album={album} />
      ))}
    </div>
  )
}
