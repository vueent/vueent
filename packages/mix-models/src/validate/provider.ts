import { ComputedRef, reactive } from 'vue-demi';

import { AnyPattern, ChildrenValidationsInitializer } from './interfaces';
import { Children } from './validation';

/**
 * Data provider properties.
 */
export interface Props {
  /**
   * Model data.
   */
  data: unknown;

  /**
   * A flag indicating that the validation state is locked.
   *
   * If this flag is set, a validation state of the context should not be changed, e.g. `dirty` flag.
   */
  locked: boolean;
}

/**
 * This class connects validations without circular dependencies.
 */
export class Provider {
  /**
   * Validation pattern.
   */
  public readonly pattern: AnyPattern;

  /**
   * Set the `dirty` flag automatically when data changes.
   */
  private readonly _autoTouch: boolean;

  /**
   * Data provider properties.
   */
  private readonly _props: Props;

  /**
   * A function that initializes child validations.
   */
  private readonly _childrenInitializer: ChildrenValidationsInitializer;

  /**
   * Model data.
   */
  public get data() {
    return this._props.data;
  }

  /**
   * A flag indicating that the validation state is locked.
   *
   * If this flag is set, a validation state of the context should not be changed, e.g. `dirty` flag.
   */
  public get locked() {
    return this._props.locked;
  }

  /**
   * @param data - model data reference
   * @param locked - reference of the flag indicating that the validation state is locked
   * @param autoTouch - set the `dirty` flag automatically when data changes
   * @param childrenInitalizer - a function that initializes child validations
   * @param pattern - validation pattern
   */
  constructor(
    data: ComputedRef<unknown> | unknown,
    locked: ComputedRef<boolean> | boolean,
    autoTouch: boolean,
    childrenInitalizer: ChildrenValidationsInitializer,
    pattern: AnyPattern
  ) {
    this._autoTouch = autoTouch;
    this._props = reactive({ data, locked }) as Props;
    this.pattern = pattern;
    this._childrenInitializer = childrenInitalizer;
  }

  /**
   * Creates and returns a child validation.
   *
   * @param defined - data field is defined
   * @param path - data field path
   * @param applyOrOffset - array index filter
   * @returns - child validation
   */
  public createChildren(defined: boolean, path: string[], applyOrOffset: number[] | number = 0): Children {
    return this._childrenInitializer(this, this.pattern, this._autoTouch, defined, path, applyOrOffset);
  }

  /**
   * Returns a {@link Provider} instance with a bound context.
   *
   * @param pattern - validation pattern (context path)
   * @returns - bound instance
   */
  public bindContext(pattern: AnyPattern): Provider {
    return new Provider(this._props.data, this._props.locked, this._autoTouch, this._childrenInitializer, pattern);
  }
}
