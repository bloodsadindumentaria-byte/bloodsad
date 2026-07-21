import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SITE_NAME } from '@/lib/constants'

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="bg-[#0a0a0a] border-t border-[#2a2a2a] mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10 grid gap-8 sm:grid-cols-3">
        <div className="flex flex-col items-center sm:items-start gap-2">
          <img src="/logo.png" alt={SITE_NAME} className="h-20 w-auto" />
          <p className="text-[#888888] text-xs text-center sm:text-left">
            {t('footer.location')}
          </p>
        </div>

        <nav className="flex flex-col items-center sm:items-start gap-2 text-sm">
          <span className="text-[#555555] text-xs uppercase tracking-wider mb-1">{t('nav.catalog')}</span>
          <Link to="/catalog" className="text-[#888888] hover:text-[#e0e0e0] transition-colors">{t('nav.catalog')}</Link>
          <Link to="/catalog?type=anime_dvd" className="text-[#888888] hover:text-[#e0e0e0] transition-colors">{t('nav.animes')}</Link>
          <Link to="/artists" className="text-[#888888] hover:text-[#e0e0e0] transition-colors">{t('nav.artists')}</Link>
          <Link to="/reels" className="text-[#888888] hover:text-[#e0e0e0] transition-colors">{t('nav.reels')}</Link>
        </nav>

        <div className="flex flex-col items-center sm:items-end justify-end gap-2 text-sm text-[#888888] text-center sm:text-right">
          <p>© {new Date().getFullYear()} {SITE_NAME}.</p>
          <p>{t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  )
}
