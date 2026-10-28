import * as v from 'valibot';
import { CvDataSchema, CvThemeSchema, CvValidationError, parseWith, type CvData, type CvTheme } from './schema';

/** A saved CV (`.cv.json`): data and design in one self-contained file. */
const CvFileSchema = v.object({
  format: v.literal('cv-generator'),
  version: v.literal(1),
  data: CvDataSchema,
  theme: CvThemeSchema,
});

export type CvFile = v.InferOutput<typeof CvFileSchema>;

export const CV_FILE_EXTENSION = '.cv.json';

export function serializeCvFile(data: CvData, theme: CvTheme): string {
  const file: CvFile = { format: 'cv-generator', version: 1, data, theme };
  return JSON.stringify(file, null, 2);
}

/** Parses the text of a saved file. Throws `CvValidationError` for anything that is not a valid CV file. */
export function parseCvFile(json: string): CvFile {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    throw new CvValidationError(['The file is not valid JSON.']);
  }
  return parseWith(CvFileSchema, raw);
}
