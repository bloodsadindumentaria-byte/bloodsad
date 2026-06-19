import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { useAlbums } from '@/hooks/useAlbums'
import { useArtists } from '@/hooks/useArtists'

export function Dashboard() {
  const { t } = useTranslation()
  const { signOut } = useAuth()
  const { albums } = useAlbums()
  const { artists } = useArtists()

  const soldCount = albums.filter((a) => a.sold).length
  const availableCount = albums.filter((a) => !a.sold).length

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">{t('admin.dashboard')}</h1>
        <div className="flex items-center gap-4">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#888888] hover:text-[#6B5CE7] text-sm transition-colors duration-200"
          >
            Ver sitio →
          </a>
          <Button variant="outline" onClick={() => signOut()}>{t('admin.logout')}</Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total álbumes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{albums.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{availableCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-muted-foreground">{soldCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{t('admin.albums')}</h2>
              <span className="text-muted-foreground text-sm">{albums.length} total</span>
            </div>
            <div className="flex gap-2">
              <Link to="/admin/albums" className={buttonVariants({ size: 'sm' })}>
                {t('admin.albums')}
              </Link>
              <Link to="/admin/albums/new" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                {t('admin.new')}
              </Link>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{t('admin.artists')}</h2>
              <span className="text-muted-foreground text-sm">{artists.length} total</span>
            </div>
            <div className="flex gap-2">
              <Link to="/admin/artists" className={buttonVariants({ size: 'sm' })}>
                {t('admin.artists')}
              </Link>
              <Link to="/admin/artists/new" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                {t('admin.new')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
