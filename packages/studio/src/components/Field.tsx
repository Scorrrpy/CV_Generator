import { resolveLocalized, type Localized } from '@scorrrpy/cv-engine';
import { useId } from 'react';
import { getIn, type Path } from '../state/path';
import { formatInput, isTranslatable, parseInput, type FieldSpec } from './fields';
import { useStudio } from './StudioContext';
import styles from './studio.module.css';

/** One labelled input bound to the value at `[...base, spec.key]`. */
export function Field({ base, spec }: { base: Path; spec: FieldSpec }) {
  const { state, dispatch, ui } = useStudio();
  const id = useId();
  const path = [...base, spec.key];
  const raw = getIn(state.data, path);
  const translatable = isTranslatable(spec.kind);
  const value = formatInput(spec.kind, translatable ? resolveLocalized(raw as Localized<unknown>, state.cvLocale) : raw);

  const change = (input: string) => {
    const next = parseInput(spec.kind, input);
    if (translatable) dispatch({ type: 'setText', path, value: next as string | string[] });
    else dispatch({ type: 'set', path, value: next });
  };

  const label = ui.fields[spec.key];
  const className = spec.wide ? `${styles.field} ${styles.wide}` : styles.field;

  return (
    <div className={className}>
      <label htmlFor={id}>
        {label}
        {translatable && state.bilingual && <span className={styles.lang}>{state.cvLocale.toUpperCase()}</span>}
      </label>
      {spec.kind === 'kind' ? (
        <select id={id} value={value} onChange={(event) => change(event.target.value)}>
          <option value="work">{ui.kinds.work}</option>
          <option value="education">{ui.kinds.education}</option>
        </select>
      ) : spec.kind === 'textarea' || spec.kind === 'lines' ? (
        <textarea id={id} value={value} rows={spec.kind === 'lines' ? 4 : 3} onChange={(event) => change(event.target.value)} />
      ) : (
        <input
          id={id}
          type={inputType(spec.kind)}
          value={value}
          onChange={(event) => change(event.target.value)}
        />
      )}
    </div>
  );
}

function inputType(kind: FieldSpec['kind']): string {
  switch (kind) {
    case 'email':
    case 'url':
    case 'tel':
    case 'month':
    case 'date':
      return kind;
    default:
      return 'text';
  }
}
