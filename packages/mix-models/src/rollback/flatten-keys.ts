import { RollbackArrayMask, RollbackMask, isRollbackArrayMaskUnsafe } from './interfaces';

/**
 * Returns a list of flatten keys of an object mask.
 *
 * The function parses an argument deeply and constructs full paths of each key.
 *
 * @param arg - rollback mask
 * @param prefix - path prefix
 * @returns - flatten keys
 */
export function flattenKeys(arg: RollbackMask | RollbackArrayMask, prefix = ''): string[] {
  const result: string[] = [];
  const dot = prefix === '' ? '' : '.';

  if (isRollbackArrayMaskUnsafe(arg)) {
    const index = arg.$index;

    const pushItem = (key: string, item: boolean | RollbackMask | RollbackArrayMask | number[] | undefined, idx?: number) => {
      const path = `${prefix}.[${idx ?? ''}].${key}`;

      if (typeof item === 'object') result.push(...flattenKeys(item as RollbackMask | RollbackArrayMask, path));
      else result.push(path);
    };

    for (const key in arg) {
      if (key !== '$array' && key !== '$index')
        index ? index.forEach(idx => pushItem(key, arg[key], idx)) : pushItem(key, arg[key]);
    }
  } else {
    for (const key in arg) {
      const item = arg[key];
      const path = prefix + (Number.isInteger(parseInt(key, 10)) ? `${dot}[${key}]` : dot + key);

      if (typeof item === 'object') result.push(...flattenKeys(item, path));
      else result.push(path);
    }
  }

  return result;
}
