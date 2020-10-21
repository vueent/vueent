import { RollbackArrayMask, RollbackMask, isRollbackArrayMaskUnsafe } from './rollback';

export function flattenKeys(arg: RollbackMask | RollbackArrayMask, prefix = ''): string[] {
  const result: string[] = [];
  const dot = prefix === '' ? '' : '.';

  if (isRollbackArrayMaskUnsafe(arg)) {
    for (const key in arg) {
      if (key !== '$array' && key !== '$index') {
        if (Reflect.has(arg, '$index')) {
          const index = arg['$index'] as number[];

          for (const idx of index) {
            const item = arg[key];
            const path = `${prefix}.[${idx}].${key}`;

            if (typeof item === 'object') result.push(...flattenKeys(item, path));
            else result.push(path);
          }
        } else {
          const item = arg[key];
          const path = `${prefix}.[].${key}`;

          if (typeof item === 'object') result.push(...flattenKeys(item, path));
          else result.push(path);
        }
      }
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
