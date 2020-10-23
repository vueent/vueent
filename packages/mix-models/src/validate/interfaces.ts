import { Children } from './validation';
import { Provider } from './provider';

export type ValidationRule = (value: any, data: unknown, path: string[]) => boolean | string;

/**
 * A base pattern interface.
 *
 * The interface must not be used directly, just use `ValidationRule` instead.
 */
export interface UnknownPattern {
  $self?: ValidationRule;
}

export function isUnknownPattern(inst: any): inst is UnknownPattern {
  return inst && typeof inst === 'object' && (inst.$self === undefined || typeof inst.$self === 'function');
}

export interface ObjectPattern extends UnknownPattern {
  $sub: Pattern;
}

export function asObjectPattern(inst: any, leafSet: Set<unknown>): ObjectPattern | undefined {
  const sup = inst;

  if (!isUnknownPattern(sup) || inst?.$sub === undefined) return undefined;

  if (leafSet.has(inst.$sub)) return inst as ObjectPattern;

  leafSet.add(inst.$sub);

  if (asPattern(inst.$sub, leafSet)) return inst as ObjectPattern;
}

export interface ArrayPattern extends UnknownPattern {
  $each: Pattern | ArrayPattern | ValidationRule;
}

export function asArrayPattern(inst: any, leafSet: Set<unknown>): ArrayPattern | undefined {
  const sup = inst;

  if (!isUnknownPattern(sup) || inst?.$each === undefined) return undefined;
  else if (typeof inst.$each === 'function') return inst as ArrayPattern;

  if (leafSet.has(inst.$each)) return inst as ArrayPattern;

  leafSet.add(inst.$each);

  if (asPattern(inst.$each, leafSet) || asArrayPattern(inst.$each, leafSet)) return inst as ArrayPattern;
}

/**
 * Checks only for the `$each` property existence.
 *
 * @param inst
 */
export function isArrayPatternUnsafe(inst: UnknownPattern): inst is ArrayPattern {
  return (inst as any).$each !== undefined;
}

export type AnyPattern = ObjectPattern | ArrayPattern;

export interface Pattern {
  [key: string]: ValidationRule | AnyPattern;
}

export function asPattern(inst: any, leafSet?: Set<unknown>): Pattern | undefined {
  if (!inst || typeof inst !== 'object') return undefined;

  if (!leafSet) leafSet = new Set<unknown>();

  for (const key in inst) {
    const value = inst[key];

    if (leafSet.has(value) || typeof value === 'function') continue;

    leafSet.add(value);

    if (!asObjectPattern(value, leafSet) && !asArrayPattern(value, leafSet)) return undefined;
  }

  return inst as Pattern;
}

export type ChildrenValidationsInitializer = (
  provider: Provider,
  pattern: AnyPattern,
  autoTouch: boolean,
  defined: boolean,
  prefix?: string[],
  applyOrOffset?: number[] | number
) => Children;
