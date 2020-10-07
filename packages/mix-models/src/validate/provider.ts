import { ComputedRef, reactive } from 'vue-demi';

import { AnyPattern, ChildrenValidationsInitializer } from './interfaces';
import { ValidationInterface } from './validation';

export interface Props {
  data: unknown;
  locked: boolean;
}

export class Provider {
  public readonly pattern: AnyPattern;

  private readonly _autoTouch: boolean;
  private readonly _props: Props;
  private readonly _childrenInitializer: ChildrenValidationsInitializer;

  public get data() {
    return this._props.data;
  }

  public get locked() {
    return this._props.locked;
  }

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

  public createChildren(
    defined: boolean,
    path: string[],
    applyOrOffset: number[] | number = 0
  ): Record<string, ValidationInterface> | ValidationInterface[] {
    return this._childrenInitializer(this, this.pattern, this._autoTouch, defined, path, applyOrOffset);
  }

  public bindContext(pattern: AnyPattern): Provider {
    return new Provider(this._props.data, this._props.locked, this._autoTouch, this._childrenInitializer, pattern);
  }
}
