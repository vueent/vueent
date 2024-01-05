import { type Constructor, BaseModel } from '@vueent/mix-models';

export interface Random {
  readonly rand: number;
}

export interface RandomPrivate extends Random {
  setMaxRandom(max: number): void;
}

export function randomMixin<D extends object, C extends Constructor<D, BaseModel<D>>>(parent: C) {
  return class extends parent implements RandomPrivate {
    #maxRandom = 1;

    get rand(): number {
      return Math.floor(Math.random() * this.#maxRandom);
    }

    setMaxRandom(max: number): void {
      this.#maxRandom = max;
    }

    /**
     * Returns `true` if the model has a mixin.
     *
     * @param mixin - mixin function
     */
    hasMixin(mixin: Function): boolean {
      return mixin === randomMixin || super.hasMixin(mixin);
    }
  };
}

export function mixRandom() {
  return <D extends object, C extends Constructor<D, BaseModel<D>>>(parent: C) => randomMixin<D, C>(parent);
}
