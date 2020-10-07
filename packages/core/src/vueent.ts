import { onBeforeMount, onBeforeUnmount, onUnmounted } from 'vue-demi';

import { Controller, Constructor as ControllerConstructor, Params as ControllerParams } from './controller';
import { Service, Constructor as ServiceConstructor, Params as ServiceParams } from './service';

export interface ServiceRegistry<T extends Service = Service> {
  create: ServiceConstructor;
  instance?: T;
}

export interface ControllerRegistry<T extends Controller = Controller> {
  create: ControllerConstructor<T>;
  instance?: T;
}

export class Vueent {
  private readonly _services: ServiceRegistry[] = [];
  private readonly _controllers: ControllerRegistry[] = [];

  public registerService<T extends Service = Service>(create: ServiceConstructor<T>) {
    if (this._services.some(s => s.create === create)) throw new Error('Service with the same name is already registered');

    this._services.push({ create, instance: undefined });
  }

  public registerController<T extends Controller = Controller>(create: ControllerConstructor<T>) {
    if (this._controllers.some(s => s.create === create)) throw new Error('Controller with the same name is already registered');

    this._controllers.push({ create, instance: undefined });
  }

  public getService<T extends Service = Service>(create: ServiceConstructor<T>, ...params: ServiceParams<T>) {
    const service = this._services.find(s => s.create === create);

    if (!service) throw new Error('Service with that name is not registered');

    if (!service.instance) service.instance = new service.create(...params);

    return service.instance as T;
  }

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

let vueent: Vueent | undefined;

export function useVueent() {
  if (!vueent) vueent = new Vueent();

  return vueent;
}
