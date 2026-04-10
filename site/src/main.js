import "./vendor/hub-energie-i18n.js";
import "./styles/doc/doc.css";
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { applyStoredShell, bindShellControls } from "./siteShell";

applyStoredShell();
const app = createApp(App);
app.use(router);
app.mount("#app");
bindShellControls(router);
