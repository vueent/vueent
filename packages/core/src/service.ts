import { useVueent } from './vueent';

/**
 * An abstract base service class.
 *
 * Each service is a singleton and must extend the base service or its descendant.
 */
export abstract class Service {}

export type Constructor<T extends Service = Service> = new (...args: any[]) => T;

export type Params<T extends Service = Service> = ConstructorParameters<Constructor<T>>;

/**
 * Creates a property with a reference to the service.
 *
 * The function will automatically lazy instantiate the service if it hasn't already been instantiated.
 * If the service hasn't been instantiated yet, the parameters will be passed to its constructor.
 *
 * @param create - service constructor
 * @param params - constructor parameters
 * @returns - property with a service reference
 */
export function inject<T extends Service = Service>(create: Constructor<T>, ...params: Params<T>) {
  return function(target: unknown, propertyKey: string | symbol) {
    Object.defineProperty(target, propertyKey, {
      get() {
        return useVueent().getService(create, ...params);
      }
    });
  };
}

/**
 * Registers a service in a vueent instance.
 *
 * This operation is necessary to access the service instance via
 * {@link inject} decorator or {@link use} function.
 *
 * @param create - service constructor
 */
export function register<T extends Service = Service>(create: Constructor<T>) {
  useVueent().registerService(create);
}

/**
 * Returns a service instance.
 *
 * Due to the singleton nature of services, the function may instantiate the service
 * if it hasn't already been instantiated.
 * If the service hasn't been instantiated yet, the parameters will be passed to its constructor.
 *
 * @param create - service constructor
 * @param params - constructor parameters
 * @returns service instance
 */
export function use<T extends Service = Service>(create: Constructor<T>, ...params: Params<T>) {
  return useVueent().getService(create, ...params);
}
