export class Storage<EncodedData extends { id: number }> {
  private _maxId = 0;
  private _store: EncodedData[] = [];

  public async add(data: Omit<EncodedData, 'id'>) {
    const record = { ...data, id: ++this._maxId } as EncodedData;

    this._store.push(record);

    return { ...record };
  }

  public async update(id: number, data: Omit<EncodedData, 'id'>) {
    const record = this._store.find(r => r.id === id);

    if (!record) throw new Error('Resource not found');

    for (const key in data) record[key as keyof typeof record] = data[key as keyof typeof data];

    for (const key in record) {
      if (!(key in data)) delete record[key];
    }

    return { ...record };
  }

  public async get(id: number) {
    const record = this._store.find(r => r.id === id);

    if (!record) throw new Error('Resource not found');

    return { ...record };
  }

  public async destroy(id: number) {
    const index = this._store.findIndex(r => r.id === id);

    if (index === -1) throw new Error('Resource not found');
    else this._store.splice(index, 1);
  }

  public async getMany(offset = 0, limit?: number) {
    return {
      items: this._store.slice(offset, limit !== undefined ? offset + limit : undefined).map(r => ({ ...r }))
    };
  }

  public reset(keepMaxId = false) {
    if (!keepMaxId) this._maxId = 0;

    this._store = [];
  }
}
