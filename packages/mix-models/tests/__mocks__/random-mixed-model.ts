import { type Base, BaseModel, mix, Options } from '@vueent/mix-models';

import { mixRandom, type Random, type RandomPrivate } from './random-mixin';

interface Data {
  id: number;
  value: number;
}

function makeInitialData(): Data {
  return { id: 0, value: 0 };
}

class DataModel extends BaseModel<Data> {}

export interface Model extends DataModel, RandomPrivate {}

export class Model extends mix<Data, typeof DataModel>(DataModel, mixRandom()) {
  constructor(initialData?: Data, react = true, ...options: Options[]) {
    super('id', initialData ?? makeInitialData(), react, ...options);

    this.setMaxRandom(256);
  }
}

export type ModelType = Base<Data> & Random;

export function create<ModelOptions extends Options>(initialData?: Data, react = true, ...options: ModelOptions[]) {
  return new Model(initialData, react, ...options) as ModelType;
}
