import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Reel } from '@/types'

interface Filter {
  albumId?: string
  artistId?: string
}

const SELECT = '*, album:albums(id,title,slug), artist:artists(id,name,slug)'

export function useReels(filter: Filter = {}) {
  const { albumId, artistId } = filter
  const [reels, setReels] = useState<Reel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      let query = supabase
        .from('reels')
        .select(SELECT)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })

      if (albumId) query = query.eq('album_id', albumId)
      if (artistId) query = query.eq('artist_id', artistId)

      const { data, error } = await query
      if (error) setError(error.message)
      else setReels((data as Reel[]) ?? [])
      setLoading(false)
    }
    void fetch()
  }, [albumId, artistId])

  return { reels, loading, error }
}
