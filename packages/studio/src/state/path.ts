/**
 * Immutable updates along a path such as `['career', 2, 'title']`. The editor addresses every field this way,
 * so one reducer action covers every form instead of one action per field.
 */
export type Path = readonly (string | number)[];

type Container = Record<string, unknown> | unknown[];

export function getIn(root: unknown, path: Path): unknown {
  let node = root;
  for (const key of path) {
    if (node === null || typeof node !== 'object') return undefined;
    node = (node as Record<string | number, unknown>)[key];
  }
  return node;
}

/** Returns a copy of `root` with `value` at `path`; `undefined` removes the key from objects. */
export function setIn<T>(root: T, path: Path, value: unknown): T {
  if (path.length === 0) return value as T;
  const [key, ...rest] = path as [string | number, ...(string | number)[]];
  const node = (root ?? (typeof key === 'number' ? [] : {})) as Container;
  const child = setIn((node as Record<string | number, unknown>)[key], rest, value);

  if (Array.isArray(node)) {
    const copy = [...node];
    copy[key as number] = child;
    return copy as T;
  }
  const copy: Record<string, unknown> = { ...node, [key]: child };
  if (child === undefined) delete copy[key];
  return copy as T;
}

/** Applies `update` to the array at `path` (a missing array counts as empty). */
export function updateList<T>(root: T, path: Path, update: (list: unknown[]) => unknown[]): T {
  const list = getIn(root, path);
  return setIn(root, path, update(Array.isArray(list) ? list : []));
}

export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length || from === to) return [...list];
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item as T);
  return copy;
}
