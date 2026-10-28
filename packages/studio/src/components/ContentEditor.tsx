import { useId, useState } from 'react';
import { photoToDataUrl } from '../photo';
import { Field } from './Field';
import { listSpecs, personFields, type ListSpec } from './fields';
import { ListEditor } from './ListEditor';
import { useStudio } from './StudioContext';
import styles from './studio.module.css';

const listSpec = (id: ListSpec['id']) => listSpecs.find((spec) => spec.id === id)!;

/** The "Content" tab: person, profile and all lists. */
export function ContentEditor() {
  const { ui } = useStudio();

  return (
    <div className={styles.sections}>
      <fieldset className={styles.section}>
        <legend>{ui.sections.person}</legend>
        <div className={styles.grid}>
          {personFields.map((field) => (
            <Field key={field.key} base={['person']} spec={field} />
          ))}
        </div>
        <PhotoField />
      </fieldset>

      <fieldset className={styles.section}>
        <legend>{ui.sections.summary}</legend>
        <div className={styles.grid}>
          <Field base={[]} spec={{ key: 'summary', kind: 'textarea', wide: true }} />
        </div>
      </fieldset>

      {(['career', 'skills', 'certificates', 'projects', 'languages', 'links'] as const).map((id) => (
        <fieldset key={id} className={styles.section}>
          <legend>{ui.sections[id]}</legend>
          <ListEditor spec={listSpec(id)} />
        </fieldset>
      ))}
    </div>
  );
}

function PhotoField() {
  const { state, dispatch, ui } = useStudio();
  const id = useId();
  const [error, setError] = useState(false);
  const photo = state.data.person.photo;

  return (
    <div className={styles.photo}>
      {photo && <img src={photo} alt="" width={64} height={64} />}
      <div>
        <label htmlFor={id} className={styles.button}>
          {ui.photo.choose}
        </label>
        <input
          id={id}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className={styles.visuallyHidden}
          onChange={async (event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (!file) return;
            try {
              dispatch({ type: 'set', path: ['person', 'photo'], value: await photoToDataUrl(file) });
              setError(false);
            } catch {
              setError(true);
            }
          }}
        />
        {photo && (
          <button
            type="button"
            className={styles.linkButton}
            onClick={() => dispatch({ type: 'set', path: ['person', 'photo'], value: undefined })}
          >
            {ui.photo.remove}
          </button>
        )}
        <p className={styles.hint}>{error ? ui.errors.open : ui.photo.hint}</p>
      </div>
    </div>
  );
}
