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

export function isObjectPattern(inst: any): inst is ObjectPattern {
  const sup = inst;

  return isUnknownPattern(sup) && isPattern(inst.$sub);
}

/**
 * Checks only for the `$sub` property existence.
 *
 * @param inst - pattern instance
 */
export function isObjectPatternUnsafe(inst: UnknownPattern): inst is ObjectPattern {
  return (inst as any).$sub !== undefined;
}

export interface ArrayPattern extends UnknownPattern {
  $each: Pattern | ArrayPattern | ValidationRule;
}

export function isArrayPattern(inst: any): inst is ArrayPattern {
  const sup = inst;

  return isUnknownPattern(sup) && (typeof inst.$each === 'function' || isPattern(inst.$each) || isArrayPattern(inst.$each));
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

export function isPattern(inst: any): inst is Pattern {
  if (!inst || typeof inst !== 'object') return false;

  for (const key in inst) {
    const value = inst[key];

    if (typeof value !== 'function' && !isObjectPattern(value) && !isArrayPattern(value)) return false;
  }

  return true;
}

export type ChildrenValidationsInitializer = (
  provider: Provider,
  pattern: AnyPattern,
  autoTouch: boolean,
  defined: boolean,
  prefix?: string[],
  applyOrOffset?: number[] | number
) => Children;
