export function flattenKeys(arg: Record<string, unknown>, prefix = ''): string[] {
  const result: string[] = [];
  const dot = prefix === '' ? '' : '.';

  for (const key in arg) {
    if (!Reflect.has(arg, key)) continue;

    const item = arg[key];
    const path = prefix + (Number.isInteger(parseInt(key, 10)) ? `[${key}]` : dot + key);

    if (typeof item === 'object') result.push(...flattenKeys(item as Record<string, unknown>, path));
    else result.push(path);
  }

  return result;
}
