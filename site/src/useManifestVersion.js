import { onMounted, onUnmounted, ref } from "vue";

function readGlobals() {
  const full =
    typeof globalThis.HubEnergieManifestVersion === "string" ? globalThis.HubEnergieManifestVersion : "";
  const series =
    typeof globalThis.HubEnergieManifestVersionSeries === "string"
      ? globalThis.HubEnergieManifestVersionSeries
      : "";
  const docSnapshotIso =
    typeof globalThis.HubEnergieDocSnapshotIsoDate === "string" ? globalThis.HubEnergieDocSnapshotIsoDate : "";
  return { full, series, docSnapshotIso };
}

/**
 * Manifest semver from `hub-energie-i18n.js` (written by build-i18n). Used for doc badges
 * instead of embedding HTML/version tokens in JSON.
 */
export function useManifestVersion() {
  const full = ref("");
  const series = ref("");
  const docSnapshotIso = ref("");

  function sync() {
    const g = readGlobals();
    full.value = g.full;
    series.value = g.series;
    docSnapshotIso.value = g.docSnapshotIso;
  }

  onMounted(() => {
    sync();
    window.addEventListener("hub-energie-lang", sync);
  });

  onUnmounted(() => {
    window.removeEventListener("hub-energie-lang", sync);
  });

  return { full, series, docSnapshotIso };
}
