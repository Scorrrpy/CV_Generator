import { describe, expect, it } from 'vitest';
import { parseCvFile, serializeCvFile } from './file';
import { sampleCv } from './fixtures';
import { CvValidationError, parseCvData, parseCvTheme } from './schema';
import { defaultTheme } from './theme';

describe('parseCvData', () => {
  it('accepts the sample CV unchanged', () => {
    expect(parseCvData(sampleCv)).toEqual(sampleCv);
  });

  it('fills in empty lists for a minimal CV', () => {
    const data = parseCvData({ version: 1, person: { name: 'Erika Musterfrau' } });
    expect(data.career).toEqual([]);
    expect(data.person.links).toEqual([]);
  });

  it('reports every problem with its path', () => {
    const invalid = {
      ...sampleCv,
      person: { ...sampleCv.person, birthDate: '02.11.2004' },
      career: [{ ...sampleCv.career[0], start: '2023-9' }],
    };
    try {
      parseCvData(invalid);
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(CvValidationError);
      const { issues } = error as CvValidationError;
      expect(issues.some((issue) => issue.startsWith('person.birthDate:'))).toBe(true);
      expect(issues.some((issue) => issue.startsWith('career.0.start:'))).toBe(true);
    }
  });

  it('rejects photos that are not embedded images', () => {
    expect(() => parseCvData({ ...sampleCv, person: { ...sampleCv.person, photo: 'https://x/y.png' } })).toThrow(
      CvValidationError,
    );
  });

  it('rejects unknown versions', () => {
    expect(() => parseCvData({ ...sampleCv, version: 2 })).toThrow(CvValidationError);
  });
});

describe('parseCvTheme', () => {
  it('rejects colours that are not #rrggbb', () => {
    expect(() => parseCvTheme({ ...defaultTheme, colors: { ...defaultTheme.colors, accent: 'red' } })).toThrow();
  });
});

describe('cv files', () => {
  it('round-trips data and theme', () => {
    const file = parseCvFile(serializeCvFile(sampleCv, defaultTheme));
    expect(file.data).toEqual(sampleCv);
    expect(file.theme).toEqual(defaultTheme);
  });

  it('rejects text that is not JSON', () => {
    expect(() => parseCvFile('not json')).toThrow(CvValidationError);
  });

  it('rejects JSON from another application', () => {
    expect(() => parseCvFile(JSON.stringify({ name: 'x' }))).toThrow(CvValidationError);
  });
});
