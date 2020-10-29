import { Children } from './validation';
import { Provider } from './provider';

export type ValidationRule = (value: any, data: unknown, path: string[]) => boolean | string;

export interface ValidationBase {
  readonly children?: Children;
  readonly anyChildDirty: boolean;
  readonly selfDirty: boolean;
  readonly dirty: boolean;
  readonly anyChildInvalid: boolean;
  readonly selfInvalid: boolean;
  readonly invalid: boolean;
  readonly message: string;
  readonly dirtyMessage: string;
  readonly c?: unknown;

  touch(): void;
  reset(): void;
  updatePath(index: number, section: string): void;
  checkValue(someValue: unknown): boolean;
  destroy(): void;
}

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
  prefix: string[],
  applyOrOffset?: number[] | number
) => Children;

export type ObjectPatternAssert<T extends ObjectPattern, D> = PatternAssert<T['$sub'], D>;

export type ArrayPatternAssert<T extends ArrayPattern, D> = T['$each'] extends Record<string, unknown>
  ? ValidationBase & {
      readonly c: Array<
        T['$each'] extends ArrayPattern
          ? ArrayPatternAssert<T['$each'], D>
          : T['$each'] extends Pattern
          ? PatternAssert<T['$each'], D>
          : never
      >;
    }
  : undefined | (ValidationBase & { readonly c: ValidationBase[] });

interface data {
  phone?: string;
}

type t = undefined;

type test = t extends {} ? never : boolean;

const val = {
  $each: (v: string) => v !== undefined || 'invalid phone'
};

type aaa = typeof val;

type s = { id: string; filename: string }[];

type ta = PatternAssert<aaa, s>;

export type PatternAssert<T extends Pattern, D> = D extends {}
  ? D extends Array<unknown>
    ? ValidationBase & {
        readonly c: {
          [K in keyof T]: T[K] extends Record<string, unknown>
            ? T[K] extends ObjectPattern
              ? ObjectPatternAssert<T[K], D>
              : T[K] extends ArrayPattern
              ? ArrayPatternAssert<T[K], D>
              : never
            : D extends {}
            ? ValidationBase
            : undefined | ValidationBase;
        };
      }
    : ValidationBase & {
        readonly c: {
          [K in keyof T & keyof D]: T[K] extends Record<string, unknown>
            ? T[K] extends ObjectPattern
              ? ObjectPatternAssert<T[K], D[K]>
              : T[K] extends ArrayPattern
              ? ArrayPatternAssert<T[K], D[K]>
              : never
            : D[K] extends {}
            ? ValidationBase
            : undefined | ValidationBase;
        };
      }
  : never;
