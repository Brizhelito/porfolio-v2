// Site metadata and constants
export const SITE = {
  title: 'Archivo Reny Mireles',
  description: 'Portafolio de ingeniería — Expedientes de trabajo de Reny Mireles',
  url: 'https://renymireles.dev',
  author: 'Reny Mireles',
  lang: 'es',
};

export const NAV_LINKS = [
  { href: '/', label: 'Inicio', icon: 'archive' },
  { href: '/about', label: 'Ficha de Identificación' },
  { href: '/tools', label: 'Catálogo de Herramientas' },
  { href: '/expedientes', label: 'Expedientes' },
  { href: '/colaboraciones', label: 'Colaboraciones' },
  { href: '/contacto', label: 'Contacto' },
] as const;

export const SOCIAL_LINKS = {
  github: 'https://github.com/renymireles',
  linkedin: 'https://linkedin.com/in/renymireles',
  email: 'mailto:renymireles@outlook.com',
  whatsapp: 'https://wa.me/584140000000',
} as const;

export const GOOGLE_FONTS = [
  'IBM+Plex+Serif:wght@400;500;600',
  'Inter:wght@300;400;500',
  'JetBrains+Mono:wght@400;500;600',
  'Special+Elite',
  'Caveat:wght@400;500;600',
] as const;

export const GOOGLE_FONTS_URL = `https://fonts.googleapis.com/css2?${GOOGLE_FONTS.map(f => `family=${f}`).join('&')}&display=swap`;
