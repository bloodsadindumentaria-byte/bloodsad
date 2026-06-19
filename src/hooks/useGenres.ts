import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Genre } from '@/types'

export function useGenres() {
  const [genres, setGenres] = useState<Genre[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase.from('genres').select('*').order('name')
      setGenres((data as Genre[]) ?? [])
      setLoading(false)
    }
    void fetch()
  }, [])

  return { genres, loading }
}
