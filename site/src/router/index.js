import { createRouter, createWebHistory } from "vue-router";
import ConfigFlowHelpView from "../views/partial/doc/setup-help/ConfigFlowHelpView.vue";
import DevelopersView from "../views/DevelopersView.vue";
import DocView from "../views/DocView.vue";
import HomeView from "../views/HomeView.vue";
import LovelaceCardsView from "../views/LovelaceCardsView.vue";
import InternalsView from "../views/partial/internals/InternalsView.vue";
import ChangelogView from "../views/ChangelogView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
    { path: "/showcase", name: "showcase", component: DocView },
    { path: "/lovelace-cards", name: "lovelace-cards", component: LovelaceCardsView },
    { path: "/doc/setup-help", name: "flowhelp", component: ConfigFlowHelpView },
    { path: "/changelog", name: "changelog", component: ChangelogView },
    { path: "/internals", name: "internals", component: InternalsView },
    /* Not linked from the public nav yet — bookmark `/dev` to open. */
    { path: "/dev", name: "developers", component: DevelopersView },
  ],
});

export default router;
