import { Document, Image, Link, Page, Text, View } from '@react-pdf/renderer';
import type { ReactNode } from 'react';
import { labels, type Labels } from '../labels';
import { resolveLocalized } from '../localize';
import { formatPeriod, parseIsoDate, parseYearMonth, sortCareer } from '../period';
import type { CareerEntry, CvData, CvTheme, Locale, Localized } from '../schema';
import { createStyles, type CvStyles } from './styles';

export interface CvDocumentProps {
  data: CvData;
  theme: CvTheme;
  locale: Locale;
  /** Registered font family for characters outside the standard fonts – `renderCvPdf` sets it when needed. */
  fallbackFont?: string;
}

interface Context {
  data: CvData;
  theme: CvTheme;
  l: Labels;
  s: CvStyles;
  tr: <T>(value: Localized<T> | undefined) => T | undefined;
}

/** Drops the empty entries that appear in lists while they are being typed. */
const filled = (items: readonly string[]) => items.map((item) => item.trim()).filter(Boolean);

/**
 * The CV as a react-pdf document. Layout `sidebar` puts photo, contact, skills and languages into a coloured
 * column on the first page; layout `classic` is a single column with the contact details in the header.
 */
export function CvDocument({ data, theme, locale, fallbackFont }: CvDocumentProps) {
  const l = labels[locale];
  const s = createStyles(theme, fallbackFont);
  const ctx: Context = { data, theme, l, s, tr: (value) => resolveLocalized(value, locale) };
  const sidebar = theme.layout === 'sidebar';

  return (
    <Document title={`${data.person.name} – ${l.document}`} author={data.person.name} language={locale}>
      <Page size="A4" style={s.page}>
        {sidebar && <View fixed style={s.sidebarBackground} />}
        {sidebar && <Sidebar ctx={ctx} />}

        <View style={s.content}>
          <Header ctx={ctx} />
          <Profile ctx={ctx} />
          <Timeline ctx={ctx} title={l.work} entries={data.career.filter((entry) => entry.kind === 'work')} />
          <Timeline
            ctx={ctx}
            title={l.education}
            entries={data.career.filter((entry) => entry.kind === 'education')}
          />
          <Projects ctx={ctx} />
          {!sidebar && <Skills ctx={ctx} />}
          <Certificates ctx={ctx} />
          {!sidebar && <Languages ctx={ctx} />}
        </View>

        <Text
          fixed
          style={s.footer}
          render={({ pageNumber, totalPages }) => `${data.person.name} · ${l.page(pageNumber, totalPages)}`}
        />
      </Page>
    </Document>
  );
}

// ── Header & sidebar ─────────────────────────────────────────────────────────

function Header({ ctx }: { ctx: Context }) {
  const { data, theme, s, tr } = ctx;
  const classic = theme.layout === 'classic';
  const photo = classic && theme.showPhoto ? data.person.photo : undefined;

  return (
    <View style={s.header}>
      <View style={{ flex: 1 }}>
        <Text style={s.name}>{data.person.name}</Text>
        {data.person.headline && <Text style={s.headline}>{tr(data.person.headline)}</Text>}
        {classic && <ContactLine ctx={ctx} />}
      </View>
      {photo && <Image src={photo} style={s.photoClassic} />}
    </View>
  );
}

/** Contact details of the person as `[text, href?]` pairs, in display order. */
function contactItems({ data, l, tr }: Context): [string, string | undefined][] {
  const { person } = data;
  const items: [string, string | undefined][] = [];
  const location = tr(person.location);
  if (location) items.push([location, undefined]);
  if (person.email) items.push([person.email, `mailto:${person.email}`]);
  if (person.phone) items.push([person.phone, `tel:${person.phone.replace(/[^\d+]/g, '')}`]);
  if (person.website) items.push([person.website.replace(/^https?:\/\//, ''), person.website]);
  for (const link of person.links) items.push([link.label, link.url]);
  if (person.birthDate) {
    const date = new Intl.DateTimeFormat(l.intl, { dateStyle: 'long' }).format(parseIsoDate(person.birthDate));
    items.push([`${l.birthDate} ${date}`, undefined]);
  }
  return items;
}

function ContactLine({ ctx }: { ctx: Context }) {
  const { s } = ctx;
  return (
    <Text style={s.contactLine}>
      {contactItems(ctx).map(([label, href], index) => (
        <Text key={label}>
          {index > 0 && <Text style={s.contactSeparator}>{'  ·  '}</Text>}
          {href ? (
            <Link src={href} style={s.link}>
              {label}
            </Link>
          ) : (
            label
          )}
        </Text>
      ))}
    </Text>
  );
}

function Sidebar({ ctx }: { ctx: Context }) {
  const { data, theme, l, s, tr } = ctx;
  const photo = theme.showPhoto ? data.person.photo : undefined;

  return (
    <View style={s.sidebar}>
      {photo && <Image src={photo} style={s.photo} />}

      <Text style={s.sidebarHeading}>{l.contact}</Text>
      {contactItems(ctx).map(([label, href]) => (
        <Text key={label} style={s.sidebarItem}>
          {href ? (
            <Link src={href} style={s.sidebarLink}>
              {label}
            </Link>
          ) : (
            label
          )}
        </Text>
      ))}

      {data.skills.length > 0 && <Text style={s.sidebarHeading}>{l.skills}</Text>}
      {data.skills.map((group, index) => (
        <View key={index} style={s.skillGroup}>
          <Text style={s.skillName}>{tr(group.group)}</Text>
          <Text>{filled(group.items).join(', ')}</Text>
        </View>
      ))}

      {data.languages.length > 0 && <Text style={s.sidebarHeading}>{l.languages}</Text>}
      {data.languages.map((language, index) => (
        <Text key={index} style={s.sidebarItem}>
          <Text style={s.skillName}>{tr(language.name)}</Text> – {tr(language.level)}
        </Text>
      ))}
    </View>
  );
}

// ── Main sections ────────────────────────────────────────────────────────────

interface SectionProps {
  ctx: Context;
  title: string;
  /** The entries of the section; each one is kept on a single page. */
  items: ReactNode[];
  /** Lays the entries out in two columns. */
  columns?: boolean;
}

/**
 * The heading and the first entry (the first row in two columns) form one unbreakable block, so a heading
 * never ends up alone at the bottom of a page. `minPresenceAhead` does not achieve that for nested views.
 */
function Section({ ctx, title, items, columns = false }: SectionProps) {
  const { s } = ctx;
  const split = columns ? 2 : 1;
  const rowStyle = columns ? s.twoColumns : undefined;

  return (
    <View style={s.section}>
      <View wrap={false}>
        <Text style={s.sectionHeading}>{title}</Text>
        <View style={rowStyle}>{items.slice(0, split)}</View>
      </View>
      {items.length > split && <View style={rowStyle}>{items.slice(split)}</View>}
    </View>
  );
}

function Profile({ ctx }: { ctx: Context }) {
  const summary = ctx.tr(ctx.data.summary);
  if (!summary) return null;
  return (
    <Section ctx={ctx} title={ctx.l.profile} items={[<Text key="summary" style={ctx.s.paragraph}>{summary}</Text>]} />
  );
}

function Timeline({ ctx, title, entries }: { ctx: Context; title: string; entries: CareerEntry[] }) {
  if (entries.length === 0) return null;
  const { l, s, tr } = ctx;
  const sorted = sortCareer(entries);

  return (
    <Section
      ctx={ctx}
      title={title}
      items={sorted.map((entry, index) => {
        const location = tr(entry.location);
        const grade = tr(entry.grade);
        const description = tr(entry.description);
        const highlights = filled(tr(entry.highlights) ?? []);
        return (
          <View key={entry.id} style={s.station} wrap={false}>
            <View style={s.rail}>
              <View style={entry.kind === 'education' ? [s.dot, s.dotHollow] : s.dot} />
              {index < sorted.length - 1 && <View style={s.line} />}
            </View>
            <View style={s.stationBody}>
              <Text style={s.period}>{formatPeriod(entry.start, entry.end, l.intl, l.present)}</Text>
              <Text style={s.stationTitle}>{tr(entry.title)}</Text>
              <Text style={s.muted}>{location ? `${entry.organization} · ${location}` : entry.organization}</Text>
              {grade && (
                <Text style={s.muted}>
                  {l.grade}: <Text style={s.skillName}>{grade}</Text>
                </Text>
              )}
              {description && <Text style={{ marginTop: 2 }}>{description}</Text>}
              {highlights.map((highlight) => (
                <View key={highlight} style={s.highlight}>
                  <Text style={s.bullet}>•</Text>
                  <Text style={{ flex: 1 }}>{highlight}</Text>
                </View>
              ))}
            </View>
          </View>
        );
      })}
    />
  );
}

function Projects({ ctx }: { ctx: Context }) {
  const { data, s, tr } = ctx;
  if (data.projects.length === 0) return null;
  return (
    <Section
      ctx={ctx}
      title={ctx.l.projects}
      columns
      items={data.projects.map((project, index) => {
        const title = tr(project.title);
        const description = tr(project.description);
        const tags = filled(project.tags);
        return (
          <View key={index} style={[s.entry, s.column]} wrap={false}>
            {project.url ? (
              <Link src={project.url} style={[s.entryTitle, s.link]}>
                {title}
              </Link>
            ) : (
              <Text style={s.entryTitle}>{title}</Text>
            )}
            {description && <Text>{description}</Text>}
            {tags.length > 0 && <Text style={s.tags}>{tags.join(' · ')}</Text>}
          </View>
        );
      })}
    />
  );
}

function Skills({ ctx }: { ctx: Context }) {
  const { data, s, tr } = ctx;
  if (data.skills.length === 0) return null;
  return (
    <Section
      ctx={ctx}
      title={ctx.l.skills}
      items={data.skills.map((group, index) => (
        <Text key={index} style={s.skillGroup}>
          <Text style={s.skillName}>{tr(group.group)}: </Text>
          {filled(group.items).join(', ')}
        </Text>
      ))}
    />
  );
}

function Certificates({ ctx }: { ctx: Context }) {
  const { data, l, s, tr } = ctx;
  if (data.certificates.length === 0) return null;
  const month = new Intl.DateTimeFormat(l.intl, { month: '2-digit', year: 'numeric' });
  return (
    <Section
      ctx={ctx}
      title={l.certificates}
      columns
      items={data.certificates.map((certificate, index) => {
        const title = tr(certificate.title);
        const date = certificate.date ? ` · ${month.format(parseYearMonth(certificate.date))}` : '';
        return (
          <View key={index} style={[s.entry, s.column]} wrap={false}>
            {certificate.url ? (
              <Link src={certificate.url} style={[s.entryTitle, s.link]}>
                {title}
              </Link>
            ) : (
              <Text style={s.entryTitle}>{title}</Text>
            )}
            <Text style={s.muted}>
              {certificate.issuer}
              {date}
            </Text>
          </View>
        );
      })}
    />
  );
}

function Languages({ ctx }: { ctx: Context }) {
  const { data, s, tr } = ctx;
  if (data.languages.length === 0) return null;
  return (
    <Section
      ctx={ctx}
      title={ctx.l.languages}
      items={[
        <Text key="languages">
          {data.languages.map((language, index) => (
            <Text key={index}>
              {index > 0 && <Text style={s.contactSeparator}>{'  ·  '}</Text>}
              <Text style={s.skillName}>{tr(language.name)}</Text> – {tr(language.level)}
            </Text>
          ))}
        </Text>,
      ]}
    />
  );
}
