import {
  Base,
  BaseModel,
  Rollback,
  RollbackPrivate,
  mixRollback,
  Validate,
  ValidatePrivate,
  mixValidate,
  mix,
  Options,
  PatternAssert,
  Save,
  SavePrivate,
  mixSave
} from '@vueent/mix-models';
import { Collection } from '@vueent/store';

export interface Data {
  id: number;
  name: string;
}

export interface EncodedData {
  id: number;
  name: string;
}

export function makeInitialData(): Data {
  return { id: 0, name: '' };
}

export const validations = {
  name: (v: any) => ((v as string).length > 0 && (v as string).length < 255 ? true : 'Unexpected name length')
} as const;

export type Validations = PatternAssert<typeof validations, Data>;

export class DataModel extends BaseModel<Data> {}

export type ModelType = Base<Data> & Rollback & Save & Validate<Validations>;

export interface Model extends DataModel, RollbackPrivate<Data>, SavePrivate<Data>, ValidatePrivate<Validations> {}

export class Model extends mix<Data, DataModel, typeof DataModel>(DataModel, mixRollback(), mixSave(), mixValidate(validations)) {
  constructor(initialData?: Data, react = true, ...options: Options[]) {
    super('id', initialData ?? makeInitialData(), react, ...options);
  }
}

export class StorableCollection extends Collection<Model, Data, EncodedData, ModelType> {
  constructor(mapStore: Map<number, EncodedData>, getNewPk: () => number) {
    super({
      construct: Model,
      createData: (data: EncodedData): unknown => {
        data.id = getNewPk();
        mapStore.set(data.id, data);

        return data;
      },
      destroyData: (id: unknown) => {
        if (mapStore.has(id as number)) mapStore.delete(id as number);
      },
      updateData: (id: unknown, data: EncodedData): unknown => {
        if (mapStore.has(id as number)) mapStore.set(id as number, data);

        return data;
      },
      loadOneData: (pk: unknown): EncodedData => {
        const data = mapStore.get(pk as number);

        if (!data) throw new Error('resource not found');

        return data;
      },
      loadManyData: (options: { ids?: number[]; name?: string }): EncodedData[] => {
        const items: EncodedData[] = [];

        if (options.ids?.length) {
          for (const id of options.ids) {
            const item = mapStore.get(id);

            if (item) items.push(item);
          }
        } else if (options.name) {
          for (const [, item] of mapStore) {
            if (item.name === options.name) items.push(item);
          }
        }

        return items;
      }
    });
  }
}
