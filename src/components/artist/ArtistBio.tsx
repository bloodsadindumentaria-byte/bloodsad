import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Camera, Share2, Video, Globe, Music2, Disc3 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Artist } from '@/types'

interface Props {
  artist: Artist
}

const SOCIAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Camera,
  facebook: Share2,
  youtube: Video,
  website: Globe,
  spotify: Music2,
  bandcamp: Disc3,
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
  const [imgError, setImgError] = useState(false)

  return (
    <div className="space-y-4">
      <div className="w-full aspect-[4/5] rounded-sm border border-[#2a2a2a] overflow-hidden bg-[#111111]">
        {artist.image_url && !imgError ? (
          <img
            src={artist.image_url}
            alt={artist.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#2a2a2a] text-6xl">
            🎸
          </div>
        )}
      </div>
      <div>
        <h1 className="text-3xl font-bold">{artist.name}</h1>
        {artist.origin && (
          <p className="text-muted-foreground text-sm mt-1">
            {t('artist.origin')}: {artist.origin}
          </p>
        )}
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
          <p className="text-sm font-medium mb-2">{t('artist.social')}</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(artist.social_links).map(([key, url]) => {
              if (!url) return null
              const Icon = SOCIAL_ICONS[key]
              return (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={SOCIAL_LABELS[key] ?? key}
                  className="flex items-center justify-center h-9 w-9 rounded-sm border border-[#2a2a2a] text-[#888888] hover:text-[#6B5CE7] hover:border-[#6B5CE7] transition-colors"
                >
                  {Icon ? <Icon className="h-4 w-4" /> : <span className="text-xs">{(SOCIAL_LABELS[key] ?? key)[0]}</span>}
                </a>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
