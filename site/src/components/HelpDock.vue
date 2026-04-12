<script setup>
import { onMounted, onUnmounted, ref, watch } from "vue";
import {
  FACEBOOK_GROUP,
  GITLAB_REPO,
  GITLAB_WORK_ITEMS,
  serviceDeskMailto,
} from "../constants/supportLinks";
import { pathTo } from "../sitePaths";

const open = ref(false);
const panelId = "help-dock-panel";

function toggle() {
  open.value = !open.value;
}

function close() {
  open.value = false;
}

function onKeydown(ev) {
  if (ev.key === "Escape") close();
}

watch(open, (v) => {
  if (typeof document === "undefined") return;
  document.body.classList.toggle("help-dock-open", v);
});

onMounted(() => {
  window.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeydown);
  document.body.classList.remove("help-dock-open");
});
</script>

<template>
  <div class="help-dock" :class="{ 'help-dock--open': open }">
    <div v-show="open" class="help-dock__backdrop" aria-hidden="true" @click="close" />
    <div :id="panelId" class="help-dock__panel card shadow border-0" role="region" :aria-hidden="!open">
      <div class="card-header d-flex align-items-center justify-content-between py-2 px-3">
        <span class="fw-semibold small" data-i18n="help_dock.panel_title">Help & community</span>
        <button type="button" class="btn-close" aria-label="Close" data-i18n-aria="nav.close_aria" @click="close" />
      </div>
      <div class="card-body py-3 px-3 small">
        <p class="text-secondary mb-2 fw-semibold text-uppercase" style="font-size: 0.65rem; letter-spacing: 0.06em" data-i18n="help_dock.social_heading">
          Community
        </p>
        <div class="d-flex flex-wrap gap-2 mb-3">
          <a
            class="btn btn-outline-secondary btn-sm"
            :href="FACEBOOK_GROUP"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i class="bi bi-facebook me-1" aria-hidden="true"></i>
            <span data-i18n="social.facebook">Facebook</span>
          </a>
          <span class="d-inline-block" tabindex="0" data-i18n-title="social.coming_soon">
            <button type="button" class="btn btn-outline-secondary btn-sm" disabled>
              <i class="bi bi-discord me-1" aria-hidden="true"></i>
              <span data-i18n="social.discord">Discord</span>
            </button>
          </span>
          <a class="btn btn-outline-secondary btn-sm" :href="GITLAB_REPO" target="_blank" rel="noopener noreferrer">
            <i class="bi bi-gitlab me-1" aria-hidden="true"></i>
            <span data-i18n="footer.link_gitlab">GitLab</span>
          </a>
        </div>

        <div class="help-dock__support-block border rounded-3 p-3 bg-body-secondary bg-opacity-25">
          <p class="text-secondary mb-2 fw-semibold text-uppercase" style="font-size: 0.65rem; letter-spacing: 0.06em" data-i18n="help_dock.support_heading">
            Project & Service Desk
          </p>
          <ul class="list-unstyled mb-0 vstack gap-2">
            <li>
              <a class="link-body" :href="GITLAB_WORK_ITEMS" target="_blank" rel="noopener noreferrer" data-i18n="help_dock.work_items"
                >GitLab work items</a
              >
            </li>
            <li>
              <a class="link-body" :href="serviceDeskMailto()" data-i18n="help_dock.service_desk_email">Email Service Desk</a>
            </li>
            <li class="pt-1">
              <router-link class="btn btn-sm btn-outline-primary" :to="pathTo('/showcase') + '#install'" @click="close">
                <span data-i18n="help_dock.cta_install">Installation guide</span>
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <button
      type="button"
      class="help-dock__tab btn btn-primary shadow"
      :aria-expanded="open ? 'true' : 'false'"
      :aria-controls="panelId"
      @click="toggle"
    >
      <span data-i18n="help_dock.tab_label">Need help?</span>
    </button>
  </div>
</template>

<style scoped src="../styles/app/help-dock.css"></style>
