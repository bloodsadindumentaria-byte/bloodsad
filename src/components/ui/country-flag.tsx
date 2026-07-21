import { countryFlagUrl } from '@/lib/constants'

interface Props {
  country?: string | null
  className?: string
  width?: 20 | 40 | 80
}

export function CountryFlag({ country, className, width = 40 }: Props) {
  const src = countryFlagUrl(country, width)
  if (!src) return null

  return (
    <img
      src={src}
      alt={country ?? ''}
      title={country ?? ''}
      className={className ?? 'inline-block h-3 w-4 rounded-[1px] object-cover align-middle'}
    />
  )
}
