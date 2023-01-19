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
  authorId: number;
  title: string;
  text: string;
  publishedAt: number; // unix timestamp
}

export type EncodedData = Data;

export function makeInitialData(): Data {
  return { id: 0, authorId: 0, title: '', text: '', publishedAt: 0 };
}

export const validations = {
  authorId: (v: any) =>
    (v as number) > 0
      ? Number.isInteger(v)
        ? true
        : 'Author id must be an integer value'
      : 'Author id must be a positive number',
  title: (v: any) =>
    (v as string).length > 0
      ? (v as string).length < 255
        ? true
        : 'Unexpected title length'
      : 'Title cannot be an empty string',
  text: (v: any) =>
    (v as string).length > 0
      ? (v as string).length <= 5000
        ? true
        : 'Unexpected text length'
      : 'Text cannot be an empty string',
  publishedAt: (v: any) => ((v as number) > new Date(2023, 0, 1).getTime() ? true : 'Unexpected publishing date')
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

export class ArticlesCollection extends Collection<Model, Data, EncodedData, ModelType> {
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
          authorId?: number;
          title?: string;
          publishedAt?: number;
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

          if (queryParams.title) {
            filters.push((v: EncodedData) => v.title === queryParams.title);
          } else if (queryParams.publishedAt) {
            filters.push((v: EncodedData) => v.publishedAt === queryParams.publishedAt);
          } else if (queryParams.authorId) {
            filters.push((v: EncodedData) => v.authorId === queryParams.authorId);
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
    return { ...encoded };
  }

  public denormalize(data: Data): EncodedData {
    return { ...data };
  }
}
