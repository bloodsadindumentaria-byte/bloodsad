import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Album } from '@/types'

export function useAlbums(genreSlug?: string | null) {
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      let query = supabase
        .from('albums')
        .select('*, artist:artists(*), genre:genres(*)')
        .order('created_at', { ascending: false })

      if (genreSlug) {
        query = query.eq('genre.slug', genreSlug)
      }

      const { data, error } = await query
      if (error) setError(error.message)
      else setAlbums((data as Album[]) ?? [])
      setLoading(false)
    }
    void fetch()
  }, [genreSlug])

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
        .select('*, artist:artists(*), genre:genres(*)')
        .eq('slug', slug)
        .single()
      if (error) setError(error.message)
      else setAlbum(data as Album)
      setLoading(false)
    }
    void fetch()
  }, [slug])

  return { album, loading, error }
}
