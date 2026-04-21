import "./vendor/hub-energie-i18n.js";
import "./styles/doc/doc.css";
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { applyStoredShell, bindShellControls } from "./siteShell";

const ciCommitTag = import.meta.env.VITE_CI_COMMIT_TAG;
if (typeof ciCommitTag === "string" && ciCommitTag.length > 0) {
  console.info("[Hub Énergie] CI deploy tag:", ciCommitTag);
}

applyStoredShell();
const app = createApp(App);
app.use(router);
app.mount("#app");
bindShellControls(router);
