import * as v from 'valibot';

/**
 * The CV data model. The schemas are the single source of truth: the TypeScript types are inferred from them,
 * and the same schemas validate imported files and saved states. Everything is plain JSON.
 */

export const LOCALES = ['de', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

/** A text in one language for both CV languages, or one translation per language. */
const localized = <T extends v.GenericSchema>(schema: T) =>
  v.union([schema, v.object({ de: schema, en: schema })]);

const text = localized(v.string());
const optionalText = v.optional(text);

const yearMonth = v.pipe(v.string(), v.regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Expected a month as YYYY-MM'));
const isoDate = v.pipe(v.string(), v.regex(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, 'Expected YYYY-MM-DD'));
const hexColor = v.pipe(v.string(), v.regex(/^#[0-9a-f]{6}$/i, 'Expected a colour as #rrggbb'));
const imageDataUrl = v.pipe(v.string(), v.regex(/^data:image\/(png|jpeg);base64,/, 'Expected a PNG or JPEG data URL'));

export const LinkSchema = v.object({
  label: v.string(),
  url: v.string(),
});

export const PersonSchema = v.object({
  name: v.string(),
  /** Job title or one-line profile below the name. */
  headline: optionalText,
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  location: optionalText,
  website: v.optional(v.string()),
  birthDate: v.optional(isoDate),
  /** Portrait as a data URL, so a saved file stays self-contained. */
  photo: v.optional(imageDataUrl),
  links: v.optional(v.array(LinkSchema), []),
});

export const CareerEntrySchema = v.object({
  id: v.string(),
  kind: v.picklist(['work', 'education']),
  title: text,
  organization: v.string(),
  location: optionalText,
  start: yearMonth,
  /** Left out while the station is still running. */
  end: v.optional(yearMonth),
  description: optionalText,
  highlights: v.optional(localized(v.array(v.string()))),
});

export const SkillGroupSchema = v.object({
  group: text,
  items: v.array(v.string()),
});

export const CertificateSchema = v.object({
  title: text,
  issuer: v.string(),
  date: v.optional(yearMonth),
  url: v.optional(v.string()),
});

export const ProjectSchema = v.object({
  title: text,
  description: optionalText,
  url: v.optional(v.string()),
  tags: v.optional(v.array(v.string()), []),
});

export const LanguageSchema = v.object({
  name: text,
  level: text,
});

export const CV_DATA_VERSION = 1;

export const CvDataSchema = v.object({
  version: v.literal(CV_DATA_VERSION),
  person: PersonSchema,
  summary: optionalText,
  career: v.optional(v.array(CareerEntrySchema), []),
  skills: v.optional(v.array(SkillGroupSchema), []),
  certificates: v.optional(v.array(CertificateSchema), []),
  projects: v.optional(v.array(ProjectSchema), []),
  languages: v.optional(v.array(LanguageSchema), []),
});

export const FONTS = ['Helvetica', 'Times-Roman', 'Courier'] as const;
export const LAYOUTS = ['sidebar', 'classic'] as const;

export const CvThemeSchema = v.object({
  colors: v.object({
    /** Name, headings and timeline. */
    primary: hexColor,
    /** Small highlights: dates, links, dots. */
    accent: hexColor,
    text: hexColor,
    muted: hexColor,
    background: hexColor,
    /** Background and text of the sidebar (layout `sidebar`). */
    sidebar: hexColor,
    sidebarText: hexColor,
  }),
  font: v.picklist(FONTS),
  layout: v.picklist(LAYOUTS),
  showPhoto: v.optional(v.boolean(), true),
});

export type Localized<T> = T | Record<Locale, T>;
export type Link = v.InferOutput<typeof LinkSchema>;
export type Person = v.InferOutput<typeof PersonSchema>;
export type CareerEntry = v.InferOutput<typeof CareerEntrySchema>;
export type SkillGroup = v.InferOutput<typeof SkillGroupSchema>;
export type Certificate = v.InferOutput<typeof CertificateSchema>;
export type Project = v.InferOutput<typeof ProjectSchema>;
export type Language = v.InferOutput<typeof LanguageSchema>;
export type CvData = v.InferOutput<typeof CvDataSchema>;
/** What callers may pass in: arrays with defaults may be left out. */
export type CvDataInput = v.InferInput<typeof CvDataSchema>;
export type CvTheme = v.InferOutput<typeof CvThemeSchema>;
export type CvFont = CvTheme['font'];
export type CvLayout = CvTheme['layout'];

/** Thrown with readable messages (`person.name: Invalid type …`) when data does not match the schema. */
export class CvValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(`Invalid CV data:\n${issues.join('\n')}`);
    this.name = 'CvValidationError';
    this.issues = issues;
  }
}

export function parseWith<T extends v.GenericSchema>(schema: T, input: unknown): v.InferOutput<T> {
  const result = v.safeParse(schema, input);
  if (result.success) return result.output;
  throw new CvValidationError(
    result.issues.map((issue) => {
      const path = v.getDotPath(issue);
      return path ? `${path}: ${issue.message}` : issue.message;
    }),
  );
}

export const parseCvData = (input: unknown): CvData => parseWith(CvDataSchema, input);
export const parseCvTheme = (input: unknown): CvTheme => parseWith(CvThemeSchema, input);
