import { describe, expect, it } from 'vitest';
import { formatInput, parseInput } from './fields';

describe('field conversion', () => {
  it('splits bullet points by line and keeps empty lines while typing', () => {
    expect(parseInput('lines', 'a\n\nb')).toEqual(['a', '', 'b']);
    expect(formatInput('lines', ['a', 'b'])).toBe('a\nb');
  });

  it('splits lists by comma', () => {
    expect(parseInput('list', 'React, Go,')).toEqual(['React', 'Go', '']);
    expect(formatInput('list', ['React', 'Go'])).toBe('React, Go');
  });

  it('removes empty dates', () => {
    expect(parseInput('month', '')).toBeUndefined();
    expect(parseInput('month', '2024-05')).toBe('2024-05');
  });

  it('shows missing values as empty inputs', () => {
    expect(formatInput('text', undefined)).toBe('');
  });
});
