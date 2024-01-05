import { Children } from './validation';
import { Provider } from './provider';

/**
 * A function type that checks a value from the data path and returns a result.
 *
 * @param value - checking data field
 * @param data - model data
 * @param path - field path
 * @returns - validation result
 */
export type ValidationRule = (value: any, data: unknown, path: string[]) => boolean | string;

/**
 * Basic validation interface.
 */
export interface ValidationBase {
  /**
   * Children validations.
   */
  readonly children?: Children;

  /**
   * A flag indicating that at least one of children has the {@link ValidationBase.dirty} flag.
   */
  readonly anyChildDirty: boolean;

  /**
   * A flag indicating that the current data field is dirty.
   */
  readonly selfDirty: boolean;

  /**
   * A flag indicating that the current data field or one of children is dirty.
   */
  readonly dirty: boolean;

  /**
   * A flag indicating that at least on of children has the {@link ValidationBase.invalid} flag.
   */
  readonly anyChildInvalid: boolean;

  /**
   * A flag indicating that validation of the current data field failed.
   */
  readonly selfInvalid: boolean;

  /**
   * A flag indicating the validation of the current data field or one of children failed.
   */
  readonly invalid: boolean;

  /**
   * Validation error text.
   */
  readonly message: string;

  /**
   * Validation error text, which is specified only if the {@link ValidationBase.dirty} flag is set.
   */
  readonly dirtyMessage: string;

  /**
   * Children shortcut. Typed children validations.
   *
   * This field is identical to {@link ValidationBase.children}, but uses a type, that should be send to the mixin function.
   */
  readonly c?: unknown;

  /**
   * Marks the current data field as dirty.
   */
  touch(): void;

  /**
   * Resets the current validation state to default values.
   */
  reset(): void;

  /**
   * Updates a path of the current date field if it is moved.
   *
   * This method is called when the array items are moving.
   * ATTENTION: This method should not be used manually.
   *
   * @internal
   * @param index - index of the modified path section
   * @param section - updated section value
   */
  updatePath(index: number, section: string): void;

  /**
   * Compares the specified value with the cached value of the current data field.
   *
   * @param someValue - specified value
   * @returns - check result
   */
  checkValue(someValue: unknown): boolean;

  /**
   * Destroys the current validation instance and its children.
   *
   * This method stops data watchers.
   */
  destroy(): void;
}

/**
 * A base pattern interface.
 *
 * ATTENTION: This interface must not be used directly.
 */
export interface UnknownPattern {
  /**
   * An object or array validation rule.
   */
  $self?: ValidationRule;
}

/**
 * Casts a variable to the {@link UnknownPattern} type if it has a correct `$self` field, or `undefined`.
 *
 * @param inst - variable
 * @returns - checking result
 */
export function isUnknownPattern(inst: any): inst is UnknownPattern {
  return inst && typeof inst === 'object' && (inst.$self === undefined || typeof inst.$self === 'function');
}

/**
 * An object pattern interface.
 *
 * ATTENTION: This interface must not be used directly.
 */
export interface ObjectPattern extends UnknownPattern {
  /**
   * A pattern of fields of the object.
   */
  $sub: Pattern;
}

/**
 * Casts a variable to the {@link ObjectPattern} type if it has correct subpatterns, or `undefined`.
 *
 * @param inst - variable
 * @param leafSet - set of subpatterns
 * @returns - checking result
 */
export function asObjectPattern(inst: any, leafSet: Set<unknown>): ObjectPattern | undefined {
  const sup = inst;

  if (!isUnknownPattern(sup) || inst?.$sub === undefined) return undefined;

  if (leafSet.has(inst.$sub)) return inst as ObjectPattern;

  leafSet.add(inst.$sub);

  if (asPattern(inst.$sub, leafSet)) return inst as ObjectPattern;
}

/**
 * An array pattern interface.
 *
 * ATTENTION: This interface must not be used directly.
 */
export interface ArrayPattern extends UnknownPattern {
  /**
   * A pattern of elements of the array.
   */
  $each: Pattern | ArrayPattern | ValidationRule;
}

/**
 * Casts a variable to the {@link ArrayPattern} type if it has correct subpatterns, or `undefined`.
 *
 * @param inst - variable
 * @param leafSet - set of subpatterns
 * @returns - checking result
 */
export function asArrayPattern(inst: any, leafSet: Set<unknown>): ArrayPattern | undefined {
  const sup = inst;

  if (!isUnknownPattern(sup) || inst?.$each === undefined) return undefined;
  else if (typeof inst.$each === 'function') return inst as ArrayPattern;

  if (leafSet.has(inst.$each)) return inst as ArrayPattern;

  leafSet.add(inst.$each);

  if (asPattern(inst.$each, leafSet) || asArrayPattern(inst.$each, leafSet)) return inst as ArrayPattern;
}

/**
 * Casts a variable to the {@link ArrayPattern} type if has a defined `$each` field.
 *
 * ATTENTION: Checks only for the `$each` property existence.
 *
 * @param inst - variable
 * @returns - checking result
 */
export function isArrayPatternUnsafe(inst: UnknownPattern): inst is ArrayPattern {
  return (inst as any).$each !== undefined;
}

/**
 * A combination of {@link ObjectPattern} and {@link ArrayPattern} types.
 */
export type AnyPattern = ObjectPattern | ArrayPattern;

/**
 * Unified pattern interface.
 *
 * ATTENTION: Do not use with type directly if you want to use {@link PatternAssert}.
 */
export interface Pattern {
  /**
   * Subpatterns.
   */
  [key: string]: ValidationRule | AnyPattern;
}

/**
 * Casts a variable to the {@link Pattern} type if it has correct subpatterns, or `undefined`.
 *
 * @param inst - variable
 * @param leafSet - set of subpatterns
 * @returns - checking result
 */
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

/**
 * A function that initializes child validations.
 *
 * @param provider - provider instance
 * @param pattern - validation pattern
 * @param autoTouch - set the `dirty` flag automatically when data changes
 * @param defined - data field is defined
 * @param prefix - data field path
 * @param applyOrOffset - array index filter
 * @returns - child validations
 */
export type ChildrenValidationsInitializer = (
  provider: Provider,
  pattern: AnyPattern,
  autoTouch: boolean,
  defined: boolean,
  prefix: string[],
  applyOrOffset?: number[] | number
) => Children;

type Conditional<C, T> = C extends undefined ? T | undefined : T;

type DataField<D, K extends keyof Exclude<D, undefined | null>> = Exclude<D, undefined | null> extends object
  ? Exclude<D, undefined | null>[K]
  : never;

type DataItem<D> = Exclude<D, undefined> extends Array<unknown> ? Exclude<D, undefined>[number] : never;

export type ArrayItemPatternAssert<T, D> = T extends ArrayPattern
  ? ArrayPatternAssert<T, D>
  : T extends Pattern
  ? PatternAssert<T, D>
  : never;

export type ObjectPatternAssert<T extends ObjectPattern, D> = PatternAssert<T['$sub'], D>;

export type ArrayPatternAssert<T extends ArrayPattern, D> = T['$each'] extends ValidationRule
  ? ValidationBase & { readonly c: Conditional<D, ValidationBase>[] }
  : ValidationBase & { readonly c: Conditional<D, ArrayItemPatternAssert<T['$each'], DataItem<D>>>[] };

/**
 * This type generates validation type from the validations pattern object and the model data type.
 *
 * @example
 * ```
 * interface Data {
 *   id: number;
 *   name: string;
 *   value: number;
 * }
 *
 * const validations = {
 *   name: (value: string) => value.length > 0,
 *   value: (value: number) => value <= 100 && value > 10
 * };
 *
 * type Validations = PatternAssert<typeof validations, Data>;
 * ```
 */
export type PatternAssert<T extends Pattern, D> = ValidationBase & {
  readonly c: {
    [K in keyof T & keyof Exclude<D, undefined | null>]: Conditional<
      D,
      T[K] extends ObjectPattern
        ? ObjectPatternAssert<T[K], DataField<D, K>>
        : T[K] extends ArrayPattern
        ? ArrayPatternAssert<T[K], DataField<D, K>>
        : T[K] extends ValidationRule
        ? ValidationBase
        : never
    >;
  };
};
