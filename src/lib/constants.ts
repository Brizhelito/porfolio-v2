// Site metadata and constants
import type { Locale } from './i18n';

export const SITE = {
  title: 'Archivo Reny Mireles',
  description: 'Portafolio de ingeniería — Expedientes de trabajo de Reny Mireles, Software Developer autodidacta.',
  url: 'https://renymireles.dev',
  author: 'Reny Mireles',
  lang: 'es',
};

export const SITE_I18N: Record<Locale, { title: string; description: string }> = {
  es: {
    title: 'Archivo Reny Mireles',
    description: 'Portafolio de ingeniería — Expedientes de trabajo de Reny Mireles, Software Developer autodidacta.',
  },
  en: {
    title: 'Reny Mireles Archive',
    description: 'Engineering portfolio — Work expedients by Reny Mireles, self-taught Software Developer.',
  },
};

export const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/about', label: 'Ficha' },
  { href: '/tools', label: 'Catálogo' },
  { href: '/expedientes', label: 'Expedientes' },
  { href: '/colaboraciones', label: 'Colaboraciones' },
] as const;

/** Secondary links shown in footer instead of main nav */
export const FOOTER_LINKS = [
  { href: '/colaboraciones', label: 'Colaboraciones' },
  { href: '/inspiraciones', label: 'Inspiraciones' },
] as const;

export const SOCIAL_LINKS = {
  github: 'https://github.com/Brizhelito',
  linkedin: 'https://www.linkedin.com/in/reny-david-mireles-bozo-523147240',
  email: 'mailto:renymireles@outlook.com',
  whatsapp: 'https://wa.me/584246091499',
} as const;

export const GOOGLE_FONTS = [
  'IBM+Plex+Serif:wght@400;500;600',
  'Inter:wght@300;400;500',
  'JetBrains+Mono:wght@400;500;600',
  'Special+Elite',
  'Caveat:wght@400;500;600',
] as const;

export const GOOGLE_FONTS_URL = `https://fonts.googleapis.com/css2?${GOOGLE_FONTS.map(f => `family=${f}`).join('&')}&display=swap`;
