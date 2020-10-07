import { useVueent } from './vueent';

export abstract class Service {}

export type Constructor<T extends Service = Service> = new (...args: unknown[]) => T;

export type Params<T extends Service = Service> = ConstructorParameters<Constructor<T>>;

export function inject<T extends Service = Service>(create: Constructor<T>, ...params: Params<T>) {
  return function(target: unknown, propertyKey: string | symbol) {
    Object.defineProperty(target, propertyKey, {
      get() {
        return useVueent().getService(create, ...params);
      }
    });
  };
}

export function register<T extends Service = Service>(create: Constructor<T>) {
  useVueent().registerService(create);
}

export function use<T extends Service = Service>(create: Constructor<T>, ...params: Params<T>) {
  return useVueent().getService(create, ...params);
}
