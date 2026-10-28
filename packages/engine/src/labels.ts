import type { Locale } from './schema';

/** Fixed texts of the generated PDF. */
export const labels = {
  de: {
    intl: 'de-DE',
    document: 'Lebenslauf',
    profile: 'Profil',
    work: 'Berufserfahrung',
    education: 'Ausbildung',
    skills: 'Kenntnisse',
    certificates: 'Zertifikate',
    projects: 'Projekte',
    languages: 'Sprachen',
    contact: 'Kontakt',
    present: 'heute',
    birthDate: 'Geboren am',
    page: (page: number, total: number) => `Seite ${page} von ${total}`,
  },
  en: {
    intl: 'en-GB',
    document: 'Curriculum Vitae',
    profile: 'Profile',
    work: 'Work experience',
    education: 'Education',
    skills: 'Skills',
    certificates: 'Certificates',
    projects: 'Projects',
    languages: 'Languages',
    contact: 'Contact',
    present: 'present',
    birthDate: 'Born',
    page: (page: number, total: number) => `Page ${page} of ${total}`,
  },
} satisfies Record<Locale, unknown>;

export type Labels = (typeof labels)[Locale];
