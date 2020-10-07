import { get } from 'lodash';
import { reactive, computed } from 'vue-demi';

import { Constructor } from '@vueent/mix-models/model';

import { Pattern, AnyPattern, ObjectPattern, isPattern, isArrayPatternUnsafe } from './interfaces';
import { Validation, ValidationInterface, ValidationBase } from './validation';
import { Provider } from './provider';

export interface ValidateOptions {
  readonly mixinType: 'validate';
  readonly validations?: ValidationInterface;
  readonly autoTouch?: boolean;
}

export interface ValidationProps {
  locked: boolean;
  autoTouch: boolean;
  validations: ValidationInterface;
}

export interface Validate<T extends ValidationBase = ValidationBase> {
  readonly validations: ValidationInterface;
  readonly v: T;
}

export interface ValidatePrivate<T extends ValidationBase = ValidationBase> extends Validate<T> {
  readonly _validationProps: ValidationProps;

  initValidations(
    provider: Provider,
    pattern: AnyPattern,
    autoTouch: boolean,
    defined: boolean,
    prefix?: string[]
  ): ValidationInterface;

  initValidationChildren(
    provider: Provider,
    pattern: AnyPattern,
    autoTouch: boolean,
    defined: boolean,
    prefix?: string[],
    offset?: number
  ): Record<string, ValidationInterface> | ValidationInterface[];
}

export function mixValidate<T extends object, TBase extends Constructor<T>, U extends ValidationBase = ValidationBase>(
  pattern?: Pattern
) {
  return function(parent: TBase) {
    return class extends parent implements ValidatePrivate<U> {
      readonly _validationProps: ValidationProps;

      get validations() {
        return this._validationProps.validations;
      }

      get v(): U {
        return (this._validationProps.validations as unknown) as U;
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

        if (!isPattern(pattern)) throw new Error('Unsupported pattern format');

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

      afterRollback() {
        this._validationProps.locked = true;
        this._validationProps.validations.reset();
        this._validationProps.locked = false;

        super.afterRollback();
      }

      initValidations(
        provider: Provider,
        pattern: AnyPattern,
        autoTouch: boolean,
        defined: boolean,
        prefix: string[] = []
      ): ValidationInterface {
        const children = this.initValidationChildren(provider, pattern, autoTouch, defined, prefix);

        return new Validation(provider.bindContext(pattern), prefix, autoTouch, pattern.$self, children);
      }

      initValidationChildren(
        provider: Provider,
        pattern: AnyPattern,
        autoTouch: boolean,
        defined: boolean,
        prefix: string[] = [],
        applyOrOffset: number[] | number = 0
      ): Record<string, ValidationInterface> | ValidationInterface[] {
        if (isArrayPatternUnsafe(pattern)) {
          // item is array
          const children: ValidationInterface[] = [];

          if (!defined) return children;

          const each = pattern.$each;
          const values: unknown[] = get(this.data, prefix.join('.'));
          let createChild: (index: number) => ValidationInterface;

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
          const children: Record<string, ValidationInterface> = {};

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
            } else if (typeof subPattern === 'function')
              children[key] = new Validation(provider.bindContext(pattern), path, autoTouch, subPattern);
          }

          return children;
        }
      }

      hasMixin(mixin: Function): boolean {
        return mixin === mixValidate || super.hasMixin(mixin);
      }
    };
  };
}
