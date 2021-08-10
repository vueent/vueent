import { WatchStopHandle, ComputedRef, computed, reactive, watch } from 'vue-demi';
import get from 'lodash/get';

import { ValidationRule, ValidationBase } from './interfaces';
import { Provider } from './provider';

/**
 * Child validations.
 */
export type Children = Record<string, ValidationBase> | ValidationBase[];

type ValidationForEachCallbackFunc = (value: ValidationBase, key: string | number, source: Children) => void;

/**
 * Reactive validation properties.
 */
export interface Props {
  /**
   * A flag indicating that at least one of children has the {@link Props.dirty} flag.
   */
  anyChildDirty?: boolean;

  /**
   * A flag indicating that the current data field or one of children is dirty.
   */
  dirty: boolean;

  /**
   * A flag indicating that at least on of children has the {@link Props.invalid} flag.
   */
  anyChildInvalid?: boolean;

  /**
   * A flag indicating the validation of the current data field or one of children failed.
   */
  invalid: boolean;

  /**
   * Validation is forced.
   */
  touched: boolean;

  /**
   * Toggled to reset.
   */
  resetted: boolean;

  /**
   * Data property path.
   */
  path: string[];

  /**
   * Current data property value.
   */
  actualValue: unknown;

  /**
   * Computed full data property path.
   */
  readonly fullPath: string;

  /**
   * Computed message (settled only).
   */
  readonly dirtyMessage: string;

  /**
   * Children validations.
   */
  children?: Children;

  /**
   * A flag indicating that validation of the current data field failed.
   */
  selfInvalid: boolean;

  /**
   * A flag indicating that the current data field is dirty.
   */
  selfDirty: boolean;

  /**
   * Validation error text.
   */
  message: string;
}

/**
 * This class provides a validator for the specified data field.
 *
 * An instance may have children, which refer to child data fields validators.
 */
export class Validation implements ValidationBase {
  /**
   * Reactive validation properties.
   */
  private _props: Props;

  /**
   * Data provider.
   */
  private _provider: Provider;

  /**
   * Validation rule.
   */
  private _check: ValidationRule;

  /**
   * Cached array length (for arrays).
   */
  private _length = 0;

  /**
   * A flag indicating that children validations are available.
   */
  private _childrenAvailable = false;

  /**
   * A flag indicating that the current data field is array.
   */
  private _childrenTypeArray = false;

  /**
   * A flag indicating that the current data field is defined.
   */
  private _defined: boolean;

  /**
   * Set the `dirty` flag automatically when data changes.
   */
  private _autoTouch = false;

  /**
   * The cached value of the data field.
   */
  private _cachedValue: unknown;

  /**
   * A function that stops a data watcher.
   */
  private _stopWatcher: WatchStopHandle;

  /**
   * A flag indicating that at least one of children has the {@link Validation.dirty} flag.
   */
  public get anyChildDirty(): boolean {
    return Boolean(this._props.anyChildDirty);
  }

  /**
   * A flag indicating that the current data field is dirty.
   */
  public get selfDirty(): boolean {
    return this._props.selfDirty;
  }

  /**
   * A flag indicating that the current data field or one of children is dirty.
   */
  public get dirty(): boolean {
    return this._props.dirty;
  }

  /**
   * Sets to `true` if any child is invalid.
   */
  public get anyChildInvalid(): boolean {
    return Boolean(this._props.anyChildInvalid);
  }

  /**
   * Sets to `true` if self check rule is invalid.
   */
  public get selfInvalid(): boolean {
    return this._props.selfInvalid;
  }

  /**
   * Sets to `true` if the field is not valid.
   */
  public get invalid(): boolean {
    return this._props.invalid;
  }

  /**
   * Validation error text.
   */
  public get message(): string {
    return this._props.message;
  }

  /**
   * Validation error text, which is specified only if the {@link Validation.dirty} flag is set.
   */
  public get dirtyMessage(): string {
    return this._props.dirtyMessage;
  }

  /**
   * Children validations.
   */
  public get children() {
    return this._props.children;
  }

  /**
   * Children shortcut.
   */
  public get c() {
    return this._props.children;
  }

  /**
   * @param provider - data provider
   * @param path - path to the data field
   * @param autoTouch - set the {@link Validation.dirty} flag automatically when data changes
   * @param validate - validation rule
   * @param children - child validations
   */
  constructor(provider: Provider, path: string[], autoTouch: boolean, validate?: ValidationRule, children?: Children) {
    this._childrenAvailable = children !== undefined;
    this._provider = provider;
    this._check = validate ? validate : () => true;

    const fullPath = computed(() => this._props.path.join('.'));
    const actualValue = computed(() =>
      this._props.path.length ? get(this._provider.data, this._props.fullPath) : this._provider.data
    );

    let anyChildInvalid: ComputedRef<boolean> | undefined = undefined;
    let anyChildDirty: ComputedRef<boolean> | undefined = undefined;

    const dirty = computed(() => this._props.selfDirty || Boolean(this._props.anyChildDirty));
    const invalid = computed(
      () => this._props.selfInvalid || (this._props.actualValue !== undefined && Boolean(this._props.anyChildInvalid))
    );

    this._props = reactive({
      anyChildDirty,
      selfDirty: false,
      dirty: (dirty as unknown) as boolean,
      anyChildInvalid,
      selfInvalid: false,
      invalid: (invalid as unknown) as boolean,
      touched: false,
      resetted: false,
      path,
      actualValue: (actualValue as unknown) as boolean,
      fullPath: (fullPath as unknown) as string,
      dirtyMessage: (computed(() => (this._props.dirty && this._props.message) || '') as unknown) as string,
      children,
      message: ''
    });

    this._defined = actualValue.value !== undefined;
    this._cachedValue = actualValue.value;

    if (Array.isArray(children)) {
      this._length = actualValue.value?.length ?? 0;
      this._childrenTypeArray = true;
      anyChildInvalid = computed(() => (this.children as ValidationBase[]).some(child => child.invalid));
      anyChildDirty = computed(() => (this.children as ValidationBase[]).some(child => child.dirty));
    } else if (typeof children === 'object') {
      anyChildInvalid = computed(() => {
        const children = this.children as Record<string, ValidationBase>;

        for (const key in children) if (children[key]?.invalid) return true;

        return false;
      });

      anyChildDirty = computed(() => {
        const children = this.children as Record<string, ValidationBase>;

        for (const key in children) if (children[key]?.dirty) return true;

        return false;
      });
    }

    this._props.anyChildDirty = (anyChildDirty as unknown) as boolean;
    this._props.anyChildInvalid = (anyChildInvalid as unknown) as boolean;
    this.inspect();
    this._autoTouch = autoTouch;
    this._stopWatcher = watch(
      () => get(this._provider.data, this._props.fullPath),
      () => this.inspect(),
      { flush: 'sync' }
    );
  }

  /**
   * Mark the current data field as dirty.
   */
  public touch() {
    this._props.touched = true;
    this.forEachChild(this._props.children, child => child.touch());
    this.inspect();
  }

  /**
   * Resets the current validation state to default values.
   */
  public reset() {
    this._props.resetted = true;
    this.forEachChild(this._props.children, child => child.reset());
    this.inspect();
  }

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
  public updatePath(index: number, section: string) {
    const { path } = this._props;

    if (path[index] === undefined || path[index] === section) return;

    path.splice(index, 1, section);
    this.forEachChild(this._props.children, child => child.updatePath(index, section));
  }

  /**
   * Compares the specified value with the cached value of the current data field.
   *
   * @param someValue - specified value
   * @returns - check result
   */
  public checkValue(someValue: unknown) {
    return this._cachedValue === someValue;
  }

  /**
   * Destroys the current validation instance and its children.
   *
   * This method stops data watchers.
   */
  public destroy() {
    this._stopWatcher();
    this.forEachChild(this._props.children, child => child.destroy());
  }

  /**
   * Checks data changes and updates the state.
   */
  private inspect() {
    const { actualValue } = this._props;
    let children: Children | undefined = this._props.children;

    if (this._childrenAvailable) {
      const { _childrenTypeArray } = this;
      const defined = actualValue !== undefined;

      if (this._defined !== defined) {
        children = defined ? this.redefineChildren() : (children = this.removeAllChildren());
        this._defined = defined;
      } else if (_childrenTypeArray && defined) {
        const value = actualValue as unknown[]; // field is an array

        if (value.length && typeof value[0] === 'object') children = this.updateChildrenArray(value);
        else if (this._length !== value.length)
          children = this._length > value.length ? this.removeObsoleteChildren(value) : this.appendChildren();
      }
    }

    const { selfDirty, selfInvalid, message } = this.validate(actualValue);

    if (children !== this._props.children) this._props.children = children;
    if (selfDirty !== this._props.selfDirty) this._props.selfDirty = selfDirty;
    if (selfInvalid !== this._props.selfInvalid) this._props.selfInvalid = selfInvalid;
    if (message !== this._props.message) this._props.message = message;
    if (actualValue !== this._cachedValue) this._cachedValue = actualValue;
  }

  /**
   * Check a value and updates the state of the instance.
   *
   * @param value - value of the data field
   * @returns - checking result
   */
  private validate(value: unknown) {
    if (this._provider.locked) {
      return {
        selfDirty: this._props.selfDirty,
        selfInvalid: this._props.selfInvalid,
        message: this._props.message
      };
    }

    const { _props } = this;
    const result = this._check(value, this._provider.data, this._props.path);
    let selfDirty: boolean;

    if (_props.resetted) {
      _props.resetted = false;
      selfDirty = false;
    } else if (_props.touched) {
      _props.touched = false;
      selfDirty = true;
    } else if (this._autoTouch && value !== this._cachedValue) selfDirty = true;
    else selfDirty = this._props.selfDirty;

    return {
      selfDirty,
      selfInvalid: result !== true,
      message: typeof result === 'string' ? result : ''
    };
  }

  /**
   * Calls callback function for each child.
   *
   * @param children - child instances
   * @param callbackfn - callback function
   */
  private forEachChild(children: Children | undefined, callbackfn: ValidationForEachCallbackFunc) {
    if (!children) return;

    if (Array.isArray(children)) for (let i = 0; i < children.length; ++i) callbackfn(children[i], i, children);
    else {
      for (const key in children) {
        const child = children[key];

        if (child !== undefined) callbackfn(child, key, children);
      }
    }
  }

  /**
   * Creates {@link Validation} instances for just defined children.
   *
   * @returns - created children
   */
  private redefineChildren() {
    const children = this._provider.createChildren(true, this._props.path);

    if (this._childrenTypeArray) this._length = (children as ValidationBase[]).length;

    return children;
  }

  /**
   * Updates children to preserve references.
   *
   * This method should be used only if the {@link Validation._childrenTypeArray} flag is set.
   *
   * @param actualValue - actual data field
   * @returns - updated array of children
   */
  private updateChildrenArray(actualValue: unknown[]) {
    const { _provider } = this;
    const { path } = this._props;
    const children = this._props.children as ValidationBase[];

    const missed: number[] = [];
    const kept: number[] = [];
    const updated: Array<ValidationBase | undefined> = [];

    for (let i = 0; i < actualValue.length; ++i) {
      const v = actualValue[i];
      const index = children.findIndex(c => c.checkValue(v));

      if (index !== -1) {
        const child = children[index];

        child.updatePath(path.length, `[${updated.length}]`);
        updated.push(child);
        kept.push(index);
      } else {
        updated.push(undefined);
        missed.push(i);
      }
    }

    children.forEach((child, i) => !kept.includes(i) && child.destroy());

    if (missed.length) {
      // generating missed children
      const providedChildren = _provider.createChildren(true, path, missed) as ValidationBase[];

      for (let i = 0, j = 0; i < updated.length && j < providedChildren.length; ++i) {
        if (!updated[i]) updated[i] = providedChildren[j++];
      }
    }

    return updated as ValidationBase[];
  }

  /**
   * Removes children which lost its data references.
   *
   * This method should be used only if the {@link Validation._childrenTypeArray} flag is set.
   *
   * @param actualValue - actual data field
   * @returns - updated children list
   */
  private removeObsoleteChildren(actualValue: unknown[]) {
    const children = this._props.children as ValidationBase[];
    const diff = this._length - actualValue.length;
    const offset = this._length - diff;
    const updated = (this._props.children as ValidationBase[]).slice(0, offset);

    children.slice(offset).forEach(child => child.destroy());
    this._length = updated.length;

    return updated;
  }

  /**
   * Appends children for the new data references.
   *
   * This method should be used only if the {@link Validation._childrenTypeArray} flag is set.
   *
   * @returns - updared children list
   */
  private appendChildren() {
    const children = this._props.children as ValidationBase[];
    const appendix = this._provider.createChildren(true, this._props.path, this._length) as ValidationBase[];
    const updated = [...children, ...appendix];

    this._length = updated.length;

    return updated;
  }

  /**
   * Removes all children instances.
   *
   * @returns - empty array or object
   */
  private removeAllChildren() {
    if (this._childrenTypeArray) this._length = 0;

    return this._childrenTypeArray ? [] : {};
  }
}
