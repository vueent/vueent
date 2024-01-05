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

  /**
   * `Before update` hook implementation.
   *
   * @param fn - handler
   * @param target - target component
   */
  onBeforeUpdate?: (fn: () => void, target?: any) => void;

  /**
   * `Updated` hook implementation.
   *
   * @param fn - handler
   * @param target - target component
   */
  onUpdated?: (fn: () => void, target?: any) => void;

  /**
   * `Activated` hook implementation.
   *
   * @param fn - handler
   * @param target - target component
   */
  onActivated?: (fn: () => void, target?: any) => void;

  /**
   * `Deactivated` hook implementation.
   *
   * @param fn - handler
   * @param target - target component
   */
  onDeactivated?: (fn: () => void, target?: any) => void;
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
   * Registered services.
   */
  private readonly _services = new Map<ServiceConstructor<Service>, ServiceRegistry>();

  /**
   * Registered controllers.
   */
  private readonly _controllers = new Map<ControllerConstructor<Controller>, ControllerRegistry>();

  /**
   * Appends a service to the list {@link Vueent._services}.
   *
   * The same service cannot be appended twice.
   *
   * @param create - service constructor
   */
  public registerService<T extends Service = Service>(create: ServiceConstructor<T>) {
    if (this._services.has(create)) throw new Error('Service with the same name is already registered');

    this._services.set(create, { create, instance: undefined });
  }

  /**
   * Appends a controller to the list {@link Vueent._controllers}.
   *
   * The same controller cannot be appended twice.
   *
   * @param create - controller constructor
   */
  public registerController<T extends Controller = Controller>(create: ControllerConstructor<T>) {
    if (this._controllers.has(create)) throw new Error('Controller with the same name is already registered');

    this._controllers.set(create, { create, instance: undefined });
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
    const service = this._services.get(create);

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
    const controller = this._controllers.get(create);

    if (!controller) throw new Error('Controller with that name is not registered');

    if (!controller.instance) controller.instance = new controller.create(...params);

    if (inSetupContext) {
      // Applying lifecycle hooks if they have been overridden by the controller class.

      if (this._options.onBeforeMount && (create as any).prototype.init !== Controller.prototype.init)
        this._options.onBeforeMount(() => controller.instance?.init());

      if (this._options.onMounted && (create as any).prototype.mounted !== Controller.prototype.mounted)
        this._options.onMounted(() => controller.instance?.mounted());

      if (this._options.onBeforeUnmount && (create as any).prototype.reset !== Controller.prototype.reset)
        this._options.onBeforeUnmount(() => controller.instance?.reset());

      if (
        this._options.onUnmounted &&
        (!this._options.persistentControllers || (create as any).prototype.destroy !== Controller.prototype.destroy)
      ) {
        this._options.onUnmounted(() => {
          controller.instance?.destroy();

          if (!this._options.persistentControllers) controller.instance = undefined;
        });
      }

      if (this._options.onBeforeUpdate && (create as any).prototype.willUpdate !== Controller.prototype.willUpdate)
        this._options.onBeforeUpdate(() => controller.instance?.willUpdate());

      if (this._options.onUpdated && (create as any).prototype.updated !== Controller.prototype.updated)
        this._options.onUpdated(() => controller.instance?.updated());

      if (this._options.onActivated && (create as any).prototype.activated !== Controller.prototype.activated)
        this._options.onActivated(() => controller.instance?.activated());

      if (this._options.onDeactivated && (create as any).prototype.deactivated !== Controller.prototype.deactivated)
        this._options.onDeactivated(() => controller.instance?.deactivated());
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
