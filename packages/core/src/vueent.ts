import { onBeforeMount, onBeforeUnmount, onUnmounted } from 'vue-demi';

import { Controller, Constructor as ControllerConstructor, Params as ControllerParams } from './controller';
import { Service, Constructor as ServiceConstructor, Params as ServiceParams } from './service';

/**
 * A record of the registered service.
 */
export interface ServiceRegistry<T extends Service = Service> {
  /**
   * Service constructor.
   */
  create: ServiceConstructor;

  /**
   * Service instance.
   */
  instance?: T;
}

/**
 * A record of the registered controller.
 */
export interface ControllerRegistry<T extends Controller = Controller> {
  /**
   * Controller constructor.
   */
  create: ControllerConstructor<T>;

  /**
   * Controller instance.
   */
  instance?: T;
}

/**
 *
 */
export class Vueent {
  /**
   * A list of registered services.
   */
  private readonly _services: ServiceRegistry[] = [];

  /**
   * A list of registered controllers.
   */
  private readonly _controllers: ControllerRegistry[] = [];

  /**
   * Appends a service to the list {@link Vueent._services}.
   *
   * The same service cannot be appended twice.
   *
   * @param create - service constructor
   */
  public registerService<T extends Service = Service>(create: ServiceConstructor<T>) {
    if (this._services.some(s => s.create === create)) throw new Error('Service with the same name is already registered');

    this._services.push({ create, instance: undefined });
  }

  /**
   * Appends a controller to the list {@link Vueent._controllers}.
   *
   * The same controller cannot be appended twice.
   *
   * @param create - controller constructor
   */
  public registerController<T extends Controller = Controller>(create: ControllerConstructor<T>) {
    if (this._controllers.some(s => s.create === create)) throw new Error('Controller with the same name is already registered');

    this._controllers.push({ create, instance: undefined });
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
   * @returns - service instance
   */
  public getService<T extends Service = Service>(create: ServiceConstructor<T>, ...params: ServiceParams<T>) {
    const service = this._services.find(s => s.create === create);

    if (!service) throw new Error('Service with that name is not registered');

    if (!service.instance) service.instance = new service.create(...params);

    return service.instance as T;
  }

  /**
   * Returns a controller instance.
   *
   * Due to the singleton nature of controllers, the function may instantiate the controller
   * if it hasn't already been instantiated.
   * If the controller hasn't been instantiated yet, the parameters will be passed to its constructor.
   *
   * @param create - controller constructor
   * @param params - constructor parameters
   * @returns - controller instance
   */
  public getController<T extends Controller = Controller>(create: ControllerConstructor<T>, ...params: ControllerParams) {
    const index = this._controllers.findIndex(s => s.create === create);

    if (index === -1) throw new Error('Controller with that name is not registered');

    const controller = this._controllers[index];

    if (!controller.instance) controller.instance = new controller.create(...params);

    onBeforeMount(() => controller.instance?.init());
    onBeforeUnmount(() => controller.instance?.reset());
    onUnmounted(() => {
      controller.instance?.destroy();
      controller.instance = undefined;
    });

    return controller.instance as T;
  }
}

/**
 * Private instance of Vueent.
 */
let vueent: Vueent | undefined;

/**
 * Returns an instance of Vueent class.
 *
 * An instance will be created automatically.
 *
 * @returns - Vueent instance
 */
export function useVueent() {
  if (!vueent) vueent = new Vueent();

  return vueent;
}
