import type { CvData } from './schema';

/** A fictional, bilingual CV – used by the tests and as the sample in the studio. */
export const sampleCv: CvData = {
  version: 1,
  person: {
    name: 'Max Mustermann',
    headline: { de: 'Softwareentwickler', en: 'Software Developer' },
    email: 'max@example.com',
    phone: '+49 170 0000000',
    location: { de: 'München, Deutschland', en: 'Munich, Germany' },
    website: 'https://example.com',
    links: [{ label: 'GitHub', url: 'https://github.com/example' }],
  },
  summary: {
    de: 'Entwickler mit Freude an sauberer Architektur, guten Schnittstellen und Oberflächen, die sich gut anfühlen.',
    en: 'Developer who enjoys clean architecture, good interfaces and user interfaces that feel right.',
  },
  career: [
    {
      id: 'apprenticeship',
      kind: 'education',
      title: {
        de: 'Ausbildung zum Fachinformatiker für Anwendungsentwicklung',
        en: 'Apprenticeship as an IT specialist for application development',
      },
      organization: 'Beispiel GmbH',
      location: 'München',
      start: '2021-09',
      end: '2024-06',
    },
    {
      id: 'developer',
      kind: 'work',
      title: { de: 'Softwareentwickler', en: 'Software Developer' },
      organization: 'Beispiel GmbH',
      location: 'München',
      start: '2024-07',
      description: {
        de: 'Entwicklung von Webanwendungen und REST-Schnittstellen.',
        en: 'Development of web applications and REST APIs.',
      },
      highlights: {
        de: ['Migration einer Altanwendung nach React', 'Aufbau einer CI/CD-Pipeline'],
        en: ['Migrated a legacy application to React', 'Set up a CI/CD pipeline'],
      },
    },
    {
      id: 'school',
      kind: 'education',
      title: { de: 'Mittlere Reife', en: 'Secondary school certificate' },
      organization: 'Realschule Musterstadt',
      start: '2015-09',
      end: '2021-07',
    },
  ],
  skills: [
    { group: { de: 'Sprachen & Frameworks', en: 'Languages & frameworks' }, items: ['TypeScript', 'React', 'Go'] },
    { group: 'Tools', items: ['Git', 'Docker', 'Figma'] },
  ],
  certificates: [
    { title: 'Responsive Web Design', issuer: 'freeCodeCamp', date: '2023-04', url: 'https://example.com/cert' },
  ],
  projects: [
    {
      title: 'Portfolio',
      description: { de: 'Persönliche Website mit Live-Demos.', en: 'Personal website with live demos.' },
      url: 'https://example.com',
      tags: ['React', 'TypeScript'],
    },
  ],
  languages: [
    { name: { de: 'Deutsch', en: 'German' }, level: { de: 'Muttersprache', en: 'Native' } },
    { name: { de: 'Englisch', en: 'English' }, level: 'C1' },
  ],
};
