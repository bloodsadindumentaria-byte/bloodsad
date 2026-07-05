import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

interface Crumb {
  label: string
  to?: string
}

interface Props {
  items: Crumb[]
}

export function Breadcrumbs({ items }: Props) {
  return (
    <nav aria-label="breadcrumbs" className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-[#666666]">
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <Fragment key={i}>
            {i > 0 && <ChevronRight className="h-3 w-3 text-[#444444]" aria-hidden />}
            {item.to && !isLast ? (
              <Link to={item.to} className="hover:text-[#e0e0e0] transition-colors duration-200">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-[#aaaaaa]' : ''}>{item.label}</span>
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}
