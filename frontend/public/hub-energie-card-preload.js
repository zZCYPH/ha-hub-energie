/**
 * Loaded before hub-energie-card.js via extra_module_url (registered first by the integration).
 * Home Assistant starts every extra module with import() in parallel; without a hint the browser
 * may only begin fetching hub-energie-card.js after this file runs, missing the ~2s custom-element
 * grace window (see home-assistant/frontend create-element-base.ts TIMEOUT).
 *
 * modulepreload only prioritizes the network fetch; it does not run the module. Calling import()
 * here starts evaluation as soon as this file runs. The same URL dedupes with HA's import(), so
 * the card's customElements.define still runs exactly once.
 */
(() => {
  const here = new URL(import.meta.url);
  const card = new URL("hub-energie-card.js", here);
  card.search = here.search;
  const href = card.href;
  let hasPreload = false;
  const links = document.querySelectorAll('link[rel="modulepreload"]');
  for (let i = 0; i < links.length; i += 1) {
    if (links[i].href === href) {
      hasPreload = true;
      break;
    }
  }
  if (!hasPreload) {
    const link = document.createElement("link");
    link.rel = "modulepreload";
    link.href = href;
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  }
  void import(href).catch((err) => {
    console.warn("[hub-energie-card-preload] import failed", err);
  });
})();
