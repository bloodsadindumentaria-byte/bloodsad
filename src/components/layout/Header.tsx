import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, X, Lock } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? 'text-[#6B5CE7] font-medium transition-colors duration-200'
    : 'text-[#888888] hover:text-[#e0e0e0] transition-colors duration-200'

function typeLinkClass(active: boolean) {
  return active
    ? 'text-[#6B5CE7] font-medium transition-colors duration-200'
    : 'text-[#888888] hover:text-[#e0e0e0] transition-colors duration-200'
}

export function Header() {
  const { t, i18n } = useTranslation()
  const { session } = useAuth()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const isAnimeRoute = location.pathname === '/catalog' && new URLSearchParams(location.search).get('type') === 'anime_dvd'
  const isCatalogRoute = location.pathname === '/catalog' && !isAnimeRoute

  function toggleLang() {
    i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es')
  }

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0a] border-b border-[#2a2a2a]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        <Link to="/" className="flex items-center hover:opacity-80 transition-opacity duration-200">
          <img src="/logo.png" alt="Roman Wrest Distro" className="h-20 w-auto" />
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <NavLink to="/" end className={navLinkClass}>{t('nav.home')}</NavLink>
          <Link to="/catalog" className={typeLinkClass(isCatalogRoute)}>{t('nav.catalog')}</Link>
          <Link to="/catalog?type=anime_dvd" className={typeLinkClass(isAnimeRoute)}>{t('nav.animes')}</Link>
          <NavLink to="/artists" className={navLinkClass}>{t('nav.artists')}</NavLink>
          <NavLink to="/reels" className={navLinkClass}>{t('nav.reels')}</NavLink>

          <button
            onClick={toggleLang}
            className="text-[#888888] hover:text-[#e0e0e0] border border-[#2a2a2a] hover:border-[#6B5CE7] text-xs px-2.5 py-1 transition-all duration-200 tracking-widest"
          >
            {i18n.language === 'es' ? 'EN' : 'ES'}
          </button>

          <Link
            to={session ? '/admin' : '/admin/login'}
            className="text-[#888888] hover:text-[#6B5CE7] transition-colors duration-200"
            title={session ? 'Admin' : 'Login'}
          >
            <Lock className="h-4 w-4" />
          </Link>
        </nav>

        {/* Botón mobile */}
        <button
          className="md:hidden text-[#e0e0e0]"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Menu"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Nav mobile */}
      {menuOpen && (
        <nav className="md:hidden border-t border-[#2a2a2a] px-4 py-4 flex flex-col gap-4 text-sm bg-[#0a0a0a]">
          <NavLink to="/" end className={navLinkClass} onClick={() => setMenuOpen(false)}>{t('nav.home')}</NavLink>
          <Link to="/catalog" className={typeLinkClass(isCatalogRoute)} onClick={() => setMenuOpen(false)}>{t('nav.catalog')}</Link>
          <Link to="/catalog?type=anime_dvd" className={typeLinkClass(isAnimeRoute)} onClick={() => setMenuOpen(false)}>{t('nav.animes')}</Link>
          <NavLink to="/artists" className={navLinkClass} onClick={() => setMenuOpen(false)}>{t('nav.artists')}</NavLink>
          <NavLink to="/reels" className={navLinkClass} onClick={() => setMenuOpen(false)}>{t('nav.reels')}</NavLink>

          <div className="flex items-center justify-between pt-2 border-t border-[#2a2a2a]">
            <button
              onClick={toggleLang}
              className="text-[#888888] hover:text-[#e0e0e0] border border-[#2a2a2a] hover:border-[#6B5CE7] text-xs px-2.5 py-1 transition-all duration-200 tracking-widest"
            >
              {i18n.language === 'es' ? 'EN' : 'ES'}
            </button>
            <Link
              to={session ? '/admin' : '/admin/login'}
              className="flex items-center gap-1.5 text-[#888888] hover:text-[#6B5CE7] transition-colors duration-200"
              onClick={() => setMenuOpen(false)}
            >
              <Lock className="h-4 w-4" />
              {session ? 'Admin' : 'Login'}
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
