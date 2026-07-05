import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Album, Genre } from '@/types'

const SELECT = '*, artist:artists(*), album_genres(genre:genres(*))'

type AlbumRow = Omit<Album, 'genres'> & { album_genres: { genre: Genre }[] }

function mapAlbum(row: AlbumRow): Album {
  const genres = (row.album_genres ?? []).map((ag) => ag.genre).filter(Boolean)
  return { ...row, genres }
}

export function useAlbums() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      const { data, error } = await supabase
        .from('albums')
        .select(SELECT)
        .order('title', { ascending: true })

      if (error) setError(error.message)
      else setAlbums(((data as AlbumRow[]) ?? []).map(mapAlbum))
      setLoading(false)
    }
    void fetch()
  }, [])

  return { albums, loading, error }
}

export function useAlbum(slug: string) {
  const [album, setAlbum] = useState<Album | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      const { data, error } = await supabase
        .from('albums')
        .select(SELECT)
        .eq('slug', slug)
        .single()
      if (error) setError(error.message)
      else setAlbum(mapAlbum(data as AlbumRow))
      setLoading(false)
    }
    void fetch()
  }, [slug])

  return { album, loading, error }
}
