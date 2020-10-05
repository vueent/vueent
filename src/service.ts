import { useVueent, ServiceConstructor } from './vueent';

export abstract class Service {}

export function inject<T extends Service = Service>(create: ServiceConstructor<T>) {
  return function(target: unknown, propertyKey: string | symbol) {
    Object.defineProperty(target, propertyKey, {
      get() {
        return useVueent().getService(create);
      }
    });
  };
}

export function register<T extends Service = Service>(create: ServiceConstructor<T>) {
  useVueent().registerService(create);
}

export function use<T extends Service = Service>(create: ServiceConstructor<T>) {
  return useVueent().getService(create);
}
