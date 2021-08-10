import VueCompositionApi from '@vue/composition-api';
import { Vue2, createApp, defineComponent } from 'vue-demi';

let VueInstance: unknown | undefined;

if (!VueInstance) {
  if (Vue2) (Vue2 as any).use(VueCompositionApi);

  VueInstance = createApp(
    defineComponent({
      name: 'App',
      render(createElement: Function) {
        return createElement('div', this.$slots.default);
      }
    })
  );
}

export default VueInstance;
