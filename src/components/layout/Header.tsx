import { Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'

export function Header() {
  const { t, i18n } = useTranslation()
  const { session } = useAuth()

  function toggleLang() {
    i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es')
  }

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0a] border-b border-[#2a2a2a]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        <Link to="/" className="flex items-center hover:opacity-80 transition-opacity duration-200">
  <img src="/logo.jpg" alt="Roman Wrest Distro" className="h-10 w-auto" />
</Link>

        <nav className="flex items-center gap-6 text-sm">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive
                ? 'text-[#6B5CE7] font-medium transition-colors duration-200'
                : 'text-[#888888] hover:text-[#e0e0e0] transition-colors duration-200'
            }
          >
            {t('nav.home')}
          </NavLink>

          <NavLink
            to="/catalog"
            className={({ isActive }) =>
              isActive
                ? 'text-[#6B5CE7] font-medium transition-colors duration-200'
                : 'text-[#888888] hover:text-[#e0e0e0] transition-colors duration-200'
            }
          >
            {t('nav.catalog')}
          </NavLink>

          <button
            onClick={toggleLang}
            className="text-[#888888] hover:text-[#e0e0e0] border border-[#2a2a2a] hover:border-[#6B5CE7] text-xs px-2.5 py-1 transition-all duration-200 tracking-widest"
          >
            {i18n.language === 'es' ? 'EN' : 'ES'}
          </button>

          <Link
            to={session ? '/admin' : '/admin/login'}
            className="text-[#888888] hover:text-[#6B5CE7] transition-colors duration-200 text-base leading-none"
            title={session ? 'Admin' : 'Login'}
          >
            🔒
          </Link>
        </nav>
      </div>
    </header>
  )
}
