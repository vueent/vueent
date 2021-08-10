import get from 'lodash/get';
import { reactive, computed } from 'vue-demi';

import { Options, Constructor, BaseModel } from '../model';

import { ValidationBase, Pattern, AnyPattern, ObjectPattern, asPattern, isArrayPatternUnsafe } from './interfaces';
import { Children, Validation } from './validation';
import { Provider } from './provider';

/**
 * Save mixin options.
 */
export interface ValidateOptions extends Options {
  /**
   * Mixin name.
   */
  readonly mixinType: 'validate';

  /**
   * Validations configuration.
   */
  readonly validations?: ValidationBase;

  /**
   * Set the {@link ValidationBase.dirty} flag automatically when data changes.
   */
  readonly autoTouch?: boolean;
}

/**
 * Reactive properties which provided by validate mixin.
 */
export interface ValidationProps {
  /**
   * A flag indicating that the state is locked and should not be changed, e.g. {@link ValidationBase.dirty}.
   */
  locked: boolean;

  /**
   * Set the {@link ValidationBase.dirty} flag automatically when data changes.
   */
  autoTouch: boolean;

  /**
   * The base instance of {@link ValidationBase}.
   */
  validations: ValidationBase;
}

/**
 * Public interface of `validate` mixin.
 */
export interface Validate<T extends ValidationBase = ValidationBase> {
  /**
   * The base instance of {@link ValidationBase}.
   */
  readonly validations: ValidationBase;

  /**
   * Typed shortcut of {@link Validate.validations} property.
   */
  readonly v: T;
}

/**
 * Private interface of `validate` mixin.
 */
export interface ValidatePrivate<T extends ValidationBase = ValidationBase> extends Validate<T> {
  /**
   * Reactive properties which provided by the mixin.
   */
  readonly _validationProps: ValidationProps;

  /**
   * Initializes an instance of {@link Validate.validations}.
   *
   * @param provider - data provider
   * @param pattern - validation pattern
   * @param autoTouch - set the {@link ValidationBase.dirty} flag automatically when data changes
   * @param defined - data field is defined
   * @param prefix - path prefix
   * @returns - root validation instance
   */
  initValidations(
    provider: Provider,
    pattern: AnyPattern,
    autoTouch: boolean,
    defined: boolean,
    prefix?: string[]
  ): ValidationBase;

  /**
   * Initializes child validations.
   *
   * @param provider - data provider
   * @param pattern - validation pattern
   * @param autoTouch - set the {@link ValidationBase.dirty} flag automatically when data changes
   * @param defined - data field is defined
   * @param prefix - path prefix
   * @param applyOrOffset - array index filter
   * @returns - child validations
   */
  initValidationChildren(
    provider: Provider,
    pattern: AnyPattern,
    autoTouch: boolean,
    defined: boolean,
    prefix: string[],
    applyOrOffset?: number
  ): Children;
}

/**
 * Appends `validate` mixin to the model class.
 *
 * @param parent - parent model class
 * @param pattern - validation pattern, @see {@link Pattern}
 * @returns - mixed model class
 */
export function validateMixin<
  D extends object,
  C extends Constructor<D, BaseModel<D>>,
  U extends ValidationBase = ValidationBase
>(parent: C, pattern?: Pattern) {
  return class extends parent implements ValidatePrivate<U> {
    /**
     * Reactive properties which provided by the mixin.
     */
    readonly _validationProps: ValidationProps;

    /**
     * The base instance of {@link ValidationBase}.
     */
    get validations() {
      return this._validationProps.validations;
    }

    /**
     * Typed shortcut of {@link Validate.validations} property.
     */
    get v(): U {
      return this._validationProps.validations as U;
    }

    constructor(...args: any[]) {
      super(...args);

      this._validationProps = reactive({ locked: false, autoTouch: false }) as ValidationProps;

      this.initValidations = this.initValidations.bind(this);
      this.initValidationChildren = this.initValidationChildren.bind(this);

      const options = args.slice(3).find(arg => arg?.mixinType === 'validate') as ValidateOptions | undefined;

      if (options?.autoTouch) this._validationProps.autoTouch = true;

      if (options?.validations) {
        this._validationProps.validations = options.validations;

        return;
      } else if (!pattern) throw new Error('Pattern or predefined validations should be set');

      pattern = asPattern(pattern);

      if (!pattern) throw new Error('Unsupported pattern format');

      const objectPattern: ObjectPattern = { $sub: pattern };
      const provider = new Provider(
        computed(() => this.data),
        computed(() => this._validationProps.locked),
        this._validationProps.autoTouch,
        this.initValidationChildren,
        objectPattern
      );

      this._validationProps.validations = this.initValidations(provider, objectPattern, this._validationProps.autoTouch, true);
    }

    /**
     * Is called after rollback the model data.
     */
    afterRollback() {
      this._validationProps.locked = true;
      this._validationProps.validations.reset();
      this._validationProps.locked = false;
      super.afterRollback();
    }

    /**
     * Destroys the model data.
     *
     * The destroyed models should not be used, its data reactivity is lost.
     */
    destroy() {
      this.validations.destroy();
      super.destroy();
    }

    /**
     * Initializes an instance of {@link Validate.validations}.
     *
     * @param provider - data provider
     * @param pattern - validation pattern
     * @param autoTouch - set the {@link ValidationBase.dirty} flag automatically when data changes
     * @param defined - data field is defined
     * @param prefix - path prefix
     * @returns - root validation instance
     */
    initValidations(
      provider: Provider,
      pattern: AnyPattern,
      autoTouch: boolean,
      defined: boolean,
      prefix: string[] = []
    ): ValidationBase {
      const children = this.initValidationChildren(provider, pattern, autoTouch, defined, prefix);

      return new Validation(provider.bindContext(pattern), prefix, autoTouch, pattern.$self, children);
    }

    /**
     * Initializes child validations.
     *
     * @param provider - data provider
     * @param pattern - validation pattern
     * @param autoTouch - set the {@link ValidationBase.dirty} flag automatically when data changes
     * @param defined - data field is defined
     * @param prefix - path prefix
     * @param applyOrOffset - array index filter
     * @returns - child validations
     */
    initValidationChildren(
      provider: Provider,
      pattern: AnyPattern,
      autoTouch: boolean,
      defined: boolean,
      prefix: string[],
      applyOrOffset: number[] | number = 0
    ): Children {
      if (isArrayPatternUnsafe(pattern)) {
        // item is array
        const children: ValidationBase[] = [];

        if (!defined) return children;

        const each = pattern.$each;
        const values: unknown[] = get(this.data, prefix.join('.'));
        let createChild: (index: number) => ValidationBase;

        if (typeof each === 'function') {
          createChild = (i: number) => new Validation(provider.bindContext(pattern), [...prefix, `[${i}]`], autoTouch, each);
        } else if (isArrayPatternUnsafe(each)) {
          createChild = (i: number) =>
            this.initValidations(provider, each, autoTouch, values[i] !== undefined, [...prefix, `[${i}]`]);
        } else {
          createChild = (i: number) =>
            this.initValidations(provider, { $sub: each }, autoTouch, values[i] !== undefined, [...prefix, `[${i}]`]);
        }

        if (typeof applyOrOffset === 'number') {
          for (let i = 0; i < values.length; ++i) {
            if (i >= applyOrOffset) children.push(createChild(i));
          }
        } else {
          for (let i = 0; i < values.length; ++i) {
            if (applyOrOffset.includes(i)) children.push(createChild(i));
          }
        }

        return children;
      } else {
        // item is object
        const children: Record<string, ValidationBase> = {};

        if (!defined) return children;

        const sub = pattern.$sub;

        for (const key in sub) {
          const path = [...prefix, String(key)];
          const subPattern = sub[key];

          if (typeof subPattern === 'object') {
            children[key] = this.initValidations(
              provider,
              subPattern,
              autoTouch,
              get(this.data, path.join('.')) !== undefined,
              path
            );
          } else children[key] = new Validation(provider.bindContext(pattern), path, autoTouch, subPattern);
        }

        return children;
      }
    }

    /**
     * Returns `true` if the model has a mixin.
     *
     * @param mixin - mixin function
     */
    hasMixin(mixin: Function): boolean {
      return mixin === validateMixin || super.hasMixin(mixin);
    }
  };
}

/**
 * Returns a typed function that extends a model class with `validate` mixin.
 *
 * This function can be used my {@see mix} function.
 *
 * @param pattern - validation pattern, @see {@link Pattern}
 * @returns - mixin function
 */
export function mixValidate<U extends ValidationBase = ValidationBase>(pattern?: Pattern) {
  return <D extends object, C extends Constructor<D, BaseModel<D>>>(parent: C) => validateMixin<D, C, U>(parent, pattern);
}
