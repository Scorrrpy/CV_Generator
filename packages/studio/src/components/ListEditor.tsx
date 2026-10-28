import { resolveLocalized, type Localized } from '@scorrrpy/cv-engine';
import { useState, type MouseEvent } from 'react';
import { getIn } from '../state/path';
import { Field } from './Field';
import type { ListSpec } from './fields';
import { useStudio } from './StudioContext';
import styles from './studio.module.css';

/** Editable list of entries (career stations, skills, …) with add, remove and reorder. */
export function ListEditor({ spec }: { spec: ListSpec }) {
  const { state, dispatch, ui } = useStudio();
  const items = (getIn(state.data, spec.path) as Record<string, unknown>[] | undefined) ?? [];

  return (
    <div className={styles.list}>
      {items.length === 0 && <p className={styles.hint}>{ui.list.empty}</p>}

      {items.map((item, index) => (
        // Most entries have no stable id, so the position is the key.
        <ListItem key={index} spec={spec} item={item} index={index} count={items.length} />
      ))}

      <button
        type="button"
        className={styles.button}
        onClick={() => dispatch({ type: 'add', path: spec.path, item: spec.newItem() })}
      >
        + {ui.list.add}
      </button>
    </div>
  );
}

interface ListItemProps {
  spec: ListSpec;
  item: Record<string, unknown>;
  index: number;
  count: number;
}

function ListItem({ spec, item, index, count }: ListItemProps) {
  const { state, dispatch, ui } = useStudio();
  const title = resolveLocalized(item[spec.titleKey] as Localized<string> | undefined, state.cvLocale);
  // New, still empty entries start expanded; afterwards the user decides.
  const [open, setOpen] = useState(!title);

  // The buttons sit inside <summary>; without preventDefault a click would also toggle the entry.
  const action = (run: () => void) => (event: MouseEvent) => {
    event.preventDefault();
    run();
  };

  return (
    <details className={styles.item} open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary>
        <span className={styles.itemTitle}>{title || ui.list.untitled}</span>
        <span className={styles.itemActions}>
          <button
            type="button"
            className={styles.iconButton}
            aria-label={ui.list.up}
            title={ui.list.up}
            disabled={index === 0}
            onClick={action(() => dispatch({ type: 'move', path: spec.path, from: index, to: index - 1 }))}
          >
            ↑
          </button>
          <button
            type="button"
            className={styles.iconButton}
            aria-label={ui.list.down}
            title={ui.list.down}
            disabled={index === count - 1}
            onClick={action(() => dispatch({ type: 'move', path: spec.path, from: index, to: index + 1 }))}
          >
            ↓
          </button>
          <button
            type="button"
            className={styles.iconButton}
            aria-label={ui.list.remove}
            title={ui.list.remove}
            onClick={action(() => dispatch({ type: 'remove', path: spec.path, index }))}
          >
            ✕
          </button>
        </span>
      </summary>
      <div className={styles.grid}>
        {spec.fields.map((field) => (
          <Field key={field.key} base={[...spec.path, index]} spec={field} />
        ))}
      </div>
    </details>
  );
}
