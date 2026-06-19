import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Artist } from '@/types'

export function useArtists() {
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .order('name')
      if (error) setError(error.message)
      else setArtists((data as Artist[]) ?? [])
      setLoading(false)
    }
    void fetch()
  }, [])

  return { artists, loading, error }
}

export function useArtist(slug: string) {
  const [artist, setArtist] = useState<Artist | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .eq('slug', slug)
        .single()
      if (error) setError(error.message)
      else setArtist(data as Artist)
      setLoading(false)
    }
    void fetch()
  }, [slug])

  return { artist, loading, error }
}
