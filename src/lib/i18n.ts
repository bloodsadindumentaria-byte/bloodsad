import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  es: {
    translation: {
      nav: {
        home: 'Inicio',
        catalog: 'Catálogo',
        artists: 'Artistas',
        admin: 'Admin',
      },
      home: {
        hero_title: 'Blood Sad Shop',
        hero_subtitle: 'Discos de culto, metal extremo y raridades.',
        browse_catalog: 'Ver catálogo',
      },
      catalog: {
        title: 'Catálogo',
        filter_genre: 'Filtrar por género',
        all_genres: 'Todos los géneros',
        no_results: 'No hay resultados.',
        sold_out: 'Vendido',
      },
      album: {
        condition: 'Condición',
        label: 'Sello',
        year: 'Año',
        tracklist: 'Lista de canciones',
        buy: 'Comprar',
        buy_whatsapp: 'Consultar por WhatsApp',
        buy_email: 'Consultar por email',
        sold_out: 'Vendido',
        back: 'Volver',
      },
      artist: {
        discography: 'Discografía disponible',
        origin: 'Origen',
        genres: 'Géneros',
        social: 'Redes',
      },
      admin: {
        dashboard: 'Panel de administración',
        albums: 'Álbumes',
        artists: 'Artistas',
        orders: 'Pedidos',
        new: 'Nuevo',
        edit: 'Editar',
        delete: 'Eliminar',
        save: 'Guardar',
        cancel: 'Cancelar',
        title: 'Título',
        login: 'Iniciar sesión',
        logout: 'Cerrar sesión',
        email: 'Email',
        password: 'Contraseña',
      },
      conditions: {
        mint: 'Mint',
        near_mint: 'Near Mint',
        very_good_plus: 'Very Good+',
        very_good: 'Very Good',
        good: 'Good',
        fair: 'Fair',
        poor: 'Poor',
      },
      footer: {
        rights: 'Todos los derechos reservados.',
      },
    },
  },
  en: {
    translation: {
      nav: {
        home: 'Home',
        catalog: 'Catalog',
        artists: 'Artists',
        admin: 'Admin',
      },
      home: {
        hero_title: 'Blood Sad Shop',
        hero_subtitle: 'Cult records, extreme metal and rarities.',
        browse_catalog: 'Browse catalog',
      },
      catalog: {
        title: 'Catalog',
        filter_genre: 'Filter by genre',
        all_genres: 'All genres',
        no_results: 'No results found.',
        sold_out: 'Sold out',
      },
      album: {
        condition: 'Condition',
        label: 'Label',
        year: 'Year',
        tracklist: 'Tracklist',
        buy: 'Buy',
        buy_whatsapp: 'Ask via WhatsApp',
        buy_email: 'Ask via email',
        sold_out: 'Sold out',
        back: 'Back',
      },
      artist: {
        discography: 'Available discography',
        origin: 'Origin',
        genres: 'Genres',
        social: 'Social',
      },
      admin: {
        dashboard: 'Admin Dashboard',
        albums: 'Albums',
        artists: 'Artists',
        orders: 'Orders',
        new: 'New',
        edit: 'Edit',
        delete: 'Delete',
        save: 'Save',
        cancel: 'Cancel',
        title: 'Title',
        login: 'Sign in',
        logout: 'Sign out',
        email: 'Email',
        password: 'Password',
      },
      conditions: {
        mint: 'Mint',
        near_mint: 'Near Mint',
        very_good_plus: 'Very Good+',
        very_good: 'Very Good',
        good: 'Good',
        fair: 'Fair',
        poor: 'Poor',
      },
      footer: {
        rights: 'All rights reserved.',
      },
    },
  },
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es',
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
