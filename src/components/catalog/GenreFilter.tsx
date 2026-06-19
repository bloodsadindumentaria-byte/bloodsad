import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import type { Genre } from '@/types'

interface Props {
  genres: Genre[]
  activeSlug: string | null
  onSelect: (slug: string | null) => void
}

export function GenreFilter({ genres, activeSlug, onSelect }: Props) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className="focus:outline-none"
      >
        <Badge
          variant={activeSlug === null ? 'default' : 'outline'}
          className="cursor-pointer"
        >
          {t('catalog.all_genres')}
        </Badge>
      </button>
      {genres.map((g) => (
        <button
          key={g.id}
          onClick={() => onSelect(g.slug)}
          className="focus:outline-none"
        >
          <Badge
            variant={activeSlug === g.slug ? 'default' : 'outline'}
            className="cursor-pointer"
          >
            {g.name}
          </Badge>
        </button>
      ))}
    </div>
  )
}
