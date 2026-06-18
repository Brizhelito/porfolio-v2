// Site metadata and constants
import type { Locale } from './i18n';

export const SITE = {
  title: 'Archivo Reny Mireles',
  description: 'Portafolio de ingeniería — Expedientes de trabajo de Reny Mireles',
  url: 'https://renymireles.dev',
  author: 'Reny Mireles',
  lang: 'es',
};

export const SITE_I18N: Record<Locale, { title: string; description: string }> = {
  es: {
    title: 'Archivo Reny Mireles',
    description: 'Portafolio de ingeniería — Expedientes de trabajo de Reny Mireles',
  },
  en: {
    title: 'Reny Mireles Archive',
    description: 'Engineering portfolio — Work expedients by Reny Mireles',
  },
};

export const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/about', label: 'Ficha' },
  { href: '/tools', label: 'Catálogo' },
  { href: '/expedientes', label: 'Expedientes' },
  { href: '/contacto', label: 'Contacto' },
] as const;

/** Secondary links shown in footer instead of main nav */
export const FOOTER_LINKS = [
  { href: '/colaboraciones', label: 'Colaboraciones' },
  { href: '/inspiraciones', label: 'Inspiraciones' },
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
