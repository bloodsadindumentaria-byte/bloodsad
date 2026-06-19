import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import '@/lib/i18n'

import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/admin/ProtectedRoute'

import { Home } from '@/pages/public/Home'
import { Catalog } from '@/pages/public/Catalog'
import { Album } from '@/pages/public/Album'
import { Artist } from '@/pages/public/Artist'
import { Genre } from '@/pages/public/Genre'

import { Login } from '@/pages/admin/Login'
import { Dashboard } from '@/pages/admin/Dashboard'
import { AlbumList } from '@/pages/admin/AlbumList'
import { AlbumForm } from '@/pages/admin/AlbumForm'
import { ArtistList } from '@/pages/admin/ArtistList'
import { ArtistForm } from '@/pages/admin/ArtistForm'

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/album/:slug" element={<Album />} />
            <Route path="/artist/:slug" element={<Artist />} />
            <Route path="/genre/:slug" element={<Genre />} />
          </Route>

          {/* Admin login (no layout) */}
          <Route path="/admin/login" element={<Login />} />

          {/* Admin protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/albums" element={<AlbumList />} />
            <Route path="/admin/albums/new" element={<AlbumForm />} />
            <Route path="/admin/albums/:id/edit" element={<AlbumForm />} />
            <Route path="/admin/artists" element={<ArtistList />} />
            <Route path="/admin/artists/new" element={<ArtistForm />} />
            <Route path="/admin/artists/:id/edit" element={<ArtistForm />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  )
}
