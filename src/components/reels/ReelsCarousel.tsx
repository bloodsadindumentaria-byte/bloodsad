import { useState } from 'react'
import { ReelCard } from './ReelCard'
import { ReelModal } from './ReelModal'
import type { Reel } from '@/types'

interface Props {
  reels: Reel[]
}

export function ReelsCarousel({ reels }: Props) {
  const [active, setActive] = useState<Reel | null>(null)

  if (reels.length === 0) return null

  return (
    <>
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {reels.map((reel) => (
          <ReelCard key={reel.id} reel={reel} onOpen={setActive} />
        ))}
      </div>

      {active && <ReelModal reel={active} onClose={() => setActive(null)} />}
    </>
  )
}
