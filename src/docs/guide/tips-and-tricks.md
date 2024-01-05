# Tips and tricks

## Serializing and deserializing

If the model data should be mutated by the UI, than its normal representation may not match the server-side (serialized) representation. For example:

```ts
// internal data representation
interface Data {
  id: number;
  age: string;
  credentials: {
    firstName: string;
    lastName: string;
  };
  phones: Array<{ value: string }>;
}

// serialized data representation
interface EncodedData {
  id: number;
  age: number;
  credentials: {
    firstName: string;
    lastName: string;
  };
  phones: string[];
}
```

So, an encoded data must be transformed (normalized) to the `Data` type when loading the model data:

<code-group>
<code-block title="TS">

```ts
function normalize(encoded: EncodedData): Data {
  return {
    id: encoded.id,
    age: String(encoded.age), // just transform, do not validate!
    credentials: { ...encoded.credentials },
    phones: encoded.phones.map(phone => ({ value: phone }))
  };
}
```

</code-block>
<code-block title="JS">

```js
/**
 * @param {EncodedData} encoded
 * @returns {Data}
 */
function normalize(encoded) {
  return {
    id: encoded.id,
    age: String(encoded.age), // just transform, do not validate!
    credentials: { ...encoded.credentials },
    phones: encoded.phones.map(phone => ({ value: phone }))
  };
}
```

</code-block>
</code-group>

Overwise, when saving model data, reverse transformation (serialization) is necessary:

<code-group>
<code-block title="TS">

```ts
function denormalize(data: Data): EncodedData {
  return {
    id: data.id,
    age: Number(data.age), // just transform, do not validate!
    credentials: { ...data.credentials },
    phones: data.phones.map(phone => phone.value)
  };
}
```

</code-block>
<code-block title="JS">

```js
/**
 * @param {Data} data
 * @returns {EncodedData}
 */
function denormalize(data) {
  return {
    id: data.id,
    age: Number(data.age), // just transform, do not validate!
    credentials: { ...data.credentials },
    phones: data.phones.map(phone => phone.value)
  };
}
```

</code-block>
</code-group>

::: tip
The `save` mixin working only with the normal data representation, therefore any data object must be transformed outside of the model class.
:::

Example:

```ts
// file: @/api.ts
import type { EncodedData as Person } from '@/models/person';

async function loadPerson(id: number): Promise<Person> {
  const response = await fetch(`/persons/${id}`);
  const encoded = await response.json();

  return encoded;
}

async function createPerson(req: Omit<Person, 'id'>): Promise<Person> {
  const response = await fetch('/persons/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(req)
  });
  const encoded = await response.json();

  return encoded;
}

// inside Service, Pinia, Vuex, etc.
import { type EncodedData, type Data, type ModelType as PersonModel, create } from '@/models/person';
import { loadPerson, createPerson } from '@/api';
import { normalize, denormalize } from '@/transforms/person';

async function load(id: number): Promise<PersonModel> {
  let response;

  try {
    response = await loadPerson(id);
  } catch (e) {
    console.error('could not load a person', e);

    throw e;
  }

  const instance = create(normalize(response), true, {
    mixinType: 'save',
    create: async (data: Data): Promise<Data> => {
      const encoded = await createPerson(denormalize(data));

      return normalize(encoded);
    }
  });
}
```
