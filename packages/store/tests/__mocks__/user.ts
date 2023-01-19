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
  firstName: string;
  lastName: string;
  age: string;
}

export interface EncodedData {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
}

export function makeInitialData(): Data {
  return { id: 0, firstName: '', lastName: '', age: '' };
}

export const validations = {
  firstName: (v: any) => ((v as string).length > 0 && (v as string).length < 255 ? true : 'Unexpected first name length'),
  lastName: (v: any) => ((v as string).length > 0 && (v as string).length < 255 ? true : 'Unexpected last name length'),
  age: (v: any) => (Number(v) >= 0 && v === String(Number(v)) ? true : 'Age must be an integer value')
} as const;

export type Validations = PatternAssert<typeof validations, Data>;

export class DataModel extends BaseModel<Data> {}

export type ModelType = Base<Data> & Rollback & Save & Validate<Validations>;

export interface Model extends DataModel, RollbackPrivate<Data>, SavePrivate<Data>, ValidatePrivate<Validations> {}

export class Model extends mix<Data, typeof DataModel>(DataModel, mixRollback(), mixSave(), mixValidate(validations)) {
  constructor(initialData?: Data, react = true, ...options: Options[]) {
    super('id', initialData ?? makeInitialData(), react, ...options);
  }
}

export class UserCollection extends Collection<Model, Data, EncodedData, ModelType> {
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
      loadManyData: (options: {
        queryParams?: {
          ids?: number[];
          firstName?: string;
          lastName?: string;
          age?: number;
        };
      }): EncodedData[] => {
        const items: EncodedData[] = [];

        const queryParams = options.queryParams;

        if (queryParams?.ids?.length) {
          for (const id of queryParams.ids) {
            const item = mapStore.get(id);

            if (item) items.push(item);
          }
        } else if (queryParams) {
          const filters: Array<(v: EncodedData) => boolean> = [];

          if (queryParams.firstName) {
            filters.push((v: EncodedData) => v.firstName === queryParams.firstName);
          } else if (queryParams.lastName) {
            filters.push((v: EncodedData) => v.lastName === queryParams.lastName);
          } else if (queryParams.age) {
            filters.push((v: EncodedData) => v.age === queryParams.age);
          }

          for (const [, item] of mapStore) {
            if (filters.every(filter => filter(item))) items.push(item);
          }
        } else {
          for (const [, item] of mapStore) items.push(item);
        }

        return items;
      }
    });
  }

  public normalize(encoded: EncodedData): Data {
    return {
      id: encoded.id,
      firstName: encoded.firstName,
      lastName: encoded.lastName,
      age: String(encoded.age)
    };
  }

  public denormalize(data: Data): EncodedData {
    return {
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      age: Number(data.age)
    };
  }
}
