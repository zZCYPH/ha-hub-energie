<script setup>
import { useManifestVersion } from "../../../useManifestVersion";

const { full } = useManifestVersion();
</script>

<template>
  <footer class="border-top pt-4 mt-2 small text-secondary">
    <p class="mb-2">
      <span data-i18n="doc.footer_p1_before"></span>
      <strong class="text-body">v{{ full }}</strong>
      <span data-i18n="doc.footer_p1_after_version"></span>
      <code class="font-mono">docs/</code>
      <span data-i18n="doc.footer_p1_after_docs"></span>
      <a
        href="https://gitlab.com/zzcyph1/home-assistant/hub-energie"
        target="_blank"
        rel="noopener noreferrer"
        data-i18n="doc.footer_p1_gitlab"
      ></a>.
    </p>
    <p class="mb-0" data-i18n="footer.license">License: see the repository.</p>
  </footer>
</template>
