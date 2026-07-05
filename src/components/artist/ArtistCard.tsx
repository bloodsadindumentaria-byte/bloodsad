import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import type { Artist } from '@/types'

interface Props {
  artist: Artist
}

export function ArtistCard({ artist }: Props) {
  const [imgError, setImgError] = useState(false)

  return (
    <Link to={`/artist/${artist.slug}`} className="group block">
      <Card className="overflow-hidden transition-shadow hover:shadow-md hover:border-[#6B5CE7]">
        <div className="aspect-square bg-muted overflow-hidden">
          {artist.image_url && !imgError ? (
            <img
              src={artist.image_url}
              alt={artist.name}
              onError={() => setImgError(true)}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-4xl">
              🎸
            </div>
          )}
        </div>
        <CardContent className="p-3">
          <p className="font-semibold text-sm truncate">{artist.name}</p>
          <p className="text-xs text-muted-foreground">{artist.origin}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
