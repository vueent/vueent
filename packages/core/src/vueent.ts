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
 * Vueent initialization options.
 */
export interface VueentOptions {
  /**
   * Do not remove controllers of unmounted routes.
   */
  persistentControllers?: boolean;

  /**
   * `Before mount` hook implementation.
   *
   * @param fn - handler
   * @param target - target component
   */
  onBeforeMount?: (fn: () => void, target?: any) => void;

  /**
   * `Mounted` hook implementation.
   *
   * @param fn - handler
   * @param target - target component
   */
  onMounted?: (fn: () => void, target?: any) => void;

  /**
   * `Before unmount` hook implementation.
   *
   * @param fn - handler
   * @param target - target component
   */
  onBeforeUnmount?: (fn: () => void, target?: any) => void;

  /**
   * `Unmounted` hook implementation.
   *
   * @param fn - handler
   * @param target - target component
   */
  onUnmounted?: (fn: () => void, target?: any) => void;
}

/**
 *
 */
export class Vueent {
  private readonly _options: VueentOptions;

  constructor(options: VueentOptions) {
    this._options = options;
  }

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
   * @param inSetupContext - marks that the controller is used inside the component's setup function
   * @param params - constructor parameters
   * @returns - controller instance
   */
  public getController<T extends Controller = Controller>(
    create: ControllerConstructor<T>,
    inSetupContext = true,
    ...params: ControllerParams
  ) {
    const index = this._controllers.findIndex(s => s.create === create);

    if (index === -1) throw new Error('Controller with that name is not registered');

    const controller = this._controllers[index];

    if (!controller.instance) controller.instance = new controller.create(...params);

    if (inSetupContext) {
      if (this._options.onBeforeMount) this._options.onBeforeMount(() => controller.instance?.init());
      if (this._options.onMounted) this._options.onMounted(() => controller.instance?.mounted());
      if (this._options.onBeforeUnmount) this._options.onBeforeUnmount(() => controller.instance?.reset());

      if (this._options.onUnmounted) {
        this._options.onUnmounted(() => {
          controller.instance?.destroy();

          if (!this._options.persistentControllers) controller.instance = undefined;
        });
      }
    }

    return controller.instance as T;
  }
}

/**
 * Returns an instance of Vueent class.
 *
 * An instance will be created automatically.
 *
 * @param context - {@link Vueent} instance wrapper
 * @param context.vueent - {@link Vueent} instance reference
 * @param context.options = {@link VueentOptions} instance options
 * @returns - {@link Vueent} instance
 */
export function useVueent(context: { vueent?: Vueent; options: VueentOptions }) {
  if (!context.vueent) context.vueent = new Vueent(context.options);

  return context.vueent;
}

/**
 * Type of a function which returns a {@link Vueent} instance.
 */
export type BoundUseVueentFunc = () => Vueent;
