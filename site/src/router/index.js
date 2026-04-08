import { createRouter, createWebHashHistory } from "vue-router";
import ConfigFlowHelpView from "../views/ConfigFlowHelpView.vue";
import DocView from "../views/DocView.vue";
import HomeView from "../views/HomeView.vue";
import InternalsView from "../views/InternalsView.vue";

const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior(to, _from, saved) {
    if (saved) return saved;
    if (to.hash) {
      const id = to.hash.replace(/^#/, "");
      return {
        el: id ? `#${id}` : undefined,
        behavior: "smooth",
        top: 80,
        left: 0,
      };
    }
    return { top: 0, left: 0 };
  },
  routes: [
    { path: "/", name: "home", component: HomeView },
    { path: "/doc", name: "doc", component: DocView },
    { path: "/doc/setup-help", name: "flowhelp", component: ConfigFlowHelpView },
    { path: "/internals", name: "internals", component: InternalsView },
  ],
});

export default router;
