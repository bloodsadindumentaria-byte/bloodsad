import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import type { Artist } from '@/types'

interface Props {
  artist: Artist
}

const SOCIAL_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  bandcamp: 'Bandcamp',
  spotify: 'Spotify',
  youtube: 'YouTube',
  website: 'Web',
}

export function ArtistBio({ artist }: Props) {
  const { t, i18n } = useTranslation()
  const bio = i18n.language === 'en' ? artist.bio_en : artist.bio_es

  return (
    <div className="space-y-4">
      {artist.image_url && (
        <img
          src={artist.image_url}
          alt={artist.name}
          className="w-48 h-48 rounded-full object-cover mx-auto md:mx-0"
        />
      )}
      <div>
        <h1 className="text-3xl font-bold">{artist.name}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {t('artist.origin')}: {artist.origin}
        </p>
      </div>
      {bio && <p className="text-base leading-relaxed">{bio}</p>}
      {artist.genres?.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-1">{t('artist.genres')}</p>
          <div className="flex flex-wrap gap-1">
            {artist.genres.map((g) => (
              <Badge key={g} variant="secondary">{g}</Badge>
            ))}
          </div>
        </div>
      )}
      {artist.social_links && Object.keys(artist.social_links).length > 0 && (
        <div>
          <p className="text-sm font-medium mb-1">{t('artist.social')}</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(artist.social_links).map(([key, url]) =>
              url ? (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm underline text-muted-foreground hover:text-foreground"
                >
                  {SOCIAL_LABELS[key] ?? key}
                </a>
              ) : null
            )}
          </div>
        </div>
      )}
    </div>
  )
}
